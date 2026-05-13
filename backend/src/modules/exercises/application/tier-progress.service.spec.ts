import { TierProgressService } from './tier-progress.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseTier } from '../../../common/enums';

describe('TierProgressService', () => {
  let service: TierProgressService;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let resultsRepo: jest.Mocked<UserExerciseResultsRepository>;

  beforeEach(() => {
    exerciseSetsRepo = {
      findActiveByLessonId: jest.fn(),
      findById: jest.fn(),
    } as any;

    exercisesRepo = {
      findBySetId: jest.fn(),
    } as any;

    resultsRepo = {
      findByUserAndExerciseIds: jest.fn(),
    } as any;

    service = new TierProgressService(
      exerciseSetsRepo,
      exercisesRepo,
      resultsRepo,
    );
  });

  describe('computeUnlockedTiers', () => {
    it('always unlocks BASIC', () => {
      const result = service.computeUnlockedTiers([]);
      expect(result).toEqual([ExerciseTier.BASIC]);
    });

    it('unlocks EASY when BASIC completed with >=80% correct', () => {
      const progresses = [
        {
          setId: 'set-basic',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 8,
          percentComplete: 100,
          percentCorrect: 80,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC, ExerciseTier.EASY]);
    });

    it('does NOT unlock EASY when BASIC <80% correct', () => {
      const progresses = [
        {
          setId: 'set-basic',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 7,
          percentComplete: 100,
          percentCorrect: 70,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC]);
    });

    it('does NOT unlock EASY when BASIC not fully attempted', () => {
      const progresses = [
        {
          setId: 'set-basic',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 9,
          correct: 9,
          percentComplete: 90,
          percentCorrect: 100,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC]);
    });

    it('unlocks sequentially through all tiers', () => {
      const progresses = [
        {
          setId: 'set-basic',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 9,
          percentComplete: 100,
          percentCorrect: 90,
        },
        {
          setId: 'set-easy',
          tier: ExerciseTier.EASY,
          title: 'Easy',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 8,
          percentComplete: 100,
          percentCorrect: 80,
        },
        {
          setId: 'set-medium',
          tier: ExerciseTier.MEDIUM,
          title: 'Medium',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 10,
          percentComplete: 100,
          percentCorrect: 100,
        },
        {
          setId: 'set-hard',
          tier: ExerciseTier.HARD,
          title: 'Hard',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 8,
          percentComplete: 100,
          percentCorrect: 80,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([
        ExerciseTier.BASIC,
        ExerciseTier.EASY,
        ExerciseTier.MEDIUM,
        ExerciseTier.HARD,
        ExerciseTier.EXPERT,
      ]);
    });

    it('stops unlock chain at incomplete tier', () => {
      const progresses = [
        {
          setId: 'set-basic',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 9,
          percentComplete: 100,
          percentCorrect: 90,
        },
        {
          setId: 'set-easy',
          tier: ExerciseTier.EASY,
          title: 'Easy',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 5,
          correct: 5,
          percentComplete: 50,
          percentCorrect: 100,
        },
        {
          setId: 'set-medium',
          tier: ExerciseTier.MEDIUM,
          title: 'Medium',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 10,
          percentComplete: 100,
          percentCorrect: 100,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC, ExerciseTier.EASY]);
    });

    it('boundary: 79% correct does NOT unlock next tier', () => {
      const progresses = [
        {
          setId: 'set-basic-100',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 100,
          attempted: 100,
          correct: 79,
          percentComplete: 100,
          percentCorrect: 79,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC]);
    });

    it('boundary: 80% correct DOES unlock next tier', () => {
      const progresses = [
        {
          setId: 'set-basic-100',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 100,
          attempted: 100,
          correct: 80,
          percentComplete: 100,
          percentCorrect: 80,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC, ExerciseTier.EASY]);
    });

    it('cannot skip tiers even if higher tier is complete', () => {
      const progresses = [
        {
          setId: 'set-basic',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 5,
          correct: 5,
          percentComplete: 50,
          percentCorrect: 100,
        },
        {
          setId: 'set-medium',
          tier: ExerciseTier.MEDIUM,
          title: 'Medium',
          isCustom: false,
          isAIGenerated: false,
          totalExercises: 10,
          attempted: 10,
          correct: 10,
          percentComplete: 100,
          percentCorrect: 100,
        },
      ];
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual([ExerciseTier.BASIC]);
    });

    it('EXPERT completion does not unlock beyond EXPERT', () => {
      const progresses = TIER_ORDER.map((tier) => ({
        setId: `set-${tier}`,
        tier,
        title: tier,
        isCustom: false,
        isAIGenerated: false,
        totalExercises: 10,
        attempted: 10,
        correct: 9,
        percentComplete: 100,
        percentCorrect: 90,
      }));
      const result = service.computeUnlockedTiers(progresses);
      expect(result).toEqual(TIER_ORDER);
      expect(result).toHaveLength(5);
    });
  });

  describe('getLessonTierSummary', () => {
    it('returns sets with progress and unlockedTiers', async () => {
      const mockSets = [
        {
          id: 'set-1',
          lessonId: 'lesson-1',
          tier: ExerciseTier.BASIC,
          title: 'Basic Exercises',
          isCustom: false,
          isAIGenerated: false,
          orderIndex: 0,
        },
      ];
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue(mockSets as any);

      const exercises = [{ id: 'ex-1' }, { id: 'ex-2' }];
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = [{ isCorrect: true }, { isCorrect: false }];
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const summary = await service.getLessonTierSummary('lesson-1', 'user-1');

      expect(summary.sets).toHaveLength(1);
      expect(summary.sets[0].tier).toBe(ExerciseTier.BASIC);
      expect(summary.sets[0].totalExercises).toBe(2);
      expect(summary.sets[0].attempted).toBe(2);
      expect(summary.sets[0].correct).toBe(1);
      expect(summary.sets[0].percentComplete).toBe(100);
      expect(summary.sets[0].percentCorrect).toBe(50);
      expect(summary.unlockedTiers).toEqual([ExerciseTier.BASIC]);
    });

    it('handles empty lesson (no sets)', async () => {
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue([]);

      const summary = await service.getLessonTierSummary('lesson-1', 'user-1');

      expect(summary.sets).toHaveLength(0);
      expect(summary.unlockedTiers).toEqual([ExerciseTier.BASIC]);
    });

    it('handles set with no exercises', async () => {
      const mockSets = [
        {
          id: 'set-1',
          lessonId: 'lesson-1',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          orderIndex: 0,
        },
      ];
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue(mockSets as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);

      const summary = await service.getLessonTierSummary('lesson-1', 'user-1');

      expect(summary.sets).toHaveLength(1);
      expect(summary.sets[0].totalExercises).toBe(0);
      expect(summary.sets[0].attempted).toBe(0);
      expect(summary.sets[0].percentComplete).toBe(0);
      expect(summary.sets[0].percentCorrect).toBe(0);
    });

    it('unlock is permanent - completing EASY tier keeps MEDIUM unlocked even if EASY progress later changes', async () => {
      const mockSets = [
        {
          id: 'set-basic',
          lessonId: 'lesson-1',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          orderIndex: 0,
        },
        {
          id: 'set-easy',
          lessonId: 'lesson-1',
          setId: 'set-easy',
          tier: ExerciseTier.EASY,
          title: 'Easy',
          isCustom: false,
          isAIGenerated: true,
          orderIndex: 1,
        },
      ];
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue(mockSets as any);

      exercisesRepo.findBySetId.mockImplementation(async (setId: string) => {
        if (setId === 'set-basic') {
          return Array.from({ length: 10 }, (_, i) => ({
            id: `ex-basic-${i}`,
          })) as any;
        }
        return Array.from({ length: 8 }, (_, i) => ({
          id: `ex-easy-${i}`,
        })) as any;
      });

      resultsRepo.findByUserAndExerciseIds.mockImplementation(
        async (_userId: string, exerciseIds: string[]) => {
          if (exerciseIds[0]?.startsWith('ex-basic')) {
            return Array.from({ length: 10 }, (_, i) => ({
              isCorrect: i < 9,
            })) as any;
          }
          return Array.from({ length: 8 }, (_, i) => ({
            isCorrect: i < 7,
          })) as any;
        },
      );

      const summary = await service.getLessonTierSummary('lesson-1', 'user-1');

      expect(summary.unlockedTiers).toEqual([
        ExerciseTier.BASIC,
        ExerciseTier.EASY,
        ExerciseTier.MEDIUM,
      ]);

      expect(
        summary.sets.find((s) => s.tier === ExerciseTier.EASY)!.percentCorrect,
      ).toBe(87.5);
    });

    it('at tier N, all tiers <= N are accessible', async () => {
      const mockSets = [
        {
          id: 'set-basic',
          lessonId: 'lesson-1',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          orderIndex: 0,
        },
        {
          id: 'set-easy',
          lessonId: 'lesson-1',
          setId: 'set-easy',
          tier: ExerciseTier.EASY,
          title: 'Easy',
          isCustom: false,
          isAIGenerated: true,
          orderIndex: 1,
        },
      ];
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue(mockSets as any);

      exercisesRepo.findBySetId.mockImplementation(async (setId: string) => {
        if (setId === 'set-basic') {
          return Array.from({ length: 10 }, (_, i) => ({
            id: `ex-basic-${i}`,
          })) as any;
        }
        return Array.from({ length: 8 }, (_, i) => ({
          id: `ex-easy-${i}`,
        })) as any;
      });

      resultsRepo.findByUserAndExerciseIds.mockImplementation(
        async (_userId: string, exerciseIds: string[]) => {
          if (exerciseIds[0]?.startsWith('ex-basic')) {
            return Array.from({ length: 10 }, (_, i) => ({
              isCorrect: i < 9,
            })) as any;
          }
          return Array.from({ length: 8 }, (_, i) => ({
            isCorrect: i < 7,
          })) as any;
        },
      );

      const summary = await service.getLessonTierSummary('lesson-1', 'user-1');

      expect(summary.unlockedTiers).toContain(ExerciseTier.BASIC);
      expect(summary.unlockedTiers).toContain(ExerciseTier.EASY);
      expect(summary.unlockedTiers).toContain(ExerciseTier.MEDIUM);
      expect(summary.unlockedTiers).not.toContain(ExerciseTier.HARD);
    });
  });

  describe('getCompactTierSummary', () => {
    it('returns compact summary with all 5 tiers, BASIC completed unlocks EASY', async () => {
      const mockSets = [
        {
          id: 'set-basic',
          lessonId: 'lesson-1',
          tier: ExerciseTier.BASIC,
          title: 'Basic Exercises',
          isCustom: false,
          isAIGenerated: false,
          orderIndex: 0,
        },
      ];
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue(mockSets as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 10 }, (_, i) => ({
        isCorrect: i < 8,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const summary = await service.getCompactTierSummary('lesson-1', 'user-1');

      expect(summary.currentTier).toBe(ExerciseTier.EASY);
      expect(summary.unlockedTiers).toEqual([
        ExerciseTier.BASIC,
        ExerciseTier.EASY,
      ]);
      expect(summary.tiers).toHaveLength(5);
      expect(summary.tiers[0]).toEqual({
        tier: ExerciseTier.BASIC,
        status: 'completed',
        percentCorrect: 80,
      });
      expect(summary.tiers[1]).toEqual({
        tier: ExerciseTier.EASY,
        status: 'in_progress',
        percentCorrect: 0,
      });
      expect(summary.tiers[2]).toEqual({
        tier: ExerciseTier.MEDIUM,
        status: 'locked',
        percentCorrect: 0,
      });
    });

    it('shows in_progress for unlocked tier with partial attempt', async () => {
      const mockSets = [
        {
          id: 'set-basic',
          lessonId: 'lesson-1',
          tier: ExerciseTier.BASIC,
          title: 'Basic',
          isCustom: false,
          isAIGenerated: false,
          orderIndex: 0,
        },
      ];
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue(mockSets as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 5 }, (_, i) => ({
        isCorrect: i < 4,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const summary = await service.getCompactTierSummary('lesson-1', 'user-1');

      expect(summary.currentTier).toBe(ExerciseTier.BASIC);
      expect(summary.tiers[0].status).toBe('in_progress');
      expect(summary.tiers[0].percentCorrect).toBe(80);
    });

    it('handles lesson with no exercise sets', async () => {
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue([]);

      const summary = await service.getCompactTierSummary('lesson-1', 'user-1');

      expect(summary.currentTier).toBe(ExerciseTier.BASIC);
      expect(summary.unlockedTiers).toEqual([ExerciseTier.BASIC]);
      expect(summary.tiers).toHaveLength(5);
      expect(summary.tiers[0].status).toBe('in_progress');
      expect(summary.tiers[1].status).toBe('locked');
    });
  });

  describe('getSetProgress', () => {
    it('returns progress detail with nextTierUnlocked when condition met', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 10 }, (_, i) => ({
        isCorrect: i < 8,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const progress = await service.getSetProgress('set-1', 'user-1');

      expect(progress.totalExercises).toBe(10);
      expect(progress.attempted).toBe(10);
      expect(progress.correct).toBe(8);
      expect(progress.percentComplete).toBe(100);
      expect(progress.percentCorrect).toBe(80);
      expect(progress.nextTierUnlocked).toBe(ExerciseTier.EASY);
    });

    it('returns null nextTierUnlocked when condition not met', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 10 }, (_, i) => ({
        isCorrect: i < 7,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const progress = await service.getSetProgress('set-1', 'user-1');

      expect(progress.percentComplete).toBe(100);
      expect(progress.percentCorrect).toBe(70);
      expect(progress.nextTierUnlocked).toBeNull();
    });

    it('returns null nextTierUnlocked when not fully attempted', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 5 }, () => ({
        isCorrect: true,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const progress = await service.getSetProgress('set-1', 'user-1');

      expect(progress.percentComplete).toBe(50);
      expect(progress.nextTierUnlocked).toBeNull();
    });

    it('returns null nextTierUnlocked for EXPERT tier (no next)', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-expert',
        lessonId: 'lesson-1',
        tier: ExerciseTier.EXPERT,
        title: 'Expert',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 10 }, () => ({
        isCorrect: true,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const progress = await service.getSetProgress('set-expert', 'user-1');

      expect(progress.percentComplete).toBe(100);
      expect(progress.percentCorrect).toBe(100);
      expect(progress.nextTierUnlocked).toBeNull();
    });

    it('handles unknown set id', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      const progress = await service.getSetProgress('unknown', 'user-1');

      expect(progress.totalExercises).toBe(0);
      expect(progress.attempted).toBe(0);
      expect(progress.correct).toBe(0);
      expect(progress.percentComplete).toBe(0);
      expect(progress.percentCorrect).toBe(0);
      expect(progress.nextTierUnlocked).toBeNull();
    });

    it('handles empty set (no exercises)', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);

      const progress = await service.getSetProgress('set-1', 'user-1');

      expect(progress.totalExercises).toBe(0);
      expect(progress.percentComplete).toBe(0);
      expect(progress.percentCorrect).toBe(0);
      expect(progress.nextTierUnlocked).toBeNull();
    });

    it('boundary: 79% correct does NOT unlock', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 100 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 100 }, (_, i) => ({
        isCorrect: i < 79,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const progress = await service.getSetProgress('set-1', 'user-1');

      expect(progress.percentCorrect).toBe(79);
      expect(progress.nextTierUnlocked).toBeNull();
    });

    it('boundary: 80% correct DOES unlock', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 100 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 100 }, (_, i) => ({
        isCorrect: i < 80,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const progress = await service.getSetProgress('set-1', 'user-1');

      expect(progress.percentCorrect).toBe(80);
      expect(progress.nextTierUnlocked).toBe(ExerciseTier.EASY);
    });
  });
});

const TIER_ORDER: ExerciseTier[] = [
  ExerciseTier.BASIC,
  ExerciseTier.EASY,
  ExerciseTier.MEDIUM,
  ExerciseTier.HARD,
  ExerciseTier.EXPERT,
];
