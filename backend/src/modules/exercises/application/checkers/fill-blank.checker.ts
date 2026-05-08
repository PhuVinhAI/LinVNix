import type {
  CheckerAdapter,
  AssessmentResult,
} from '../../domain/assessment.types';
import type { FillBlankAnswer } from '../../domain/exercise-options.types';
import { normalizeVietnamese } from '../utils/text-normalizer';

export class FillBlankChecker implements CheckerAdapter {
  check(
    userAnswer: FillBlankAnswer,
    correctAnswer: FillBlankAnswer,
  ): AssessmentResult {
    const userAnswers = userAnswer.answers;
    const correctAnswers = correctAnswer.answers;

    if (userAnswers.length !== correctAnswers.length) {
      return {
        isCorrect: false,
        feedback: 'Number of answers does not match blanks',
      };
    }

    const allCorrect = userAnswers.every(
      (ans, i) =>
        normalizeVietnamese(ans) === normalizeVietnamese(correctAnswers[i]),
    );

    return { isCorrect: allCorrect };
  }
}
