import { PersonalVocabulariesService } from './personal-vocabularies.service';
import { PersonalVocabulariesRepository } from './repositories/personal-vocabularies.repository';
import { PersonalVocabularySource } from '../../../common/enums';
import { PersonalVocabularySort } from '../dto/personal-vocabulary-query.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PersonalVocabulariesService', () => {
  let service: PersonalVocabulariesService;
  let repository: jest.Mocked<PersonalVocabulariesRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      softDelete: jest.fn(),
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<PersonalVocabulariesRepository>;
    service = new PersonalVocabulariesService(repository);
  });

  describe('create', () => {
    it('creates a personal vocabulary scoped to the user', async () => {
      const data = {
        word: 'bàn',
        translation: 'table',
        source: PersonalVocabularySource.IMAGE_DISCOVERY,
      };
      const created = {
        id: 'pv-1',
        userId: 'user-1',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.create.mockResolvedValue(created as any);

      const result = await service.create('user-1', data);

      expect(repository.create).toHaveBeenCalledWith({
        ...data,
        userId: 'user-1',
      });
      expect(result).toEqual(created);
    });

    it('creates with optional fields', async () => {
      const data = {
        word: 'bàn',
        translation: 'table',
        phonetic: 'bahn',
        partOfSpeech: 'noun',
        classifier: 'cái',
        source: PersonalVocabularySource.IMAGE_DISCOVERY,
      };
      repository.create.mockResolvedValue({ id: 'pv-1', ...data } as any);

      await service.create('user-1', data);

      expect(repository.create).toHaveBeenCalledWith({
        ...data,
        userId: 'user-1',
      });
    });
  });

  describe('findById', () => {
    it('returns personal vocabulary when found and owned', async () => {
      const pv = {
        id: 'pv-1',
        userId: 'user-1',
        word: 'bàn',
      };
      repository.findById.mockResolvedValue(pv as any);

      const result = await service.findById('pv-1', 'user-1');

      expect(result).toEqual(pv);
    });

    it('throws NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('pv-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when not owned', async () => {
      const pv = { id: 'pv-1', userId: 'user-2', word: 'bàn' };
      repository.findById.mockResolvedValue(pv as any);

      await expect(service.findById('pv-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('list', () => {
    it('returns paginated list scoped to user', async () => {
      const paginatedResult = {
        data: [{ id: 'pv-1', userId: 'user-1', word: 'bàn' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      repository.findPaginated.mockResolvedValue(paginatedResult as any);

      const result = await service.list('user-1', {
        page: 1,
        limit: 20,
        sort: PersonalVocabularySort.NEWEST,
      });

      expect(repository.findPaginated).toHaveBeenCalledWith({
        userId: 'user-1',
        page: 1,
        limit: 20,
        search: undefined,
        sort: PersonalVocabularySort.NEWEST,
      });
      expect(result.meta.total).toBe(1);
    });

    it('passes search and sort params', async () => {
      repository.findPaginated.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });

      await service.list('user-1', {
        page: 1,
        limit: 20,
        search: 'bàn',
        sort: PersonalVocabularySort.AZ,
      });

      expect(repository.findPaginated).toHaveBeenCalledWith({
        userId: 'user-1',
        page: 1,
        limit: 20,
        search: 'bàn',
        sort: PersonalVocabularySort.AZ,
      });
    });
  });

  describe('delete', () => {
    it('soft-deletes when owned by user', async () => {
      repository.findByIdAndUserId.mockResolvedValue({
        id: 'pv-1',
        userId: 'user-1',
      } as any);
      repository.softDelete.mockResolvedValue(undefined);

      await service.delete('pv-1', 'user-1');

      expect(repository.softDelete).toHaveBeenCalledWith('pv-1');
    });

    it('throws NotFoundException when not found', async () => {
      repository.findByIdAndUserId.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('pv-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when not owned', async () => {
      repository.findByIdAndUserId.mockResolvedValue(null);
      repository.findById.mockResolvedValue({
        id: 'pv-1',
        userId: 'user-2',
      } as any);

      await expect(service.delete('pv-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
