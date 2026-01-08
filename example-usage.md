# Example Usage

## Testing with a Public Repository

You can test the tool with any public GitHub repository. Here's a complete workflow example:

### 1. Set up minimal configuration
Create a `.env` file:
```env
GITHUB_REPOSITORY_OWNER=microsoft
GITHUB_REPOSITORY_NAME=vscode
REVIEWER_USERNAME=coderabbit[bot]
GITHUB_AUTH_TYPE=token
GITHUB_TOKEN=your_token_here
```

### 2. Complete workflow with automatic report generation
```bash
# Build first
npm run build

# Step 1: Collect data
github-pr-metrics collect --repo microsoft/vscode --reviewer coderabbit[bot] --days 7

# Step 2: Analyze and generate report (JSON by default)
github-pr-metrics analyze --input ./temp/pr-data.json

# Step 3: Generate Markdown report for human reading
github-pr-metrics analyze --input ./temp/pr-data.json --report markdown

# Or use npm scripts for development
npm run start collect --repo microsoft/vscode --reviewer coderabbit[bot] --days 7
npm run start analyze --input ./temp/pr-data.json --report markdown
```

## What You'll See

The tool operates in two streamlined phases:

### Collection Phase
1. **Configuration Summary** - Repository, reviewer, time period
2. **Data Collection Status** - PRs and comments found
3. **Data Storage Confirmation** - JSON file location

### Analysis Phase  
1. **Data Loading Status** - Validation and summary
2. **Processing Status** - Metrics calculation
3. **Report Generation** - Automatic report creation in specified format
4. **Comprehensive Metrics** - Summary statistics, reaction analysis, effectiveness indicators
5. **Overall Assessment** - Color-coded effectiveness rating

### Report Generation Phase
1. **Report Format Confirmation** - Selected format and output path (integrated with analysis)
2. **Data Processing Status** - Metrics calculation for report (shared with analysis)
3. **Report Generation Status** - Template processing and file creation
4. **Output Confirmation** - Final report location and summary

## Example Output

### Collection Phase Output
```
🚀 GitHub PR Metrics Analyzer
================================

📋 Loading configuration...
📊 Repository: microsoft/vscode
👤 Reviewer: coderabbit[bot]
📅 Period: 2024-12-04 to 2024-12-11

🔐 Authenticating with GitHub...
✅ Authentication successful

📥 Collecting pull requests...
✅ Found 15 pull requests

📋 Pull Requests Summary:
========================
1. #1234: Fix memory leak in extension host
   State: merged | Author: developer123
   Created: 2024-12-10

💬 Collecting reviewer comments...
✅ Found 23 comments from coderabbit[bot]

💾 Saving data to JSON file...
✅ Data saved to: ./temp/pr-data.json

📊 Collection Summary:
   Repository: microsoft/vscode
   Reviewer: coderabbit[bot]
   Period: 2024-12-04 to 2024-12-11
   Total PRs: 15
   Total Comments: 23

🎉 Data collection complete!
```

### Analysis Phase Output
```
🚀 GitHub PR Metrics Analyzer - Analysis Mode
=============================================

📖 Reading data from JSON file...
✅ Data loaded successfully

📋 Analysis Metadata:
   Repository: microsoft/vscode
   Reviewer: coderabbit[bot]
   Period: 2024-12-04 to 2024-12-11
   Data collected: 12/11/2024, 2:30:00 PM
   Total PRs: 15
   Total Comments: 23

🔄 Processing data and calculating metrics...
✅ Metrics calculation complete

📊 Comprehensive Metrics Analysis:
==================================

📋 Summary Metrics:
   Total PRs: 15
   Total Comments: 23
   Average Comments per PR: 1.53
   Resolved Comments: 18 (78.3%)
   Comments with Replies: 12 (52.2%)

👍 Reaction Analysis:
   Positive Reactions: 34
   Negative Reactions: 2
   Positive Ratio: 94.4%
   Overall Sentiment: 😊 Positive

🎯 Effectiveness Indicators:
   Resolution Rate: 78.3% 🟢
   Engagement Rate: 52.2% 🟢
   Positivity Rate: 94.4% 🟢

🏆 Overall AI Reviewer Effectiveness: 75.0% 🟢 Excellent

📄 Generating MARKDOWN report...
💾 Saving report to: ./temp/pr-data-report.md
✅ Report saved successfully

📊 Report Summary:
   Repository: microsoft/vscode
   Reviewer: coderabbit[bot]
   Period: 2024-12-04 to 2024-12-11
   Format: MARKDOWN
   Output: ./temp/pr-data-report.md
   Total PRs: 15
   Total Comments: 23
   Resolution Rate: 78.3%

🎉 Analysis complete!
```

### Report Generation Output
```
(Integrated with Analysis - no separate command needed)

📄 Generating MARKDOWN report...
💾 Saving report to: ./temp/pr-data-report.md
✅ Report saved successfully

📊 Report Summary:
   Repository: microsoft/vscode
   Reviewer: coderabbit[bot]
   Period: 2024-12-04 to 2024-12-11
   Format: MARKDOWN
   Output: ./temp/pr-data-report.md
   Total PRs: 15
   Total Comments: 23
   Resolution Rate: 78.3%
```

## Generated Report Examples

### Markdown Report Sample
```markdown
# GitHub PR Metrics Report

## Repository Analysis
- **Repository**: microsoft/vscode
- **Analysis Period**: December 4, 2024 to December 11, 2024
- **AI Reviewer**: coderabbit[bot]
- **Generated**: December 11, 2024

## Summary Metrics

| Metric | Value |
|--------|-------|
| Total Pull Requests | 15 |
| Total AI Comments | 23 |
| Average Comments per PR | 1.53 |
| Comments with Positive Reactions | 34 |
| Comments with Negative Reactions | 2 |
| Comments with Human Replies | 12 |
| Resolved Comments | 18 |

## Engagement Analysis

### Reaction Distribution
- **Positive Reactions**: 34 (94.4%)
- **Negative Reactions**: 2 (5.6%)

### Response Rate
- **Comments with Replies**: 12 (52.2%)
- **Resolution Rate**: 18 (78.3%)
```

### JSON Report Sample
```json
{
  "metadata": {
    "repository": "microsoft/vscode",
    "period": {
      "start": "2024-12-04T00:00:00.000Z",
      "end": "2024-12-11T23:59:59.999Z"
    },
    "reviewer": "coderabbit[bot]",
    "generatedAt": "2024-12-11T14:30:00.000Z"
  },
  "summary": {
    "pullRequests": { "total": 15 },
    "comments": { "total": 23, "averagePerPR": 1.53 },
    "reactions": {
      "positive": 34,
      "negative": 2,
      "positivePercentage": 94.4,
      "negativePercentage": 5.6
    },
    "engagement": {
      "repliedComments": 12,
      "resolvedComments": 18,
      "replyRate": 52.2,
      "resolutionRate": 78.3
    }
  }
}
```

## Next Steps

Once you verify the data collection, analysis, and report generation works, you can:
1. Configure it for your own repositories
2. Analyze different reviewers (CodeRabbit, GitHub Copilot, etc.)
3. Experiment with different time periods and report formats
4. Use the `--detailed` flag for comprehensive comment analysis
5. Integrate generated reports into documentation or presentations
6. Set up automated collection, analysis, and reporting workflows
7. Use JSON reports for further data processing or integration with other tools

The streamlined CLI now provides all functionality through the `analyze` command, eliminating redundancy while maintaining full reporting capabilities.