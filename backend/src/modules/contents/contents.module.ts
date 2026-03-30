import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonContent } from './domain/lesson-content.entity';
import { ContentsService } from './application/contents.service';
import { ContentsRepository } from './application/contents.repository';
import { ContentsController } from './presentation/contents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LessonContent])],
  controllers: [ContentsController],
  providers: [ContentsService, ContentsRepository],
  exports: [ContentsService],
})
export class ContentsModule {}
