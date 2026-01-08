#!/usr/bin/env node

/**
 * CLI entry point for GitHub PR Metrics Analyzer
 * Simple implementation to test data collection functionality
 */

import { Command } from 'commander';
import { ConfigurationManager } from './config';
import { GitHubClient } from './github';
import { createDataCollector } from './collectors';
import { createMetricsCalculator } from './metrics';
import { createDataProcessor } from './processors';
import { DataStorage } from './storage';
import { createReportGenerator, createMetricsReport, getFileExtension } from './reporters';

const program = new Command();

program
  .name('github-pr-metrics')
  .description('Analyze GitHub Pull Request feedback effectiveness')
  .version('1.0.0');

program
  .command('collect')
  .description('Collect PR data from GitHub and save to JSON file')
  .option('-r, --repo <repo>', 'Repository in format owner/repo')
  .option('-u, --reviewer <username>', 'Reviewer username to analyze')
  .option('-d, --days <days>', 'Number of days to analyze', '7')
  .option('-o, --output <file>', 'Output JSON file path', './temp/pr-data.json')
  .action(async (options) => {
    try {
      console.log('🚀 Collecting PR data...');

      // Load configuration
      const configManager = new ConfigurationManager();
      const config = await configManager.loadConfig();

      // Override with CLI options if provided
      if (options.repo) {
        const [owner, repo] = options.repo.split('/');
        if (!owner || !repo) {
          console.error('❌ Repository must be in format owner/repo');
          process.exit(1);
        }
        config.repository.owner = owner;
        config.repository.repo = repo;
      }

      if (options.reviewer) {
        config.analysis.reviewerUserName = options.reviewer;
      }

      if (options.days) {
        const days = parseInt(options.days);
        if (isNaN(days) || days <= 0) {
          console.error('❌ Days must be a positive number');
          process.exit(1);
        }
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        config.analysis.timePeriod = { start: startDate, end: endDate };
      }

      console.log(`📊 ${config.repository.owner}/${config.repository.repo} | ${config.analysis.reviewerUserName} | ${options.days} days`);

      // Initialize GitHub client
      const githubClient = new GitHubClient();
      await githubClient.authenticate(config.auth);

      // Create data collector
      const collector = createDataCollector(githubClient);

      // Collect pull requests
      const prs = await collector.collectPullRequests(config.analysis, config.repository);
      console.log(`📥 Found ${prs.length} pull requests`);

      if (prs.length === 0) {
        console.log('ℹ️  No pull requests found in the specified time period.');
        return;
      }

      // Collect comments
      const comments = await collector.collectComments(prs, config.analysis.reviewerUserName, config.repository);
      console.log(`💬 Found ${comments.length} comments from ${config.analysis.reviewerUserName}`);

      // Save to JSON file using DataStorage
      const outputPath = options.output;
      
      await DataStorage.saveCollectedData(
        outputPath,
        prs,
        comments,
        {
          repository: `${config.repository.owner}/${config.repository.repo}`,
          reviewer: config.analysis.reviewerUserName,
          period: config.analysis.timePeriod
        }
      );
      
      console.log(`✅ Data saved to: ${outputPath}`);

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze collected PR data and generate report')
  .option('-i, --input <file>', 'Input JSON file path', './temp/pr-data.json')
  .option('--report <format>', 'Report format (json, markdown)', 'json')
  .option('--report-output <file>', 'Output file for generated report')
  .action(async (options) => {
    try {
      console.log('🚀 Analyzing PR metrics...');

      // Validate and read data from JSON file
      if (!DataStorage.fileExists(options.input)) {
        console.error(`❌ Input file not found: ${options.input}`);
        console.log('�e Run "collect" command first to gather data');
        process.exit(1);
      }

      // Validate file structure
      const validation = DataStorage.validateDataFile(options.input);
      if (!validation.isValid) {
        console.error('❌ Invalid data file format:');
        validation.errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
      }
      
      const { prs, comments, metadata } = await DataStorage.loadCollectedData(options.input);
      console.log(`📊 Loaded ${metadata.totalPRs} PRs, ${metadata.totalComments} comments`);

      if (comments.length === 0) {
        console.log(`ℹ️  No comments found from reviewer: ${metadata.reviewer}`);
        return;
      }

      // Process data and calculate metrics
      console.log('🔄 Processing metrics...');
      const processor = createDataProcessor();
      const processedComments = processor.classifyReactions(
        processor.detectReplies(
          processor.detectResolution(comments)
        )
      );

      const calculator = createMetricsCalculator();
      const summary = calculator.calculateSummary(prs, processedComments);
      const detailed = calculator.calculateDetailed(prs, processedComments);

      // Validate report format
      const format = options.report.toLowerCase();
      if (!['json', 'markdown'].includes(format)) {
        console.error('❌ Invalid report format. Supported formats: json, markdown');
        process.exit(1);
      }

      // Generate report
      console.log(`📄 Generating ${format.toUpperCase()} report...`);
      
      const report = createMetricsReport(
        metadata.repository,
        {
          start: new Date(metadata.period.start),
          end: new Date(metadata.period.end)
        },
        metadata.reviewer,
        summary,
        detailed
      );

      const generator = createReportGenerator();
      const reportContent = await generator.generateReport(report, {
        format: format as 'json' | 'markdown',
        includeDetailed: true
      });

      // Determine output file path
      let outputPath = options.reportOutput;
      if (!outputPath) {
        const baseName = options.input.replace(/\.[^/.]+$/, ''); // Remove extension
        const extension = getFileExtension(format as 'json' | 'markdown');
        outputPath = `${baseName}-report${extension}`;
      }

      // Write report to file
      const fs = await import('fs/promises');
      await fs.writeFile(outputPath, reportContent, 'utf8');
      console.log(`✅ Report saved to: ${outputPath}`);

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(async () => {
    try {
      const configManager = new ConfigurationManager();
      const config = await configManager.loadConfig();
      
      console.log('📋 Configuration:');
      console.log(`Repository: ${config.repository.owner}/${config.repository.repo}`);
      console.log(`Reviewer: ${config.analysis.reviewerUserName}`);
      console.log(`Period: ${config.analysis.timePeriod.start.toISOString().split('T')[0]} to ${config.analysis.timePeriod.end.toISOString().split('T')[0]}`);
      
    } catch (error) {
      
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}