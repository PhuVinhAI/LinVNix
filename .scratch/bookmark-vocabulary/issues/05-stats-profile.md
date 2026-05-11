Status: ready-for-agent

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

Add a "Thống kê từ vựng" section to the Profile screen showing total bookmarked words count and breakdown by partOfSpeech.

**Backend**: Add a stats endpoint or derive from bookmarks list. Could be a dedicated `GET /vocabularies/bookmarks/stats` returning `{ total: number, byPartOfSpeech: Record<string, number> }`, or computed client-side from the bookmarks list if efficient enough.

**Mobile**: Add section to Profile screen with:
- Total bookmarked words count
- Breakdown by partOfSpeech (e.g. "12 danh từ, 8 động từ, 5 tính từ")

## Acceptance criteria

- [ ] Profile screen shows total bookmarked words count
- [ ] Profile screen shows breakdown by partOfSpeech in Vietnamese labels
- [ ] Stats update when bookmarks change (e.g. after unbookmarking)

## Blocked by

- `.scratch/bookmark-vocabulary/issues/01-bookmark-backend-api.md` (bookmark data must exist)
