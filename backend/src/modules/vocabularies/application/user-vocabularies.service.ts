import { Injectable } from '@nestjs/common';
import { UserVocabulariesRepository } from './repositories/user-vocabularies.repository';
import { UserVocabulary } from '../domain/user-vocabulary.entity';

@Injectable()
export class UserVocabulariesService {
  constructor(
    private readonly userVocabulariesRepository: UserVocabulariesRepository,
  ) {}

  async getUserVocabularies(userId: string): Promise<UserVocabulary[]> {
    return this.userVocabulariesRepository.findByUserId(userId);
  }

  async getDueForReview(userId: string): Promise<UserVocabulary[]> {
    return this.userVocabulariesRepository.findDueForReview(userId);
  }
}
