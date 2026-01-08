# GitHub PR Metrics Analyzer

A comprehensive metrics collection and reporting tool that analyzes GitHub Pull Request feedback effectiveness, specifically targeting AI reviewer comments (starting with CodeRabbit) but designed to be extensible for any AI agent. Generate professional reports in multiple formats for data-driven insights into code review effectiveness.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example configuration and fill in your details:
```bash
cp .env.example .env
```

Edit `.env` with your GitHub repository and authentication details:
```env
GITHUB_REPOSITORY_OWNER=your-org
GITHUB_REPOSITORY_NAME=your-repo
GITHUB_TOKEN=your_github_token_here
REVIEWER_USERNAME=coderabbit[bot]
```

### 3. Build the Project
```bash
npm run build
```

### 4. Complete Workflow
```bash
# Step 1: Collect data from GitHub
npm start collect --repo owner/repo --reviewer coderabbit[bot] --days 7

# Step 2: Analyze and generate report
npm start analyze --input ./temp/pr-data.json --report markdown

# Or generate standalone reports
npm start report --input ./temp/pr-data.json --format json
```

## CLI Usage

The tool provides three main commands for a complete analysis workflow:

### Collect Command
Collects PR data from GitHub and saves to JSON file:
```bash
github-pr-metrics collect [options]

Options:
  -r, --repo <repo>      Repository in format owner/repo
  -u, --reviewer <user>  Reviewer username to analyze
  -d, --days <days>      Number of days to analyze (default: "7")
  -o, --output <file>    Output JSON file path (default: "./temp/pr-data.json")
  -h, --help            Display help for command
```

### Analyze Command
Analyzes collected PR data with integrated report generation:
```bash
github-pr-metrics analyze [options]

Options:
  -i, --input <file>         Input JSON file path (default: "./temp/pr-data.json")
  --detailed                 Show detailed comment analysis
  --report <format>          Generate report in specified format (json, markdown)
  --report-output <file>     Output file for generated report
  -h, --help                Display help for command
```

### Config Command
Shows current configuration:
```bash
github-pr-metrics config
```

### Examples

#### Basic Workflow
```bash
# Collect data for last 7 days from your configured repo
npm run dev collect

# Collect from specific repository for last 30 days
npm run dev collect --repo microsoft/vscode --reviewer coderabbit[bot] --days 30

# Analyze with detailed console output
npm run dev analyze --detailed

# Analyze and generate Markdown report
npm run dev analyze --report markdown

# Analyze and generate JSON report with custom output
npm run dev analyze --report json --report-output ./reports/metrics.json
```

#### Complete Workflow Example
```bash
# 1. Collect data from repository
npm run dev collect --repo microsoft/vscode --reviewer coderabbit[bot] --days 14

# 2. Analyze with detailed output and generate both report formats
npm run dev analyze --input ./temp/pr-data.json --detailed --report markdown
npm run dev analyze --input ./temp/pr-data.json --report json --report-output ./reports/metrics.json
```

## What It Does

Currently implemented features:
- ✅ **Data Collection**: Retrieves PRs and comments from GitHub API
- ✅ **Authentication**: Supports GitHub tokens and GitHub App authentication  
- ✅ **Comment Analysis**: Processes reviewer comments with metadata
- ✅ **Reaction Tracking**: Collects and categorizes emoji reactions
- ✅ **Reply Detection**: Identifies comment threads and replies
- ✅ **Time Filtering**: Analyzes data within specified date ranges
- ✅ **Metrics Calculation**: Comprehensive statistics and effectiveness indicators
- ✅ **Data Storage**: JSON file-based data persistence
- ✅ **Detailed Analysis**: Resolution rates, engagement metrics, sentiment analysis
- ✅ **Report Generation**: Professional reports in Markdown and JSON formats
- ✅ **CLI Integration**: Seamless workflow from data collection to report generation

The tool operates in three phases:
1. **Collection Phase**: Gathers PR and comment data from GitHub API and saves to JSON
2. **Analysis Phase**: Processes the collected data and generates comprehensive metrics
3. **Reporting Phase**: Creates formatted reports for sharing and documentation

### Report Formats

#### Markdown Reports
- Human-readable format perfect for documentation
- Professional layout with tables and sections
- Includes engagement analysis and detailed breakdowns
- Ideal for sharing with teams and stakeholders

#### JSON Reports
- Machine-readable structured format with calculated percentages
- Clean, hierarchical data structure with metadata
- Perfect for further processing, automation, or integration with other tools
- Includes all raw data and computed metrics

### Sample Output
The analysis provides:
- Pull request summaries with state and author information
- Comment statistics with resolution and reaction tracking  
- Comprehensive metrics including resolution rates, engagement rates, and sentiment analysis
- Effectiveness indicators with color-coded ratings (🟢 Excellent, 🟡 Good, 🔴 Needs Improvement)
- Detailed breakdowns by PR state, comment type, and reaction type
- Professional reports ready for presentation or further analysis

## Development

### Run Tests
```bash
npm test
```

### Development Mode Examples
```bash
# Collect data in development mode
npm run dev collect --repo your-org/your-repo --reviewer coderabbit[bot] --days 7

# Analyze with detailed output and generate report
npm run dev analyze --input ./temp/pr-data.json --detailed --report markdown

# Generate JSON report with custom output
npm run dev analyze --input ./temp/pr-data.json --report json --report-output ./reports/metrics.json
```

### Build
```bash
npm run build
```

## Features

- **Comprehensive Data Collection**: Collect PR data for specified repositories and time periods
- **AI Reviewer Analysis**: Analyze AI reviewer comment interactions and effectiveness
- **Professional Report Generation**: Generate reports in multiple formats (JSON, Markdown)
- **Flexible CLI Interface**: Standalone commands or integrated workflow options
- **Extensible Architecture**: Plugin system for custom metrics and AI reviewers
- **CI/CD Integration**: Perfect for GitHub Actions and automated reporting workflows
- **Real-time Analysis**: Console output with detailed metrics and effectiveness indicators

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Workflow

1. **Collect PR data from GitHub**:
   ```bash
   github-pr-metrics collect --repo owner/repo --reviewer coderabbit[bot] --days 30
   ```

2. **Analyze data and generate report** (JSON by default):
   ```bash
   github-pr-metrics analyze --input ./temp/pr-data.json
   ```

3. **Generate different report formats**:
   ```bash
   # Markdown report
   github-pr-metrics analyze --input ./temp/pr-data.json --report markdown
   
   # Custom output location
   github-pr-metrics analyze --input ./temp/pr-data.json --report json --report-output ./reports/metrics.json
   ```

### Development Mode

```bash
# Using npm scripts for development
npm run start collect --repo owner/repo --reviewer coderabbit[bot] --days 7
npm run start analyze --input ./temp/pr-data.json --report markdown
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── cli.ts              # Command-line interface with report integration
├── config.ts           # Configuration management
├── github.ts           # GitHub API client
├── collectors.ts       # Data collection services
├── processors.ts       # Data processing logic
├── metrics.ts          # Metrics calculation engines
├── reporters.ts        # Report generation system
├── storage.ts          # Data persistence
├── types/              # TypeScript type definitions
│   ├── core.ts         # Core data models
│   ├── interfaces.ts   # System interfaces
│   └── index.ts        # Type exports
└── index.ts            # Main exports

tests/
├── unit/               # Unit tests
├── properties/         # Property-based tests
└── fixtures/           # Test data fixtures
```

## Configuration

The tool can be configured through environment variables, configuration files, or CLI arguments. See the documentation for detailed configuration options.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Weekly PR Metrics Report
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
  workflow_dispatch:

jobs:
  generate-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        
      - name: Generate PR Metrics Report
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm start collect --repo ${{ github.repository }} --reviewer coderabbit[bot] --days 7
          npm start analyze --input ./temp/pr-data.json --report markdown --report-output ./reports/weekly-metrics.md
          npm start analyze --input ./temp/pr-data.json --report json --report-output ./reports/weekly-metrics.json
          
      - name: Upload Reports
        uses: actions/upload-artifact@v4
        with:
          name: pr-metrics-reports
          path: ./reports/
```

### Automated Reporting Script
```bash
#!/bin/bash
# weekly-report.sh - Generate weekly metrics reports

DATE=$(date +%Y-%m-%d)
REPO="myorg/myrepo"
REVIEWER="coderabbit[bot]"

echo "Generating weekly PR metrics report for $REPO..."

# Collect data
npm start collect --repo "$REPO" --reviewer "$REVIEWER" --days 7

# Generate reports
npm start analyze --input ./temp/pr-data.json --report markdown --report-output "./reports/$DATE-weekly-metrics.md"
npm start analyze --input ./temp/pr-data.json --report json --report-output "./reports/$DATE-weekly-metrics.json"

echo "Reports generated in ./reports/"
```

## License

MIT