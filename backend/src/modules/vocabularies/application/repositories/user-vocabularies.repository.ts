import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserVocabulary } from '../../domain/user-vocabulary.entity';
import { MasteryLevel } from '../../../../common/enums';

@Injectable()
export class UserVocabulariesRepository {
  constructor(
    @InjectRepository(UserVocabulary)
    private readonly repository: Repository<UserVocabulary>,
  ) {}

  async create(data: Partial<UserVocabulary>): Promise<UserVocabulary> {
    const userVocab = this.repository.create(data);
    return this.repository.save(userVocab);
  }

  async findByUserId(userId: string): Promise<UserVocabulary[]> {
    return this.repository.find({
      where: { userId },
      relations: ['vocabulary'],
    });
  }

  async findByUserAndVocabulary(
    userId: string,
    vocabularyId: string,
  ): Promise<UserVocabulary | null> {
    return this.repository.findOne({
      where: { userId, vocabularyId },
    });
  }

  async findDueForReview(userId: string): Promise<UserVocabulary[]> {
    return this.repository
      .createQueryBuilder('uv')
      .where('uv.userId = :userId', { userId })
      .andWhere('uv.nextReviewAt <= :now', { now: new Date() })
      .leftJoinAndSelect('uv.vocabulary', 'vocabulary')
      .getMany();
  }

  async update(
    id: string,
    data: Partial<UserVocabulary>,
  ): Promise<UserVocabulary> {
    await this.repository.update(id, data);
    const userVocab = await this.repository.findOne({ where: { id } });
    if (!userVocab) {
      throw new Error('UserVocabulary not found after update');
    }
    return userVocab;
  }

  async updateMastery(
    manager: EntityManager,
    userId: string,
    vocabularyId: string,
    masteryLevel: MasteryLevel,
  ): Promise<void> {
    await manager.update(
      UserVocabulary,
      { userId, vocabularyId },
      { masteryLevel },
    );
  }
}
