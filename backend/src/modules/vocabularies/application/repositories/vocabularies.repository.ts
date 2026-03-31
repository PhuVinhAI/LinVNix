import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../../domain/vocabulary.entity';

@Injectable()
export class VocabulariesRepository {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly repository: Repository<Vocabulary>,
  ) {}

  async create(data: Partial<Vocabulary>): Promise<Vocabulary> {
    const vocabulary = this.repository.create(data);
    return this.repository.save(vocabulary);
  }

  async findByLessonId(lessonId: string): Promise<Vocabulary[]> {
    return this.repository.find({
      where: { lessonId },
    });
  }

  async findById(id: string): Promise<Vocabulary | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Vocabulary>): Promise<Vocabulary> {
    await this.repository.update(id, data);
    const vocabulary = await this.findById(id);
    if (!vocabulary) {
      throw new Error('Vocabulary not found after update');
    }
    return vocabulary;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async search(query: string): Promise<Vocabulary[]> {
    // PostgreSQL full-text search with ILIKE for simplicity
    // For better performance, consider adding GIN index on word, translation, phonetic
    return this.repository
      .createQueryBuilder('vocabulary')
      .where(
        'vocabulary.word ILIKE :query OR vocabulary.translation ILIKE :query OR vocabulary.phonetic ILIKE :query',
        { query: `%${query}%` },
      )
      .orderBy('vocabulary.word', 'ASC')
      .limit(50) // Limit results to prevent overload
      .getMany();
  }
}
