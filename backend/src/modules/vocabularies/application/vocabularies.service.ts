import { Injectable, NotFoundException } from '@nestjs/common';
import { VocabulariesRepository } from './repositories/vocabularies.repository';
import { Vocabulary } from '../domain/vocabulary.entity';

@Injectable()
export class VocabulariesService {
  constructor(
    private readonly vocabulariesRepository: VocabulariesRepository,
  ) {}

  async create(data: Partial<Vocabulary>): Promise<Vocabulary> {
    return this.vocabulariesRepository.create(data);
  }

  async findByLessonId(lessonId: string): Promise<Vocabulary[]> {
    return this.vocabulariesRepository.findByLessonId(lessonId);
  }

  async findById(id: string): Promise<Vocabulary> {
    const vocabulary = await this.vocabulariesRepository.findById(id);
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    return vocabulary;
  }

  async update(id: string, data: Partial<Vocabulary>): Promise<Vocabulary> {
    await this.findById(id);
    return this.vocabulariesRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.vocabulariesRepository.delete(id);
  }
}
