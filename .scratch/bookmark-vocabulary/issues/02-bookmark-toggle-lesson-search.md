Status: done

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

Replace the "Learn" button in the lesson vocabulary step with a BookmarkIconButton that toggles bookmark status. Also show bookmark status in vocabulary search results. The widget is a bookmark icon (filled when bookmarked, outlined when not) that calls the toggle endpoint on tap.

**New widget**: `BookmarkIconButton` in `features/bookmarks/presentation/widgets/` — accepts `vocabularyId` and `isBookmarked` props, calls toggle bookmark API on tap, updates state optimistically.

**Modified**:
- `features/lessons/presentation/widgets/vocabulary_step.dart` — replace `FilledButton.tonal` "Learn"/"Learned" with `BookmarkIconButton`, remove `learnVocabulary` API call, use bookmark toggle instead
- Vocabulary search results — show `BookmarkIconButton` per item using `isBookmarked` from API response

**Mobile module structure**:
- `features/bookmarks/data/bookmark_repository.dart` — toggleBookmark, getBookmarks
- `features/bookmarks/data/bookmark_providers.dart` — Riverpod providers
- `features/bookmarks/domain/bookmark_models.dart` — Bookmark, BookmarkWithVocabulary
- `features/bookmarks/presentation/widgets/bookmark_icon_button.dart` — toggle icon widget

## Acceptance criteria

- [x] "Learn" button in vocabulary step replaced with BookmarkIconButton
- [x] Tapping bookmark icon toggles bookmark on backend and updates icon (filled ↔ outlined)
- [x] Search results show bookmark status per vocabulary item
- [x] BookmarkIconButton widget test passes (filled vs outlined icon state)

## Blocked by

- `.scratch/bookmark-vocabulary/issues/01-bookmark-backend-api.md` (bookmark API must exist)

## Implementation notes

### Files created

- `mobile/lib/features/bookmarks/domain/bookmark_models.dart` — BookmarkSort enum, BookmarkWithVocabulary model, BookmarksPage model (fromJson for paginated bookmarks API response)
- `mobile/lib/features/bookmarks/data/bookmark_repository.dart` — BookmarkRepository with toggleBookmark (POST /vocabularies/:id/bookmark) and getBookmarks (GET /vocabularies/bookmarks with pagination/search/sort)
- `mobile/lib/features/bookmarks/data/bookmark_providers.dart` — bookmarkRepositoryProvider Riverpod provider
- `mobile/lib/features/bookmarks/presentation/widgets/bookmark_icon_button.dart` — BookmarkIconButton widget (Icons.bookmark when filled, Icons.bookmark_border when outlined, calls onToggle callback)
- `mobile/test/features/bookmarks/data/bookmark_repository_test.dart` — Unit tests for toggleBookmark (bookmarked/unbookmarked/401) and getBookmarks (paginated response, search/sort params)
- `mobile/test/features/bookmarks/presentation/widgets/bookmark_icon_button_test.dart` — Widget tests for outlined icon when not bookmarked, filled icon when bookmarked, onToggle callback on tap

### Files modified

- `mobile/lib/features/lessons/domain/lesson_models.dart` — Added `isBookmarked` field (bool, default false) to LessonVocabulary, updated fromJson to parse `isBookmarked` from API response
- `mobile/lib/features/review/domain/review_models.dart` — Added `isBookmarked` field (bool, default false) to Vocabulary model, updated fromJson to parse `isBookmarked` from API response
- `mobile/lib/features/lessons/presentation/widgets/vocabulary_step.dart` — Replaced FilledButton.tonal "Learn"/"Learned" with BookmarkIconButton; removed learnVocabulary API call and learnedVocabIds/onVocabLearned props; added optimistic toggle with loading spinner; uses bookmarkRepositoryProvider for toggle
- `mobile/lib/features/review/presentation/screens/vocabulary_browser_screen.dart` — Added BookmarkIconButton to VocabularySearchDelegate search results; imports bookmark_providers and BookmarkIconButton; added _toggleBookmark method for inline bookmark toggling in search
- `mobile/lib/features/lessons/presentation/screens/lesson_wizard_screen.dart` — Removed review_providers import; removed _learnedVocabIds state; removed myVocabularies fetch logic for determining learned status (now uses isBookmarked from API directly); simplified VocabularyStepWidget props (removed learnedVocabIds and onVocabLearned)

### Files deleted

None

### Verification

- lint (flutter analyze): 0 errors, only pre-existing info warnings
- typecheck: pass (build_runner succeeded)
- mobile bookmark tests: 8/8 pass (5 repository + 3 widget)
- backend tests: 20/20 suites, 252/252 tests pass (unaffected)
