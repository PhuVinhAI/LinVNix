import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarRule } from '../domain/grammar-rule.entity';

@Injectable()
export class GrammarRepository {
  constructor(
    @InjectRepository(GrammarRule)
    private readonly repository: Repository<GrammarRule>,
  ) {}

  async create(data: Partial<GrammarRule>): Promise<GrammarRule> {
    const grammar = this.repository.create(data);
    return this.repository.save(grammar);
  }

  async findByLessonId(lessonId: string): Promise<GrammarRule[]> {
    return this.repository.find({
      where: { lessonId },
    });
  }

  async findById(id: string): Promise<GrammarRule | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<GrammarRule>): Promise<GrammarRule> {
    await this.repository.update(id, data);
    const grammar = await this.findById(id);
    if (!grammar) {
      throw new Error('Grammar rule not found after update');
    }
    return grammar;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
