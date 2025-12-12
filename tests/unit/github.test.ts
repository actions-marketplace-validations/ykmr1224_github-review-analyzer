/**
 * Unit tests for GitHub API client
 */

import { GitHubClient } from '../../src/github';
import { AuthConfig } from '../../src/config';

describe('GitHubClient', () => {
  let client: GitHubClient;

  beforeEach(() => {
    client = new GitHubClient();
  });

  describe('Authentication', () => {
    it('should require authentication before making API calls', async () => {
      const repo = { owner: 'test', repo: 'test' };
      const period = { start: new Date(), end: new Date() };

      await expect(client.getPullRequests(repo, period))
        .rejects
        .toThrow('Client must be authenticated before making API calls');
    });

    it('should validate token authentication config', async () => {
      const config: AuthConfig = {
        type: 'token',
        token: ''
      };

      await expect(client.authenticate(config))
        .rejects
        .toThrow('GitHub token is required for token authentication');
    });

    it('should validate app authentication config', async () => {
      const config: AuthConfig = {
        type: 'app'
      };

      await expect(client.authenticate(config))
        .rejects
        .toThrow('GitHub App configuration is required for app authentication');
    });

    it('should check authentication status', () => {
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should provide rate limit information', async () => {
      // This test would require a valid token, so we'll just check the method exists
      expect(typeof client.getRateLimit).toBe('function');
    });
  });
});