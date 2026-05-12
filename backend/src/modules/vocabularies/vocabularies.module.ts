import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './domain/vocabulary.entity';
import { UserVocabulary } from './domain/user-vocabulary.entity';
import { Bookmark } from './domain/bookmark.entity';
import { VocabulariesService } from './application/vocabularies.service';
import { UserVocabulariesService } from './application/user-vocabularies.service';
import { VocabularyReviewService } from './application/vocabulary-review.service';
import { BookmarksService } from './application/bookmarks.service';
import { VocabulariesRepository } from './application/repositories/vocabularies.repository';
import { UserVocabulariesRepository } from './application/repositories/user-vocabularies.repository';
import { BookmarksRepository } from './application/repositories/bookmarks.repository';
import { VocabulariesController } from './presentation/vocabularies.controller';
import { AuthModule } from '../auth/auth.module';
import { LoggingModule } from '../../infrastructure/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, UserVocabulary, Bookmark]),
    AuthModule,
    LoggingModule,
  ],
  controllers: [VocabulariesController],
  providers: [
    VocabulariesService,
    UserVocabulariesService,
    VocabularyReviewService,
    BookmarksService,
    VocabulariesRepository,
    UserVocabulariesRepository,
    BookmarksRepository,
  ],
  exports: [
    VocabulariesService,
    UserVocabulariesService,
    VocabularyReviewService,
    BookmarksService,
  ],
})
export class VocabulariesModule {}
