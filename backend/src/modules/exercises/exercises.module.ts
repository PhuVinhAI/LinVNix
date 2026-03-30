import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './domain/exercise.entity';
import { UserExerciseResult } from './domain/user-exercise-result.entity';
import { ExercisesService } from './application/exercises.service';
import { ExerciseCheckerService } from './application/exercise-checker.service';
import { ExercisesRepository } from './application/repositories/exercises.repository';
import { UserExerciseResultsRepository } from './application/repositories/user-exercise-results.repository';
import { ExercisesController } from './presentation/exercises.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, UserExerciseResult])],
  controllers: [ExercisesController],
  providers: [
    ExercisesService,
    ExerciseCheckerService,
    ExercisesRepository,
    UserExerciseResultsRepository,
  ],
  exports: [ExercisesService],
})
export class ExercisesModule {}
