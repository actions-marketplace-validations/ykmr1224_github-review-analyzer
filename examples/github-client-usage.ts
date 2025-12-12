/**
 * Example usage of the GitHub API client
 */

import { GitHubClient } from '../src/github';
import { AuthConfig, RepositoryConfig } from '../src/config';

async function exampleUsage() {
  const client = new GitHubClient();

  // Example 1: Token authentication
  const tokenConfig: AuthConfig = {
    type: 'token',
    token: process.env.GITHUB_TOKEN || 'your-token-here'
  };

  // Example 2: GitHub App authentication
  const appConfig: AuthConfig = {
    type: 'app',
    app: {
      appId: process.env.GITHUB_APP_ID || 'your-app-id',
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY || 'your-private-key',
      installationId: process.env.GITHUB_APP_INSTALLATION_ID || 'your-installation-id'
    }
  };

  try {
    // Authenticate (choose one method)
    await client.authenticate(tokenConfig);
    // OR: await client.authenticate(appConfig);

    // Check authentication status
    console.log('Authenticated:', client.isAuthenticated());

    // Get rate limit info
    const rateLimit = await client.getRateLimit();
    console.log('Rate limit:', rateLimit);

    // Get pull requests for a repository
    const repo: RepositoryConfig = {
      owner: 'octocat',
      repo: 'Hello-World'
    };

    const period = {
      start: new Date('2023-01-01'),
      end: new Date('2023-12-31')
    };

    const pullRequests = await client.getPullRequests(repo, period);
    console.log(`Found ${pullRequests.length} pull requests`);

    // Get comments for a specific PR
    if (pullRequests.length > 0) {
      const comments = await client.getComments(repo, pullRequests[0].number);
      console.log(`Found ${comments.length} comments for PR #${pullRequests[0].number}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  exampleUsage();
}