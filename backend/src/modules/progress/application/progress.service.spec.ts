import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { TierProgressService } from '../../exercises/application/tier-progress.service';
import { ProgressStatus, ExerciseTier } from '../../../common/enums';

describe('ProgressService', () => {
  let service: ProgressService;
  let progressRepo: jest.Mocked<ProgressRepository>;
  let tierProgressService: jest.Mocked<TierProgressService>;

  beforeEach(() => {
    progressRepo = {
      findByUserAndLesson: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    tierProgressService = {
      getLessonTierSummary: jest.fn(),
    } as any;

    service = new ProgressService(progressRepo, tierProgressService);
  });

  describe('markContentReviewed', () => {
    it('creates progress with contentViewed=true when no existing progress', async () => {
      progressRepo.findByUserAndLesson.mockResolvedValue(null);
      progressRepo.create.mockResolvedValue({
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: true,
        lastAccessedAt: expect.any(Date),
      } as any);

      const result = await service.markContentReviewed('user-1', 'lesson-1');

      expect(progressRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          lessonId: 'lesson-1',
          contentViewed: true,
          status: ProgressStatus.IN_PROGRESS,
        }),
      );
      expect(result.contentViewed).toBe(true);
    });

    it('updates existing progress to contentViewed=true', async () => {
      const existing = {
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: false,
        lastAccessedAt: new Date(),
      };
      progressRepo.findByUserAndLesson.mockResolvedValue(existing as any);
      progressRepo.update.mockResolvedValue({
        ...existing,
        contentViewed: true,
      } as any);

      const result = await service.markContentReviewed('user-1', 'lesson-1');

      expect(progressRepo.update).toHaveBeenCalledWith('p-1', {
        contentViewed: true,
        lastAccessedAt: expect.any(Date),
      });
      expect(result.contentViewed).toBe(true);
    });

    it('does not reset contentViewed if already true', async () => {
      const existing = {
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: true,
        lastAccessedAt: new Date(),
      };
      progressRepo.findByUserAndLesson.mockResolvedValue(existing as any);
      progressRepo.update.mockResolvedValue(existing as any);

      await service.markContentReviewed('user-1', 'lesson-1');

      expect(progressRepo.update).toHaveBeenCalledWith('p-1', {
        contentViewed: true,
        lastAccessedAt: expect.any(Date),
      });
    });
  });

  describe('completeLesson', () => {
    it('rejects completion when contentViewed is false', async () => {
      const progress = {
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: false,
      };
      progressRepo.findByUserAndLesson.mockResolvedValue(progress as any);

      await expect(
        service.completeLesson('user-1', 'lesson-1', 80),
      ).rejects.toThrow('Content must be viewed before completing lesson');
    });

    it('rejects completion when basic tier not completed', async () => {
      const progress = {
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: true,
      };
      progressRepo.findByUserAndLesson.mockResolvedValue(progress as any);
      tierProgressService.getLessonTierSummary.mockResolvedValue({
        sets: [
          {
            setId: 'set-1',
            tier: ExerciseTier.BASIC,
            percentComplete: 50,
            percentCorrect: 80,
          },
        ],
        unlockedTiers: [ExerciseTier.BASIC],
      } as any);

      await expect(
        service.completeLesson('user-1', 'lesson-1', 80),
      ).rejects.toThrow(
        'Basic tier must be completed before completing lesson',
      );
    });

    it('allows completion when contentViewed=true and basic tier completed', async () => {
      const progress = {
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: true,
      };
      progressRepo.findByUserAndLesson.mockResolvedValue(progress as any);
      tierProgressService.getLessonTierSummary.mockResolvedValue({
        sets: [
          {
            setId: 'set-1',
            tier: ExerciseTier.BASIC,
            percentComplete: 100,
            percentCorrect: 90,
          },
        ],
        unlockedTiers: [ExerciseTier.BASIC, ExerciseTier.EASY],
      } as any);
      progressRepo.update.mockResolvedValue({
        ...progress,
        status: ProgressStatus.COMPLETED,
        score: 80,
      } as any);

      const result = await service.completeLesson('user-1', 'lesson-1', 80);

      expect(result.status).toBe(ProgressStatus.COMPLETED);
    });

    it('allows completion when lesson has no exercises (no basic tier set)', async () => {
      const progress = {
        id: 'p-1',
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: ProgressStatus.IN_PROGRESS,
        contentViewed: true,
      };
      progressRepo.findByUserAndLesson.mockResolvedValue(progress as any);
      tierProgressService.getLessonTierSummary.mockResolvedValue({
        sets: [],
        unlockedTiers: [ExerciseTier.BASIC],
      } as any);
      progressRepo.update.mockResolvedValue({
        ...progress,
        status: ProgressStatus.COMPLETED,
        score: 80,
      } as any);

      const result = await service.completeLesson('user-1', 'lesson-1', 80);

      expect(result.status).toBe(ProgressStatus.COMPLETED);
    });
  });
});
