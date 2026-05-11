Status: ready-for-agent

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

Add bookmark toggle + list endpoints to the existing VocabulariesModule, plus enrich existing vocabulary responses with `isBookmarked` for authenticated users.

**Bookmark entity** (table `bookmarks`): extends `BaseEntity`, `userId` FK → User (CASCADE), `vocabularyId` FK → Vocabulary (CASCADE), unique constraint on `(userId, vocabularyId)`.

**New endpoints** (within `/api/v1/vocabularies`):
- `POST /vocabularies/:vocabularyId/bookmark` — Toggle bookmark. Returns `{ data: { isBookmarked: boolean } }`. If not bookmarked → create; if already bookmarked → delete.
- `GET /vocabularies/bookmarks` — List bookmarked vocabularies. Query params: `page`, `limit` (default 20), `search` (ILIKE word/translation), `sort` (`newest`|`oldest`|`az`|`za`|`difficulty`, default `newest`). Returns paginated list with full Vocabulary data + `bookmarkedAt`.

**Modified responses**:
- `GET /vocabularies/search` — when user authenticated, each item includes `isBookmarked: boolean`
- `GET /vocabularies/lesson/:lessonId` — when user authenticated, each item includes `isBookmarked: boolean`
- When user not authenticated, `isBookmarked` is absent or `false`

**Module structure** (all within `vocabularies/`):
- `domain/bookmark.entity.ts` — NEW
- `dto/bookmark-query.dto.ts` — NEW (page, limit, search, sort)
- `application/bookmarks.service.ts` — NEW (toggle, list, isBookmarked batch check)
- `application/repositories/bookmarks.repository.ts` — NEW (CRUD + search + sort)
- `application/vocabularies.service.ts` — MODIFIED (inject BookmarksService for enrichment)
- `presentation/vocabularies.controller.ts` — MODIFIED (add 2 bookmark endpoints, enrich search/lesson responses)
- `vocabularies.module.ts` — MODIFIED (register Bookmark entity + new providers)

## Acceptance criteria

- [ ] Bookmark entity created with correct columns, FKs, and unique constraint
- [ ] `POST /vocabularies/:vocabularyId/bookmark` toggles bookmark and returns `{ isBookmarked }`
- [ ] `GET /vocabularies/bookmarks` returns paginated, searchable, sortable list with `bookmarkedAt`
- [ ] `GET /vocabularies/search` includes `isBookmarked` for authenticated users
- [ ] `GET /vocabularies/lesson/:lessonId` includes `isBookmarked` for authenticated users
- [ ] Unauthenticated requests do not include `isBookmarked` (or it is `false`)
- [ ] BookmarksService unit tests (toggle logic, list with pagination/search/sort, isBookmarked batch check)
- [ ] BookmarksRepository unit tests (CRUD, search query building, sort ordering)
- [ ] Controller tests for bookmark endpoints

## Blocked by

None — can start immediately
