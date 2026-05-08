import type {
  CheckerAdapter,
  AssessmentResult,
} from '../../domain/assessment.types';
import type { ListeningAnswer } from '../../domain/exercise-options.types';
import { normalizeVietnamese } from '../utils/text-normalizer';

export class ListeningChecker implements CheckerAdapter {
  check(
    userAnswer: ListeningAnswer,
    correctAnswer: ListeningAnswer,
  ): AssessmentResult {
    const userTranscript = userAnswer.transcript;
    const correctTranscript = correctAnswer.transcript;

    if (!userTranscript || !correctTranscript) {
      return { isCorrect: false, feedback: 'Missing transcript' };
    }

    const normalizedUser = normalizeVietnamese(userTranscript);
    const normalizedCorrect = normalizeVietnamese(correctTranscript);

    return { isCorrect: normalizedUser === normalizedCorrect };
  }
}
