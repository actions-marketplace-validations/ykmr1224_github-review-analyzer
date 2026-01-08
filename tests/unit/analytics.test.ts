/**
 * Tests for comment analytics and AI reviewer configuration
 */

import { CommentAnalytics } from '../../src/metrics';
import { AIReviewerUtils } from '../../src/config';
import { Comment, User } from '../../src/types/core';

describe('Comment Analytics', () => {
  describe('Comment Analytics', () => {
    const createComment = (body: string): Comment => ({
      id: 1,
      body,
      author: { login: 'test', type: 'User', id: 1 } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false,
      reactions: [],
      replies: [],
    });

    test('should classify suggestions correctly', () => {
      const comment = createComment('I suggest you refactor this function');
      expect(CommentAnalytics.classifyComment(comment)).toBe('suggestion');
    });

    test('should classify issues correctly', () => {
      const comment = createComment('There is a bug in this code');
      expect(CommentAnalytics.classifyComment(comment)).toBe('issue');
    });

    test('should classify questions correctly', () => {
      const comment = createComment('Why did you choose this approach?');
      expect(CommentAnalytics.classifyComment(comment)).toBe('question');
    });

    test('should classify praise correctly', () => {
      const comment = createComment('This looks great!');
      expect(CommentAnalytics.classifyComment(comment)).toBe('praise');
    });

    test('should classify unknown comments', () => {
      const comment = createComment('Random comment without keywords');
      expect(CommentAnalytics.classifyComment(comment)).toBe('unknown');
    });

    test('should calculate classification statistics correctly', () => {
      const comments: Comment[] = [
        createComment('I suggest improving this'),
        createComment('There is an issue here'),
        createComment('Random comment'),
      ];

      const stats = CommentAnalytics.getClassificationStats(comments);
      
      expect(stats.suggestion).toBe(1);
      expect(stats.issue).toBe(1);
      expect(stats.unknown).toBe(1);
      expect(stats.question).toBe(0);
      expect(stats.praise).toBe(0);
    });

    test('should calculate sentiment correctly', () => {
      expect(CommentAnalytics.calculateSentiment(createComment('This is great!'))).toBeGreaterThan(0);
      expect(CommentAnalytics.calculateSentiment(createComment('This is broken'))).toBeLessThan(0);
      expect(CommentAnalytics.calculateSentiment(createComment('Random comment'))).toBe(0);
    });

    test('should calculate sentiment statistics correctly', () => {
      const comments: Comment[] = [
        createComment('This is great!'),
        createComment('This is broken'),
        createComment('Random comment'),
      ];

      const stats = CommentAnalytics.getSentimentStats(comments);
      
      expect(stats.positive).toBe(1);
      expect(stats.negative).toBe(1);
      expect(stats.neutral).toBe(1);
    });
  });
});

describe('AI Reviewer Configuration', () => {
  describe('AI Reviewer Matching', () => {
    test('should match exact usernames', () => {
      expect(AIReviewerUtils.isAIReviewer('coderabbitai[bot]', 'coderabbitai[bot]')).toBe(true);
      expect(AIReviewerUtils.isAIReviewer('coderabbitai[bot]', 'human-user')).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(AIReviewerUtils.isAIReviewer('CodeRabbitAI[bot]', 'coderabbitai[bot]')).toBe(true);
      expect(AIReviewerUtils.isAIReviewer('CODERABBITAI[BOT]', 'coderabbitai[bot]')).toBe(true);
    });

    test('should handle whitespace', () => {
      expect(AIReviewerUtils.isAIReviewer(' coderabbitai[bot] ', 'coderabbitai[bot]')).toBe(true);
      expect(AIReviewerUtils.isAIReviewer('coderabbitai[bot]', ' coderabbitai[bot] ')).toBe(true);
    });
  });
});