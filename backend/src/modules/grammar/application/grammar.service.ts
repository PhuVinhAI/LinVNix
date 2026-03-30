import { Injectable, NotFoundException } from '@nestjs/common';
import { GrammarRepository } from './grammar.repository';
import { GrammarRule } from '../domain/grammar-rule.entity';

@Injectable()
export class GrammarService {
  constructor(private readonly grammarRepository: GrammarRepository) {}

  async create(data: Partial<GrammarRule>): Promise<GrammarRule> {
    return this.grammarRepository.create(data);
  }

  async findByLessonId(lessonId: string): Promise<GrammarRule[]> {
    return this.grammarRepository.findByLessonId(lessonId);
  }

  async findById(id: string): Promise<GrammarRule> {
    const grammar = await this.grammarRepository.findById(id);
    if (!grammar) {
      throw new NotFoundException(`Grammar rule with ID ${id} not found`);
    }
    return grammar;
  }

  async update(id: string, data: Partial<GrammarRule>): Promise<GrammarRule> {
    await this.findById(id);
    return this.grammarRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.grammarRepository.delete(id);
  }
}
