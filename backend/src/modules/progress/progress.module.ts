import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './domain/user-progress.entity';
import { UserExerciseResult } from '../exercises/domain/user-exercise-result.entity';
import { ProgressService } from './application/progress.service';
import { ProgressRepository } from './application/progress.repository';
import { ProgressController } from './presentation/progress.controller';
import { ProgressTransactionService } from './application/progress-transaction.service';
import { UserExerciseResultsRepository } from '../exercises/application/repositories/user-exercise-results.repository';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProgress, UserExerciseResult]),
    forwardRef(() => ExercisesModule),
  ],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressRepository,
    ProgressTransactionService,
    UserExerciseResultsRepository,
  ],
  exports: [ProgressService, ProgressRepository, ProgressTransactionService],
})
export class ProgressModule {}
