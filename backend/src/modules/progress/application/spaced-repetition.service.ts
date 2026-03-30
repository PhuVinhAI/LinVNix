import { Injectable } from '@nestjs/common';
import { SPACED_REPETITION_INTERVALS } from '../../../common/constants';

@Injectable()
export class SpacedRepetitionService {
  /**
   * Calculate next review date based on review count and correctness
   * @param reviewCount Number of times reviewed
   * @param isCorrect Whether the last review was correct
   * @returns Next review date
   */
  calculateNextReview(reviewCount: number, isCorrect: boolean): Date {
    let intervalDays: number;

    if (!isCorrect) {
      // If incorrect, reset to 1 day
      intervalDays = 1;
    } else {
      // Use spaced repetition intervals
      const intervalIndex = Math.min(
        reviewCount,
        SPACED_REPETITION_INTERVALS.length - 1,
      );
      intervalDays = SPACED_REPETITION_INTERVALS[intervalIndex];
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);
    return nextReview;
  }

  /**
   * Calculate mastery level based on correct count
   * @param correctCount Number of correct reviews
   * @returns Mastery level: learning, familiar, mastered
   */
  calculateMasteryLevel(correctCount: number): string {
    if (correctCount >= 10) {
      return 'mastered';
    } else if (correctCount >= 3) {
      return 'familiar';
    }
    return 'learning';
  }

  /**
   * Get items due for review
   * @param items Array of items with nextReviewAt date
   * @returns Items that are due for review
   */
  getDueItems<T extends { nextReviewAt?: Date }>(items: T[]): T[] {
    const now = new Date();
    return items.filter(
      (item) => item.nextReviewAt && item.nextReviewAt <= now,
    );
  }

  /**
   * Calculate retention rate
   * @param correctCount Number of correct reviews
   * @param totalCount Total number of reviews
   * @returns Retention rate as percentage
   */
  calculateRetentionRate(correctCount: number, totalCount: number): number {
    if (totalCount === 0) return 0;
    return Math.round((correctCount / totalCount) * 100);
  }
}
