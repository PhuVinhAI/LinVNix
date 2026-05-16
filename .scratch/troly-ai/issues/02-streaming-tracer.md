Status: ready-for-agent

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

- [ ] `AgentService.runTurnStream` exists and yields typed events; covered by `agent.service.spec.ts` with a mock `IAiProvider` driving scripted sequences (single tool call, multi-iteration tool loop, mid-stream unsubscribe → `interrupted=true` persisted)
- [ ] `SseEventEncoder` is unit-tested for each event type and for multi-line `data:` escaping
- [ ] `POST /api/v1/ai/chat/stream` covered by an `*.e2e-spec.ts` happy-path test against a mock provider (one tool call + one text response + `done`)
- [ ] `GET /api/v1/ai/chat/:id/stream` is deleted (404 for old paths); the 2-step branch on `POST /api/v1/ai/chat` is gone
- [ ] `POST /api/v1/ai/chat/simple` still works (`runTurn` non-streaming)
- [ ] `get_user_summary` returns the expected shape and is registered in `AgentModule.TOOLS`; co-located `get-user-summary.tool.spec.ts` mocks `UsersService`, `DailyGoalsService`, `DailyStreakService` and asserts `userId` flows from `ctx`, never from `params`
- [ ] `get_user_summary` does NOT call `DailyGoalProgressService.getTodayProgress` (regression-tested by spy)
- [ ] `GenaiService.mapResponseToAiChatResponse` propagates `functionCalls`; new spec test asserts; existing `runTurn` tool loop now actually fires tool calls
- [ ] `AI_CHAT_STREAM` is removed from enum, seed, and decorators; existing tests pass
- [ ] When a Conversation has non-empty `screenContext`, the system instruction is rendered from `assistant-tutor.yaml`; verified by inspecting the prompt sent to the mock provider in the e2e test
- [ ] curl smoke test: `POST /api/v1/ai/chat/stream` with `{ message: "How am I doing?", screenContext: { route: "/", displayName: "Trang chủ", barPlaceholder: "Hỏi gì đi nào?", data: {} } }` against real Gemini → observe `tool_start{name:get_user_summary}` + `tool_result` + `text_chunk` events + `done`
- [ ] `cd backend && bun run lint && bun run typecheck && bun run test && bun run test:e2e` all pass

## Blocked by

- [`01-foundation.md`](./01-foundation.md)
