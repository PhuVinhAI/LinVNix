Status: ready-for-agent

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
2. Show typing indicator: `AppSpinner` + "Đang suy nghĩ..." centered, input hint "[NPC name] đang nhập..."
3. Response arrives: remove indicator, insert NPC bubbles with staggered 300ms slide-in animation
4. If `nextTurnCharacterId` = learner → input active with "Lượt bạn" hint; if NPC → auto-call API for next AI turn (repeat step 2-3)
5. If `sessionEnded: true` → transition to COMPLETED state (handled in slice 07)

**Turn coordination:** Chat screen reads `nextTurnCharacterId` from response. If it matches the learner's character ID → enable input. If it's an NPC ID → auto-trigger next send. If multiple NPC messages arrive in one response, render all with stagger.

Add `sendMessage(String sessionId, String content)` and `getSession(String sessionId)` to `SimulationRepository`. Create `SendMessageResponse` model (fromJson: messages[], nextTurnCharacterId, feedback?, sessionEnded, endReason?, result?). Create `simulationSessionProvider` (Family AsyncNotifier, manages session + messages). `sendMessage` uses extended timeout (15s).

## Acceptance criteria

- [ ] Chat screen renders NPC bubbles left-aligned with avatar + name + card-colored bubble
- [ ] Chat screen renders learner bubbles right-aligned with primary-tinted bubble, no avatar/name
- [ ] Pill-shaped compose bar matches assistant pattern; disabled state shows NPC hint, enabled shows "Lượt bạn"
- [ ] Sending a message: input disables, typing indicator shows, input shows "[NPC name] đang nhập..."
- [ ] AI response: typing indicator removed, NPC bubbles appear with 300ms stagger animation
- [ ] `nextTurnCharacterId` correctly toggles input enabled/disabled; auto-triggers next API call for NPC turns
- [ ] Multiple NPC messages in one response all render in order with stagger
- [ ] `SimulationRepository.sendMessage()` calls `POST /simulations/sessions/:id/messages` with extended timeout
- [ ] `SimulationRepository.getSession()` calls `GET /simulations/sessions/:id`
- [ ] `SendMessageResponse` model parses all fields including nullable feedback, endReason, result
- [ ] `SimulationChatNotifier` manages state transitions: idle → sending → receiving → idle/completed
- [ ] Auto-scroll to latest message on send/receive

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/04-character-selection-session-creation.md`
