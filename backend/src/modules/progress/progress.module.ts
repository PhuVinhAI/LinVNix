import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './domain/user-progress.entity';
import { ModuleProgress } from './domain/module-progress.entity';
import { CourseProgress } from './domain/course-progress.entity';
import { UserExerciseResult } from '../exercises/domain/user-exercise-result.entity';
import { ProgressService } from './application/progress.service';
import { ProgressRepository } from './application/progress.repository';
import { ModuleProgressRepository } from './application/module-progress.repository';
import { CourseProgressRepository } from './application/course-progress.repository';
import { ProgressController } from './presentation/progress.controller';
import { ProgressTransactionService } from './application/progress-transaction.service';
import { UserExerciseResultsRepository } from '../exercises/application/repositories/user-exercise-results.repository';
import { ExercisesModule } from '../exercises/exercises.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProgress,
      UserExerciseResult,
      ModuleProgress,
      CourseProgress,
    ]),
    forwardRef(() => ExercisesModule),
    forwardRef(() => CoursesModule),
  ],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressRepository,
    ModuleProgressRepository,
    CourseProgressRepository,
    ProgressTransactionService,
    UserExerciseResultsRepository,
  ],
  exports: [
    ProgressService,
    ProgressRepository,
    ModuleProgressRepository,
    CourseProgressRepository,
    ProgressTransactionService,
  ],
})
export class ProgressModule {}
