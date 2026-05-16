Status: ready-for-agent

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

- [ ] `VocabulariesService.search` accepts `{ query, lessonId?, dialect? }`; existing callers still work; dialect filter unit-tested
- [ ] `GrammarRepository.search` exists; `search_grammar_rules` tool returns matching rules; spec test added
- [ ] `CourseContentService.findLessons` exists; `find_lessons` tool returns filtered lesson summaries; spec test added
- [ ] `getLessonDetail` returns lesson with `exercises` and `exerciseSets` populated; existing `course-content.service.spec.ts` updated
- [ ] All 4 tools registered in `AgentModule.TOOLS`; all 4 have co-located `*.spec.ts`
- [ ] `search_vocabulary` falls back to `ctx.user.preferredDialect` when `params.dialect` is absent (regression test)
- [ ] One integration test for `search_vocabulary` against real DB passes
- [ ] Manual: from mobile (#04), set test user dialect to Miền Bắc, ask "Tell me about xe đạp" → AI calls `search_vocabulary` and the dialect propagates without the user mentioning it
- [ ] `cd backend && bun run lint && bun run typecheck && bun run test` all pass

## Blocked by

- [`01-foundation.md`](./01-foundation.md)
