import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExerciseSetService } from './exercise-set.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { TierProgressService } from './tier-progress.service';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseGenerationService } from './exercise-generation.service';
import { ExerciseTier, ExerciseType } from '../../../common/enums';

describe('ExerciseSetService', () => {
  let service: ExerciseSetService;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let tierProgressService: jest.Mocked<TierProgressService>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let resultsRepo: jest.Mocked<UserExerciseResultsRepository>;
  let generationService: jest.Mocked<ExerciseGenerationService>;

  beforeEach(async () => {
    exerciseSetsRepo = {
      create: jest.fn(),
      findByIdWithExercises: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    tierProgressService = {
      getLessonTierSummary: jest.fn(),
      getSetProgress: jest.fn(),
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
      regenerate: jest.fn(),
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
          provide: TierProgressService,
          useValue: tierProgressService,
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
    it('delegates to tierProgressService', async () => {
      const mockSummary = {
        sets: [],
        unlockedTiers: ['BASIC'],
      };
      tierProgressService.getLessonTierSummary.mockResolvedValue(
        mockSummary as any,
      );

      const result = await service.findByLessonId('lesson-1', 'user-1');

      expect(result).toEqual(mockSummary);
      expect(tierProgressService.getLessonTierSummary).toHaveBeenCalledWith(
        'lesson-1',
        'user-1',
      );
    });
  });

  describe('getSetProgress', () => {
    it('delegates to tierProgressService when set exists', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        tier: ExerciseTier.BASIC,
      } as any);

      const mockProgress = {
        totalExercises: 10,
        attempted: 10,
        correct: 8,
        percentCorrect: 80,
        percentComplete: 100,
        nextTierUnlocked: ExerciseTier.EASY,
      };
      tierProgressService.getSetProgress.mockResolvedValue(mockProgress);

      const result = await service.getSetProgress('set-1', 'user-1');

      expect(result).toEqual(mockProgress);
      expect(tierProgressService.getSetProgress).toHaveBeenCalledWith(
        'set-1',
        'user-1',
      );
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
        tier: ExerciseTier.BASIC,
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
      );
    });
  });

  describe('regenerate', () => {
    it('delegates to exerciseGenerationService', async () => {
      const mockExercises = [{ id: 'ex-1', exerciseType: 'translation' }];
      generationService.regenerate.mockResolvedValue(mockExercises as any);

      const result = await service.regenerate('set-1', 'user-1');

      expect(result).toEqual(mockExercises);
      expect(generationService.regenerate).toHaveBeenCalledWith(
        'set-1',
        'user-1',
      );
    });
  });

  describe('createCustom', () => {
    const validConfig = {
      questionCount: 10,
      exerciseTypes: [ExerciseType.MULTIPLE_CHOICE, ExerciseType.MATCHING],
      focusArea: 'both' as const,
    };

    it('creates custom set and generates exercises when unlocked', async () => {
      tierProgressService.getLessonTierSummary.mockResolvedValue({
        sets: [],
        customSets: [],
        unlockedTiers: [ExerciseTier.BASIC, ExerciseTier.EASY],
        customPracticeUnlocked: true,
      });
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'custom-set-1',
        lessonId: 'lesson-1',
        isCustom: true,
        customConfig: validConfig,
      } as any);
      generationService.generateCustom.mockResolvedValue([
        { id: 'ex-1' },
      ] as any);

      const result = await service.createCustom(
        'lesson-1',
        validConfig,
        'user-1',
      );

      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonId: 'lesson-1',
          tier: null,
          isCustom: true,
          customConfig: validConfig,
          title: 'Custom Practice',
        }),
      );
      expect(generationService.generateCustom).toHaveBeenCalledWith(
        'custom-set-1',
        'user-1',
      );
      expect(result.set.id).toBe('custom-set-1');
      expect(result.exercises).toHaveLength(1);
    });

    it('throws when custom practice is locked', async () => {
      tierProgressService.getLessonTierSummary.mockResolvedValue({
        sets: [],
        customSets: [],
        unlockedTiers: [ExerciseTier.BASIC],
        customPracticeUnlocked: false,
      });

      await expect(
        service.createCustom('lesson-1', validConfig, 'user-1'),
      ).rejects.toThrow(BadRequestException);
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

    it('throws BadRequestException when set is not custom', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        isCustom: false,
      } as any);

      await expect(service.deleteCustom('set-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(exercisesRepo.softDeleteBySetId).not.toHaveBeenCalled();
    });
  });
});
