import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PersonalVocabulariesRepository } from './repositories/personal-vocabularies.repository';
import { PersonalVocabulary } from '../domain/personal-vocabulary.entity';
import { PersonalVocabularySort } from '../dto/personal-vocabulary-query.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class PersonalVocabulariesService {
  constructor(
    private readonly personalVocabulariesRepository: PersonalVocabulariesRepository,
  ) {}

  async create(
    userId: string,
    data: Partial<PersonalVocabulary>,
  ): Promise<PersonalVocabulary> {
    return this.personalVocabulariesRepository.create({
      ...data,
      userId,
    });
  }

  async findById(id: string, userId: string): Promise<PersonalVocabulary> {
    const personalVocabulary =
      await this.personalVocabulariesRepository.findById(id);
    if (!personalVocabulary) {
      throw new NotFoundException(
        `Personal vocabulary with ID ${id} not found`,
      );
    }
    if (personalVocabulary.userId !== userId) {
      throw new ForbiddenException('You do not own this personal vocabulary');
    }
    return personalVocabulary;
  }

  async list(
    userId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      sort: PersonalVocabularySort;
    },
  ): Promise<PaginatedResult<PersonalVocabulary>> {
    return this.personalVocabulariesRepository.findPaginated({
      userId,
      ...params,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const personalVocabulary =
      await this.personalVocabulariesRepository.findByIdAndUserId(id, userId);
    if (!personalVocabulary) {
      const exists = await this.personalVocabulariesRepository.findById(id);
      if (!exists) {
        throw new NotFoundException(
          `Personal vocabulary with ID ${id} not found`,
        );
      }
      throw new ForbiddenException('You do not own this personal vocabulary');
    }
    await this.personalVocabulariesRepository.softDelete(id);
  }
}
