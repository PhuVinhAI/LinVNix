Status: ready-for-agent

# Backend AI tools (user data): get_progress_overview, list_recent_exercise_results, list_bookmarks, toggle_bookmark

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

Three user-scoped read tools plus the one direct-write tool from V1 (`toggle_bookmark`). Each tool reads `userId` from `ctx`, NEVER from LLM-controlled `params`. Each declares a Vietnamese `displayName` so the mobile Phase B status text is granular ("Đang xem tiến trình của bạn...", etc).

After this slice the learner can ask "How am I doing on my courses?", "What did I get wrong last time?", "What words did I bookmark?", and "Bookmark this word for me" against any of the screens.

- **`get_progress_overview`** — composes existing `ProgressService.getUserProgress(userId)` and `getCourseProgress(userId, courseId)` per active course. Returns a CEFR-aware summary: `{ currentLevel, activeCourses: [{ id, title, percent }], modulesInProgress: [{ id, title, percent, courseTitle }], weakAreas: [...] }`. No new service methods needed; the tool layer just orchestrates. `displayName: "Đang xem tiến trình của bạn..."`.
- **`list_recent_exercise_results`** — calls `ExercisesService.getUserResults(userId)`. Extend `UserExerciseResultsRepository.findByUserId` to accept `{ limit?: number }` (default 10, max 50, sort already `attemptedAt: 'DESC'`). Tool exposes `limit` via Zod schema. `displayName: "Đang xem kết quả bài tập gần đây..."`.
- **`list_bookmarks`** — calls existing `BookmarksService.list(userId, { page, limit, search?, sort })`. Tool exposes `search`, `limit` params; defaults to `limit=20`, `sort='createdAt:DESC'`. `displayName: "Đang xem từ bạn đã yêu sách..."`.
- **`toggle_bookmark`** (direct write) — calls existing `BookmarksService.toggle(userId, vocabularyId)`. Returns `{ bookmarked: boolean, vocabularyId }`. `displayName: "Đang đánh dấu yêu sách..."`.

Place each tool at `backend/src/modules/agent/tools/<name>.tool.ts`. Register all 4 in `AgentModule`'s `TOOLS` factory.

Each tool ships with a co-located `<name>.tool.spec.ts` that:

- Mocks the underlying service.
- Asserts the correct service method is called with `userId` from `ctx` (never from `params`) — this is a **security regression test** and must explicitly drive a malicious `params` shape that includes a fake `userId` to confirm the tool ignores it.
- Asserts the output shape matches the declared Zod schema.
- Asserts errors are returned as `{ error: string }` from `execute`, not thrown.

Plus 2 integration tests under `backend/scripts/test/suites/`:

- One canonical read against real DB: `list_bookmarks`.
- One canonical direct-write against real DB: `toggle_bookmark` (toggle twice, assert reversibility).

## Acceptance criteria

- [ ] All 4 tools are registered in `AgentModule.TOOLS` and callable via `runTurnStream`
- [ ] Each tool has a co-located `*.spec.ts` asserting `userId` comes from `ctx`, NOT from `params`, including a malicious-input regression case
- [ ] Each tool has a `displayName` matching the strings in the description above
- [ ] `UserExerciseResultsRepository.findByUserId` supports `limit` (default 10, max 50); existing tests still pass; new test for limit added
- [ ] `list_bookmarks` integration test passes against real DB
- [ ] `toggle_bookmark` integration test passes against real DB and is reversible
- [ ] Manual: from mobile (#04), ask "How am I doing?" → AI calls `get_user_summary` (from #02) + `get_progress_overview` and replies in `user.nativeLanguage`
- [ ] `cd backend && bun run lint && bun run typecheck && bun run test && bun run test:integration:bookmarks` all pass

## Blocked by

- [`01-foundation.md`](./01-foundation.md)
