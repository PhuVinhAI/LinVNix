import { ExerciseSetService } from './exercise-set.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { NotFoundException } from '@nestjs/common';

describe('ExerciseSetService - Resume & Reset', () => {
  let service: ExerciseSetService;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let resultsRepo: jest.Mocked<UserExerciseResultsRepository>;

  beforeEach(() => {
    exerciseSetsRepo = {
      findById: jest.fn(),
    } as any;

    exercisesRepo = {
      findBySetId: jest.fn(),
    } as any;

    resultsRepo = {
      findByUserAndExerciseIds: jest.fn(),
      deleteByUserAndExerciseIds: jest.fn(),
    } as any;

    service = new ExerciseSetService(
      exerciseSetsRepo,
      exercisesRepo,
      resultsRepo,
      { generate: jest.fn(), regenerate: jest.fn(), generateCustom: jest.fn() } as any,
    );
  });

  describe('getResumeInfo', () => {
    it('returns resume info for incomplete set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 5 }, () => ({ isCorrect: true }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const info = await service.getResumeInfo('set-1', 'user-1');

      expect(info.canResume).toBe(true);
      expect(info.attempted).toBe(5);
      expect(info.totalExercises).toBe(10);
    });

    it('returns canResume=false for completed set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      const results = Array.from({ length: 10 }, () => ({ isCorrect: true }));
      resultsRepo.findByUserAndExerciseIds.mockResolvedValue(results as any);

      const info = await service.getResumeInfo('set-1', 'user-1');

      expect(info.canResume).toBe(false);
      expect(info.attempted).toBe(10);
    });

    it('returns canResume=false for unstarted set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        title: 'Basic',
      } as any);

      const exercises = Array.from({ length: 10 }, (_, i) => ({
        id: `ex-${i}`,
      }));
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      resultsRepo.findByUserAndExerciseIds.mockResolvedValue([]);

      const info = await service.getResumeInfo('set-1', 'user-1');

      expect(info.canResume).toBe(false);
      expect(info.attempted).toBe(0);
    });

    it('throws NotFoundException for unknown set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.getResumeInfo('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetProgress', () => {
    it('deletes all results for exercises in the set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        title: 'Basic',
      } as any);

      const exercises = [{ id: 'ex-1' }, { id: 'ex-2' }, { id: 'ex-3' }];
      exercisesRepo.findBySetId.mockResolvedValue(exercises as any);

      await service.resetProgress('set-1', 'user-1');

      expect(resultsRepo.deleteByUserAndExerciseIds).toHaveBeenCalledWith(
        'user-1',
        ['ex-1', 'ex-2', 'ex-3'],
      );
    });

    it('handles set with no exercises', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        lessonId: 'lesson-1',
        title: 'Basic',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);

      await service.resetProgress('set-1', 'user-1');

      expect(resultsRepo.deleteByUserAndExerciseIds).toHaveBeenCalledWith(
        'user-1',
        [],
      );
    });

    it('throws NotFoundException for unknown set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.resetProgress('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
