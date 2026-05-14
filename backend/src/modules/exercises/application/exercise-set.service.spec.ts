import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExerciseSetService } from './exercise-set.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseGenerationService } from './exercise-generation.service';
import { ExerciseType } from '../../../common/enums';

describe('ExerciseSetService', () => {
  let service: ExerciseSetService;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let resultsRepo: jest.Mocked<UserExerciseResultsRepository>;
  let generationService: jest.Mocked<ExerciseGenerationService>;

  beforeEach(async () => {
    exerciseSetsRepo = {
      create: jest.fn(),
      findByIdWithExercises: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
      findActiveByLessonId: jest.fn(),
    } as any;

    exercisesRepo = {
      findBySetId: jest.fn(),
      softDeleteBySetId: jest.fn(),
    } as any;

    resultsRepo = {
      findByUserAndExerciseIds: jest.fn(),
      deleteByUserAndExerciseIds: jest.fn(),
    } as any;

    generationService = {
      generate: jest.fn(),
      createRegeneratedSet: jest.fn(),
      finalizeRegeneration: jest.fn(),
      generateCustom: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSetService,
        {
          provide: ExerciseSetsRepository,
          useValue: exerciseSetsRepo,
        },
        {
          provide: ExercisesRepository,
          useValue: exercisesRepo,
        },
        {
          provide: UserExerciseResultsRepository,
          useValue: resultsRepo,
        },
        {
          provide: ExerciseGenerationService,
          useValue: generationService,
        },
      ],
    }).compile();

    service = module.get<ExerciseSetService>(ExerciseSetService);
  });

  describe('findById', () => {
    it('returns exercise set with exercises', async () => {
      const mockSet = {
        id: 'set-1',
        title: 'Basic Exercises',
        exercises: [{ id: 'ex-1' }, { id: 'ex-2' }],
      };
      exerciseSetsRepo.findByIdWithExercises.mockResolvedValue(mockSet as any);

      const result = await service.findById('set-1');

      expect(result.id).toBe('set-1');
      expect(result.exercises).toHaveLength(2);
      expect(exerciseSetsRepo.findByIdWithExercises).toHaveBeenCalledWith(
        'set-1',
      );
    });

    it('throws NotFoundException when set not found', async () => {
      exerciseSetsRepo.findByIdWithExercises.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByLessonId', () => {
    it('returns exercise sets with progress stats', async () => {
      exerciseSetsRepo.findActiveByLessonId.mockResolvedValue([
        { id: 'set-1', title: 'Basic', isCustom: false, isAIGenerated: false },
        { id: 'set-2', title: 'Custom', isCustom: true, isAIGenerated: true },
      ] as any);

      exercisesRepo.findBySetId.mockImplementation(async (setId: string) => {
        if (setId === 'set-1') return [{ id: 'ex-1' }, { id: 'ex-2' }] as any;
        return [{ id: 'ex-3' }] as any;
      });

      resultsRepo.findByUserAndExerciseIds.mockImplementation(
        async (_userId: string, exerciseIds: string[]) => {
          return exerciseIds.map((id) => ({
            exerciseId: id,
            isCorrect: id === 'ex-1',
          })) as any;
        },
      );

      const result = await service.findByLessonId('lesson-1', 'user-1');

      expect(result.sets).toHaveLength(2);
      expect(result.sets[0].totalExercises).toBe(2);
      expect(result.sets[0].attempted).toBe(2);
      expect(result.sets[0].correct).toBe(1);
      expect(result.sets[0].percentComplete).toBe(100);
    });
  });

  describe('getSetProgress', () => {
    it('returns progress when set exists', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([
        { id: 'ex-1' },
        { id: 'ex-2' },
      ] as any);
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue([
        { exerciseId: 'ex-1', isCorrect: true },
      ] as any);

      const result = await service.getSetProgress('set-1', 'user-1');

      expect(result.totalExercises).toBe(2);
      expect(result.attempted).toBe(1);
      expect(result.correct).toBe(1);
      expect(result.percentComplete).toBe(50);
      expect(result.percentCorrect).toBe(100);
    });

    it('throws NotFoundException when set not found', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.getSetProgress('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns exercise set', async () => {
      const data = {
        lessonId: 'lesson-1',
        title: 'Basic Exercises',
      };
      const created = { id: 'set-1', ...data };
      exerciseSetsRepo.create.mockResolvedValue(created as any);

      const result = await service.create(data);

      expect(result.id).toBe('set-1');
      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe('generate', () => {
    it('delegates to exerciseGenerationService', async () => {
      const mockExercises = [{ id: 'ex-1', exerciseType: 'matching' }];
      generationService.generate.mockResolvedValue(mockExercises as any);

      const result = await service.generate('set-1', 'user-1');

      expect(result).toEqual(mockExercises);
      expect(generationService.generate).toHaveBeenCalledWith(
        'set-1',
        'user-1',
        undefined,
      );
    });

    it('passes userPrompt override to generationService', async () => {
      const mockExercises = [{ id: 'ex-1', exerciseType: 'matching' }];
      generationService.generate.mockResolvedValue(mockExercises as any);
      exerciseSetsRepo.findById.mockResolvedValue({ id: 'set-1' } as any);

      await service.generate('set-1', 'user-1', 'my override prompt');

      expect(generationService.generate).toHaveBeenCalledWith(
        'set-1',
        'user-1',
        'my override prompt',
      );
    });
  });

  describe('regenerate', () => {
    it('creates a new regenerated set', async () => {
      const mockSet = { id: 'new-set-1', lessonId: 'lesson-1' };
      generationService.createRegeneratedSet.mockResolvedValue(mockSet as any);

      const result = await service.regenerate('set-1', 'user-1');

      expect(result.id).toBe('new-set-1');
      expect(generationService.createRegeneratedSet).toHaveBeenCalledWith(
        'set-1',
        undefined,
      );
    });

    it('passes userPrompt override to createRegeneratedSet', async () => {
      const mockSet = { id: 'new-set-1', lessonId: 'lesson-1' };
      generationService.createRegeneratedSet.mockResolvedValue(mockSet as any);

      await service.regenerate('set-1', 'user-1', 'new prompt');

      expect(generationService.createRegeneratedSet).toHaveBeenCalledWith(
        'set-1',
        'new prompt',
      );
    });
  });

  describe('createCustom', () => {
    const validConfig = {
      questionCount: 10,
      exerciseTypes: [ExerciseType.MULTIPLE_CHOICE, ExerciseType.MATCHING],
      focusArea: 'both' as const,
    };

    it('creates empty custom set without generating', async () => {
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'custom-set-1',
        lessonId: 'lesson-1',
        isCustom: true,
        customConfig: validConfig,
      } as any);

      const result = await service.createCustom(
        'lesson-1',
        validConfig,
        'user-1',
      );

      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonId: 'lesson-1',
          isCustom: true,
          customConfig: validConfig,
          title: 'Custom Practice',
          userPrompt: undefined,
        }),
      );
      expect(generationService.generateCustom).not.toHaveBeenCalled();
      expect(result.set.id).toBe('custom-set-1');
    });

    it('creates custom set with userPrompt', async () => {
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'custom-set-1',
        lessonId: 'lesson-1',
        isCustom: true,
        customConfig: validConfig,
        userPrompt: 'Focus on greetings',
      } as any);

      await service.createCustom(
        'lesson-1',
        validConfig,
        'user-1',
        'Focus on greetings',
      );

      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: 'Focus on greetings',
        }),
      );
    });

    it('throws when config is invalid', async () => {
      const invalidConfig = {
        questionCount: 0,
        exerciseTypes: [],
        focusArea: 'invalid' as any,
      };

      await expect(
        service.createCustom('lesson-1', invalidConfig, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when questionCount exceeds bounds', async () => {
      const overMaxConfig = {
        questionCount: 50,
        exerciseTypes: [ExerciseType.MULTIPLE_CHOICE],
        focusArea: 'both' as const,
      };

      await expect(
        service.createCustom('lesson-1', overMaxConfig, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCustom', () => {
    it('soft-deletes exercises and set when custom', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        isCustom: true,
      } as any);

      await service.deleteCustom('set-1');

      expect(exercisesRepo.softDeleteBySetId).toHaveBeenCalledWith('set-1');
      expect(exerciseSetsRepo.softDelete).toHaveBeenCalledWith('set-1');
    });

    it('throws NotFoundException when set missing', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.deleteCustom('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(exercisesRepo.softDeleteBySetId).not.toHaveBeenCalled();
    });

    it('allows deleting non-custom set when generation failed', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        isCustom: false,
        generationStatus: 'failed',
      } as any);

      await service.deleteCustom('set-1');

      expect(exercisesRepo.softDeleteBySetId).toHaveBeenCalledWith('set-1');
      expect(exerciseSetsRepo.softDelete).toHaveBeenCalledWith('set-1');
    });

    it('throws BadRequestException when set is not custom and complete', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        isCustom: false,
        generationStatus: 'ready',
      } as any);

      await expect(service.deleteCustom('set-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(exercisesRepo.softDeleteBySetId).not.toHaveBeenCalled();
    });
  });

  describe('getResumeInfo', () => {
    it('returns canResume=true when partially completed', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({ id: 'set-1' } as any);
      exercisesRepo.findBySetId.mockResolvedValue([
        { id: 'ex-1' },
        { id: 'ex-2' },
      ] as any);
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue([
        { exerciseId: 'ex-1' },
      ] as any);

      const result = await service.getResumeInfo('set-1', 'user-1');

      expect(result.canResume).toBe(true);
      expect(result.attempted).toBe(1);
      expect(result.totalExercises).toBe(2);
    });

    it('returns canResume=false when not started', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({ id: 'set-1' } as any);
      exercisesRepo.findBySetId.mockResolvedValue([{ id: 'ex-1' }] as any);
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue([] as any);

      const result = await service.getResumeInfo('set-1', 'user-1');

      expect(result.canResume).toBe(false);
    });

    it('returns canResume=false when fully completed', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({ id: 'set-1' } as any);
      exercisesRepo.findBySetId.mockResolvedValue([{ id: 'ex-1' }] as any);
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue([
        { exerciseId: 'ex-1' },
      ] as any);

      const result = await service.getResumeInfo('set-1', 'user-1');

      expect(result.canResume).toBe(false);
    });
  });

  describe('resetProgress', () => {
    it('deletes user results for set exercises', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({ id: 'set-1' } as any);
      exercisesRepo.findBySetId.mockResolvedValue([
        { id: 'ex-1' },
        { id: 'ex-2' },
      ] as any);
      resultsRepo.deleteByUserAndExerciseIds.mockResolvedValue(undefined);

      await service.resetProgress('set-1', 'user-1');

      expect(resultsRepo.deleteByUserAndExerciseIds).toHaveBeenCalledWith(
        'user-1',
        ['ex-1', 'ex-2'],
      );
    });

    it('throws NotFoundException when set not found', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.resetProgress('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSummary', () => {
    it('returns stats and wrong questions', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({ id: 'set-1' } as any);
      exercisesRepo.findBySetId.mockResolvedValue([
        {
          id: 'ex-1',
          question: 'Q1',
          exerciseType: 'multiple_choice',
          correctAnswer: { selectedChoice: 'A' },
          explanation: 'E1',
        },
        {
          id: 'ex-2',
          question: 'Q2',
          exerciseType: 'matching',
          correctAnswer: { matches: [] },
          explanation: 'E2',
        },
      ] as any);
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue([
        {
          exerciseId: 'ex-1',
          isCorrect: true,
          userAnswer: { selectedChoice: 'A' },
        },
        { exerciseId: 'ex-2', isCorrect: false, userAnswer: { matches: [] } },
      ] as any);

      const result = await service.getSummary('set-1', 'user-1');

      expect(result.stats.totalExercises).toBe(2);
      expect(result.stats.attempted).toBe(2);
      expect(result.stats.correct).toBe(1);
      expect(result.wrongQuestions).toHaveLength(1);
      expect(result.wrongQuestions[0].exerciseId).toBe('ex-2');
    });
  });
});
