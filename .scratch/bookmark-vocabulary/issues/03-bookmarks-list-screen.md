Status: ready-for-agent

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

A BookmarksScreen accessible from the Profile screen that displays all bookmarked vocabularies with search, sort, and infinite-scroll pagination. Users can unbookmark directly from the list and tap a word to see full details.

**Screen**: `BookmarksScreen` in `features/bookmarks/presentation/screens/` — loads bookmarked words via `GET /vocabularies/bookmarks`, supports search bar (word/translation), sort dropdown (newest/oldest/az/za/difficulty), paginated scroll. Each item shows word + translation + partOfSpeech. Tapping an item shows full detail (phonetic, example, classifier, etc.) via bottom sheet or detail route. Swipe or icon to unbookmark from list.

## Acceptance criteria

- [ ] BookmarksScreen shows all bookmarked words with pagination
- [ ] Search filters by word or translation (ILIKE)
- [ ] Sort dropdown: newest, oldest, A-Z, Z-A, difficulty
- [ ] Unbookmark directly from list updates UI immediately
- [ ] Tap word shows full vocabulary details
- [ ] "Thư từ đã lưu" entry in Profile screen navigates to BookmarksScreen

## Blocked by

- `.scratch/bookmark-vocabulary/issues/01-bookmark-backend-api.md` (bookmark API must exist)
