import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserVocabulariesRepository } from './user-vocabularies.repository';
import { UserVocabulary } from '../../domain/user-vocabulary.entity';
import { MasteryLevel } from '../../../../common/enums';

describe('UserVocabulariesRepository', () => {
  let repository: UserVocabulariesRepository;
  let mockRepo: jest.Mocked<Repository<UserVocabulary>>;
  let mockManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockManager = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserVocabulariesRepository,
        {
          provide: getRepositoryToken(UserVocabulary),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<UserVocabulariesRepository>(
      UserVocabulariesRepository,
    );
  });

  describe('updateMastery', () => {
    it('updates mastery level for user vocabulary', async () => {
      await repository.updateMastery(
        mockManager,
        'user-1',
        'vocab-1',
        MasteryLevel.FAMILIAR,
      );

      expect(mockManager.update).toHaveBeenCalledWith(
        UserVocabulary,
        { userId: 'user-1', vocabularyId: 'vocab-1' },
        { masteryLevel: MasteryLevel.FAMILIAR },
      );
    });

    it('updates mastery to MASTERED', async () => {
      await repository.updateMastery(
        mockManager,
        'user-1',
        'vocab-1',
        MasteryLevel.MASTERED,
      );

      expect(mockManager.update).toHaveBeenCalledWith(
        UserVocabulary,
        { userId: 'user-1', vocabularyId: 'vocab-1' },
        { masteryLevel: MasteryLevel.MASTERED },
      );
    });

    it('updates mastery to LEARNING', async () => {
      await repository.updateMastery(
        mockManager,
        'user-1',
        'vocab-1',
        MasteryLevel.LEARNING,
      );

      expect(mockManager.update).toHaveBeenCalledWith(
        UserVocabulary,
        { userId: 'user-1', vocabularyId: 'vocab-1' },
        { masteryLevel: MasteryLevel.LEARNING },
      );
    });

    it('passes manager for transaction context', async () => {
      await repository.updateMastery(
        mockManager,
        'user-1',
        'vocab-1',
        MasteryLevel.FAMILIAR,
      );

      expect(mockManager.update).toHaveBeenCalledTimes(1);
    });
  });
});
