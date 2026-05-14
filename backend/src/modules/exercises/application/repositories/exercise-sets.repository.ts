import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseSet } from '../../domain/exercise-set.entity';

@Injectable()
export class ExerciseSetsRepository {
  constructor(
    @InjectRepository(ExerciseSet)
    private readonly repository: Repository<ExerciseSet>,
  ) {}

  async create(data: Partial<ExerciseSet>): Promise<ExerciseSet> {
    const set = this.repository.create(data);
    return this.repository.save(set);
  }

  async findByLessonId(lessonId: string): Promise<ExerciseSet[]> {
    return this.repository.find({
      where: { lessonId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findActiveByLessonId(lessonId: string): Promise<ExerciseSet[]> {
    const sets = await this.repository.find({
      where: {
        lessonId,
        deletedAt: undefined as any,
      },
      order: { orderIndex: 'ASC' },
    });
    return sets.filter((s) => s.generationStatus !== 'generating');
  }

  async findById(id: string): Promise<ExerciseSet | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdWithExercises(id: string): Promise<ExerciseSet | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['exercises'],
    });
  }

  async update(
    id: string,
    data: Partial<ExerciseSet>,
  ): Promise<ExerciseSet | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findActiveCustomSetsByLesson(lessonId: string): Promise<ExerciseSet[]> {
    return this.repository.find({
      where: { lessonId, isCustom: true, deletedAt: undefined as any },
      order: { createdAt: 'DESC' },
    });
  }
}
