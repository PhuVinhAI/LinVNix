import type { ExerciseAnswer } from './exercise-options.types';

export interface AssessmentResult {
  isCorrect: boolean;
  similarity?: number;
  partialCredit?: number;
  feedback?: string;
}

export interface CheckerAdapter {
  check(
    userAnswer: ExerciseAnswer,
    correctAnswer: ExerciseAnswer,
  ): AssessmentResult;
}
