import { Injectable } from '@nestjs/common';
import { ExerciseType } from '../../../common/enums';

@Injectable()
export class ExerciseCheckerService {
  checkAnswer(
    exerciseType: ExerciseType,
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    switch (exerciseType) {
      case ExerciseType.MULTIPLE_CHOICE:
        return this.checkMultipleChoice(userAnswer, correctAnswer);

      case ExerciseType.FILL_BLANK:
        return this.checkFillBlank(userAnswer, correctAnswer);

      case ExerciseType.MATCHING:
        return this.checkMatching(userAnswer, correctAnswer);

      case ExerciseType.ORDERING:
        return this.checkOrdering(userAnswer, correctAnswer);

      case ExerciseType.TRANSLATION:
        return this.checkTranslation(userAnswer, correctAnswer);

      case ExerciseType.LISTENING:
        return this.checkListening(userAnswer, correctAnswer);

      default:
        return false;
    }
  }

  private checkMultipleChoice(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }

  private checkFillBlank(userAnswer: string, correctAnswer: string | string[]): boolean {
    const normalizedUserAnswer = this.normalizeVietnamese(userAnswer);

    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(
        (answer) =>
          this.normalizeVietnamese(answer) === normalizedUserAnswer,
      );
    }

    return this.normalizeVietnamese(correctAnswer) === normalizedUserAnswer;
  }

  private checkMatching(userAnswer: Record<string, string>, correctAnswer: Record<string, string>): boolean {
    const userKeys = Object.keys(userAnswer).sort();
    const correctKeys = Object.keys(correctAnswer).sort();

    if (userKeys.length !== correctKeys.length) {
      return false;
    }

    return userKeys.every(
      (key) =>
        userAnswer[key].trim().toLowerCase() ===
        correctAnswer[key]?.trim().toLowerCase(),
    );
  }

  private checkOrdering(userAnswer: string[], correctAnswer: string[]): boolean {
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }

    return userAnswer.every(
      (item, index) =>
        item.trim().toLowerCase() === correctAnswer[index].trim().toLowerCase(),
    );
  }

  private checkTranslation(userAnswer: string, correctAnswer: string | string[]): boolean {
    // Similar to fill blank but more lenient
    const normalizedUserAnswer = this.normalizeVietnamese(userAnswer);

    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some((answer) => {
        const normalized = this.normalizeVietnamese(answer);
        return this.calculateSimilarity(normalizedUserAnswer, normalized) > 0.8;
      });
    }

    const normalizedCorrect = this.normalizeVietnamese(correctAnswer);
    return this.calculateSimilarity(normalizedUserAnswer, normalizedCorrect) > 0.8;
  }

  private checkListening(userAnswer: string, correctAnswer: string): boolean {
    return this.checkFillBlank(userAnswer, correctAnswer);
  }

  private normalizeVietnamese(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?;:]/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
