import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentsRepository } from './contents.repository';
import { LessonContent } from '../domain/lesson-content.entity';

@Injectable()
export class ContentsService {
  constructor(private readonly contentsRepository: ContentsRepository) {}

  async create(data: Partial<LessonContent>): Promise<LessonContent> {
    return this.contentsRepository.create(data);
  }

  async findByLessonId(lessonId: string): Promise<LessonContent[]> {
    return this.contentsRepository.findByLessonId(lessonId);
  }

  async findById(id: string): Promise<LessonContent> {
    const content = await this.contentsRepository.findById(id);
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async update(id: string, data: Partial<LessonContent>): Promise<LessonContent> {
    await this.findById(id);
    return this.contentsRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.contentsRepository.delete(id);
  }
}
