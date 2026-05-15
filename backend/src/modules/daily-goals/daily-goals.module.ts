import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyGoal } from './domain/daily-goal.entity';
import { DailyGoalsRepository } from './application/daily-goals.repository';
import { DailyGoalsService } from './application/daily-goals.service';
import { DailyGoalsController } from './presentation/daily-goals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyGoal])],
  controllers: [DailyGoalsController],
  providers: [DailyGoalsService, DailyGoalsRepository],
  exports: [DailyGoalsService],
})
export class DailyGoalsModule {}
