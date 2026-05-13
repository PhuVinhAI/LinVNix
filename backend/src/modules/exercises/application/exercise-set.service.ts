import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { TierProgressService } from './tier-progress.service';
import { ExercisesRepository } from './repositories/exercises.repository';
import { UserExerciseResultsRepository } from './repositories/user-exercise-results.repository';
import { ExerciseGenerationService } from './exercise-generation.service';
import { ExerciseTier } from '../../../common/enums';

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

export interface ExerciseSetSummary {
  stats: {
    totalExercises: number;
    attempted: number;
    correct: number;
    percentCorrect: number;
    percentComplete: number;
  };
  wrongQuestions: WrongQuestion[];
  nextTierUnlocked: ExerciseTier | null;
}

@Injectable()
export class ExerciseSetService {
  constructor(
    private readonly exerciseSetsRepository: ExerciseSetsRepository,
    private readonly tierProgressService: TierProgressService,
    private readonly exercisesRepository: ExercisesRepository,
    private readonly userExerciseResultsRepository: UserExerciseResultsRepository,
    private readonly exerciseGenerationService: ExerciseGenerationService,
  ) {}

  async findByLessonId(lessonId: string, userId: string) {
    return this.tierProgressService.getLessonTierSummary(lessonId, userId);
  }

  async getSetProgress(setId: string, userId: string) {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new NotFoundException(`ExerciseSet with ID ${setId} not found`);
    }
    return this.tierProgressService.getSetProgress(setId, userId);
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

  async generate(setId: string, userId: string) {
    return this.exerciseGenerationService.generate(setId, userId);
  }

  async generateForTier(lessonId: string, tier: ExerciseTier, userId: string) {
    return this.exerciseGenerationService.generateForTier(
      lessonId,
      tier,
      userId,
    );
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

    const progress = await this.tierProgressService.getSetProgress(
      setId,
      userId,
    );

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
      nextTierUnlocked: progress.nextTierUnlocked,
    };
  }
}
