# Configuration Example

## Environment Variables

The tool uses environment variables for configuration. Copy `.env.example` to `.env` and customize:

```bash
# Required
GITHUB_REPOSITORY_OWNER=microsoft
GITHUB_REPOSITORY_NAME=vscode
GITHUB_TOKEN=ghp_your_token_here

# Optional (with defaults)
REVIEWER_USERNAME=coderabbit[bot]
ANALYSIS_START_DATE=2024-01-01
ANALYSIS_END_DATE=2024-12-31
OUTPUT_FORMAT=json
OUTPUT_DIR=./reports
```

## Configuration Loading

The configuration system loads settings in this order:
1. Environment variables (highest priority)
2. Default values (lowest priority)

```typescript
import { ConfigurationManager } from './src/config';

const configManager = new ConfigurationManager();
const config = await configManager.loadConfig();

console.log(config);
// {
//   repository: { owner: 'microsoft', repo: 'vscode' },
//   auth: { type: 'token', token: 'ghp_your_token_here' },
//   analysis: {
//     reviewerUserName: 'coderabbit[bot]',
//     timePeriod: { start: Date, end: Date }
//   },
//   output: { format: 'json', outputDir: './reports' }
// }
```

## CLI Override Options

CLI arguments override environment variables:

```bash
# Override repository
npm run dev collect --repo owner/repo

# Override reviewer
npm run dev collect --reviewer coderabbit[bot]

# Override time period  
npm run dev collect --days 14

# Override output file
npm run dev collect --output ./custom-data.json

# Generate reports with custom settings
npm run dev report --format markdown --output ./reports/custom-report.md
npm run dev analyze --report json --report-output ./reports/analysis.json
```

## Report Generation Options

### Integrated Analysis + Reporting
```bash
# Analyze and generate Markdown report
npm run dev analyze --input ./temp/pr-data.json --report markdown

# Analyze and generate JSON report with custom output
npm run dev analyze --input ./temp/pr-data.json --report json --report-output ./reports/analysis.json

# Analyze with detailed console output and generate report
npm run dev analyze --input ./temp/pr-data.json --detailed --report markdown --report-output ./reports/detailed-analysis.md
```

## Authentication Options

### Personal Access Token (Recommended)
```bash
GITHUB_AUTH_TYPE=token
GITHUB_TOKEN=ghp_your_token_here
```

### GitHub App Authentication
```bash
GITHUB_AUTH_TYPE=app
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key_here
GITHUB_APP_INSTALLATION_ID=your_installation_id
```

## Simplified Architecture

This configuration system provides:
- Environment variable-based configuration
- CLI argument overrides
- Secure credential handling
- Default value fallbacks
- Type-safe configuration objects

The system focuses on essential functionality without complex validation schemas or file-based configuration loading.