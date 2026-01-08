# Example Usage

## Testing with a Public Repository

You can test the tool with any public GitHub repository without authentication for basic functionality:

### 1. Set up minimal configuration
Create a `.env` file:
```env
GITHUB_REPOSITORY_OWNER=microsoft
GITHUB_REPOSITORY_NAME=vscode
REVIEWER_USERNAME=github-actions
GITHUB_AUTH_TYPE=token
GITHUB_TOKEN=your_token_here
```

### 2. Run analysis
```bash
# Build first
npm run build

# Step 1: Collect data (development mode)
npm run dev collect --repo microsoft/vscode --reviewer dependabot --days 7

# Step 2: Analyze the collected data
npm run dev analyze --input ./temp/pr-data.json --detailed

# Or use built version
npm start collect --repo microsoft/vscode --reviewer dependabot --days 7
npm start analyze --input ./temp/pr-data.json --detailed
```

## What You'll See

The tool operates in two phases and will output:

### Collection Phase
1. **Configuration Summary** - Repository, reviewer, time period
2. **Authentication Status** - GitHub API connection
3. **Pull Requests Summary** - List of PRs found in the time period  
4. **Comments Summary** - Detailed breakdown of reviewer comments
5. **Data Storage Confirmation** - JSON file location and summary

### Analysis Phase  
1. **Data Loading Status** - Validation and metadata display
2. **Processing Status** - Data processing and metrics calculation
3. **Detailed Comment Analysis** - Individual comment breakdowns (with --detailed flag)
4. **Comprehensive Metrics** - Summary statistics, reaction analysis, effectiveness indicators
5. **Overall Assessment** - Color-coded effectiveness rating

## Example Output

### Collection Phase Output
```
🚀 GitHub PR Metrics Analyzer
================================

📋 Loading configuration...
📊 Repository: microsoft/vscode
👤 Reviewer: dependabot
📅 Period: 2024-12-04 to 2024-12-11

🔐 Authenticating with GitHub...
✅ Authentication successful

📥 Collecting pull requests...
✅ Found 15 pull requests

📋 Pull Requests Summary:
========================
1. #1234: Bump axios from 1.5.0 to 1.6.0
   State: merged | Author: dependabot[bot]
   Created: 2024-12-10

💬 Collecting reviewer comments...
✅ Found 8 comments from dependabot

💾 Saving data to JSON file...
✅ Data saved to: ./temp/pr-data.json

📊 Collection Summary:
   Repository: microsoft/vscode
   Reviewer: dependabot
   Period: 2024-12-04 to 2024-12-11
   Total PRs: 15
   Total Comments: 8

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
   Reviewer: dependabot
   Period: 2024-12-04 to 2024-12-11
   Data collected: 12/11/2024, 2:30:00 PM
   Total PRs: 15
   Total Comments: 8

🔄 Processing data and calculating metrics...
✅ Metrics calculation complete

📊 Comprehensive Metrics Analysis:
==================================

📋 Summary Metrics:
   Total PRs: 15
   Total Comments: 8
   Average Comments per PR: 0.53
   Resolved Comments: 6 (75.0%)
   Comments with Replies: 3 (37.5%)

👍 Reaction Analysis:
   Positive Reactions: 12
   Negative Reactions: 0
   Positive Ratio: 100.0%
   Overall Sentiment: 😊 Positive

🎯 Effectiveness Indicators:
   Resolution Rate: 75.0% 🟢
   Engagement Rate: 37.5% 🟡
   Positivity Rate: 100.0% 🟢

🏆 Overall AI Reviewer Effectiveness: 70.8% 🟢 Excellent

🎉 Analysis complete!
```

## Next Steps

Once you verify the data collection and analysis works, you can:
1. Configure it for your own repositories
2. Analyze different reviewers (CodeRabbit, GitHub Copilot, etc.)
3. Experiment with different time periods
4. Use the `--detailed` flag for comprehensive comment analysis
5. Integrate the collected JSON data with other analysis tools
6. Set up automated collection and analysis workflows