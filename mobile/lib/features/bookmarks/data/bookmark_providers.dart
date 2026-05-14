import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/providers.dart';
import '../../../core/sync/sync.dart';
import '../data/bookmark_repository.dart';
import '../domain/bookmark_models.dart';

final bookmarkIdsProvider = AsyncNotifierProvider<BookmarkIdsNotifier, Set<String>>(
  BookmarkIdsNotifier.new,
);

class BookmarkIdsNotifier extends CachedRepository<Set<String>>
    with DataChangeBusSubscriber<Set<String>> {
  @override
  Duration get ttl => const Duration(minutes: 2);

  @override
  Future<Set<String>> fetchFromApi() async {
    final repo = ref.read(bookmarkRepositoryProvider);
    final allItems = <BookmarkWithVocabulary>[];
    int page = 1;
    const limit = 50;
    while (true) {
      final result = await repo.getBookmarks(page: page, limit: limit);
      allItems.addAll(result.items);
      if (page >= result.totalPages) break;
      page++;
    }
    return allItems.map((i) => i.vocabularyId).toSet();
  }

  Future<void> toggle(String vocabularyId) async {
    final current = state.value ?? <String>{};
    final optimistic = Set<String>.from(current);
    if (optimistic.contains(vocabularyId)) {
      optimistic.remove(vocabularyId);
    } else {
      optimistic.add(vocabularyId);
    }

    final repo = ref.read(bookmarkRepositoryProvider);
    await mutate(
      optimisticData: optimistic,
      apiCall: () async {
        final isBookmarked = await repo.toggleBookmark(vocabularyId);
        final reconciled = Set<String>.from(current);
        if (isBookmarked) {
          reconciled.add(vocabularyId);
        } else {
          reconciled.remove(vocabularyId);
        }
        return reconciled;
      },
      emitTags: {'bookmark', 'vocabulary-$vocabularyId'},
    );
  }
}

final bookmarkStatsProvider = AsyncNotifierProvider<BookmarkStatsNotifier, BookmarkStats>(
  BookmarkStatsNotifier.new,
);

class BookmarkStatsNotifier extends CachedRepository<BookmarkStats>
    with DataChangeBusSubscriber<BookmarkStats> {
  @override
  Duration get ttl => Duration.zero;

  @override
  Future<BookmarkStats> fetchFromApi() async {
    final repo = ref.read(bookmarkRepositoryProvider);
    return repo.getBookmarkStats();
  }

  @override
  Future<BookmarkStats> build() async {
    watchTags({'bookmark'});
    return super.build();
  }
}

final bookmarkRepositoryProvider = Provider<BookmarkRepository>((ref) {
  return BookmarkRepository(ref.watch(dioProvider));
});

class BookmarkSortNotifier extends Notifier<BookmarkSort> {
  @override
  BookmarkSort build() => BookmarkSort.newest;

  void setSort(BookmarkSort sort) => state = sort;
}

final bookmarkSortProvider = NotifierProvider<BookmarkSortNotifier, BookmarkSort>(
  BookmarkSortNotifier.new,
);

class BookmarkSearchNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void setSearch(String? search) => state = search;
}

final bookmarkSearchProvider = NotifierProvider<BookmarkSearchNotifier, String?>(
  BookmarkSearchNotifier.new,
);

final bookmarksProvider = AsyncNotifierProvider<BookmarksNotifier, BookmarksPage>(
  BookmarksNotifier.new,
);

class BookmarksNotifier extends AsyncNotifier<BookmarksPage>
    with DataChangeBusSubscriber<BookmarksPage> {
  int _page = 1;
  bool _hasMore = true;
  static const _limit = 20;

  @override
  Future<BookmarksPage> build() async {
    _page = 1;
    _hasMore = true;
    watchTags({'bookmark'});
    final search = ref.watch(bookmarkSearchProvider);
    final sort = ref.watch(bookmarkSortProvider);
    return _loadPage(1, search: search, sort: sort);
  }

  Future<BookmarksPage> _loadPage(
    int page, {
    String? search,
    BookmarkSort sort = BookmarkSort.newest,
  }) async {
    final repo = ref.read(bookmarkRepositoryProvider);
    return repo.getBookmarks(page: page, limit: _limit, search: search, sort: sort);
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    final current = state.value;
    if (current == null) return;

    try {
      final search = ref.read(bookmarkSearchProvider);
      final sort = ref.read(bookmarkSortProvider);
      final nextPage = await _loadPage(_page + 1, search: search, sort: sort);
      _page++;
      _hasMore = nextPage.items.length >= _limit;
      state = AsyncData(BookmarksPage(
        items: [...current.items, ...nextPage.items],
        page: nextPage.page,
        limit: nextPage.limit,
        totalPages: nextPage.totalPages,
        totalItems: nextPage.totalItems,
      ));
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
  }

  Future<void> toggleBookmark(String vocabularyId) async {
    await ref.read(bookmarkIdsProvider.notifier).toggle(vocabularyId);
  }
}

final flashcardBookmarksProvider =
    AsyncNotifierProvider<FlashcardBookmarksNotifier, List<BookmarkWithVocabulary>>(
  FlashcardBookmarksNotifier.new,
);

class FlashcardBookmarksNotifier extends CachedRepository<List<BookmarkWithVocabulary>>
    with DataChangeBusSubscriber<List<BookmarkWithVocabulary>> {
  @override
  Duration get ttl => const Duration(minutes: 2);

  @override
  Future<List<BookmarkWithVocabulary>> fetchFromApi() async {
    final repo = ref.read(bookmarkRepositoryProvider);
    final allItems = <BookmarkWithVocabulary>[];
    int page = 1;
    const limit = 50;
    while (true) {
      final result = await repo.getBookmarks(page: page, limit: limit);
      allItems.addAll(result.items);
      if (page >= result.totalPages) break;
      page++;
    }
    return allItems;
  }

  @override
  Future<List<BookmarkWithVocabulary>> build() async {
    watchTags({'bookmark'});
    return super.build();
  }
}
