import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseGenerationService } from './exercise-generation.service';
import {
  ExerciseSet,
  type CustomSetConfig,
} from '../domain/exercise-set.entity';
import { Exercise } from '../domain/exercise.entity';

export interface ResumeInfo {
  canResume: boolean;
  attempted: number;
  totalExercises: number;
}

export interface WrongQuestion {
  exerciseId: string;
  question: string;
  exerciseType: string;
  correctAnswer: any;
  explanation?: string;
  userAnswer?: any;
}

export interface ExerciseSetProgress {
  setId: string;
  title: string;
  isCustom: boolean;
  isAIGenerated: boolean;
  totalExercises: number;
  attempted: number;
  correct: number;
  percentCorrect: number;
  percentComplete: number;
}

export interface LessonExerciseSummary {
  sets: ExerciseSetProgress[];
}

export interface ExerciseSetSummary {
  stats: {
    totalExercises: number;
    attempted: number;
    correct: number;
    percentCorrect: number;
    percentComplete: number;
  };
  wrongQuestions: WrongQuestion[];
}

@Injectable()
export class ExerciseSetService {
  constructor(
    private readonly exerciseSetsRepository: ExerciseSetsRepository,
    private readonly exercisesRepository: ExercisesRepository,
    private readonly userExerciseResultsRepository: UserExerciseResultsRepository,
    private readonly exerciseGenerationService: ExerciseGenerationService,
  ) {}

  async findByLessonId(
    lessonId: string,
    userId: string,
  ): Promise<LessonExerciseSummary> {
    const sets =
      await this.exerciseSetsRepository.findActiveByLessonId(lessonId);
    const progresses: ExerciseSetProgress[] = [];

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

      if (set.isCustom && totalExercises === 0) {
        continue;
      }

      const percentComplete =
        totalExercises > 0 ? (attempted / totalExercises) * 100 : 0;
      const percentCorrect = attempted > 0 ? (correct / attempted) * 100 : 0;

      progresses.push({
        setId: set.id,
        title: set.title,
        isCustom: set.isCustom,
        isAIGenerated: set.isAIGenerated,
        totalExercises,
        attempted,
        correct,
        percentCorrect: Math.round(percentCorrect * 100) / 100,
        percentComplete: Math.round(percentComplete * 100) / 100,
      });
    }

    return { sets: progresses };
  }

  async getSetProgress(setId: string, userId: string) {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${setId} not found`);
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

    return {
      totalExercises,
      attempted,
      correct,
      percentCorrect: Math.round(percentCorrect * 100) / 100,
      percentComplete: Math.round(percentComplete * 100) / 100,
    };
  }

  async findById(id: string) {
    const set = await this.exerciseSetsRepository.findByIdWithExercises(id);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${id} not found`);
    }
    return set;
  }

  async create(
    data: Partial<import('../domain/exercise-set.entity').ExerciseSet>,
  ) {
    return this.exerciseSetsRepository.create(data);
  }

  async generate(setId: string, userId: string): Promise<Exercise[]> {
    const exercises = await this.exerciseGenerationService.generate(
      setId,
      userId,
    );
    const set = await this.exerciseSetsRepository.findById(setId);
    if (set?.replacesSetId) {
      await this.exercisesRepository.softDeleteBySetId(set.replacesSetId);
      await this.exerciseSetsRepository.softDelete(set.replacesSetId);
    }
    return exercises;
  }

  async regenerate(setId: string, _userId: string) {
    return this.exerciseGenerationService.createRegeneratedSet(setId);
  }

  async createCustom(
    lessonId: string,
    config: CustomSetConfig,
    _userId: string,
  ) {
    if (!ExerciseSet.isValidCustomConfig(config)) {
      throw new BadRequestException('Invalid custom set config');
    }

    const set = await this.exerciseSetsRepository.create({
      lessonId,
      isCustom: true,
      customConfig: config,
      isAIGenerated: false,
      title: 'Custom Practice',
      orderIndex: 100,
    });

    return { set };
  }

  async deleteCustom(setId: string): Promise<void> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${setId} not found`);
    }

    const isIncomplete =
      set.generationStatus === 'generating' ||
      set.generationStatus === 'failed';

    if (!set.isCustom && !isIncomplete) {
      throw new BadRequestException(
        'Only custom practice sets can be deleted via this endpoint',
      );
    }

    await this.exercisesRepository.softDeleteBySetId(setId);
    await this.exerciseSetsRepository.softDelete(setId);
  }

  async getResumeInfo(setId: string, userId: string): Promise<ResumeInfo> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${setId} not found`);
    }

    const exercises = await this.exercisesRepository.findBySetId(setId);
    const exerciseIds = exercises.map((e) => e.id);
    const totalExercises = exerciseIds.length;

    let attempted = 0;
    if (totalExercises > 0 && userId) {
      const results =
        await this.userExerciseResultsRepository.findByUserAndExerciseIds(
          userId,
          exerciseIds,
        );
      attempted = results.length;
    }

    const canResume = attempted > 0 && attempted < totalExercises;

    return { canResume, attempted, totalExercises };
  }

  async resetProgress(setId: string, userId: string): Promise<void> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${setId} not found`);
    }

    const exercises = await this.exercisesRepository.findBySetId(setId);
    const exerciseIds = exercises.map((e) => e.id);

    await this.userExerciseResultsRepository.deleteByUserAndExerciseIds(
      userId,
      exerciseIds,
    );
  }

  async getSummary(setId: string, userId: string): Promise<ExerciseSetSummary> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${setId} not found`);
    }

    const progress = await this.getSetProgress(setId, userId);

    const exercises = await this.exercisesRepository.findBySetId(setId);
    const exerciseIds = exercises.map((e) => e.id);

    const results =
      await this.userExerciseResultsRepository.findByUserAndExerciseIds(
        userId,
        exerciseIds,
      );

    const incorrectResults = results.filter((r) => !r.isCorrect);
    const wrongQuestions: WrongQuestion[] = [];

    for (const result of incorrectResults) {
      const exercise = exercises.find((e) => e.id === result.exerciseId);
      if (exercise) {
        wrongQuestions.push({
          exerciseId: exercise.id,
          question: exercise.question,
          exerciseType: exercise.exerciseType,
          correctAnswer: exercise.correctAnswer,
          explanation: exercise.explanation,
          userAnswer: result.userAnswer,
        });
      }
    }

    return {
      stats: {
        totalExercises: progress.totalExercises,
        attempted: progress.attempted,
        correct: progress.correct,
        percentCorrect: progress.percentCorrect,
        percentComplete: progress.percentComplete,
      },
      wrongQuestions,
    };
  }
}
