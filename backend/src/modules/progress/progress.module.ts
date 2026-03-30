import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './domain/user-progress.entity';
import { ProgressService } from './application/progress.service';
import { ProgressRepository } from './application/progress.repository';
import { ProgressController } from './presentation/progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserProgress])],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository],
  exports: [ProgressService],
})
export class ProgressModule {}
