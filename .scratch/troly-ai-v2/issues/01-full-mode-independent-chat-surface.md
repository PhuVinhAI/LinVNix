Status: ready-for-agent

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Replace `AssistantFull(priorState)` with four dedicated Full states (FullCompose, FullLoading, FullReading, FullError) so Full mode operates as an independent chat surface. The state machine grows from 6 to 9 states. `priorState` is removed — closing Full always goes to Collapsed. `enterFull()` now maps each Mid state to its Full equivalent (mirror). Reset in Full stays in Full (FullCompose, not MidCompose).

The chat notifier (`AssistantChatNotifier._handleEvent`) must dispatch SSE events for Full states (FullLoading, FullReading) the same way it does for Mid states. `sendMessage` must handle Full source states (FullCompose, FullError, FullReading(done) with rapid-send, FullLoading/FullReading(streaming) with implicit stop+composeAgain).

The AssistantBar adds `onLongPress` — long-press transitions Collapsed→FullCompose and navigates to `AssistantFullScreen` directly, skipping the bottom sheet.

`AssistantFullScreen` is rewritten for stream inline rendering: persisted history messages from server + live streaming AI bubble from `FullReading.partial`. When `FullLoading`, show typing indicator (AI avatar + statusText + animated dots). When `FullError`, show error bubble inline with "Thử lại" button. Compose bar always ready after AI finishes — no "Soạn tiếp" button. Send icon becomes Stop icon during FullLoading/FullReading(streaming). Partial responses get "Đã dừng" indicator when stopped.

Mid→Full mirror transition preserves conversation and continues streaming without interruption. History loads from server while streaming response renders from state.

Closing Full (back/close) → Collapsed, drops conversationId. No return to Mid.

State machine for reference:

```
States:
  AssistantCollapsed
  AssistantMidCompose
  AssistantMidLoading(lastInput, statusText)
  AssistantMidReading(partial, streaming, interrupted, messageId, proposals)
  AssistantMidError(message, lastInput)
  AssistantFullCompose
  AssistantFullLoading(lastInput, statusText)
  AssistantFullReading(partial, streaming, interrupted, messageId, proposals)
  AssistantFullError(message, lastInput)

Transitions:
  tap bar                          → Collapsed → MidCompose
  long-press bar                   → Collapsed → FullCompose
  send (Mid)                       → MidCompose/MidError → MidLoading
  send (Full)                      → FullCompose/FullError → FullLoading
  text_chunk (Mid)                 → MidLoading → MidReading(streaming)
  text_chunk (Full)                → FullLoading → FullReading(streaming)
  done (Mid)                       → MidReading(streaming) → MidReading(done)
  done (Full)                      → FullReading(streaming) → FullReading(done)
  error pre-token (Mid)            → MidLoading → MidError
  error pre-token (Full)           → FullLoading → FullError
  error mid-stream                 → *Reading(streaming) → *Reading(interrupted)
  stop                             → *Loading → *Reading(interrupted); *Reading(streaming) → *Reading(interrupted)
  composeAgain                     → MidReading(done) → MidCompose
  reset (Mid)                      → any Mid → MidCompose
  reset (Full)                     → any Full → FullCompose
  collapse (Mid)                   → any Mid → Collapsed
  close Full                       → any Full → Collapsed
  enterFull (mirror)               → MidCompose→FullCompose, MidLoading→FullLoading, MidReading→FullReading, MidError→FullError
  proposal confirm/decline         → mutate proposals list within *Reading
```

## Acceptance criteria

- [ ] `AssistantState` sealed class has 9 states (4 Full replacing single `AssistantFull`), no `priorState` field
- [ ] State machine: all transitions from the table above work; invalid transitions throw `StateError`
- [ ] `enterFull()` mirrors Mid→Full state mapping (MidCompose→FullCompose, MidLoading→FullLoading, MidReading→FullReading, MidError→FullError)
- [ ] Closing Full → Collapsed (not Mid); `exitFull()` and `priorState` removed
- [ ] Reset in Full → FullCompose (stays in Full)
- [ ] Chat notifier `_handleEvent` dispatches ToolStartEvent/TextChunkEvent/ProposeEvent/AssistantErrorEvent/DoneEvent for FullLoading and FullReading states
- [ ] Chat notifier `sendMessage` handles Full source states: FullCompose/FullError (send), FullReading(done) (rapid-send), FullLoading/FullReading(streaming) (stop+composeAgain+send)
- [ ] Long-press on AssistantBar → FullCompose + navigate to AssistantFullScreen (skip bottom sheet)
- [ ] Full screen renders streaming AI bubble inline from `FullReading.partial`, persisted messages from server
- [ ] FullLoading shows typing indicator (AI avatar + statusText + animated dots)
- [ ] FullError shows error bubble inline with "Thử lại" button, compose bar remains visible
- [ ] Stop icon replaces Send icon during FullLoading/FullReading(streaming)
- [ ] Partial responses show "Đã dừng" indicator when stopped
- [ ] Compose bar always ready after FullReading(done) — no "Soạn tiếp" button
- [ ] Mid→Full mirror: conversation continues, stream renders seamlessly, history loads while streaming
- [ ] Closing Full → Collapsed, drops conversationId
- [ ] Unit tests: state machine (9 states, all transitions, invalid transitions, mirror), chat notifier (Full state event dispatch)

## Blocked by

None - can start immediately
