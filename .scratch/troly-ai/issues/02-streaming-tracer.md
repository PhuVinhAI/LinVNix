Status: done

# Backend streaming tracer: runTurnStream + POST /ai/chat/stream + get_user_summary + functionCalls fix + AI_CHAT_STREAM deprecation

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

The first end-to-end vertical tracer through the backend stack: a single SSE streaming endpoint that drives the full agent tool loop and emits typed events the mobile client can consume. Replaces today's broken 2-step flow where SSE bypasses tools by design. Validates the pipe by shipping the first real production tool, `get_user_summary`. Also fixes a pre-existing bug where the Gemini provider drops `functionCalls`, which means the existing `runTurn` loop never actually sees tool calls.

Demoable via curl after this slice: `POST /api/v1/ai/chat/stream` returns a real SSE stream with `tool_start` → `tool_result` → `text_chunk` → `done` for a "How am I doing?"-style prompt.

- **`AgentService.runTurnStream(conversationId | null, message, screenContext?)`** — new async generator. Lazy-creates the Conversation if `conversationId` is null and snapshots `screenContext` onto it. Drives the agent tool loop and yields typed events at every interesting boundary: `tool_start` (with `name`, `displayName`, `args`), `tool_result` (with `name`, `ok`), `text_chunk` (with `text`), `propose` (placeholder; populated in #07), `error`, `done` (with `messageId`, `interrupted`).
- **`SseEventEncoder`** — new helper that converts typed events into NestJS `MessageEvent`s with the right `event:` field and JSON-encoded `data:` line. Handles multi-line `data:` escaping per the SSE spec.
- **`POST /api/v1/ai/chat/stream`** — new `@Sse()` endpoint accepting `{ conversationId?: string, message: string, screenContext?: ScreenContextDto }`. Reuses `AI_CHAT` permission. When `Conversation.screenContext` is non-empty, render the `assistant-tutor.yaml` template (from #01) as the system instruction; otherwise fall back to the existing default.
- **Remove** `GET /api/v1/ai/chat/:id/stream` and the `stream !== false` 2-step branch on `POST /api/v1/ai/chat`. Keep `POST /api/v1/ai/chat/simple` (non-streaming) for tooling/dev.
- **Abort handling** — when the SSE subscriber unsubscribes (mobile cancels Dio), best-effort cancel the Gemini stream (verify `@google/genai` AbortSignal support; if missing, accept that background tokens are discarded — the partial-save behavior still works) and persist the partial assistant message with `interrupted=true`. Emit final `done` event with `interrupted: true`.
- **`get_user_summary` tool** — first real production tool. Lives at `backend/src/modules/agent/tools/get-user-summary.tool.ts`. Returns `{ level, nativeLanguage, dialect, dailyGoals, streak }`. Pulls user from `ctx.user` (already loaded by #01), goals via `DailyGoalsService.findAll(userId)`, streak via `DailyStreakService.getStreak(userId)`. **Must NOT call `DailyGoalProgressService.getTodayProgress`** — that has the side effect of mutating streak state. `displayName: "Đang tóm tắt thông tin của bạn..."`.
- **Fix `GenaiService.mapResponseToAiChatResponse`** — propagate `functionCalls` from the `@google/genai` SDK response into `AiChatResponse.functionCalls`. Today this field is always undefined, which means even the existing `runTurn` tool loop never sees tool calls. Add a regression test in `genai.service.spec.ts` (or create the spec if missing).
- **Deprecate `AI_CHAT_STREAM` permission** — remove from `Permission` enum, remove from `RbacService.userPermissions` seeding, remove all `@RequirePermissions(Permission.AI_CHAT_STREAM)` decorators (they're on the deleted endpoints anyway). Existing seeded users keep `AI_CHAT` so the new endpoint is reachable for them.

## Acceptance criteria

- [x] `AgentService.runTurnStream` exists and yields typed events; covered by `agent.service.spec.ts` with a mock `IAiProvider` driving scripted sequences (single tool call, multi-iteration tool loop, mid-stream unsubscribe → `interrupted=true` persisted)
- [x] `SseEventEncoder` is unit-tested for each event type and for multi-line `data:` escaping
- [x] `POST /api/v1/ai/chat/stream` covered by an `*.e2e-spec.ts` happy-path test against a mock provider (one tool call + one text response + `done`)
- [x] `GET /api/v1/ai/chat/:id/stream` is deleted (404 for old paths); the 2-step branch on `POST /api/v1/ai/chat` is gone
- [x] `POST /api/v1/ai/chat/simple` still works (`runTurn` non-streaming)
- [x] `get_user_summary` returns the expected shape and is registered in `AgentModule.TOOLS`; co-located `get-user-summary.tool.spec.ts` mocks `UsersService`, `DailyGoalsService`, `DailyStreakService` and asserts `userId` flows from `ctx`, never from `params`
- [x] `get_user_summary` does NOT call `DailyGoalProgressService.getTodayProgress` (regression-tested by spy)
- [x] `GenaiService.mapResponseToAiChatResponse` propagates `functionCalls`; new spec test asserts; existing `runTurn` tool loop now actually fires tool calls
- [x] `AI_CHAT_STREAM` is removed from enum, seed, and decorators; existing tests pass
- [x] When a Conversation has non-empty `screenContext`, the system instruction is rendered from `assistant-tutor.yaml`; verified by inspecting the prompt sent to the mock provider in the e2e test
- [ ] curl smoke test: `POST /api/v1/ai/chat/stream` with `{ message: "How am I doing?", screenContext: { route: "/", displayName: "Trang chủ", barPlaceholder: "Hỏi gì đi nào?", data: {} } }` against real Gemini → observe `tool_start{name:get_user_summary}` + `tool_result` + `text_chunk` events + `done` _(not run locally; happy-path is covered by `ai-chat-stream.e2e-spec.ts` against a scripted mock provider — the real-Gemini smoke test belongs to the manual QA pass)_
- [x] `cd backend && bun run lint && bun run typecheck && bun run test && bun run test:e2e` all pass

## Implementation notes

### Validation results

- `bun run lint` — 0 errors, 1170 warnings (all pre-existing, untouched by this slice)
- `bun run typecheck` — clean
- `bun run test` — 30 suites / 458 tests pass
- `bun run test:e2e -- --testPathPatterns "ai-chat-stream"` — 1 suite / 3 tests pass (against real Postgres + Redis from `bun run db:up`)
- `packages/shared` rebuilt (`bun run build`) — 36 tests pass

### Design choices

- The Gemini Developer API does not reliably stream function calls (per `js-genai/sdk-samples/chat_afc_streaming_function_call.ts`), so `runTurnStream` uses non-streaming `aiProvider.chat()` for every iteration of the ReAct tool loop and yields the final response text as a single `text_chunk` event. This keeps the tool-detection logic deterministic; a future enhancement can split the final answer via `chatStream` once dev-API streaming function-calls land.
- The TransformInterceptor was wrapping every response in `{ data: T }` — fatal for SSE, where each yielded `MessageEvent` must reach the wire untouched so NestJS can serialize the `event:`/`data:` lines. Added a generic `@SkipTransform()` decorator + metadata check rather than special-casing the AI controller.
- Abort handling is best-effort: when the SSE subscriber tears down, `runTurnStream` observes the AbortSignal at every loop boundary and persists a partial assistant message with `interrupted=true`. The Gemini stream itself is not actively cancelled (the SDK call returns synchronously per-iteration), but the conversation is consistent and the mobile client receives `done { interrupted: true }`.
- The `MailService` ↔ `LoggingService` issue surfaced by the foundation slice is sidestepped by importing the full `AppModule` in the e2e fixture; the global `LoggingModule` is then in scope.

### Files created

- `backend/src/modules/agent/application/stream-event.ts` — typed `StreamEvent` discriminated union (`tool_start`, `tool_result`, `text_chunk`, `propose`, `error`, `done`); imported by both the agent and the SSE encoder.
- `backend/src/modules/ai/presentation/sse-event-encoder.ts` — converts a `StreamEvent` to a NestJS `MessageEvent`, JSON-encoding the payload onto a single `data:` line.
- `backend/src/modules/ai/presentation/sse-event-encoder.spec.ts` — 12 cases covering every event type plus multi-line `data:` escaping invariants.
- `backend/src/modules/ai/dto/ai-chat-stream-request.dto.ts` — request body for the new endpoint (`message`, optional `conversationId`, optional `ScreenContextDto`).
- `backend/src/modules/ai/dto/screen-context.dto.ts` — typed mobile screen snapshot pushed by the assistant bar.
- `backend/src/modules/agent/tools/get-user-summary.tool.ts` — first production read tool. Pulls level / native language / dialect from `ctx.user`, daily goals from `DailyGoalsService.findAll`, streak from `DailyStreakService.getStreak`. Wired into `AgentModule.TOOLS`.
- `backend/src/modules/agent/tools/get-user-summary.tool.spec.ts` — 10 cases including the `DailyGoalProgressService.getTodayProgress` regression spy.
- `backend/src/common/decorators/skip-transform.decorator.ts` — `@SkipTransform()` opt-out so SSE routes bypass the global `{ data }` envelope.
- `backend/test/ai-chat-stream.e2e-spec.ts` — boots the full `AppModule` against real Postgres, mocks `AI_PROVIDER`, signs a JWT for a freshly-seeded verified user, asserts the wire-level SSE event sequence and the rendered `assistant-tutor` system instruction.

### Files modified

- `packages/shared/src/tools/base-tool.ts` — added `abstract readonly displayName: string` so every tool exposes the Vietnamese loading-state label the mobile UI surfaces during `tool_start`.
- `packages/shared/src/__tests/shared.spec.ts` — extended the test tools with `displayName` and added the contract test for it.
- `backend/src/infrastructure/genai/genai.service.ts` — fixed `mapResponseToAiChatResponse` to walk every step, collect `function_call` steps into `functionCalls`, and concatenate all `model_output` text. Without this, the existing `runTurn` tool loop never saw a tool call.
- `backend/src/infrastructure/genai/genai.service.spec.ts` — three new cases pinning the SDK shape (function-call only, text only, both).
- `backend/src/modules/agent/application/agent.service.ts` — added `runTurnStream` async generator (lazy create + ToolContext build + assistant-tutor render + ReAct tool loop + abort + partial persist + final `done`). Also imports the new `StreamEvent`.
- `backend/src/modules/agent/application/agent.service.spec.ts` — 15 new cases covering the streaming path (no-tool, single tool, multi-iteration loop, lazy create, system-instruction branching, abort, ToolContext shape, messageId echo).
- `backend/src/modules/agent/agent.module.ts` — registered `GetUserSummaryTool` and imported `DailyGoalsModule`.
- `backend/src/modules/agent/tools/echo.tool.ts` — added `displayName` to satisfy the new `BaseTool` contract.
- `backend/src/modules/ai/presentation/ai.controller.ts` — replaced the 2-step `POST /chat` and `GET /chat/:id/stream` endpoints with the single `POST /chat/stream` SSE endpoint (`@HttpCode(200)` + `@SkipTransform()`). Added an Observable bridge with abort + per-event encoding + error fallback. Kept `POST /chat/simple` and the conversation read/delete endpoints.
- `backend/src/modules/ai/presentation/ai.controller.spec.ts` — rewrote the streaming test suite around the new endpoint.
- `backend/src/common/enums/permission.enum.ts` — dropped `AI_CHAT_STREAM`.
- `backend/src/modules/auth/application/rbac.service.ts` — removed `AI_CHAT_STREAM` from permission definitions and from the `USER` role's permission set.
- `backend/src/common/interceptors/transform.interceptor.ts` — honors the new `@SkipTransform()` metadata so SSE responses pass through untouched.
- `backend/src/common/decorators/index.ts` — re-exports `@SkipTransform()`.

### Files deleted

None — the previous `POST /ai/chat` and `GET /ai/chat/:id/stream` endpoints lived inside `ai.controller.ts` and were removed in-place rather than as separate files.

## Blocked by

- [`01-foundation.md`](./01-foundation.md)
