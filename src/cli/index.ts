#!/usr/bin/env node

/**
 * CLI entry point for GitHub PR Metrics Analyzer
 */

import { Command } from 'commander';
import { collectCommand } from './collect';
import { analyzeCommand } from './analyze';
import { ConfigurationManager } from '../config';

const program = new Command();

program
  .name('github-pr-metrics')
  .description('Analyze GitHub Pull Request feedback effectiveness')
  .version('1.0.0');

// Register commands
program.addCommand(collectCommand);
program.addCommand(analyzeCommand);

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
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}