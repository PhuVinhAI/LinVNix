import { ExerciseSetService } from './exercise-set.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { TierProgressService } from './tier-progress.service';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseTier } from '../../../common/enums';

describe('ExerciseSetService - Summary', () => {
  let service: ExerciseSetService;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let tierProgressService: jest.Mocked<TierProgressService>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let resultsRepo: jest.Mocked<UserExerciseResultsRepository>;

  beforeEach(() => {
    exerciseSetsRepo = {
      findById: jest.fn(),
    } as any;

    tierProgressService = {
      getSetProgress: jest.fn(),
      getLessonTierSummary: jest.fn(),
    } as any;

    exercisesRepo = {
      findBySetId: jest.fn(),
      findById: jest.fn(),
    } as any;

    resultsRepo = {
      findByUserAndExerciseIds: jest.fn(),
    } as any;

    service = new ExerciseSetService(
      exerciseSetsRepo,
      tierProgressService,
      exercisesRepo,
      resultsRepo,
    );
  });

  describe('getSummary', () => {
    it('returns overall stats with wrong questions and correct answers', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = [
        {
          id: 'ex-1',
          question: 'Question 1',
          exerciseType: 'MULTIPLE_CHOICE',
          correctAnswer: { value: 'A' },
          explanation: 'Because A is correct',
          orderIndex: 0,
        },
        {
          id: 'ex-2',
          question: 'Question 2',
          exerciseType: 'FILL_BLANK',
          correctAnswer: { value: 'B' },
          explanation: 'Because B is correct',
          orderIndex: 1,
        },
        {
          id: 'ex-3',
          question: 'Question 3',
          exerciseType: 'TRANSLATION',
          correctAnswer: { value: 'C' },
          explanation: 'Because C is correct',
          orderIndex: 2,
        },
      ];
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = [
        { exerciseId: 'ex-1', isCorrect: true },
        { exerciseId: 'ex-2', isCorrect: false },
        { exerciseId: 'ex-3', isCorrect: false },
      ];
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      tierProgressService.getSetProgress.mockResolvedValue({
        totalExercises: 3,
        attempted: 3,
        correct: 1,
        percentCorrect: 33.33,
        percentComplete: 100,
        nextTierUnlocked: null,
      });

      const summary = await service.getSummary('set-1', 'user-1');

      expect(summary.stats.totalExercises).toBe(3);
      expect(summary.stats.attempted).toBe(3);
      expect(summary.stats.correct).toBe(1);
      expect(summary.stats.percentCorrect).toBe(33.33);
      expect(summary.wrongQuestions).toHaveLength(2);
      expect(summary.wrongQuestions[0].exerciseId).toBe('ex-2');
      expect(summary.wrongQuestions[0].correctAnswer).toEqual({ value: 'B' });
      expect(summary.wrongQuestions[0].explanation).toBe(
        'Because B is correct',
      );
      expect(summary.wrongQuestions[1].exerciseId).toBe('ex-3');
    });

    it('returns empty wrongQuestions when all correct', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = [
        {
          id: 'ex-1',
          question: 'Q1',
          exerciseType: 'MULTIPLE_CHOICE',
          correctAnswer: { value: 'A' },
          explanation: 'Exp',
          orderIndex: 0,
        },
        {
          id: 'ex-2',
          question: 'Q2',
          exerciseType: 'FILL_BLANK',
          correctAnswer: { value: 'B' },
          explanation: 'Exp2',
          orderIndex: 1,
        },
      ];
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = [
        { exerciseId: 'ex-1', isCorrect: true },
        { exerciseId: 'ex-2', isCorrect: true },
      ];
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      tierProgressService.getSetProgress.mockResolvedValue({
        totalExercises: 2,
        attempted: 2,
        correct: 2,
        percentCorrect: 100,
        percentComplete: 100,
        nextTierUnlocked: ExerciseTier.EASY,
      });

      const summary = await service.getSummary('set-1', 'user-1');

      expect(summary.wrongQuestions).toHaveLength(0);
      expect(summary.nextTierUnlocked).toBe(ExerciseTier.EASY);
    });

    it('includes nextTierUnlocked when unlock condition met', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        tier: ExerciseTier.BASIC,
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
        question: `Q${i}`,
        exerciseType: 'MULTIPLE_CHOICE',
        correctAnswer: { value: 'A' },
        explanation: 'Exp',
        orderIndex: i,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 10 }, (_, i) => ({
        exerciseId: `ex-${i}`,
        isCorrect: i < 8,
      }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      tierProgressService.getSetProgress.mockResolvedValue({
        totalExercises: 10,
        attempted: 10,
        correct: 8,
        percentCorrect: 80,
        percentComplete: 100,
        nextTierUnlocked: ExerciseTier.EASY,
      });

      const summary = await service.getSummary('set-1', 'user-1');

      expect(summary.nextTierUnlocked).toBe(ExerciseTier.EASY);
    });

    it('throws NotFoundException for unknown set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.getSummary('missing', 'user-1')).rejects.toThrow(
        'ExerciseSet with ID missing not found',
      );
    });
  });
});
