Status: done

# Mobile Full mode: chat list + drawer + Conversation rename / delete / +Mới

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

The full-screen state of the assistant. Drag-up from Mid Reading enters Full; drawer reveals the Conversation list with rename / delete / +Mới. Right-aligned user message bubbles with background; full-width AI messages with markdown.

This slice adds the small backend endpoints required for Conversation list management (rename + auto-title generation), if they don't already exist.

- **`AssistantFullScreen` widget** — header (drawer toggle, current Flutter screen name from `currentScreenContextProvider.displayName`, Reset button, close button), body (chat list of all `ConversationMessage`s with `role IN (USER, ASSISTANT)`, scrolled to bottom on new message). User messages: right-aligned, background color, no markdown. AI messages: full-width, no background, markdown rendered with `flutter_markdown`.
- **State machine extension** — wire the existing `Full` stub state from #04. Drag-up gesture from `MidReading(*)` → `Full`. Back gesture / close button → prior `Mid*` state or `Collapsed`. Reset and Soạn-tiếp buttons keep their semantics in Full mode.
- **Drawer** — opens via header toggle. Lists Conversations sorted by `updatedAt` DESC. Each row: title (or "Hội thoại mới" if empty), trailing rename + delete actions. Top of drawer: "+ Mới" button. Drawer closes on row tap.
- **+ Mới** — same behavior as Reset: drops local `conversationId`, returns to `MidCompose` (or `Full` blank state). Next Send creates a new Conversation with current `screenContext`.
- **Tap a Conversation row** — makes it active. Loads messages via existing `GET /ai/conversations/:id` + `GET /ai/conversations/:id/messages`. Body shows the loaded history. Send-from-here continues that Conversation regardless of current screen.
- **Rename** — tap pencil icon → inline text edit → `PATCH /api/v1/ai/conversations/:id { title }`. Add this backend endpoint if it doesn't already exist (guarded by `AI_VIEW_CONVERSATIONS` for read + `AI_CHAT` for mutate, ownership-checked).
- **Delete** — confirm dialog → `DELETE /api/v1/ai/conversations/:id` (existing endpoint).
- **Auto-title generation** — on lazy-create of a Conversation in `runTurnStream` (slice #02 added the lazy-create path), populate `title` with the first ~50 characters of the user message. The user can override later via Rename. Add this server-side; do NOT do it on the client.

Per PRD's V1 testing scope, no widget tests for `AssistantFullScreen`, `ConversationDrawer`, or the message bubbles — rely on manual smoke and on the indirect coverage from the e2e flow.

## Acceptance criteria

- [x] Drag-up from Mid Reading state opens Full screen with the same active Conversation
- [x] Back gesture / close button from Full returns to prior Mid state (or Collapsed)
- [x] Drawer lists Conversations sorted by `updatedAt` DESC
- [x] Rename works end-to-end (UI edit → backend `PATCH` → drawer reflects new title; server endpoint added if missing, ownership-checked)
- [x] Delete works end-to-end (confirm → backend `DELETE` → drawer no longer shows it)
- [x] "+ Mới" creates a new Conversation with current `screenContext` on next Send (verifiable by 2 distinct conversation IDs in DB)
- [x] Tapping an old Conversation loads its messages and renders user bubbles + AI markdown correctly
- [x] Auto-generated title is populated server-side on first Send (max ~50 chars from first user message); manual rename overrides it
- [x] Backend endpoints `GET /ai/conversations` (paginated), `GET /ai/conversations/:id`, `GET /ai/conversations/:id/messages`, `PATCH /ai/conversations/:id`, `DELETE /ai/conversations/:id` exist and are guarded by `AI_VIEW_CONVERSATIONS` (read) / `AI_CHAT` (mutate)
- [x] `cd mobile && flutter analyze && flutter test` pass; `cd backend && bun run lint && bun run typecheck && bun run test` pass (e2e tests require `db:up` — pre-existing infra dependency)

## Blocked by

- [`04-mobile-mid-mode.md`](./04-mobile-mid-mode.md)

## Implementation notes

### Files created

| File | Description |
|------|-------------|
| `backend/src/modules/ai/dto/update-conversation.dto.ts` | DTO for `PATCH /ai/conversations/:id` — validates `title` (string, max 200 chars) |
| `mobile/lib/features/assistant/data/conversation_model.dart` | `ConversationSummary` and `ConversationMessage` models for the drawer and full-screen chat list |
| `mobile/lib/features/assistant/data/conversation_list_provider.dart` | Riverpod `AsyncNotifier` for conversation list with `refresh`, `rename`, `delete` operations |
| `mobile/lib/features/assistant/presentation/widgets/conversation_drawer.dart` | `ConversationDrawer` widget — lists conversations sorted by `updatedAt` DESC with inline rename, delete confirmation dialog, and "+ Mới" button |
| `mobile/lib/features/assistant/presentation/widgets/assistant_full_screen.dart` | `AssistantFullScreen` widget — header with drawer toggle/display name/reset/close, scrolling chat list with user bubbles (right-aligned, primary color background) and AI messages (full-width markdown), compose bar at bottom |

### Files modified

| File | Description |
|------|-------------|
| `backend/src/modules/ai/presentation/ai.controller.ts` | Added `PATCH /ai/conversations/:id` endpoint (rename) with `AI_CHAT` permission guard and ownership check |
| `backend/src/modules/conversations/application/conversation.service.ts` | Added `updateTitle(id, title)` method |
| `backend/src/modules/agent/application/agent.service.ts` | Auto-title generation: when lazily creating a conversation in `runTurnStream`, populates `title` with first ~50 chars of user message |
| `mobile/lib/features/assistant/domain/assistant_state.dart` | `AssistantFull` now carries `priorState` field for back navigation |
| `mobile/lib/features/assistant/application/assistant_state_machine.dart` | Added `enterFull()` and `exitFull()` transitions |
| `mobile/lib/features/assistant/application/assistant_chat_notifier.dart` | Added `enterFull()`, `exitFull()`, `openExistingConversation()`, and public `conversationId` getter |
| `mobile/lib/features/assistant/data/ai_api.dart` | Added `listConversations`, `getConversation`, `renameConversation`, `deleteConversation` methods |
| `mobile/lib/features/assistant/presentation/widgets/assistant_question_sheet.dart` | Added "Toàn màn hình" button in header; handles `AssistantFull` state transition by dismissing sheet and navigating to `AssistantFullScreen` |
