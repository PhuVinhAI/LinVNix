import { Injectable } from '@nestjs/common';
import { BookmarksRepository } from './repositories/bookmarks.repository';
import { BookmarkSort } from '../dto/bookmark-query.dto';
import { Bookmark } from '../domain/bookmark.entity';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

export interface BookmarkToggleResult {
  isBookmarked: boolean;
}

export interface BookmarkListItem {
  bookmarkedAt: Date;
  vocabulary: any;
}

export interface BookmarkListResult {
  data: BookmarkListItem[];
  meta: PaginatedResult<Bookmark>['meta'];
}

export interface BookmarkStatsResult {
  total: number;
  byPartOfSpeech: Record<string, number>;
}

@Injectable()
export class BookmarksService {
  constructor(private readonly bookmarksRepository: BookmarksRepository) {}

  async getStats(userId: string): Promise<BookmarkStatsResult> {
    return this.bookmarksRepository.getStats(userId);
  }

  async toggle(
    userId: string,
    vocabularyId: string,
  ): Promise<BookmarkToggleResult> {
    const existing = await this.bookmarksRepository.findByUserAndVocabulary(
      userId,
      vocabularyId,
    );

    if (existing) {
      await this.bookmarksRepository.delete(existing.id);
      return { isBookmarked: false };
    }

    await this.bookmarksRepository.create({ userId, vocabularyId });
    return { isBookmarked: true };
  }

  async list(
    userId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      sort: BookmarkSort;
    },
  ): Promise<BookmarkListResult> {
    const result = await this.bookmarksRepository.findPaginated({
      userId,
      ...params,
    });

    return {
      data: result.data.map((bookmark) => ({
        bookmarkedAt: bookmark.createdAt,
        vocabulary: bookmark.vocabulary,
      })),
      meta: result.meta,
    };
  }

  async isBookmarked(
    userId: string,
    vocabularyIds: string[],
  ): Promise<Record<string, boolean>> {
    if (vocabularyIds.length === 0) {
      return {};
    }

    const bookmarks = await this.bookmarksRepository.findByVocabularyIds(
      userId,
      vocabularyIds,
    );

    const bookmarkedIds = new Set(bookmarks.map((b) => b.vocabularyId));

    return vocabularyIds.reduce(
      (map, id) => {
        map[id] = bookmarkedIds.has(id);
        return map;
      },
      {} as Record<string, boolean>,
    );
  }
}
