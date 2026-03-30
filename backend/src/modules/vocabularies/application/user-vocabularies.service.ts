import { Injectable } from '@nestjs/common';
import { UserVocabulariesRepository } from './repositories/user-vocabularies.repository';
import { UserVocabulary } from '../domain/user-vocabulary.entity';
import { MasteryLevel } from '../../../common/enums';

@Injectable()
export class UserVocabulariesService {
  constructor(
    private readonly userVocabulariesRepository: UserVocabulariesRepository,
  ) {}

  async addVocabulary(
    userId: string,
    vocabularyId: string,
  ): Promise<UserVocabulary> {
    const existing =
      await this.userVocabulariesRepository.findByUserAndVocabulary(
        userId,
        vocabularyId,
      );

    if (existing) {
      return existing;
    }

    return this.userVocabulariesRepository.create({
      userId,
      vocabularyId,
      masteryLevel: MasteryLevel.LEARNING,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
  }

  async reviewVocabulary(
    userId: string,
    vocabularyId: string,
    isCorrect: boolean,
  ): Promise<UserVocabulary> {
    const userVocab =
      await this.userVocabulariesRepository.findByUserAndVocabulary(
        userId,
        vocabularyId,
      );

    if (!userVocab) {
      throw new Error('User vocabulary not found');
    }

    const reviewCount = userVocab.reviewCount + 1;
    const correctCount = isCorrect
      ? userVocab.correctCount + 1
      : userVocab.correctCount;

    // Spaced repetition algorithm
    let nextReviewInterval = 1; // days
    if (isCorrect) {
      nextReviewInterval = Math.min(reviewCount * 2, 30);
    }

    // Update mastery level
    let masteryLevel = userVocab.masteryLevel;
    if (correctCount >= 10) {
      masteryLevel = MasteryLevel.MASTERED;
    } else if (correctCount >= 3) {
      masteryLevel = MasteryLevel.FAMILIAR;
    }

    return this.userVocabulariesRepository.update(userVocab.id, {
      reviewCount,
      correctCount,
      masteryLevel,
      lastReviewedAt: new Date(),
      nextReviewAt: new Date(
        Date.now() + nextReviewInterval * 24 * 60 * 60 * 1000,
      ),
    });
  }

  async getUserVocabularies(userId: string): Promise<UserVocabulary[]> {
    return this.userVocabulariesRepository.findByUserId(userId);
  }

  async getDueForReview(userId: string): Promise<UserVocabulary[]> {
    return this.userVocabulariesRepository.findDueForReview(userId);
  }
}
