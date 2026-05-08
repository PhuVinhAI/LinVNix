import { Test, TestingModule } from '@nestjs/testing';
import { VocabularyReviewService } from './vocabulary-review.service';
import { UserVocabulariesRepository } from './repositories/user-vocabularies.repository';
import { MasteryLevel } from '../../../common/enums';
import { Rating, State } from '../../progress/application/fsrs.service';
import { UserVocabulary } from '../domain/user-vocabulary.entity';
import { LoggingService } from '../../../infrastructure/logging/logging.service';

const mockUserVocabBase = {
  reviewCount: 0,
  correctCount: 0,
  lastReviewedAt: null,
  stability: 0,
  difficulty: 0,
  state: State.New,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
};

describe('VocabularyReviewService', () => {
  let service: VocabularyReviewService;
  let repository: jest.Mocked<UserVocabulariesRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const repoMock = {
      findByUserAndVocabulary: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findDueForReview: jest.fn(),
    };

    const loggingMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyReviewService,
        { provide: UserVocabulariesRepository, useValue: repoMock },
        { provide: LoggingService, useValue: loggingMock },
      ],
    }).compile();

    service = module.get<VocabularyReviewService>(VocabularyReviewService);
    repository = module.get(UserVocabulariesRepository);
    loggingService = module.get(LoggingService);
  });

  describe('addVocabulary', () => {
    it('returns { id, nextReviewAt, masteryLevel } for new vocabulary', async () => {
      const created = {
        id: 'uv-1',
        ...mockUserVocabBase,
        nextReviewAt: new Date(),
        masteryLevel: MasteryLevel.LEARNING,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary.mockResolvedValue(null);
      repository.create.mockResolvedValue(created);

      const result = await service.addVocabulary('user-1', 'vocab-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('nextReviewAt');
      expect(result).toHaveProperty('masteryLevel');
      expect(result.masteryLevel).toBe(MasteryLevel.LEARNING);
    });

    it('returns existing vocabulary when already added', async () => {
      const existing = {
        id: 'uv-1',
        ...mockUserVocabBase,
        nextReviewAt: new Date('2024-01-05'),
        masteryLevel: MasteryLevel.FAMILIAR,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary.mockResolvedValue(existing);

      const result = await service.addVocabulary('user-1', 'vocab-1');

      expect(result.id).toBe('uv-1');
      expect(result.masteryLevel).toBe(MasteryLevel.FAMILIAR);
      expect(repository.create.mock.calls).toHaveLength(0);
    });
  });

  describe('reviewVocabulary', () => {
    it('returns { id, nextReviewAt, masteryLevel } with updated nextReviewAt after Good rating', async () => {
      const userVocab = {
        id: 'uv-1',
        ...mockUserVocabBase,
        nextReviewAt: new Date('2024-01-01'),
        masteryLevel: MasteryLevel.LEARNING,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary.mockResolvedValue(userVocab);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({
          ...userVocab,
          ...data,
        } as UserVocabulary),
      );

      const result = await service.reviewVocabulary(
        'user-1',
        'vocab-1',
        Rating.Good,
        new Date('2024-01-01'),
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('nextReviewAt');
      expect(result).toHaveProperty('masteryLevel');
      expect(result.nextReviewAt).toBeTruthy();
    });

    it('calculates masteryLevel as LEARNING for new cards reviewed with Again', async () => {
      const userVocab = {
        id: 'uv-1',
        ...mockUserVocabBase,
        nextReviewAt: new Date('2024-01-01'),
        masteryLevel: MasteryLevel.LEARNING,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary.mockResolvedValue(userVocab);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({
          ...userVocab,
          ...data,
        } as UserVocabulary),
      );

      const result = await service.reviewVocabulary(
        'user-1',
        'vocab-1',
        Rating.Again,
        new Date('2024-01-01'),
      );

      expect(result.masteryLevel).toBe(MasteryLevel.LEARNING);
    });

    it('advances mastery to FAMILIAR when stability reaches threshold', async () => {
      const userVocab = {
        id: 'uv-1',
        reviewCount: 4,
        correctCount: 4,
        lastReviewedAt: new Date('2024-01-01'),
        nextReviewAt: new Date('2024-01-01'),
        stability: 20,
        difficulty: 5,
        state: State.Review,
        elapsedDays: 20,
        scheduledDays: 20,
        reps: 5,
        lapses: 0,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary.mockResolvedValue(userVocab);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({
          ...userVocab,
          ...data,
        } as UserVocabulary),
      );

      const result = await service.reviewVocabulary(
        'user-1',
        'vocab-1',
        Rating.Easy,
        new Date('2024-01-21'),
      );

      expect(result.masteryLevel).not.toBe(MasteryLevel.LEARNING);
    });

    it('throws when vocabulary not found', async () => {
      repository.findByUserAndVocabulary.mockResolvedValue(null);

      await expect(
        service.reviewVocabulary('user-1', 'vocab-999', Rating.Good),
      ).rejects.toThrow('User vocabulary not found');
    });
  });

  describe('calculateMasteryLevel', () => {
    it('returns LEARNING for New state', () => {
      expect(service.calculateMasteryLevel(State.New, 0)).toBe(
        MasteryLevel.LEARNING,
      );
    });

    it('returns LEARNING for Learning state', () => {
      expect(service.calculateMasteryLevel(State.Learning, 5)).toBe(
        MasteryLevel.LEARNING,
      );
    });

    it('returns LEARNING for Relearning state', () => {
      expect(service.calculateMasteryLevel(State.Relearning, 50)).toBe(
        MasteryLevel.LEARNING,
      );
    });

    it('returns FAMILIAR for Review state with stability >= 21', () => {
      expect(service.calculateMasteryLevel(State.Review, 21)).toBe(
        MasteryLevel.FAMILIAR,
      );
    });

    it('returns MASTERED for Review state with stability >= 100', () => {
      expect(service.calculateMasteryLevel(State.Review, 100)).toBe(
        MasteryLevel.MASTERED,
      );
    });

    it('returns LEARNING for Review state with stability < 21', () => {
      expect(service.calculateMasteryLevel(State.Review, 10)).toBe(
        MasteryLevel.LEARNING,
      );
    });
  });

  describe('batchReview', () => {
    it('returns per-item results with success=true for valid reviews', async () => {
      const userVocab = {
        id: 'uv-1',
        ...mockUserVocabBase,
        nextReviewAt: new Date('2024-01-01'),
        masteryLevel: MasteryLevel.LEARNING,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary.mockResolvedValue(userVocab);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({
          ...userVocab,
          ...data,
        } as UserVocabulary),
      );

      const result = await service.batchReview(
        'user-1',
        [
          { vocabularyId: 'v1', rating: Rating.Good },
          { vocabularyId: 'v2', rating: Rating.Easy },
        ],
        new Date('2024-01-01'),
      );

      expect(result).toHaveLength(2);
      expect(result[0].vocabularyId).toBe('v1');
      expect(result[0].success).toBe(true);
      expect(result[0].result).toHaveProperty('nextReviewAt');
      expect(result[0].result).toHaveProperty('masteryLevel');
      expect(result[1].vocabularyId).toBe('v2');
      expect(result[1].success).toBe(true);
    });

    it('returns per-item results with success=false for failed reviews, without throwing', async () => {
      repository.findByUserAndVocabulary.mockResolvedValue(null);

      const result = await service.batchReview('user-1', [
        { vocabularyId: 'v-missing', rating: Rating.Good },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].vocabularyId).toBe('v-missing');
      expect(result[0].success).toBe(false);
      expect(result[0].error).toBe('User vocabulary not found');
      expect(result[0].result).toBeUndefined();
    });

    it('logs errors via LoggingService for failed items', async () => {
      repository.findByUserAndVocabulary.mockResolvedValue(null);

      await service.batchReview('user-1', [
        { vocabularyId: 'v-missing', rating: Rating.Good },
      ]);

      expect(loggingService.error as jest.Mock).toHaveBeenCalledTimes(1);
      expect((loggingService.error as jest.Mock).mock.calls[0]).toEqual([
        expect.stringContaining('batchReview failed for vocabulary v-missing'),
        undefined,
        'VocabularyReviewService',
      ]);
    });

    it('returns mixed results when some reviews succeed and some fail', async () => {
      const userVocab = {
        id: 'uv-1',
        ...mockUserVocabBase,
        nextReviewAt: new Date('2024-01-01'),
        masteryLevel: MasteryLevel.LEARNING,
      } as unknown as UserVocabulary;

      repository.findByUserAndVocabulary
        .mockResolvedValueOnce(userVocab)
        .mockResolvedValueOnce(null);
      repository.update.mockImplementation((_id, data) =>
        Promise.resolve({
          ...userVocab,
          ...data,
        } as UserVocabulary),
      );

      const result = await service.batchReview(
        'user-1',
        [
          { vocabularyId: 'v1', rating: Rating.Good },
          { vocabularyId: 'v-missing', rating: Rating.Good },
        ],
        new Date('2024-01-01'),
      );

      expect(result).toHaveLength(2);
      expect(result[0].success).toBe(true);
      expect(result[0].result).toBeDefined();
      expect(result[1].success).toBe(false);
      expect(result[1].error).toBeDefined();
    });
  });

  describe('getDueForReview', () => {
    it('returns due vocabularies from repository', async () => {
      const dueVocabs = [
        { id: 'uv-1', masteryLevel: MasteryLevel.LEARNING } as UserVocabulary,
        { id: 'uv-2', masteryLevel: MasteryLevel.FAMILIAR } as UserVocabulary,
      ];
      repository.findDueForReview.mockResolvedValue(dueVocabs);

      const result = await service.getDueForReview('user-1');

      expect(result).toHaveLength(2);
      expect(repository.findDueForReview as jest.Mock).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('returns empty array when no vocabularies are due', async () => {
      repository.findDueForReview.mockResolvedValue([]);

      const result = await service.getDueForReview('user-1');

      expect(result).toHaveLength(0);
    });
  });
});
