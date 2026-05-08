import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './presentation/admin.controller';
import { AdminDashboardService } from './application/admin-dashboard.service';
import { User } from '../users/domain/user.entity';
import { UserExerciseResult } from '../exercises/domain/user-exercise-result.entity';
import { UserProgress } from '../progress/domain/user-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserExerciseResult, UserProgress])],
  controllers: [AdminController],
  providers: [AdminDashboardService],
  exports: [AdminDashboardService],
})
export class AdminModule {}
