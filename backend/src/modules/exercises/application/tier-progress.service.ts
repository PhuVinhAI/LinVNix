import { Injectable } from '@nestjs/common';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { ExerciseTier } from '../../../common/enums';

export interface TierProgress {
  tier: ExerciseTier;
  title: string;
  isCustom: boolean;
  isAIGenerated: boolean;
  totalExercises: number;
  attempted: number;
  correct: number;
  percentComplete: number;
  percentCorrect: number;
}

export interface SetProgressDetail {
  totalExercises: number;
  attempted: number;
  correct: number;
  percentCorrect: number;
  percentComplete: number;
  nextTierUnlocked: ExerciseTier | null;
}

export interface LessonTierSummary {
  sets: TierProgress[];
  unlockedTiers: ExerciseTier[];
}

const TIER_ORDER: ExerciseTier[] = [
  ExerciseTier.BASIC,
  ExerciseTier.EASY,
  ExerciseTier.MEDIUM,
  ExerciseTier.HARD,
  ExerciseTier.EXPERT,
];

@Injectable()
export class TierProgressService {
  constructor(
    private readonly exerciseSetsRepository: ExerciseSetsRepository,
    private readonly exercisesRepository: ExercisesRepository,
    private readonly userExerciseResultsRepository: UserExerciseResultsRepository,
  ) {}

  async getSetProgress(
    setId: string,
    userId: string,
  ): Promise<SetProgressDetail> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      return {
        totalExercises: 0,
        attempted: 0,
        correct: 0,
        percentCorrect: 0,
        percentComplete: 0,
        nextTierUnlocked: null,
      };
    }

    const exercises = await this.exercisesRepository.findBySetId(setId);
    const exerciseIds = exercises.map((e) => e.id);
    const totalExercises = exerciseIds.length;

    let attempted = 0;
    let correct = 0;

    if (totalExercises > 0 && userId) {
      const results =
        await this.userExerciseResultsRepository.findByUserAndExerciseIds(
          userId,
          exerciseIds,
        );
      attempted = results.length;
      correct = results.filter((r) => r.isCorrect).length;
    }

    const percentComplete =
      totalExercises > 0 ? (attempted / totalExercises) * 100 : 0;
    const percentCorrect = attempted > 0 ? (correct / attempted) * 100 : 0;

    const nextTierUnlocked =
      percentComplete === 100 && percentCorrect >= 80
        ? this.getNextTier(set.tier)
        : null;

    return {
      totalExercises,
      attempted,
      correct,
      percentCorrect: Math.round(percentCorrect * 100) / 100,
      percentComplete: Math.round(percentComplete * 100) / 100,
      nextTierUnlocked,
    };
  }

  async checkUnlockAfterSubmission(
    lessonId: string,
    userId: string,
  ): Promise<ExerciseTier | null> {
    const summary = await this.getLessonTierSummary(lessonId, userId);
    return summary.unlockedTiers.length > 1
      ? summary.unlockedTiers[summary.unlockedTiers.length - 1]
      : null;
  }

  async getLessonTierSummary(
    lessonId: string,
    userId: string,
  ): Promise<LessonTierSummary> {
    const sets =
      await this.exerciseSetsRepository.findActiveByLessonId(lessonId);
    const tierProgresses: TierProgress[] = [];

    for (const set of sets) {
      const exercises = await this.exercisesRepository.findBySetId(set.id);
      const exerciseIds = exercises.map((e) => e.id);
      const totalExercises = exerciseIds.length;

      let attempted = 0;
      let correct = 0;

      if (totalExercises > 0 && userId) {
        const results =
          await this.userExerciseResultsRepository.findByUserAndExerciseIds(
            userId,
            exerciseIds,
          );
        attempted = results.length;
        correct = results.filter((r) => r.isCorrect).length;
      }

      const percentComplete =
        totalExercises > 0 ? (attempted / totalExercises) * 100 : 0;
      const percentCorrect = attempted > 0 ? (correct / attempted) * 100 : 0;

      tierProgresses.push({
        tier: set.tier,
        title: set.title,
        isCustom: set.isCustom,
        isAIGenerated: set.isAIGenerated,
        totalExercises,
        attempted,
        correct,
        percentComplete: Math.round(percentComplete * 100) / 100,
        percentCorrect: Math.round(percentCorrect * 100) / 100,
      });
    }

    const unlockedTiers = this.computeUnlockedTiers(tierProgresses);

    return {
      sets: tierProgresses,
      unlockedTiers,
    };
  }

  computeUnlockedTiers(tierProgresses: TierProgress[]): ExerciseTier[] {
    const unlocked: ExerciseTier[] = [ExerciseTier.BASIC];

    for (let i = 0; i < TIER_ORDER.length - 1; i++) {
      const currentTier = TIER_ORDER[i];
      const nextTier = TIER_ORDER[i + 1];
      const progress = tierProgresses.find((p) => p.tier === currentTier);

      if (
        progress &&
        progress.percentComplete === 100 &&
        progress.percentCorrect >= 80
      ) {
        unlocked.push(nextTier);
      } else {
        break;
      }
    }

    return unlocked;
  }

  private getNextTier(currentTier: ExerciseTier): ExerciseTier | null {
    const idx = TIER_ORDER.indexOf(currentTier);
    if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
    return TIER_ORDER[idx + 1];
  }
}
