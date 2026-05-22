Status: done

## Parent

.scratch/image-discovery/PRD.md

## What to build

Từ vựng cá nhân — a new entity owned directly by Học viên (not Bài học), plus Yêu sách integration so they appear in the existing bookmarks UI with a distinct icon.

**Backend**: New `personal-vocabularies` module with CRUD endpoints (`POST`, `GET` list, `GET :id`, `DELETE`). Entity mirrors Vocabulary minus `lessonId`/`orderIndex`, adds `source` enum (`IMAGE_DISCOVERY` | `MANUAL`) and `userId` FK. All endpoints use `@CurrentUser()` to scope to authenticated Học viên. No PUT/PATCH in V1 (AI-generated content is immutable).

Extend Bookmark entity: add nullable `personalVocabularyId` FK. Constraint: exactly one of `vocabularyId` or `personalVocabularyId` must be non-null. Replace `@Unique(['userId', 'vocabularyId'])` with partial unique indexes. `toggleBookmark` accepts optional `personalVocabularyId`. Bookmark list response includes `type` field (`system` | `personal`).

**Mobile**: API client for personal-vocabularies CRUD. Extend `BookmarkWithVocabulary` model with `type` and `personalVocabularyId`. Yêu sách screen shows distinct icon (e.g. `Icons.auto_awesome`) for personal bookmarks. Tapping personal bookmark shows same detail sheet. Delete un-bookmarks and soft-deletes the personal vocabulary.

## Acceptance criteria

- [x] `POST /api/v1/personal-vocabularies` creates a PersonalVocabulary scoped to the authenticated user
- [x] `GET /api/v1/personal-vocabularies` returns paginated list with search, scoped to authenticated user
- [x] `GET /api/v1/personal-vocabularies/:id` returns detail, 404 if not found or not owned
- [x] `DELETE /api/v1/personal-vocabularies/:id` soft-deletes, 403 if not owned
- [x] Bookmark entity has nullable `personalVocabularyId`, partial unique indexes, XOR constraint enforced
- [x] `toggleBookmark` works with `personalVocabularyId`, returns `type` field in list responses
- [ ] Yêu sách screen renders personal bookmarks with distinct icon
- [x] Deleting a personal bookmark also soft-deletes the PersonalVocabulary
- [x] Unit tests for PersonalVocabulary service + controller, Bookmark service modification
- [x] Integration test for PersonalVocabulary CRUD against real DB

## Blocked by

None — can start immediately

## Implementation notes

Backend implementation complete. Mobile (Yêu sách screen distinct icon) is deferred to a separate issue.

### Files created

- `backend/src/common/enums/personal-vocabulary-source.enum.ts` — `PersonalVocabularySource` enum (`IMAGE_DISCOVERY` | `MANUAL`)
- `backend/src/modules/personal-vocabularies/domain/personal-vocabulary.entity.ts` — PersonalVocabulary entity extending BaseEntity
- `backend/src/modules/personal-vocabularies/dto/create-personal-vocabulary.dto.ts` — Create DTO with class-validator + Swagger
- `backend/src/modules/personal-vocabularies/dto/personal-vocabulary-query.dto.ts` — Query DTO with pagination, search, sort enum
- `backend/src/modules/personal-vocabularies/application/repositories/personal-vocabularies.repository.ts` — Repository with create, findById, findByIdAndUserId, softDelete, findPaginated
- `backend/src/modules/personal-vocabularies/application/personal-vocabularies.service.ts` — Service with CRUD, ownership checks (NotFoundException, ForbiddenException)
- `backend/src/modules/personal-vocabularies/application/personal-vocabularies.service.spec.ts` — Unit tests for service (create, findById, list, delete)
- `backend/src/modules/personal-vocabularies/presentation/personal-vocabularies.controller.ts` — Controller with POST, GET list, GET :id, DELETE :id
- `backend/src/modules/personal-vocabularies/presentation/personal-vocabularies.controller.spec.ts` — Unit tests for controller
- `backend/src/modules/personal-vocabularies/personal-vocabularies.module.ts` — NestJS module registration
- `backend/scripts/test/suites/personal-vocabularies.test.ts` — Integration test for CRUD against real DB

### Files modified

- `backend/src/common/enums/index.ts` — Added `personal-vocabulary-source.enum` export
- `backend/src/modules/users/domain/user.entity.ts` — Added `@OneToMany('PersonalVocabulary', 'user') personalVocabularies` relation
- `backend/src/modules/vocabularies/domain/bookmark.entity.ts` — Replaced `@Unique` with partial unique indexes, added nullable `personalVocabularyId` column + `@ManyToOne` relation to PersonalVocabulary
- `backend/src/modules/vocabularies/application/repositories/bookmarks.repository.ts` — Added `findByUserAndPersonalVocabulary`, updated `findPaginated` to join personalVocabulary and search across both, updated `getStats` to filter by `vocabularyId IS NOT NULL`
- `backend/src/modules/vocabularies/application/repositories/bookmarks.repository.spec.ts` — Updated tests for new repository methods and changed query builder behavior
- `backend/src/modules/vocabularies/application/bookmarks.service.ts` — Added `PersonalVocabulariesService` dependency, updated `toggle` to accept `personalVocabularyId` with XOR validation, updated `list` to return `type` field, un-bookmarking personal vocabulary also soft-deletes it
- `backend/src/modules/vocabularies/application/bookmarks.service.spec.ts` — Added tests for personalVocabularyId toggle, XOR constraint, cascade delete, type field in list
- `backend/src/modules/vocabularies/vocabularies.module.ts` — Added PersonalVocabulary entity to TypeOrmModule.forFeature, imported PersonalVocabulariesModule via forwardRef
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.ts` — Updated `toggleBookmark` to accept optional `body.personalVocabularyId`
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.spec.ts` — Updated toggle test to pass body param
- `backend/src/modules/agent/tools/list-bookmarks.tool.spec.ts` — Added `type: 'system'` to mock BookmarkListItem
- `backend/src/app.module.ts` — Added PersonalVocabulariesModule import
- `backend/package.json` — Added `test:integration:personal-vocabularies` script

### Files deleted

None
