import type {
  CheckerAdapter,
  AssessmentResult,
} from '../../domain/assessment.types';
import type { TranslationAnswer } from '../../domain/exercise-options.types';
import {
  normalizeVietnamese,
  calculateSimilarity,
} from '../utils/text-normalizer';

export class TranslationChecker implements CheckerAdapter {
  private readonly SIMILARITY_THRESHOLD = 0.8;

  check(
    userAnswer: TranslationAnswer,
    correctAnswer: TranslationAnswer,
  ): AssessmentResult {
    const userTranslation = userAnswer.translation;
    const correctTranslation = correctAnswer.translation;

    if (!userTranslation || !correctTranslation) {
      return {
        isCorrect: false,
        similarity: 0,
        feedback: 'Missing translation',
      };
    }

    const normalizedUser = normalizeVietnamese(userTranslation);
    const normalizedCorrect = normalizeVietnamese(correctTranslation);
    const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

    return {
      isCorrect: similarity > this.SIMILARITY_THRESHOLD,
      similarity,
    };
  }
}
