Status: ready-for-agent

# Mobile Mid mode: state machine + SSE decoder + Compose/Loading/Reading + Stop / Soạn tiếp / Reset

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

Light up the assistant: wire the bar from #03 to the streaming endpoint from #02 and ship the full Mid-mode UX described in the PRD. After this slice the learner can tap the bar, ask a question, see a granular per-tool spinner, watch the response stream in markdown, optionally stop mid-stream and see a "Đã dừng" partial, then Soạn tiếp for a follow-up or Reset to start a fresh Conversation with the now-current `screenContext`.

- **`AssistantStateMachine`** — pure-logic Riverpod notifier. States: `Collapsed`, `MidCompose`, `MidLoading`, `MidReading(streaming)`, `MidReading(done, interrupted?)`. (`Full` is a stub here, lit up in #08.) Triggers from PRD: bar tap → `Collapsed → MidCompose`; Send → `MidCompose → MidLoading`; first `text_chunk` → `MidLoading → MidReading(streaming)`; `done` → `MidReading(done)`; Stop → `MidReading(done, interrupted=true)` regardless of phase B/C; Soạn tiếp → `MidReading(done) → MidCompose`; Reset → `→ MidCompose` with a fresh Conversation; backdrop / "−" / drag-down → `→ Collapsed`. Invalid transitions throw.
- **`SseEventDecoder`** — parses byte streams from Dio `ResponseType.stream` into typed event objects. Tolerates network chunking (events split across reads), multi-line `data:` lines, and surfaces malformed events as decoder errors rather than silent drops. Custom — Dio doesn't ship an SSE parser.
- **`AiApi.chatStream({ String message, String? conversationId, ScreenContext? screenContext }) → Stream<AssistantEvent>`** — uses Dio with `ResponseType.stream` + `CancelToken`. Auth attaches via existing `AuthInterceptor`. Returns a typed stream of `ToolStart`, `ToolResult`, `TextChunk`, `Propose` (placeholder; actually used in #09), `ErrorEvent`, `Done`.
- **`AssistantChatNotifier`** (Riverpod) — owns the in-flight `Stream` subscription, drives `AssistantStateMachine`, accumulates partial `text` for display, persists `conversationId` from the first event the server emits.
- **`AssistantQuestionSheet`** — renders 3 phases:
  - **Compose**: textarea growing up to 5 lines + Send button.
  - **Loading**: spinner + dynamic status text — generic "Đang suy nghĩ..." until first `tool_start`, then per-tool `displayName` (`tool_start.displayName`) + Stop button.
  - **Reading**: `MarkdownBody` (`flutter_markdown`) auto-growing up to ~75% of screen height, Stop while streaming, "Soạn tiếp" when done. Show "Đã dừng" label below partial when `done.interrupted=true`.
- **Stop** — cancels the `CancelToken`. The interrupt is honored server-side by #02 (partial saved with `interrupted=true`). UI keeps partial text + "Đã dừng" label and shows "Soạn tiếp".
- **Soạn tiếp** — clears the on-screen AI message, returns to Compose. Server-side `conversationId` is preserved so the AI keeps context.
- **Reset** (button visible in Mid; will be visible in Full in #08) — drops local `conversationId`. Next Send creates a brand-new Conversation with the **now-current** `screenContext` from `currentScreenContextProvider`.
- **Rapid Send** — if a stream is already in-flight when Send is tapped again, cancel the prior `CancelToken` and start the new request immediately (race-safe).
- **Pre-token error** — if the stream errors before any `text_chunk` arrives, show an error message + "Thử lại" button that retries with the same input.

## Acceptance criteria

- [ ] `AssistantStateMachine` unit tests cover the trigger sequences from PRD (open → compose → send → loading → first chunk → done → soạn-tiếp → compose) and that invalid transitions throw
- [ ] `SseEventDecoder` unit tests cover (a) chunk-split events (one event delivered as two byte chunks), (b) multi-line `data:`, (c) malformed event surfacing as a decoder error
- [ ] `AiApi.chatStream` integration test against a fake HTTP server (e.g. `package:shelf` or a stub `Dio` adapter): emits a scripted SSE byte stream, asserts the decoded event stream + clean `CancelToken` abort
- [ ] Mid-mode UX works end-to-end against the real backend (#02): ask `get_user_summary`, see status text change to "Đang tóm tắt thông tin của bạn...", then see streaming markdown reply, tap Stop mid-stream → see "Đã dừng" with the partial text persisted in DB
- [ ] Tap "Soạn tiếp" → UI clears, follow-up message persists in same Conversation server-side (verify by hitting `GET /ai/conversations/:id`)
- [ ] Tap Reset on a different route → next Send creates a new Conversation with the now-current `screenContext` (verify 2 distinct conversation IDs in DB after navigating between routes)
- [ ] Rapid Send works without dangling streams (no leaked Dio requests in dev tools network panel)
- [ ] Pre-token error shows error + working "Thử lại" button
- [ ] `cd mobile && flutter analyze && flutter test` pass
- [ ] Per the PRD, `AssistantQuestionSheet` does not need widget tests; rely on the state-machine + decoder unit tests + manual smoke

## Blocked by

- [`02-streaming-tracer.md`](./02-streaming-tracer.md)
- [`03-mobile-shell.md`](./03-mobile-shell.md)
