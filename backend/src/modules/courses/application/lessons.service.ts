import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsRepository } from './repositories/lessons.repository';
import { Lesson } from '../domain/lesson.entity';

@Injectable()
export class LessonsService {
  constructor(private readonly lessonsRepository: LessonsRepository) {}

  async create(data: Partial<Lesson>): Promise<Lesson> {
    return this.lessonsRepository.create(data);
  }

  async findByUnitId(unitId: string): Promise<Lesson[]> {
    return this.lessonsRepository.findByUnitId(unitId);
  }

  async findById(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    await this.findById(id);
    return this.lessonsRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.lessonsRepository.delete(id);
  }
}
