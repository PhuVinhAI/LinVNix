Status: done

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

Add a "Thống kê từ vựng" section to the Profile screen showing total bookmarked words count and breakdown by partOfSpeech.

**Backend**: Add a stats endpoint or derive from bookmarks list. Could be a dedicated `GET /vocabularies/bookmarks/stats` returning `{ total: number, byPartOfSpeech: Record<string, number> }`, or computed client-side from the bookmarks list if efficient enough.

**Mobile**: Add section to Profile screen with:
- Total bookmarked words count
- Breakdown by partOfSpeech (e.g. "12 danh từ, 8 động từ, 5 tính từ")

## Acceptance criteria

- [x] Profile screen shows total bookmarked words count
- [x] Profile screen shows breakdown by partOfSpeech in Vietnamese labels
- [x] Stats update when bookmarks change (e.g. after unbookmarking)

## Blocked by

- `.scratch/bookmark-vocabulary/issues/01-bookmark-backend-api.md` (bookmark data must exist)

## Implementation notes

### Files created

(none)

### Files modified

- `backend/src/modules/vocabularies/application/repositories/bookmarks.repository.ts` — Added `getStats(userId)` method: GROUP BY partOfSpeech query returning total + breakdown
- `backend/src/modules/vocabularies/application/repositories/bookmarks.repository.spec.ts` — Added tests for `getStats` (with data, empty), added `addSelect`/`getRawMany`/`leftJoin`/`groupBy`/`select` query builder mocks
- `backend/src/modules/vocabularies/application/bookmarks.service.ts` — Added `BookmarkStatsResult` interface and `getStats(userId)` method delegating to repository
- `backend/src/modules/vocabularies/application/bookmarks.service.spec.ts` — Added tests for `getStats` (with data, empty), added `getStats` to repository mock
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.ts` — Added `GET /vocabularies/bookmarks/stats` endpoint with JwtAuthGuard
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.spec.ts` — Added tests for `getBookmarkStats` (with data, empty), added `getStats` to service mock
- `mobile/lib/features/bookmarks/domain/bookmark_models.dart` — Added `kPartOfSpeechViLabels` mapping (9 entries: noun→Danh từ, verb→Động từ, etc.) and `BookmarkStats` model class with `fromJson`
- `mobile/lib/features/bookmarks/data/bookmark_repository.dart` — Added `getBookmarkStats()` method calling `GET /vocabularies/bookmarks/stats`
- `mobile/lib/features/bookmarks/data/bookmark_providers.dart` — Added `bookmarkStatsProvider` (FutureProvider), added `ref.invalidate(bookmarkStatsProvider)` in `toggleBookmark` so stats refresh on bookmark change
- `mobile/lib/features/profile/presentation/screens/profile_screen.dart` — Added `_VocabStatsSection` (ConsumerWidget) and `_VocabStatsCard` widgets showing total count + Chip breakdown by partOfSpeech with Vietnamese labels; inserted between Statistics and Saved Words sections; added imports for bookmark_providers and bookmark_models

### Files deleted

(none)
