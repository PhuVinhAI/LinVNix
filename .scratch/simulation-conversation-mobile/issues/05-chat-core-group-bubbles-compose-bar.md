Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the core chat interaction: group chat screen with NPC/learner bubbles, pill-shaped compose bar, and the send/receive message cycle. Route: `/practice/sessions/:id` (outside shell, push).

**Bubble styles (group chat, NOT assistant pattern):**
- NPC bubbles: left-aligned. Row: `AppAvatar` (20px radius) + name label (caption/w600) above bubble. Bubble: `c.card` bg, `AppRadius.lg` (14), `c.border` 1px. Text: `bodyMedium/c.foreground`, plain text.
- Learner bubbles: right-aligned. Bubble: `c.primary.withAlpha(0.1)` bg, same radius + padding. No avatar/name.
- System messages: centered, muted text, no bubble.

**Compose bar:** Pill-shaped matching assistant pattern. `Container(muted/0.4 bg, AppRadius.lg)` wrapping borderless `TextField(maxLines:5, minLines:1)` + 36px circular primary send button (`Icons.arrow_upward_rounded`). Disabled state: `c.muted` bg, muted text hint, button hidden.

**Send/receive cycle via `SimulationChatNotifier` (plain Provider like AssistantChatNotifier):**
1. Learner types + taps send → call `sendMessage(sessionId, content)` → input disabled
2. Show typing indicator: `AppSpinner` + "Thinking..." centered, input hint "[NPC name] is typing..."
3. Response arrives: remove indicator, insert NPC bubbles with staggered 300ms slide-in animation
4. If `nextTurnCharacterId` = learner → input active with "Your turn" hint; if NPC → auto-call API for next AI turn (repeat step 2-3)
5. If `sessionEnded: true` → transition to COMPLETED state (handled in slice 07)

**Turn coordination:** Chat screen reads `nextTurnCharacterId` from response. If it matches the learner's character ID → enable input. If it's an NPC ID → auto-trigger next send. If multiple NPC messages arrive in one response, render all with stagger.

Add `sendMessage(String sessionId, String content)` and `getSession(String sessionId)` to `SimulationRepository`. Create `SendMessageResponse` model (fromJson: messages[], nextTurnCharacterId, feedback?, sessionEnded, endReason?, result?). Create `simulationSessionProvider` (Family AsyncNotifier, manages session + messages). `sendMessage` uses extended timeout (15s).

## Acceptance criteria

- [x] Chat screen renders NPC bubbles left-aligned with avatar + name + card-colored bubble
- [x] Chat screen renders learner bubbles right-aligned with primary-tinted bubble, no avatar/name
- [x] Pill-shaped compose bar matches assistant pattern; disabled state shows NPC hint, enabled shows "Your turn"
- [x] Sending a message: input disables, typing indicator shows, input shows "[NPC name] is typing..."
- [x] AI response: typing indicator removed, NPC bubbles appear with 300ms stagger animation
- [x] `nextTurnCharacterId` correctly toggles input enabled/disabled; auto-triggers next API call for NPC turns
- [x] Multiple NPC messages in one response all render in order with stagger
- [x] `SimulationRepository.sendMessage()` calls `POST /simulations/sessions/:id/messages` with extended timeout
- [x] `SimulationRepository.getSession()` calls `GET /simulations/sessions/:id`
- [x] `SendMessageResponse` model parses all fields including nullable feedback, endReason, result
- [x] `SimulationChatNotifier` manages state transitions: idle → sending → receiving → idle/completed
- [x] Auto-scroll to latest message on send/receive

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/04-character-selection-session-creation.md`

## Implementation notes

### Files created

- `mobile/lib/features/simulation/domain/send_message_response.dart` — `SendMessageResponse` model parsing messages[], nextTurnCharacterId, feedback?, sessionEnded, endReason?, result?
- `mobile/lib/features/simulation/application/simulation_chat_notifier.dart` — `SimulationChatNotifier` (Riverpod Notifier) managing chat state transitions (idle→sending→receiving→idle/completed), `SimulationChatState` with turn coordination logic, `simulationChatProvider` and `simulationSessionProvider` providers
- `mobile/lib/features/simulation/presentation/screens/chat_screen.dart` — Full chat screen with `_NpcBubble`, `_LearnerBubble`, `_SystemMessage`, `_ComposeBar`, `_TypingIndicator`, `_CompletedBanner`, `_HistoryBanner`, staggered slide-in animation via `_AnimatedBubble`
- `mobile/test/features/simulation/domain/send_message_response_test.dart` — 5 unit tests for SendMessageResponse model (all fields, sessionEnded, nullable defaults, toJson, null messages)
- `mobile/test/features/simulation/application/simulation_chat_notifier_test.dart` — 10 unit tests for SimulationChatNotifier (initSession, sendMessage flow, completed transition, empty content guard, ended session guard, loadExistingSession, npcSpeakerName, multiple NPC messages, error handling)

### Files modified

- `mobile/lib/features/simulation/data/simulation_repository.dart` — Added `sendMessage(sessionId, content)` with 15s timeout calling `POST /simulations/sessions/:id/messages`, added `getSession(sessionId)` calling `GET /simulations/sessions/:id`, added `SessionWithMessages` helper class
- `mobile/lib/features/simulation/data/simulation_providers.dart` — No changes (providers referenced from chat_notifier)
- `mobile/lib/core/router/app_router.dart` — Added route `/practice/sessions/:id` with optional `?history=true` query param, imported `ChatScreen`
- `mobile/test/features/simulation/data/simulation_repository_test.dart` — Added 6 tests for `sendMessage` (API contract, timeout, sessionEnded+endReason+result parsing, NetworkException) and 3 tests for `getSession` (API contract, response without messages, NetworkException)
