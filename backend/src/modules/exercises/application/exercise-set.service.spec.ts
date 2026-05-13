import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExerciseSetService } from './exercise-set.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { TierProgressService } from './tier-progress.service';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseTier } from '../../../common/enums';

describe('ExerciseSetService', () => {
  let service: ExerciseSetService;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let tierProgressService: jest.Mocked<TierProgressService>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let resultsRepo: jest.Mocked<UserExerciseResultsRepository>;

  beforeEach(async () => {
    exerciseSetsRepo = {
      create: jest.fn(),
      findByIdWithExercises: jest.fn(),
      findById: jest.fn(),
    } as any;

    tierProgressService = {
      getLessonTierSummary: jest.fn(),
      getSetProgress: jest.fn(),
    } as any;

    exercisesRepo = {
      findBySetId: jest.fn(),
    } as any;

    resultsRepo = {
      findByUserAndExerciseIds: jest.fn(),
      deleteByUserAndExerciseIds: jest.fn(),
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
});
