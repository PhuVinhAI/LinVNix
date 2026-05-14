Status: `completed`

## What to build

Unify the three fragmented bookmark state sources (VocabularyStepWidget's local Set, BookmarksNotifier, and server) into a single `bookmarkIdsProvider` that all screens watch. When a user toggles a bookmark in any screen, all other screens reflect the change immediately via DataChangeBus propagation.

### Current problem (from codebase exploration)

- `VocabularyStepWidget` builds a local `Set<String> _bookmarkedIds` from vocab data, calls `bookmarkRepositoryProvider` directly to toggle — bypasses `BookmarksNotifier` entirely, does NOT invalidate `bookmarksProvider` or `bookmarkStatsProvider`
- `BookmarksScreen` toggles via `BookmarksNotifier.toggleBookmark()`, which calls repo then invalidates `bookmarkStatsProvider` and manually removes from local state
- Neither path notifies the other — toggling in lesson doesn't refresh bookmarks list, and vice versa

### What changes

- Create `bookmarkIdsProvider` (`AsyncNotifierProvider<BookmarkIdsNotifier, Set<String>>`) extending `CachedRepository<Set<String>>`
- `toggle(vocabularyId)`: optimistic add/remove → API → reconcile → emit `DataChanged(tags: {'bookmark', 'vocabulary-$id'})`
- `VocabularyStepWidget`: replace local `_bookmarkedIds` Set + raw repo call → `ref.watch(bookmarkIdsProvider)` + `ref.read(bookmarkIdsProvider.notifier).toggle()`
- `BookmarksScreen`: use `bookmarkIdsProvider` for `isBookmarked` checks; simplify `BookmarksNotifier` to thin wrapper that also watches `bookmarkIdsProvider`
- `BookmarkIconButton`: parent widgets pass `isBookmarked` from `bookmarkIdsProvider` watch
- `bookmarkStatsProvider`: subscribe to DataChangeBus tag `'bookmark'` for auto-invalidation
- `bookmarksProvider`: subscribe to DataChangeBus tag `'bookmark'` for auto-invalidation
- `flashcardBookmarksProvider`: subscribe to DataChangeBus tag `'bookmark'` for auto-invalidation
- Remove all manual `ref.invalidate(bookmarkStatsProvider)` and `ref.invalidate(bookmarksProvider)` calls from UI code

## Acceptance criteria

- [x] `bookmarkIdsProvider` with `toggle(vocabularyId)` method, extending CachedRepository
- [x] Toggle emits `DataChanged(tags: {'bookmark', 'vocabulary-$id'})` on API success
- [x] VocabularyStepWidget uses `ref.watch(bookmarkIdsProvider)` — no local `_bookmarkedIds` Set
- [x] BookmarksScreen uses `bookmarkIdsProvider` for `isBookmarked` state
- [x] BookmarksNotifier simplified to thin wrapper around `bookmarkIdsProvider`
- [x] `bookmarkStatsProvider` auto-invalidates via DataChangeBus tag `'bookmark'`
- [x] `bookmarksProvider` auto-invalidates via DataChangeBus tag `'bookmark'`
- [x] `flashcardBookmarksProvider` auto-invalidates via DataChangeBus tag `'bookmark'`
- [x] No manual `ref.invalidate()` for bookmark-related providers remains in UI code
- [x] Unit test: toggle adds ID when not present, optimistic update visible immediately
- [x] Unit test: toggle removes ID when present
- [x] Unit test: API failure reverts toggle to previous state
- [x] Unit test: `DataChanged` event emitted on success only
- [x] End-to-end verification: toggle bookmark in lesson → BookmarksScreen updates without restart

## Blocked by

- Issue 01 (DataChangeBus + Event Infrastructure)
- Issue 02 (CachedRepository Generic + TTL)

## Implementation notes

### Files created

- `mobile/test/features/bookmarks/data/bookmark_ids_notifier_test.dart` — unit tests for `BookmarkIdsNotifier` covering optimistic add, optimistic remove, API-failure revert, and `DataChanged` emission on success only.

### Files modified

- `mobile/lib/features/bookmarks/data/bookmark_providers.dart` — created `BookmarkIdsNotifier` (extends `CachedRepository<Set<String>>` with optimistic toggle + reconcile + `DataChanged` emission); converted `bookmarkStatsProvider` and `flashcardBookmarksProvider` to `AsyncNotifier` extending `CachedRepository` with `watchTags({'bookmark'})`; simplified `BookmarksNotifier.toggleBookmark` to delegate to `bookmarkIdsProvider` and removed manual `ref.invalidate(bookmarkStatsProvider)`.
- `mobile/lib/features/lessons/presentation/widgets/vocabulary_step.dart` — removed local `_bookmarkedIds` Set; widget now `ref.watch(bookmarkIdsProvider)` and delegates toggle to `bookmarkIdsProvider.notifier.toggle(vocabularyId)`.
- `mobile/lib/features/bookmarks/presentation/screens/bookmarks_screen.dart` — removed manual `ref.invalidate(bookmarksProvider)` calls from search/sort handlers; `_onToggleBookmark` now delegates to `bookmarkIdsProvider.notifier.toggle`; `_BookmarkTile` receives `isBookmarked` from `bookmarkIdsProvider` watch.
- `mobile/lib/features/bookmarks/presentation/screens/flashcard_screen.dart` — replaced `ref.invalidate(flashcardBookmarksProvider)` retry button with `ref.read(flashcardBookmarksProvider.notifier).refresh()`.
- `mobile/lib/core/sync/cached_repository.dart` — added `refresh()` method (`ref.invalidateSelf()`) for `AsyncNotifier` subclasses.
- `mobile/lib/core/sync/tag_subscription.dart` — fixed potential infinite-invalidate loop in `watchTags` by tracking the last handled `DataChanged` instance via `identical` comparison before calling `ref.invalidateSelf()`.
- `mobile/test/features/bookmarks/data/bookmarks_notifier_test.dart` — updated existing tests to reflect the simplified `BookmarksNotifier` (removed assertions on the old manual-remove behavior; kept load/refresh tests).

### Files deleted

- None.
