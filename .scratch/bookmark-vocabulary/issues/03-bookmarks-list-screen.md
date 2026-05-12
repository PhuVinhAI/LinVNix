Status: done

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

A BookmarksScreen accessible from the Profile screen that displays all bookmarked vocabularies with search, sort, and infinite-scroll pagination. Users can unbookmark directly from the list and tap a word to see full details.

**Screen**: `BookmarksScreen` in `features/bookmarks/presentation/screens/` — loads bookmarked words via `GET /vocabularies/bookmarks`, supports search bar (word/translation), sort dropdown (newest/oldest/az/za/difficulty), paginated scroll. Each item shows word + translation + partOfSpeech. Tapping an item shows full detail (phonetic, example, classifier, etc.) via bottom sheet or detail route. Swipe or icon to unbookmark from list.

## Acceptance criteria

- [x] BookmarksScreen shows all bookmarked words with pagination
- [x] Search filters by word or translation (ILIKE)
- [x] Sort dropdown: newest, oldest, A-Z, Z-A, difficulty
- [x] Unbookmark directly from list updates UI immediately
- [x] Tap word shows full vocabulary details
- [x] "Thư từ đã lưu" entry in Profile screen navigates to BookmarksScreen

## Blocked by

- `.scratch/bookmark-vocabulary/issues/01-bookmark-backend-api.md` (bookmark API must exist)

## Implementation notes

### Files created

- `mobile/lib/features/bookmarks/presentation/screens/bookmarks_screen.dart` — BookmarksScreen with search bar, sort dropdown (Mới nhất/Cũ nhất/A-Z/Z-A/Độ khó), infinite-scroll pagination via ScrollController, each item shows word+translation+partOfSpeech+BookmarkIconButton, tap shows DraggableScrollableSheet detail (phonetic/classifier/example/dialectVariants), unbookmark removes item from list immediately with snackbar

- `mobile/test/features/bookmarks/data/bookmarks_notifier_test.dart` — Unit tests for BookmarksNotifier: loads initial page, toggleBookmark removes item when unbookmarked, toggleBookmark keeps item when bookmarked, refresh resets and reloads; plus bookmarkSortProvider/bookmarkSearchProvider default value tests

### Files modified

- `mobile/lib/features/bookmarks/data/bookmark_providers.dart` — Added BookmarkSortNotifier (NotifierProvider replacing StateProvider for Riverpod 3.x compat), BookmarkSearchNotifier, BookmarksNotifier with loadMore/refresh/toggleBookmark methods; toggleBookmark optimistically removes item from list on unbookmark

- `mobile/lib/core/router/app_router.dart` — Added `/bookmarks` route pointing to BookmarksScreen, added import for bookmarks_screen.dart

- `mobile/lib/features/profile/presentation/screens/profile_screen.dart` — Added `_SavedWordsSection` widget (Card with ListTile: bookmark icon + "Từ đã lưu" + chevron, navigates to `/bookmarks` via context.push), inserted after Stats section

### Files deleted

None

### Verification

- lint (flutter analyze): 0 errors (info-level warnings only, consistent with existing codebase)
- typecheck (dart analyze lib/): pass (0 errors, 0 new warnings)
- mobile bookmark tests: 14/14 pass (6 notifier + 5 repository + 3 widget)
- backend tests: 20/20 suites, 252/252 tests pass (unaffected)
