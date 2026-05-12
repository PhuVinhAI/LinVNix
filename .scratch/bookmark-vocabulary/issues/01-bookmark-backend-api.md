Status: done

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

- [x] Bookmark entity created with correct columns, FKs, and unique constraint
- [x] `POST /vocabularies/:vocabularyId/bookmark` toggles bookmark and returns `{ isBookmarked }`
- [x] `GET /vocabularies/bookmarks` returns paginated, searchable, sortable list with `bookmarkedAt`
- [x] `GET /vocabularies/search` includes `isBookmarked` for authenticated users
- [x] `GET /vocabularies/lesson/:lessonId` includes `isBookmarked` for authenticated users
- [x] Unauthenticated requests do not include `isBookmarked` (or it is `false`)
- [x] BookmarksService unit tests (toggle logic, list with pagination/search/sort, isBookmarked batch check)
- [x] BookmarksRepository unit tests (CRUD, search query building, sort ordering)
- [x] Controller tests for bookmark endpoints

## Blocked by

None — can start immediately

## Implementation notes

### Files created

- `backend/src/modules/vocabularies/domain/bookmark.entity.ts` — Bookmark entity with userId/vocabularyId FKs, unique constraint, CASCADE deletes, extends BaseEntity
- `backend/src/modules/vocabularies/dto/bookmark-query.dto.ts` — BookmarkQueryDto (page, limit, search, sort with BookmarkSort enum) + BookmarkSort enum
- `backend/src/modules/vocabularies/application/repositories/bookmarks.repository.ts` — BookmarksRepository with CRUD, findByVocabularyIds batch check, findPaginated with search/sort/pagination using QueryBuilder
- `backend/src/modules/vocabularies/application/repositories/bookmarks.repository.spec.ts` — Unit tests for create, findByUserAndVocabulary, delete, findByVocabularyIds, findPaginated (all 5 sort orders, search filter, pagination meta)
- `backend/src/modules/vocabularies/application/bookmarks.service.ts` — BookmarksService with toggle (create/delete), list (paginated with bookmarkedAt), isBookmarked (batch check returning map)
- `backend/src/modules/vocabularies/application/bookmarks.service.spec.ts` — Unit tests for toggle (create/delete paths), list (pagination/search/sort/bookmarkedAt), isBookmarked (batch map, empty, edge cases)
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.spec.ts` — Controller tests for toggle endpoint, bookmarks list endpoint, search/lesson isBookmarked enrichment (authenticated + unauthenticated)

### Files modified

- `backend/src/modules/vocabularies/domain/vocabulary.entity.ts` — Added `@OneToMany('Bookmark', 'vocabulary') bookmarks` relation
- `backend/src/modules/vocabularies/application/vocabularies.service.ts` — Injected BookmarksService, added `enrichWithBookmarks()` method that batch-checks isBookmarked for vocabulary lists
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.ts` — Injected BookmarksService, added `POST :vocabularyId/bookmark` and `GET bookmarks` endpoints, enriched `search` and `findByLesson` responses with isBookmarked via OptionalJwtAuthGuard
- `backend/src/modules/vocabularies/vocabularies.module.ts` — Registered Bookmark entity in TypeOrmModule, added BookmarksService + BookmarksRepository providers, exported BookmarksService

### Files deleted

None

### Verification

- lint: 0 errors (warnings only, consistent with existing codebase)
- typecheck: pass
- test: 20/20 suites, 252/252 tests pass
