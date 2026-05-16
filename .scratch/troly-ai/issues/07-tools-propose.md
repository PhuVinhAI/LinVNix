Status: ready-for-agent

# Backend AI tools (propose): propose_create_daily_goal, propose_update_daily_goal, propose_generate_custom_exercise_set + propose SSE event

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

The propose tool category and the matching SSE event. Propose tools NEVER mutate state — they return a structured `ProposalPayload` that `runTurnStream` translates into a `propose` SSE event. The mobile client (#09) renders an inline confirm card; on the user's "Có" tap, the mobile client calls the actual REST endpoint with its normal auth, so all standard backend permission/validation logic still runs.

Demoable via curl after this slice: `POST /api/v1/ai/chat/stream` for a prompt like "Set me a 30-minute study goal" → observe a `propose` event with `kind=create_daily_goal`, `endpoint=POST /api/v1/daily-goals`, and a valid body payload.

- **`ProposeTool` base class** in shared package extending `BaseTool`. Its `execute(params, ctx)` returns a `ProposalPayload { kind: string, title: string, description: string, endpoint: string, payload: object, labels?: { confirm: string, decline: string } }` instead of action data. Default labels: `{ confirm: "Có", decline: "Không" }`.
- **`runTurnStream` propose handling** — when a tool result is a `ProposalPayload`, in addition to the regular `tool_result` SSE event emit a typed `propose` SSE event carrying the full payload. The proposal is also stored in `ConversationMessage.toolResults[]` for audit (today's `toolResults` JSONB column on `ConversationMessage` already supports this — no schema change needed).
- **`propose_create_daily_goal`** — given LLM `params: { type: 'EXERCISES_DONE'|'STUDY_MINUTES'|'LESSONS_DONE', target: number }`, returns a `ProposalPayload` with `endpoint: 'POST /api/v1/daily-goals'`, `payload` matching `CreateDailyGoalDto`, `title`/`description` localized to `ctx.user.nativeLanguage` (template via `assistant-tutor.yaml` is fine, but propose strings come from the tool itself in V1 — keep simple). `displayName: "Đang chuẩn bị mục tiêu mới..."`.
- **`propose_update_daily_goal`** — given `params: { id, type?, target? }`, returns proposal with `endpoint: 'PATCH /api/v1/daily-goals/:id'` (path param substituted), payload matching `UpdateDailyGoalDto`. The user owns the goal — backend `PATCH` already enforces ownership when the mobile client makes the real call. `displayName: "Đang chuẩn bị cập nhật mục tiêu..."`.
- **`propose_generate_custom_exercise_set`** — given `params: { topic, level, count, lessonId? }`, returns proposal with `endpoint: 'POST /api/v1/exercise-sets/custom'`, payload matching the existing `CreateCustomExerciseSetDto`. The endpoint already has `AI_GENERATE_EXERCISE` permission guard (verified during PRD reality-check; no missing-guard fix needed). `displayName: "Đang chuẩn bị bộ bài tập..."`.

Each tool ships with a co-located `*.spec.ts` that:

- Mocks the underlying repository / service.
- Asserts NO database writes happen during `execute` — use `expect(repository.save).not.toHaveBeenCalled()` (regression test against accidentally turning a propose into a write).
- Asserts the returned `ProposalPayload` shape matches the spec, and the `endpoint` strings are exact (verified against the real controller paths).

Plus an e2e test for the streaming path:

- `runTurnStream` end-to-end with a mock provider scripting a `propose_create_daily_goal` invocation. Assert the SSE byte stream contains a `propose` event with the right `kind`/`endpoint`/`payload` AND a regular `tool_result` event for the same tool. Assert `ConversationMessage.toolResults[]` in DB contains the proposal payload after the stream closes.

## Acceptance criteria

- [ ] `ProposeTool` base class + `ProposalPayload` type exported from shared package
- [ ] All 3 propose tools registered in `AgentModule.TOOLS`; co-located `*.spec.ts` for each
- [ ] Spec tests assert NO DB writes happen during `execute` (explicit `not.toHaveBeenCalled` on repository spies)
- [ ] `runTurnStream` emits a `propose` SSE event when a propose tool runs (covered by `*.e2e-spec.ts` against a mock provider)
- [ ] `ConversationMessage.toolResults[]` contains the proposal payload after the stream closes (asserted in same e2e test)
- [ ] `displayName`s match the strings in the description above
- [ ] `propose_generate_custom_exercise_set` payload validates against the real `CreateCustomExerciseSetDto` (regression-tested by feeding the payload into the DTO validator)
- [ ] curl smoke test: `POST /api/v1/ai/chat/stream` with `{ message: "Set me a 30-minute study goal" }` → see a `propose` SSE event with `kind=create_daily_goal`, valid `endpoint` and `payload`
- [ ] `cd backend && bun run lint && bun run typecheck && bun run test && bun run test:e2e` all pass

## Blocked by

- [`02-streaming-tracer.md`](./02-streaming-tracer.md)
