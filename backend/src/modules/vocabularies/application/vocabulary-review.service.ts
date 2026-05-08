import { Injectable } from '@nestjs/common';
import { UserVocabulariesRepository } from './repositories/user-vocabularies.repository';
import { MasteryLevel } from '../../../common/enums';
import {
  FSRSService,
  Rating,
  Card,
  State,
} from '../../progress/application/fsrs.service';

export interface VocabularyReviewResult {
  id: string;
  nextReviewAt: Date;
  masteryLevel: MasteryLevel;
}

@Injectable()
export class VocabularyReviewService {
  private readonly fsrsService: FSRSService;

  constructor(
    private readonly userVocabulariesRepository: UserVocabulariesRepository,
  ) {
    this.fsrsService = new FSRSService();
  }

  async addVocabulary(
    userId: string,
    vocabularyId: string,
  ): Promise<VocabularyReviewResult> {
    const existing =
      await this.userVocabulariesRepository.findByUserAndVocabulary(
        userId,
        vocabularyId,
      );

    if (existing) {
      return {
        id: existing.id,
        nextReviewAt: existing.nextReviewAt ?? new Date(),
        masteryLevel: existing.masteryLevel,
      };
    }

    const newCard = this.fsrsService.initCard();
    const masteryLevel = this.calculateMasteryLevel(
      newCard.state,
      newCard.stability,
    );

    const userVocab = await this.userVocabulariesRepository.create({
      userId,
      vocabularyId,
      masteryLevel,
      nextReviewAt: newCard.due,
      stability: newCard.stability,
      difficulty: newCard.difficulty,
      state: newCard.state,
      elapsedDays: newCard.elapsedDays,
      scheduledDays: newCard.scheduledDays,
      reps: newCard.reps,
      lapses: newCard.lapses,
    });

    return {
      id: userVocab.id,
      nextReviewAt: userVocab.nextReviewAt ?? new Date(),
      masteryLevel,
    };
  }

  async reviewVocabulary(
    userId: string,
    vocabularyId: string,
    rating: Rating,
    reviewDate?: Date,
  ): Promise<VocabularyReviewResult> {
    const userVocab =
      await this.userVocabulariesRepository.findByUserAndVocabulary(
        userId,
        vocabularyId,
      );

    if (!userVocab) {
      throw new Error('User vocabulary not found');
    }

    const currentCard = this.toCard(userVocab);
    const now = reviewDate ?? new Date();
    const nextCard = this.calculateNextReview(currentCard, rating, now);

    const reviewCount = userVocab.reviewCount + 1;
    const isCorrect = rating >= Rating.Good;
    const correctCount = isCorrect
      ? userVocab.correctCount + 1
      : userVocab.correctCount;
    const masteryLevel = this.calculateMasteryLevel(
      nextCard.state,
      nextCard.stability,
    );

    const updated = await this.userVocabulariesRepository.update(userVocab.id, {
      reviewCount,
      correctCount,
      masteryLevel,
      lastReviewedAt: now,
      nextReviewAt: nextCard.due,
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
      state: nextCard.state,
      elapsedDays: nextCard.elapsedDays,
      scheduledDays: nextCard.scheduledDays,
      reps: nextCard.reps,
      lapses: nextCard.lapses,
    });

    return {
      id: updated.id,
      nextReviewAt: nextCard.due,
      masteryLevel,
    };
  }

  async batchReview(
    userId: string,
    reviews: Array<{ vocabularyId: string; rating: number }>,
    reviewDate?: Date,
  ): Promise<VocabularyReviewResult[]> {
    const results: VocabularyReviewResult[] = [];

    for (const review of reviews) {
      try {
        const result = await this.reviewVocabulary(
          userId,
          review.vocabularyId,
          review.rating as Rating,
          reviewDate,
        );
        results.push(result);
      } catch {
        // swallow per-item errors, matching existing behavior
      }
    }

    return results;
  }

  calculateMasteryLevel(state: State, stability: number): MasteryLevel {
    if (
      state === State.New ||
      state === State.Learning ||
      state === State.Relearning
    ) {
      return MasteryLevel.LEARNING;
    }
    if (stability >= 100) {
      return MasteryLevel.MASTERED;
    }
    if (stability >= 21) {
      return MasteryLevel.FAMILIAR;
    }
    return MasteryLevel.LEARNING;
  }

  private toCard(userVocab: {
    nextReviewAt?: Date;
    lastReviewedAt?: Date;
    stability: number;
    difficulty: number;
    state: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
  }): Card {
    return {
      due: userVocab.nextReviewAt ?? new Date(),
      stability: userVocab.stability,
      difficulty: userVocab.difficulty,
      elapsedDays: userVocab.elapsedDays,
      scheduledDays: userVocab.scheduledDays,
      reps: userVocab.reps,
      lapses: userVocab.lapses,
      state: userVocab.state as State,
      lastReview: userVocab.lastReviewedAt,
    };
  }

  private calculateNextReview(
    currentCard: Card,
    rating: Rating,
    reviewDate: Date,
  ): Card {
    const schedulingInfo = this.fsrsService.repeat(currentCard, reviewDate);
    return schedulingInfo[rating].card;
  }
}
