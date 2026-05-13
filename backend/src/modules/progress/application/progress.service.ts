import { Injectable, BadRequestException } from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { TierProgressService } from '../../exercises/application/tier-progress.service';
import { UserProgress } from '../domain/user-progress.entity';
import { ProgressStatus, ExerciseTier } from '../../../common/enums';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly tierProgressService: TierProgressService,
  ) {}

  async startLesson(userId: string, lessonId: string): Promise<UserProgress> {
    const existing = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    if (existing) {
      return this.progressRepository.update(existing.id, {
        status: ProgressStatus.IN_PROGRESS,
        lastAccessedAt: new Date(),
      });
    }

    return this.progressRepository.create({
      userId,
      lessonId,
      status: ProgressStatus.IN_PROGRESS,
      lastAccessedAt: new Date(),
    });
  }

  async markContentReviewed(
    userId: string,
    lessonId: string,
  ): Promise<UserProgress> {
    const existing = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    if (existing) {
      return this.progressRepository.update(existing.id, {
        contentViewed: true,
        lastAccessedAt: new Date(),
      });
    }

    return this.progressRepository.create({
      userId,
      lessonId,
      contentViewed: true,
      status: ProgressStatus.IN_PROGRESS,
      lastAccessedAt: new Date(),
    });
  }

  async completeLesson(
    userId: string,
    lessonId: string,
    score: number,
  ): Promise<UserProgress> {
    const progress = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    if (!progress) {
      throw new Error('Progress not found');
    }

    if (!progress.contentViewed) {
      throw new BadRequestException(
        'Content must be viewed before completing lesson',
      );
    }

    const summary = await this.tierProgressService.getLessonTierSummary(
      lessonId,
      userId,
    );

    const hasExercises = summary.sets.length > 0;
    if (hasExercises) {
      const basicSet = summary.sets.find((s) => s.tier === ExerciseTier.BASIC);
      if (!basicSet || basicSet.percentComplete < 100) {
        throw new BadRequestException(
          'Basic tier must be completed before completing lesson',
        );
      }
    }

    return this.progressRepository.update(progress.id, {
      status: ProgressStatus.COMPLETED,
      score,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    });
  }

  async updateTimeSpent(
    userId: string,
    lessonId: string,
    additionalTime: number,
  ): Promise<UserProgress> {
    const progress = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    if (!progress) {
      throw new Error('Progress not found');
    }

    const currentTimeSpent = progress.timeSpent ?? 0;
    const newTimeSpent = currentTimeSpent + (additionalTime || 0);

    return this.progressRepository.update(progress.id, {
      timeSpent: newTimeSpent,
      lastAccessedAt: new Date(),
    });
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.progressRepository.findByUserId(userId);
  }

  async getLessonProgress(
    userId: string,
    lessonId: string,
  ): Promise<UserProgress | null> {
    return this.progressRepository.findByUserAndLesson(userId, lessonId);
  }

  async getLessonExerciseStatus(
    userId: string,
    lessonId: string,
  ): Promise<{
    contentViewed: boolean;
    hasIncompleteSet: boolean;
    incompleteSetId: string | null;
    incompleteSetAttempted: number;
    incompleteSetTotal: number;
    unlockedTiers: ExerciseTier[];
  }> {
    const progress = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    const contentViewed = progress?.contentViewed ?? false;

    const summary = await this.tierProgressService.getLessonTierSummary(
      lessonId,
      userId,
    );

    const incompleteSet = summary.sets.find(
      (s) => s.attempted > 0 && s.attempted < s.totalExercises,
    );

    return {
      contentViewed,
      hasIncompleteSet: !!incompleteSet,
      incompleteSetId: incompleteSet?.setId ?? null,
      incompleteSetAttempted: incompleteSet?.attempted ?? 0,
      incompleteSetTotal: incompleteSet?.totalExercises ?? 0,
      unlockedTiers: summary.unlockedTiers,
    };
  }
}
