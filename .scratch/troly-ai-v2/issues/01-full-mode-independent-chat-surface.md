Status: done

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

- [x] `AssistantState` sealed class has 9 states (4 Full replacing single `AssistantFull`), no `priorState` field
- [x] State machine: all transitions from the table above work; invalid transitions throw `StateError`
- [x] `enterFull()` mirrors Mid→Full state mapping (MidCompose→FullCompose, MidLoading→FullLoading, MidReading→FullReading, MidError→FullError)
- [x] Closing Full → Collapsed (not Mid); `exitFull()` and `priorState` removed
- [x] Reset in Full → FullCompose (stays in Full)
- [x] Chat notifier `_handleEvent` dispatches ToolStartEvent/TextChunkEvent/ProposeEvent/AssistantErrorEvent/DoneEvent for FullLoading and FullReading states
- [x] Chat notifier `sendMessage` handles Full source states: FullCompose/FullError (send), FullReading(done) (rapid-send), FullLoading/FullReading(streaming) (stop+composeAgain+send)
- [x] Long-press on AssistantBar → FullCompose + navigate to AssistantFullScreen (skip bottom sheet)
- [x] Full screen renders streaming AI bubble inline from `FullReading.partial`, persisted messages from server
- [x] FullLoading shows typing indicator (AI avatar + statusText + animated dots)
- [x] FullError shows error bubble inline with "Thử lại" button, compose bar remains visible
- [x] Stop icon replaces Send icon during FullLoading/FullReading(streaming)
- [x] Partial responses show "Đã dừng" indicator when stopped
- [x] Compose bar always ready after FullReading(done) — no "Soạn tiếp" button
- [x] Mid→Full mirror: conversation continues, stream renders seamlessly, history loads while streaming
- [x] Closing Full → Collapsed, drops conversationId
- [x] Unit tests: state machine (9 states, all transitions, invalid transitions, mirror), chat notifier (Full state event dispatch)

## Blocked by

None - can start immediately

## Implementation notes

Implemented Full mode as an independent chat surface in the mobile app. `AssistantFull(priorState)` was removed and replaced with dedicated `AssistantFullCompose`, `AssistantFullLoading`, `AssistantFullReading`, and `AssistantFullError` states. Mid-to-Full now mirrors the active phase and keeps the same conversation/stream, while closing Full always collapses and clears the cached conversation id.

### Files created

- None.

### Files modified

- `mobile/lib/features/assistant/domain/assistant_state.dart` — replaced monolithic `AssistantFull` with four Full phase states and shared Full reading/loading/error data shape.
- `mobile/lib/features/assistant/application/assistant_state_machine.dart` — added `openFull`, Full send/loading/reading/error transitions, mirror `enterFull`, Full reset, proposal mutation in Full, and invalid transition guards.
- `mobile/lib/features/assistant/application/assistant_chat_notifier.dart` — added Full entry/close support, Full SSE event dispatch, Full retry/rapid-send handling, and Full mode helpers.
- `mobile/lib/features/assistant/presentation/widgets/assistant_bar.dart` — added long-press direct Full entry and guarded sheet dismissal so Mid→Full navigation does not collapse the Full state.
- `mobile/lib/features/assistant/presentation/widgets/assistant_question_sheet.dart` — updated Full navigation/listening for the new Full state variants.
- `mobile/lib/features/assistant/presentation/widgets/assistant_full_screen.dart` — rendered persisted history plus live streaming bubble, inline typing indicator, inline error retry bubble, Stop/Send compose action, interrupted label, and close-to-collapsed behavior.
- `mobile/test/features/assistant/application/assistant_state_machine_test.dart` — added coverage for 9 states, Full transitions, invalid Full transitions, mirror mapping, reset/collapse, and proposal handling.
- `mobile/test/features/assistant/application/assistant_chat_notifier_test.dart` — added coverage for Full SSE dispatch, Full rapid-send, and Full close clearing conversation id.
- `.scratch/troly-ai-v2/issues/01-full-mode-independent-chat-surface.md` — updated status, acceptance criteria, and implementation notes.

### Files deleted

- None.

### Validation

- `flutter analyze` — failed only because of existing warnings/info outside this assistant change (unused lesson imports, deprecated `WillPopScope` in `exercise_play_screen.dart`, stale widget test overrides, etc.); no assistant-related analyzer issues.
- `flutter analyze --no-fatal-warnings --no-fatal-infos` — passed with the same pre-existing warnings/info.
- `flutter test test/features/assistant/application/assistant_state_machine_test.dart test/features/assistant/application/assistant_chat_notifier_test.dart` — passed.
- `flutter test` — failed in existing `test/widget_test.dart` app-level tests (`pumpAndSettle` timeout and missing expected home/navigation widgets), unrelated to the assistant Full mode changes.
