Status: done

# Backend AI tools (catalog): search_vocabulary, search_grammar_rules, find_lessons, get_lesson_detail (with service extensions)

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

Four catalog read tools. Several require small extensions to underlying services because the existing API is too narrow: today `VocabulariesService.search` ignores dialect/lesson filters, there is no full-text search on grammar rules, there is no topic/level lesson search, and `getLessonDetail` doesn't load exercises.

After this slice the learner can ask "What's the Northern variant of xe đạp?", "Find me a grammar rule about classifiers", "What lessons do you have on family vocabulary?", and "Tell me about lesson X".

- **Service extensions** (each is small, additive, and preserves existing behavior):
  - `VocabulariesService.search` — change signature to `search({ query, lessonId?, dialect? })`. When `dialect` is supplied, filter results to vocabularies whose `dialectVariants` covers that dialect (or have a Chuẩn chung variant). Keep the existing 50-item cap. All current callers pass `query` only — adapt them with positional defaults so they keep working.
  - `GrammarRepository.search(query, opts?: { lessonId?, level? })` — new method. ILIKE on `title` + `explanation` (consider a normalized lower-case search index later). Surface via `CourseContentService.searchGrammar(query, opts)`.
  - `CourseContentService.findLessons({ topic?, level?, type?, limit? })` — new method. Joins `Lesson → Module → Course` and filters: `topic` is matched against `Module.title` ILIKE, `level` against `Course.level`, `type` against `Lesson.type`. Returns `{ id, title, level, type, courseTitle, moduleTitle }` summaries (NOT full content).
  - `LessonsRepository.findById` — extend the relations to include `exercises` and `exerciseSets`. Update `CourseContentService.getLessonDetail` to expose the richer shape.

- **Tools** (placed at `backend/src/modules/agent/tools/<name>.tool.ts`, registered in `AgentModule.TOOLS`):
  - `search_vocabulary` — exposes `{ query, lessonId?, dialect? }`. **When `dialect` is absent, defaults to `ctx.user.preferredDialect`**. `displayName: "Đang tra cứu từ vựng..."`.
  - `search_grammar_rules` — exposes `{ query, lessonId?, level? }`. `displayName: "Đang tra cứu ngữ pháp..."`.
  - `find_lessons` — exposes `{ topic?, level?, type?, limit? }`. `displayName: "Đang tìm bài học phù hợp..."`.
  - `get_lesson_detail` — exposes `{ lessonId }`. Returns full lesson incl. exercises. `displayName: "Đang đọc nội dung bài học..."`.

Each tool ships with a co-located `*.spec.ts` asserting input shape, `userId` (where applicable) flows from `ctx`, output shape matches schema, and errors are returned as `{ error }`. The `search_vocabulary` spec must explicitly assert that `ctx.user.preferredDialect` is consulted when `params.dialect` is absent.

Plus 1 integration test against real DB: `search_vocabulary` (canonical for catalog reads).

## Acceptance criteria

- [x] `VocabulariesService.search` accepts `{ query, lessonId?, dialect? }`; existing callers still work; dialect filter unit-tested
- [x] `GrammarRepository.search` exists; `search_grammar_rules` tool returns matching rules; spec test added
- [x] `CourseContentService.findLessons` exists; `find_lessons` tool returns filtered lesson summaries; spec test added
- [x] `getLessonDetail` returns lesson with `exercises` and `exerciseSets` populated; existing `course-content.service.spec.ts` updated
- [x] All 4 tools registered in `AgentModule.TOOLS`; all 4 have co-located `*.spec.ts`
- [x] `search_vocabulary` falls back to `ctx.user.preferredDialect` when `params.dialect` is absent (regression test)
- [x] One integration test for `search_vocabulary` against real DB passes
- [ ] Manual: from mobile (#04), set test user dialect to Miền Bắc, ask "Tell me about xe đạp" → AI calls `search_vocabulary` and the dialect propagates without the user mentioning it — deferred until mobile slice (#04) is integrated; backend regression test + integration test cover the propagation contract on the server side
- [x] `cd backend && bun run lint && bun run typecheck && bun run test` all pass

## Blocked by

- [`01-foundation.md`](./01-foundation.md)

## Implementation notes

### Approach

Six TDD vertical slices, each pairing a failing spec (RED) with the minimum code to turn it green (GREEN). Cross-block regression was caught by running the full unit + integration suites at the end of each block.

- **Block A — `VocabulariesService.search` signature.** Wrote a new `vocabularies.service.spec.ts` first (no spec existed before) to drive the `{ query, lessonId?, dialect? }` object signature. Updated `VocabulariesService.search`, `VocabulariesRepository.search`, and the only production caller `VocabulariesController.search('@Query("q")')` to use the new shape. Repository introduced a JSONB-aware dialect filter: a vocabulary passes when its `dialect_variants` is null (dialect-agnostic), explicitly covers the requested dialect via the PG `?` operator, or has a STANDARD fallback. Permissive on purpose — most vocab has no regional variation and the AI shouldn't get empty results for the common case.
- **Block B — grammar full-text search.** Added `searchGrammar` cases to `course-content.service.spec.ts`, plus a `search` field on the GrammarRepository mock. Implemented `GrammarRepository.search(query, opts)` with ILIKE on `title` + `explanation`, optional `lessonId` filter, and optional `level` filter via a `lesson → module → course` join. Surfaced the method through `CourseContentService.searchGrammar`, with the same "empty / whitespace short-circuit" guard as vocabulary search.
- **Block C — `findLessons` catalog search.** Added `findLessons` cases to `course-content.service.spec.ts` driving the summary shape `{ id, title, level, type, courseTitle, moduleTitle }`. Implemented `LessonsRepository.findByFilter({ topic, level, type, limit })` joining `Lesson → Module → Course` (topic ILIKEs against `Module.title` per the PRD, `level` exact-matches `Course.level`, `type` exact-matches `Lesson.lessonType`). 50-row hard cap matches the rest of the catalog. `CourseContentService.findLessons` composes the summary projection so the AI tool returns lightweight data and the LLM follows up with `get_lesson_detail` when it needs the full lesson body.
- **Block D — `getLessonDetail` richer relations.** Extended the existing `LessonsRepository.findById` relations array to load `exercises` and `exerciseSets` in addition to the previous four. `CourseContentService.getLessonDetail` keeps its overrides of `contents` + `grammarRules`; the new relations flow through unchanged because the service never reassigns them. Added an extra test case asserting the richer payload.
- **Block E — four tools + AgentModule registration.** Created one `*.tool.ts` + co-located `*.tool.spec.ts` per tool, following the patterns from `get-user-summary.tool` and `toggle-bookmark.tool` (Zod `.strip()` schemas, `ToolContext<User>`, `{ error }` shape on failure, Vietnamese `displayName`). The headline regression for `search_vocabulary` covers the `ctx.user.preferredDialect` fallback explicitly (dialect omitted → `NORTHERN` propagates; dialect present → params win; user has no dialect → no filter applied). Registered all four in `AgentModule.TOOLS` and imported `CoursesModule` so `CourseContentService` resolves into the agent context.
- **Block F — integration test against real DB.** Modeled on `bookmarks.test.ts`: bootstrap full `AppModule` (no HTTP), seed user + course + module + two lessons + five vocabularies covering each dialect-variant edge case (no variants, NORTHERN-only, SOUTHERN-only, STANDARD-only, dialect-agnostic in lesson B), exercise the tool via `ctx.app.get(SearchVocabularyTool).execute(...)`, assert exact id sets per dialect filter. Force-exits at the end (same Bull/Redis workaround as the bookmarks suite).

### Bug caught by the integration test

The first integration run failed because the SQL was applying the dialect filter only to the last clause of the ILIKE OR group — TypeORM's `.andWhere` concatenates verbatim and `AND` binds tighter than `OR`. The fix was to wrap the OR group in the original `.where(...)` call explicitly: `(word ILIKE :q OR translation ILIKE :q OR phonetic ILIKE :q)`. This would not have been caught by the unit test (which mocks the repository); the real-DB integration test was load-bearing.

### Verification

- `cd backend && bun run lint` → 0 errors, 1279 warnings (all consistent with project style; foundation slice baseline was 1103).
- `cd backend && bun run typecheck` → green.
- `cd backend && bun run test` → 570/570 green across 39 suites (was 555 across 38 before this slice; +15 new tests + 1 new suite for vocabularies service).
- `cd backend && bun run test:integration:search-vocabulary` → 4/4 green against the real Postgres stack with seeded data covering the dialect-permissive contract.

### Files created

- `backend/src/modules/agent/tools/search-vocabulary.tool.ts` — Read tool exposing `{ query, lessonId?, dialect? }`. Defaults `dialect` to `ctx.user.preferredDialect` when the LLM omits it; an explicit `dialect` param wins; if neither is present, the filter is skipped. Returns `{ vocabularies }` or `{ error }`.
- `backend/src/modules/agent/tools/search-vocabulary.tool.spec.ts` — 12 cases incl. the explicit `ctx.user.preferredDialect` fallback regression and the "params override ctx" precedence.
- `backend/src/modules/agent/tools/search-grammar-rules.tool.ts` — Read tool exposing `{ query, lessonId?, level? }`. `level` is intentionally NOT defaulted from `ctx.user.currentLevel` — learners may legitimately ask about advanced rules.
- `backend/src/modules/agent/tools/search-grammar-rules.tool.spec.ts` — 11 cases covering the params shape, filter propagation, and error surface.
- `backend/src/modules/agent/tools/find-lessons.tool.ts` — Read tool exposing `{ topic?, level?, type?, limit? }`. All filters optional; `limit` is hard-bounded to 1..50 at the schema level so the LLM can't bypass the catalog cap.
- `backend/src/modules/agent/tools/find-lessons.tool.spec.ts` — 11 cases incl. limit bounds and the lesson-summary projection.
- `backend/src/modules/agent/tools/get-lesson-detail.tool.ts` — Read tool exposing `{ lessonId }`. Returns the full `Lesson` entity (now with exercises + exercise sets thanks to Block D). NotFoundException from the service is converted to `{ error }` rather than re-thrown so the agent loop can keep streaming.
- `backend/src/modules/agent/tools/get-lesson-detail.tool.spec.ts` — 9 cases covering happy path, exercises/exerciseSets being surfaced, and NotFoundException → `{ error }` conversion.
- `backend/src/modules/vocabularies/application/vocabularies.service.spec.ts` — New file; 5 cases pinning down the new `search({ query, lessonId?, dialect? })` signature, including whitespace short-circuit and partial-filter propagation.
- `backend/scripts/test/suites/search-vocabulary.test.ts` — Integration suite against real Postgres. Seeds five vocabularies that exercise the four dialect-filter branches (NULL, has-dialect, STANDARD fallback, excluded) plus a separate lesson for the `lessonId` filter case. Modeled on `bookmarks.test.ts`.

### Files modified

- `backend/src/modules/vocabularies/application/vocabularies.service.ts` — `search(query: string)` → `search(options: VocabularySearchOptions)`. Whitespace short-circuit preserved; `lessonId` / `dialect` forwarded only when defined so the repository never sees `undefined` keys.
- `backend/src/modules/vocabularies/application/repositories/vocabularies.repository.ts` — `search` takes the same options object. New `VocabularySearchOptions` exported. JSONB-aware dialect filter using PG `?` operator with NULL + STANDARD permissive semantics. Outer parens around the ILIKE OR group are load-bearing per the bug fix described above.
- `backend/src/modules/vocabularies/presentation/vocabularies.controller.ts` — Adapted the only production caller of `vocabulariesService.search` to pass `{ query }`. No behavior change for `/vocabularies/search?q=` clients.
- `backend/src/modules/grammar/application/grammar.repository.ts` — Added `search(query, opts?: GrammarSearchOptions)` with ILIKE on `title` + `explanation`, optional `lessonId` and `level` filters (the latter via `lesson → module → course` join). Exported `GrammarSearchOptions`. 50-row hard cap consistent with the rest of the catalog.
- `backend/src/modules/courses/application/course-content.service.ts` — Added `searchGrammar(query, opts)` and `findLessons(opts)`. New `LessonSummary` exported. Imported `LessonFilterOptions` from `LessonsRepository`. `getLessonDetail` unchanged; its richer payload is purely from the relations extension in Block D.
- `backend/src/modules/courses/application/course-content.service.spec.ts` — Added `searchGrammar` (3 cases), `findLessons` (4 cases), and an extra `getLessonDetail` case asserting `exercises` + `exerciseSets`. Added `search` and `findByFilter` to the grammar / lessons repository mocks.
- `backend/src/modules/courses/application/repositories/lessons.repository.ts` — Extended `findById` relations to include `exercises` and `exerciseSets`. Added `findByFilter(opts: LessonFilterOptions)` with the join + filters described above and an order key `course.order_index → module.order_index → lesson.order_index` so the LLM gets predictably ordered results.
- `backend/src/modules/agent/agent.module.ts` — Imported `CoursesModule`. Registered the four new tool classes as providers and added them to the `'TOOLS'` factory + inject array. The agent loop now sees ten tools (six existing + four new).
- `backend/package.json` — Added `test:integration:search-vocabulary` script entry.

### Files deleted

- None.
