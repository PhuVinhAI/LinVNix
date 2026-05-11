Status: ready-for-agent

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

- [ ] "Learn" button in vocabulary step replaced with BookmarkIconButton
- [ ] Tapping bookmark icon toggles bookmark on backend and updates icon (filled ↔ outlined)
- [ ] Search results show bookmark status per vocabulary item
- [ ] BookmarkIconButton widget test passes (filled vs outlined icon state)

## Blocked by

- `.scratch/bookmark-vocabulary/issues/01-bookmark-backend-api.md` (bookmark API must exist)
