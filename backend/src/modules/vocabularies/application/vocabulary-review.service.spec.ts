import { Test, TestingModule } from '@nestjs/testing';
import { VocabularyReviewService } from './vocabulary-review.service';
import { UserVocabulariesRepository } from './repositories/user-vocabularies.repository';
import { MasteryLevel } from '../../../common/enums';
import { Rating, State } from '../../progress/application/fsrs.service';
import { UserVocabulary } from '../domain/user-vocabulary.entity';

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

  beforeEach(async () => {
    const repoMock = {
      findByUserAndVocabulary: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyReviewService,
        { provide: UserVocabulariesRepository, useValue: repoMock },
      ],
    }).compile();

    service = module.get<VocabularyReviewService>(VocabularyReviewService);
    repository = module.get(UserVocabulariesRepository);
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
    it('returns results for each successful review', async () => {
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
      expect(result[0]).toHaveProperty('nextReviewAt');
      expect(result[0]).toHaveProperty('masteryLevel');
    });

    it('skips failed reviews without throwing', async () => {
      repository.findByUserAndVocabulary.mockResolvedValue(null);

      const result = await service.batchReview('user-1', [
        { vocabularyId: 'v1', rating: Rating.Good },
      ]);

      expect(result).toHaveLength(0);
    });
  });
});
