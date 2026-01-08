/**
 * Data processing logic for GitHub PR metrics analysis
 * Implements Requirements 2.4, 2.5, 2.6
 */

import { IDataProcessor } from './types/interfaces';
import { PullRequest, Comment, DateRange, Reaction, User } from './types/core';

/**
 * Data processor implementation for reaction classification and reply detection
 * Handles positive/negative reaction categorization and human response detection
 */
export class DataProcessor implements IDataProcessor {

  /**
   * Filter pull requests by time range
   * Ensures strict time period compliance
   */
  filterByTimeRange(prs: PullRequest[], period: DateRange): PullRequest[] {
    if (!prs || prs.length === 0) {
      return [];
    }

    return prs.filter(pr => {
      return pr.createdAt >= period.start && pr.createdAt <= period.end;
    });
  }

  /**
   * Filter comments by reviewer username
   * Case-insensitive matching for AI reviewer identification
   */
  filterByReviewer(comments: Comment[], userName: string): Comment[] {
    if (!comments || comments.length === 0 || !userName) {
      return [];
    }

    return comments.filter(comment => 
      comment.author.login.toLowerCase().trim() === userName.toLowerCase().trim()
    );
  }

  /**
   * Detect comment resolution status
   * Enhanced resolution detection logic
   */
  detectResolution(comments: Comment[]): Comment[] {
    if (!comments || comments.length === 0) {
      return [];
    }

    return comments.map(comment => ({
      ...comment,
      isResolved: this.isCommentResolved(comment)
    }));
  }

  /**
   * Classify reactions into positive/negative categories
   * Implements Requirements 2.4, 2.5
   * Also detects CodeRabbit "Addressed in commit" messages as synthetic positive reactions
   */
  classifyReactions(comments: Comment[]): Comment[] {
    if (!comments || comments.length === 0) {
      return [];
    }

    return comments.map(comment => {
      // Start with existing reactions
      let reactions = comment.reactions.map(reaction => ({
        ...reaction,
        // Add classification metadata without changing the core structure
        type: this.normalizeReactionType(reaction.type)
      }));

      // Add synthetic positive reaction for CodeRabbit "Addressed in commit" messages
      if (this.hasCodeRabbitResolutionMessage(comment)) {
        const syntheticReaction = {
          type: 'thumbs_up' as const,
          user: comment.author, // The author of the resolution message
          createdAt: comment.updatedAt || comment.createdAt,
          synthetic: true // Mark as synthetic to distinguish from real reactions
        };
        reactions = [...reactions, syntheticReaction];
      }

      return {
        ...comment,
        reactions
      };
    });
  }

  /**
   * Check if a comment contains CodeRabbit "Addressed in commit" message
   */
  private hasCodeRabbitResolutionMessage(comment: Comment): boolean {
    const patterns = [
      /addressed in commit [a-f0-9]{6,40}/i,
      /fixed in commit [a-f0-9]{6,40}/i,
      /resolved in commit [a-f0-9]{6,40}/i,
      /updated in commit [a-f0-9]{6,40}/i
    ];

    return patterns.some(pattern => pattern.test(comment.body));
  }

  /**
   * Detect human replies to AI comments
   * Implements Requirement 2.6
   */
  detectReplies(comments: Comment[]): Comment[] {
    if (!comments || comments.length === 0) {
      return [];
    }

    // Build a map of all comments for efficient lookup
    const commentMap = new Map<number, Comment>();
    comments.forEach(comment => commentMap.set(comment.id, comment));

    return comments.map(comment => ({
      ...comment,
      replies: this.findHumanReplies(comment, commentMap)
    }));
  }

  /**
   * Enhanced resolution detection logic
   * Checks multiple indicators for comment resolution
   */
  private isCommentResolved(comment: Comment): boolean {
    // Check explicit resolution markers
    if (this.hasExplicitResolutionMarkers(comment)) {
      return true;
    }

    // Check for resolution through positive engagement
    if (this.hasResolutionThroughEngagement(comment)) {
      return true;
    }

    // Check for resolution through edit history
    if (this.hasResolutionThroughEdits(comment)) {
      return true;
    }

    return false;
  }

  /**
   * Check for explicit resolution markers in comment body
   */
  private hasExplicitResolutionMarkers(comment: Comment): boolean {
    const bodyLower = comment.body.toLowerCase();
    
    // Check for explicit resolution markers
    const explicitMarkers = [
      '[resolved]',
      '✅',
      '[fixed]',
      '[done]',
      '☑️',
      '[completed]'
    ];

    return explicitMarkers.some(marker => bodyLower.includes(marker));
  }

  /**
   * Check for resolution through positive engagement
   */
  private hasResolutionThroughEngagement(comment: Comment): boolean {
    if (!comment.reactions || comment.reactions.length === 0) {
      return false;
    }

    // Count positive reactions
    const positiveReactions = comment.reactions.filter(reaction => 
      this.isPositiveReaction(reaction.type)
    );

    // Consider resolved if it has multiple positive reactions
    // This indicates the comment was well-received and likely addressed
    return positiveReactions.length >= 2;
  }

  /**
   * Check for resolution through comment edits
   */
  private hasResolutionThroughEdits(comment: Comment): boolean {
    // If comment was updated after creation, check for resolution keywords
    if (comment.updatedAt > comment.createdAt) {
      const bodyLower = comment.body.toLowerCase();
      const resolutionKeywords = [
        'resolved',
        'fixed',
        'done',
        'completed',
        'addressed',
        'implemented',
        'updated'
      ];

      return resolutionKeywords.some(keyword => bodyLower.includes(keyword));
    }

    return false;
  }

  /**
   * Classify reaction as positive
   * Implements Requirement 2.4
   */
  private isPositiveReaction(type: Reaction['type']): boolean {
    const positiveTypes: Reaction['type'][] = ['thumbs_up', 'heart', 'hooray', 'rocket'];
    return positiveTypes.includes(type);
  }

  /**
   * Classify reaction as negative
   * Implements Requirement 2.5
   */
  isNegativeReaction(type: Reaction['type']): boolean {
    const negativeTypes: Reaction['type'][] = ['thumbs_down', 'confused'];
    return negativeTypes.includes(type);
  }

  /**
   * Normalize reaction type to handle edge cases
   */
  private normalizeReactionType(type: string): Reaction['type'] {
    const validTypes: Reaction['type'][] = [
      'thumbs_up', 'thumbs_down', 'laugh', 'hooray', 'confused', 'heart', 'rocket', 'eyes'
    ];
    
    // Handle common variations and normalize
    const normalized = type.toLowerCase().replace(/[^a-z_]/g, '');
    
    if (validTypes.includes(normalized as Reaction['type'])) {
      return normalized as Reaction['type'];
    }
    
    // Handle common aliases
    const aliases: Record<string, Reaction['type']> = {
      'plus_one': 'thumbs_up',
      'plusone': 'thumbs_up',
      '+1': 'thumbs_up',
      'minus_one': 'thumbs_down',
      'minusone': 'thumbs_down',
      '-1': 'thumbs_down',
      'tada': 'hooray',
      'party': 'hooray',
      'celebrate': 'hooray'
    };

    if (aliases[normalized]) {
      return aliases[normalized];
    }
    
    return 'unknown';
  }

  /**
   * Find human replies to AI comments
   * Implements Requirement 2.6
   */
  private findHumanReplies(comment: Comment, commentMap: Map<number, Comment>): Comment[] {
    const replies: Comment[] = [];

    // Check direct replies using inReplyToId
    for (const [, potentialReply] of commentMap) {
      if (potentialReply.inReplyToId === comment.id) {
        // Only include if it's from a human (not a bot)
        if (this.isHumanUser(potentialReply.author)) {
          replies.push(potentialReply);
        }
      }
    }

    // For comments without explicit reply relationships,
    // use heuristics to detect conversational replies
    if (replies.length === 0) {
      replies.push(...this.findConversationalReplies(comment, commentMap));
    }

    // Sort replies by creation date
    return replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Detect conversational replies using heuristics
   * For platforms where explicit reply relationships aren't available
   */
  private findConversationalReplies(comment: Comment, commentMap: Map<number, Comment>): Comment[] {
    const replies: Comment[] = [];
    const commentTime = comment.createdAt.getTime();
    
    // Look for comments that might be replies based on timing and content
    for (const [, potentialReply] of commentMap) {
      // Skip if it's the same comment or from a bot
      if (potentialReply.id === comment.id || !this.isHumanUser(potentialReply.author)) {
        continue;
      }

      const replyTime = potentialReply.createdAt.getTime();
      
      // Check if it's a potential reply based on timing (within reasonable timeframe)
      const timeDiff = replyTime - commentTime;
      const maxReplyWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (timeDiff > 0 && timeDiff <= maxReplyWindow) {
        // Check for conversational indicators
        if (this.hasConversationalIndicators(potentialReply, comment)) {
          replies.push(potentialReply);
        }
      }
    }

    return replies;
  }

  /**
   * Check for conversational indicators that suggest a reply relationship
   */
  private hasConversationalIndicators(potentialReply: Comment, originalComment: Comment): boolean {
    const replyBody = potentialReply.body.toLowerCase();
    const originalAuthor = originalComment.author.login.toLowerCase();
    
    // Check for direct mentions
    if (replyBody.includes(`@${originalAuthor}`)) {
      return true;
    }

    // Check for reply indicators
    const replyIndicators = [
      'thanks',
      'thank you',
      'fixed',
      'done',
      'updated',
      'addressed',
      'good point',
      'you\'re right',
      'agreed',
      'disagree',
      'actually',
      'however'
    ];

    return replyIndicators.some(indicator => replyBody.includes(indicator));
  }

  /**
   * Determine if a user is human (not a bot)
   */
  private isHumanUser(user: User): boolean {
    // Check user type
    if (user.type === 'Bot') {
      return false;
    }

    // Check for common bot username patterns
    const botPatterns = [
      /bot$/i,
      /\[bot\]/i,
      /^dependabot/i,
      /^renovate/i,
      /^github-actions/i,
      /^codecov/i,
      /^sonarcloud/i,
      /^coderabbit/i
    ];

    return !botPatterns.some(pattern => pattern.test(user.login));
  }
}

/**
 * Reaction classification utilities
 * Provides standalone functions for reaction analysis
 */
export class ReactionClassifier {
  
  /**
   * Get all positive reactions from a comment
   * Implements Requirement 2.4
   */
  static getPositiveReactions(comment: Comment): Reaction[] {
    if (!comment.reactions) {
      return [];
    }

    return comment.reactions.filter(reaction => 
      this.isPositiveReaction(reaction.type)
    );
  }

  /**
   * Get all negative reactions from a comment
   * Implements Requirement 2.5
   */
  static getNegativeReactions(comment: Comment): Reaction[] {
    if (!comment.reactions) {
      return [];
    }

    return comment.reactions.filter(reaction => 
      this.isNegativeReaction(reaction.type)
    );
  }

  /**
   * Calculate reaction sentiment score
   * Returns a score between -1 (all negative) and 1 (all positive)
   * Includes synthetic reactions in the calculation
   */
  static calculateSentimentScore(comment: Comment): number {
    const positive = this.getPositiveReactions(comment).length;
    const negative = this.getNegativeReactions(comment).length;
    const total = positive + negative;

    if (total === 0) {
      return 0; // Neutral when no reactions
    }

    return (positive - negative) / total;
  }

  /**
   * Get only real (non-synthetic) positive reactions from a comment
   */
  static getRealPositiveReactions(comment: Comment): Reaction[] {
    if (!comment.reactions) {
      return [];
    }

    return comment.reactions.filter(reaction => 
      this.isPositiveReaction(reaction.type) && !reaction.synthetic
    );
  }

  /**
   * Get only synthetic positive reactions from a comment
   */
  static getSyntheticPositiveReactions(comment: Comment): Reaction[] {
    if (!comment.reactions) {
      return [];
    }

    return comment.reactions.filter(reaction => 
      this.isPositiveReaction(reaction.type) && reaction.synthetic
    );
  }

  private static isPositiveReaction(type: Reaction['type']): boolean {
    const positiveTypes: Reaction['type'][] = ['thumbs_up', 'heart', 'hooray', 'rocket'];
    return positiveTypes.includes(type);
  }

  private static isNegativeReaction(type: Reaction['type']): boolean {
    const negativeTypes: Reaction['type'][] = ['thumbs_down', 'confused'];
    return negativeTypes.includes(type);
  }
}

/**
 * Reply detection utilities
 * Provides standalone functions for reply analysis
 */
export class ReplyDetector {
  
  /**
   * Check if a comment has human replies
   * Implements Requirement 2.6
   */
  static hasHumanReplies(comment: Comment): boolean {
    return comment.replies && comment.replies.length > 0;
  }

  /**
   * Count human replies to a comment
   */
  static countHumanReplies(comment: Comment): number {
    if (!comment.replies) {
      return 0;
    }

    return comment.replies.filter(reply => 
      reply.author.type !== 'Bot'
    ).length;
  }

  /**
   * Get the fastest human reply time
   * Returns time in milliseconds from original comment to first human reply
   */
  static getFastestReplyTime(comment: Comment): number | null {
    if (!comment.replies || comment.replies.length === 0) {
      return null;
    }

    const humanReplies = comment.replies.filter(reply => 
      reply.author.type !== 'Bot'
    );

    if (humanReplies.length === 0) {
      return null;
    }

    const originalTime = comment.createdAt.getTime();
    const replyTimes = humanReplies.map(reply => 
      reply.createdAt.getTime() - originalTime
    );

    return Math.min(...replyTimes);
  }
}

/**
 * CodeRabbit detection utilities
 * Provides functions for detecting CodeRabbit-specific feedback patterns
 */
export class CodeRabbitDetector {
  
  /**
   * Check if a comment contains CodeRabbit "Addressed in commit" message
   */
  static hasAddressedInCommitMessage(comment: Comment): boolean {
    const patterns = [
      /addressed in commit [a-f0-9]{6,40}/i,
      /fixed in commit [a-f0-9]{6,40}/i,
      /resolved in commit [a-f0-9]{6,40}/i,
      /updated in commit [a-f0-9]{6,40}/i
    ];

    return patterns.some(pattern => pattern.test(comment.body));
  }

  /**
   * Extract commit hash from CodeRabbit "Addressed in commit" message
   */
  static extractCommitHash(comment: Comment): string | null {
    const pattern = /(?:addressed|fixed|resolved|updated) in commit ([a-f0-9]{6,40})/i;
    const match = comment.body.match(pattern);
    return match ? match[1] : null;
  }

  /**
   * Check if a comment is from CodeRabbit
   */
  static isCodeRabbitComment(comment: Comment): boolean {
    return comment.author.login.toLowerCase().includes('coderabbit');
  }

  /**
   * Count CodeRabbit resolution messages in a list of comments
   */
  static countResolutionMessages(comments: Comment[]): number {
    return comments.filter(comment => 
      this.hasAddressedInCommitMessage(comment)
    ).length;
  }

  /**
   * Get all CodeRabbit resolution messages from comments
   */
  static getResolutionMessages(comments: Comment[]): Comment[] {
    return comments.filter(comment => 
      this.hasAddressedInCommitMessage(comment)
    );
  }

  /**
   * Count synthetic positive reactions (from CodeRabbit resolution messages)
   */
  static countSyntheticPositiveReactions(comments: Comment[]): number {
    return comments.reduce((count, comment) => {
      const syntheticReactions = comment.reactions.filter(reaction => 
        reaction.synthetic && reaction.type === 'thumbs_up'
      );
      return count + syntheticReactions.length;
    }, 0);
  }
}

/**
 * Factory function to create a data processor
 */
export function createDataProcessor(): IDataProcessor {
  return new DataProcessor();
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createDataProcessor, ReactionClassifier, ReplyDetector, CodeRabbitDetector } from './processors';
 * 
 * const processor = createDataProcessor();
 * 
 * // Process comments
 * const classifiedComments = processor.classifyReactions(comments);
 * const commentsWithReplies = processor.detectReplies(classifiedComments);
 * 
 * // Analyze individual comments
 * const positiveReactions = ReactionClassifier.getPositiveReactions(comment);
 * const sentimentScore = ReactionClassifier.calculateSentimentScore(comment);
 * const hasReplies = ReplyDetector.hasHumanReplies(comment);
 * 
 * // CodeRabbit-specific analysis
 * const hasResolution = CodeRabbitDetector.hasAddressedInCommitMessage(comment);
 * const commitHash = CodeRabbitDetector.extractCommitHash(comment);
 * const resolutionCount = CodeRabbitDetector.countResolutionMessages(comments);
 * ```
 */

export { DataProcessor as default };