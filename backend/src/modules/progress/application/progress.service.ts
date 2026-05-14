import { Injectable, BadRequestException } from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { UserProgress } from '../domain/user-progress.entity';
import { ProgressStatus } from '../../../common/enums';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
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
  }> {
    const progress = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    const contentViewed = progress?.contentViewed ?? false;

    return {
      contentViewed,
      hasIncompleteSet: false,
      incompleteSetId: null,
      incompleteSetAttempted: 0,
      incompleteSetTotal: 0,
    };
  }
}
