Status: ready-for-agent

# PRD: Trợ lý AI V2 — Full Mode Độc lập, Ảnh, Message Actions, Sidebar CRUD

## Problem Statement

**Trạng thái Toàn màn hình** hiện tại là một surface phụ thuộc hoàn toàn vào **Trạng thái Hỏi** — nó không thể gửi tin nhắn trực tiếp (SSE events bị bỏ qua khi state là `AssistantFull`), nút Reset hay "+ Mới" luôn đẩy học viên về Mid, và không có phase riêng (loading, reading, error). Học viên trải nghiệm Full mode giống một "xem lại" chứ không phải chat thực tế.

Ngoài ra, Full mode thiếu các tính năng cơ bản của AI chat: không gửi ảnh, không copy/regenerate/edit tin nhắn, sidebar không cập nhật realtime (cần mở lại mới thấy thay đổi), và không có cách tắt Thanh Trợ lý AI cho học viên không muốn dùng.

## Solution

Nâng cấp **Trạng thái Toàn màn hình** thành một chat surface hoàn toàn độc lập, có state machine riêng (4 phase: Compose, Loading, Reading, Error), stream inline render, gửi ảnh (camera + photo picker), message actions (copy, regenerate, edit), và sidebar CRUD reactive. Thêm preference ẩn/hiện Thanh Trợ lý AI. Giữ **Trạng thái Hỏi** (Mid) chỉ cho text Q&A nhanh — không ảnh, không message actions ngoài select text.

### Entry points mới

- **Tap bar** → MidCompose (giữ nguyên)
- **Long-press bar** → FullCompose (mới — bỏ qua Mid, mở trực tiếp Full screen)
- **Mid → Full** (tap "Toàn màn hình") → mirror state: MidCompose→FullCompose, MidLoading→FullLoading, MidReading(streaming)→FullReading(streaming), MidError→FullError. Stream tiếp tục không gián đoạn

### Đóng Full = kết thúc phiên

Đóng Full (back/close) → Collapsed, drop conversationId. Không quay về Mid. `AssistantFull.priorState` bị loại bỏ — Full states không nhớ Mid trước đó.

## User Stories

### Full mode độc lập — entry và phase

1. As a learner, I want to long-press the assistant bar to open full-screen chat directly, so that I can skip the small sheet when I know I want a full chat
2. As a learner, I want full-screen mode to have its own compose phase with a text input ready to type, so that I can send messages without going through Mid first
3. As a learner, I want full-screen mode to show a typing indicator (icon + "Đang suy nghĩ...") inline in the message list while the AI is thinking, so that I can still scroll up to read old messages
4. As a learner, I want the typing indicator to show granular tool status text (e.g., "Đang tra cứu từ vựng..."), so that I know what the AI is doing
5. As a learner, I want the AI's response to stream inline in a message bubble within the chat list (word-by-word markdown rendering), so that I see the answer appear in context like a real chat
6. As a learner, I want the compose bar to always be visible and ready after the AI finishes responding, so that I can immediately type a follow-up without tapping "Soạn tiếp"
7. As a learner, I want to see an error bubble inline in the message list with a "Thử lại" button when the AI request fails, so that I can retry while still seeing the conversation history
8. As a learner, I want to stop the AI mid-stream by tapping the Stop icon (which replaces the Send icon in the compose bar), so that I can interrupt a long answer
9. As a learner, I want partial responses to be saved with an "Đã dừng" indicator when I stop the AI in full-screen mode, so that I know the message was interrupted

### Full mode — Mid → Full transition

10. As a learner, I want to tap "Toàn màn hình" in the Mid sheet to transition to full-screen with my current conversation, so that I can see the full history
11. As a learner, I want the AI to continue streaming seamlessly when I transition from Mid to Full (no lost tokens, no restart), so that I don't miss any of the response
12. As a learner, I want the existing conversation history to load from the server while the streaming response continues rendering from state, so that I see old messages and the live response simultaneously

### Full mode — Reset và conversation lifecycle

13. As a learner, I want the Reset button in full-screen to stay in full-screen (not push me back to Mid), so that my UI mode is preserved
14. As a learner, I want the "+ Mới" button in the drawer to stay in full-screen and start a fresh conversation there, so that I don't lose my UI mode
15. As a learner, I want closing full-screen (back gesture or close button) to close the assistant entirely (collapsed state), so that I'm back to my normal screen
16. As a learner, I want closing full-screen to end the current conversation session (next bar tap starts fresh), so that behavior is consistent and predictable

### Gửi ảnh trong Full mode

17. As a learner, I want to tap a camera/photo button in the full-screen compose bar to attach images to my message, so that I can show the AI what I'm looking at
18. As a learner, I want to choose between taking a photo with the camera or picking from my gallery, so that I can use whichever source is convenient
19. As a learner, I want to see thumbnail previews of attached images above the text field with a delete button on each, so that I can review and remove images before sending
20. As a learner, I want to attach up to 4 images per message, so that I can provide multiple visual contexts
21. As a learner, I want the AI to understand and respond to images I send (e.g., a screenshot of an exercise, a photo of a sign), so that I can ask about visual content
22. As a learner, I want to see my sent images rendered in a horizontally scrollable row inside my message bubble in the chat list, so that the chat stays compact
23. As a learner, I want to tap an image in a message bubble to view it fullscreen, so that I can see details
24. As a learner, I want Mid mode to remain text-only (no image support), so that the quick Q&A surface stays simple

### Message actions — Copy, Regenerate, Edit

25. As a learner, I want to tap a message to reveal action icons (copy, regenerate for my messages; copy for AI messages), so that I can interact with message content
26. As a learner, I want the action icons to hide when I tap outside the message, so that the chat stays clean
27. As a learner, I want to copy raw text from a user message, so that I can paste it elsewhere
28. As a learner, I want to copy raw markdown from an AI message, so that I can paste formatted content
29. As a learner, I want to select and copy text by dragging in both Mid and Full modes (system text selection), so that I can copy partial content without using the icon
30. As a learner, I want to regenerate a response by tapping regenerate on my user message, so that I get a fresh AI answer to the same question
31. As a learner, I want regenerate to delete the AI response and all subsequent messages, then resend from that point, so that the conversation branches cleanly
32. As a learner, I want to edit a previously sent user message inline (bubble becomes a text field with send/cancel), so that I can fix typos or rephrase
33. As a learner, I want editing a message to delete the AI response and all subsequent messages, then resend with the new text, so that the conversation continues from the edited point
34. As a learner, I want regenerate and edit to cancel any in-flight AI stream immediately, so that I don't have to wait for a response I'm about to replace

### Sidebar CRUD — reactive updates

35. As a learner, I want the sidebar conversation list to update immediately when I create, rename, or delete a conversation, so that I don't have to close and reopen the drawer to see changes
36. As a learner, I want a new conversation row to appear in the sidebar as soon as I send the first message (not just when I reopen), so that I can see it was created
37. As a learner, I want rename changes to appear instantly in the sidebar without reloading, so that I trust the edit worked
38. As a learner, I want deleted conversations to disappear from the sidebar immediately, so that the list stays clean
39. As a learner, I want to search conversations by title using a search bar at the top of the sidebar, so that I can find old conversations quickly
40. As a learner, I want the search to filter locally within the loaded list, so that it's instant and works offline

### Lazy load tin nhắn

41. As a learner, I want to see the 20 most recent messages when I open a conversation in full-screen, so that the initial load is fast
42. As a learner, I want older messages to load automatically when I scroll to the top of the message list, so that I can browse the full history seamlessly
43. As a learner, I want a loading indicator at the top while older messages are being fetched, so that I know more content is coming

### Setting — ẩn/hiện Thanh Trợ lý AI

44. As a learner, I want a toggle in my profile screen to show or hide the assistant bar, so that I can remove it if I don't use the AI feature
45. As a learner, I want the assistant bar to be visible by default, so that I discover the feature naturally
46. As a learner, I want hiding the bar to completely disable the AI assistant (no alternative entry point), so that the UI is clean when I opt out
47. As a learner, I want the bar to stay visible until any active AI stream finishes when I toggle it off, so that I don't lose a response mid-stream

## Implementation Decisions

### State machine — 9 states, Full độc lập

The existing `AssistantFull(priorState)` is replaced with four dedicated Full states. `priorState` is removed entirely — closing Full always goes to Collapsed.

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

Key differences from V1:
- `AssistantFull.priorState` removed. `enterFull()` no longer stores prior — it maps to the equivalent Full state.
- `exitFull()` removed. Closing Full = `collapse()` → Collapsed.
- `reset()` in Full → `FullCompose` (not MidCompose).
- `send()` accepts `FullCompose` and `FullError` as valid source states.
- `_handleEvent` in `AssistantChatNotifier` dispatches to Full states when state machine is in `FullLoading`/`FullReading`.

### Chat notifier — Full state handling

`AssistantChatNotifier._handleEvent` currently only reacts when state is `MidLoading` or `MidReading(streaming)`. The fix:

- `ConversationStartedEvent`: set `_conversationId` (already works — no state check)
- `ToolStartEvent`: react when `FullLoading` → `sm.onToolStart()`
- `TextChunkEvent`: react when `FullLoading` or `FullReading(streaming)` → `sm.onTextChunk()`
- `ProposeEvent`: react when `FullReading(streaming)` → `sm.onPropose()`
- `AssistantErrorEvent`: react when `FullLoading` or `FullReading(streaming)` → `sm.onError()`
- `DoneEvent`: react when `FullLoading` or `FullReading(streaming)` → `sm.onDone()`

`sendMessage()` must handle Full source states:
- `FullLoading` / `FullReading(streaming)` → stop + composeAgain (implicit rapid-send in Full)
- `FullReading(done)` → composeAgain → send
- `FullCompose` / `FullError` → send directly

### Long-press bar entry

`AssistantBar` adds `onLongPress` handler. Long-press:
1. Transition state machine: `Collapsed` → `FullCompose`
2. Navigate to `AssistantFullScreen` via `MaterialPageRoute(fullscreenDialog: true)`
3. Do NOT open the bottom sheet

This requires `GlobalAssistantShell` or `AssistantBar` to have access to the navigator (already has `rootNavigatorKeyProvider`).

### Full screen — stream inline rendering

`AssistantFullScreen` is rewritten to render AI responses inline instead of reloading from server:

- **History messages** loaded from `GET /ai/conversations/:id/messages` (paginated, 20 per page)
- **Streaming response** rendered from `FullReading.partial` as a live-updating AI bubble at the bottom of the list
- When `FullReading` transitions to done → reload conversation from server to merge the final persisted message into `_messages`, clear the streaming bubble

Local state management in `_AssistantFullScreenState`:
- `_messages: List<ConversationMessage>` — persisted history from server
- `_streamingPartial: String?` — live text from `FullReading.partial`
- `_streamingProposals: List<ProposalState>` — from `FullReading.proposals`
- Watch `assistantStateMachineProvider` — when FullReading, extract partial + proposals for the streaming bubble

### Full screen — typing indicator

When state is `FullLoading`, render a typing indicator row at the bottom of the message list:
- AI avatar icon + `statusText` (e.g., "Đang suy nghĩ..." → "Đang tra cứu từ vựng...")
- Animated dots or spinner

When state transitions to `FullReading(streaming)`, the typing indicator is replaced by the streaming AI bubble.

### Full screen — compose bar always ready

The compose bar in Full mode has no "Soạn tiếp" button. After `FullReading(done)`, the text field is simply focusable. The state machine does not need a `composeAgain()` transition for Full — `FullReading(done)` allows `send()` directly (add `FullReading(done)` as a valid source for rapid-send logic).

### Full screen — Stop = Send→Stop icon

In the compose bar:
- Default: Send icon
- When state is `FullLoading` or `FullReading(streaming)`: Send icon replaced by Stop icon (square, error-colored). Tap → `notifier.stop()`

### Full screen — error bubble

When state is `FullError`, render an error bubble inline in the message list:
- Red icon + error message + "Thử lại" button
- Compose bar remains visible and functional below
- Tap "Thử lại" → `notifier.retry()` which calls `sendMessage(lastInput)`

### Image support — compose bar (Full only)

The Full compose bar adds a camera/photo button to the left of the text field (or beside the send button). Tap opens an action sheet: "Chụp ảnh" (camera) or "Chọn ảnh" (gallery).

Selected images are shown as a horizontal thumbnail row above the text field, each with a small X button to remove. Max 4 images. Each image max 10MB — validate on mobile before attaching; backend also rejects oversized files.

Mid compose bar does NOT have this button — Mid stays text-only.

### Image support — message bubble rendering

User message bubbles with images render them as a single horizontal row (scrollable if >2 images). Each image is a rounded thumbnail. Tap → fullscreen image viewer (dialog with zoom).

AI messages remain text-only (markdown). Images in AI responses (if Gemini returns `inlineData`) are out of scope for V2.

### Image support — multipart chat stream endpoint

`POST /ai/chat/stream` changes from JSON body to `multipart/form-data`:
- Fields: `message` (string), `conversationId` (optional UUID), `screenContext` (optional JSON string)
- Files: `images` (up to 4 files, each ≤10MB, accepted MIME types: `image/jpeg`, `image/png`, `image/webp`)

Backend handling:
1. Multer `FilesInterceptor('images', 4)` with file filter (MIME check) and size limit (10MB)
2. For each uploaded image: call `StorageService.uploadImage()` → save to `uploads/images/`, get URL
3. Build message content parts: `[{ type: 'text', text: message }, { type: 'image', url: '/uploads/images/abc.jpg' }, ...]`
4. For Gemini Interactions input: read each image file from disk, base64-encode, add `{ type: 'image', data: base64, mime_type: 'image/jpeg' }` as a Step content part alongside the text
5. Persist `ConversationMessage` with `content` as JSONB (see schema change below)

The existing `AiChatStreamRequestDto` is replaced by manual field extraction from `multipart/form-data` (or a new DTO that works with `@Body()` + `@UploadedFiles()`).

Non-streaming `POST /ai/chat/simple` is updated similarly for consistency.

### Schema change — ConversationMessage.content text → jsonb

`ConversationMessage.content` column type changes from `text` to `jsonb`. The new structure:

```json
[
  { "type": "text", "text": "What does this sign say?" },
  { "type": "image", "url": "/uploads/images/abc123.jpg" },
  { "type": "image", "url": "/uploads/images/def456.jpg" }
]
```

Migration strategy:
- New rows write jsonb array format
- Old rows: migration converts `text` content → `[{ "type": "text", "text": "<old_content>" }]`
- Reading: code must handle both formats during transition (check if content is string → wrap, if array → use as-is)
- AI messages and TOOL messages: always `[{ "type": "text", "text": "..." }]` (single text part)

`StorageService.uploadImage` mimetype hard-coding (`'image/jpeg'`) must be fixed — derive from the actual file's mimetype or accept it as a parameter.

### Message actions — copy, regenerate, edit (Full only)

Each message in the Full screen message list supports tap-to-reveal action icons:

**User messages**: Copy, Regenerate, Edit
**AI messages**: Copy only

Icons are hidden by default. Tap on a message bubble → show action bar below the bubble. Tap outside → hide.

**Copy**: copies raw text/markdown to clipboard via `Clipboard.setData`. No API call.

**Regenerate** (user message):
1. Cancel any in-flight stream
2. Call `DELETE /ai/conversations/:id/messages?from=<messageId>` — backend hard-deletes this message and all subsequent messages in the conversation
3. Remove deleted messages from local `_messages` list
4. Resend the original user text via `notifier.sendMessage(originalText)` — continues same conversationId

**Edit** (user message):
1. Cancel any in-flight stream
2. The user bubble transforms inline into a text field pre-filled with the original text, with Send and Cancel buttons
3. On Send: same as regenerate but with the edited text instead of the original
4. On Cancel: revert the bubble back to display mode

Mid mode does not have message action icons — only `selectable: true` for system text selection/copy.

### Message delete endpoint

New backend endpoint: `DELETE /api/v1/ai/conversations/:id/messages?from=<messageId>`

- Hard-deletes (not soft-delete) the specified message and all messages with `createdAt >= that message's createdAt` within the same conversation
- Ownership-checked: only the conversation owner can delete
- Guarded by `AI_CHAT` permission
- Returns `{ deletedCount: number }`

Used exclusively by regenerate and edit flows on the client.

### Sidebar — reactive CRUD

`ConversationDrawer` changes:

1. **After rename**: `conversationListProvider.notifier.rename()` already calls backend + updates local list. Verify it invalidates properly so UI reflects instantly.
2. **After delete**: same — verify `delete()` removes from local list immediately.
3. **After "+ Mới"**: call `reset()` → `FullCompose`. A new row appears when `conversation_started` SSE event arrives (conversationId assigned). The chat notifier exposes this event to the drawer via a provider invalidation.
4. **After first message sent**: when `conversation_started` event fires, invalidate `conversationListProvider` so the new conversation (with auto-title) appears in the drawer.
5. **Search bar**: add a `TextField` at the top of the drawer (below header, above list). Filters `_filteredConversations` locally by title substring match. When search is empty, show all.

`conversationListProvider` must support adding a conversation locally without a full refresh. Options: maintain a local list that gets merged with server data, or invalidate and refetch. The simplest correct approach: invalidate on every mutation (rename, delete, new conversation) — the list is small (typically <50 conversations) and the fetch is fast.

### Lazy load tin nhắn — pagination

Backend: extend `GET /ai/conversations/:id/messages` to accept query params:
- `before: string` (optional) — ISO timestamp. Return messages with `createdAt < before`
- `limit: number` (optional, default 20, max 50)
- Order: `createdAt ASC` (oldest first, for chat display)

Response: `{ data: ConversationMessage[], hasMore: boolean }`

Mobile: `AssistantFullScreen` maintains:
- `_messages: List<ConversationMessage>` — loaded history
- `_hasMore: bool` — whether older messages exist
- Scroll controller listener: when scrolled near top, fetch next page with `before: _messages.first.createdAt`
- Loading indicator at top while fetching

### Setting — assistant_bar_visible

`PreferencesService` adds:
- Key: `assistant_bar_visible` (bool, default true)
- Getter: `bool get assistantBarVisible => _prefs.getBool('assistant_bar_visible') ?? true`
- Setter: `Future<void> setAssistantBarVisible(bool)`

Riverpod provider: `assistantBarVisibleProvider` — derives from `preferencesProvider`, similar to `themeModeProvider`.

`GlobalAssistantShell.build()` checks `assistantBarVisibleProvider`. When false, returns `widget.child` without the `AssistantBar` (same as hidden routes). When true, existing behavior.

`AssistantBar` itself is not rendered at all when the preference is false — no visual trace of the assistant.

Profile screen: add a toggle row in the settings section (below theme selector):
- Label: "Hiện thanh Trợ lý AI"
- Switch: bound to `assistantBarVisibleProvider`
- When toggled off while a stream is active: delay takes effect after stream completes. Implementation: the toggle writes the preference immediately; `GlobalAssistantShell` reads it reactively. If the shell detects the preference is off but a Full screen is open, it does NOT force-close the Full screen — the learner closes it manually. The bar simply won't appear on the next screen/collapsed state.

### Full screen compose bar — shared style with Mid

The Full compose bar uses the same visual style as Mid's compose body: rounded container with muted background, borderless text field, circular send button in bottom-right corner. Differences:
- Additional camera/photo button (circular, next to send or in bottom-left)
- Image preview row above text field when images are attached
- Send icon becomes Stop icon when streaming
- No max-height constraint (Full screen gives full space)

## Testing Decisions

### What makes a good test

Tests verify observable behavior, not implementation details. State machines are tested by driving inputs and asserting state transitions. API endpoints are tested by asserting response shape and database state. Image upload is tested by asserting file is saved and message content shape is correct.

### Modules to test

**AssistantStateMachine (unit tests) — high priority:**
- All 9 states and transitions
- Mirror transitions: Mid→Full for each Mid state
- Reset in Full → FullCompose
- Send from FullCompose/FullError → FullLoading
- FullLoading/FullReading event handling
- Invalid transitions throw StateError
- Prior art: existing `assistant_state_machine_test.dart` (25 tests)

**Message content schema (unit tests):**
- JSONB content parsing: text-only, text+images, old-format string fallback
- Content builder: builds parts array from text + image URLs
- Prior art: existing `conversation_model.dart` tests

**Image upload pipeline (unit tests):**
- `AiController.chatStream` with multipart: mock multer files, assert StorageService called, assert message content has image parts, assert Gemini input includes base64 image data
- File size limit enforcement (reject >10MB)
- MIME type validation (reject non-image)
- Max 4 images enforcement
- Prior art: existing `ai_api_test.dart`

**Message delete endpoint (unit + e2e tests):**
- Unit: ownership check, cascade delete from `from` messageId
- E2E: `DELETE /ai/conversations/:id/messages?from=X` — verify messages deleted, subsequent messages gone
- Prior art: existing conversation e2e tests

**Message pagination (unit tests):**
- `before` cursor parameter returns correct page
- `hasMore` flag correct
- Boundary: no messages before cursor
- Prior art: existing paginated list endpoints

**SSE event dispatch for Full states (unit tests):**
- Mock events dispatched when state is FullLoading → verify FullLoading transitions
- Mock events dispatched when state is FullReading(streaming) → verify FullReading transitions
- Prior art: existing `assistant_chat_notifier_test.dart`

### Skipped

- Widget tests for AssistantFullScreen, ConversationDrawer, FullComposeBar — same rationale as V1 PRD (UI shells, low ROI)
- Integration tests for image upload to Gemini — requires real Gemini API, deferred
- Full e2e test for regenerate/edit flow — covered by unit tests of delete endpoint + state machine

## Out of Scope

- **AI image output** — Gemini returning `inlineData` image parts in responses. Deferred to V3.
- **Image compression** — mobile sends originals, no client-side resize. Gemini handles large images internally.
- **Mid mode image support** — Mid stays text-only by design.
- **Mid mode message actions** — Mid has system text selection only, no icon actions.
- **"Soạn tiếp" in Full mode** — compose bar is always ready, no dedicated button.
- **Audio/video messages** — V2 is images only.
- **Conversation pinning** — deferred from V1, still deferred.
- **Notify AI on proposal decline** — deferred from V1, still deferred.
- **Multi-provider AI support** — stays on Gemini.
- **S3/cloud storage migration** — stays local filesystem via StorageService.
- **Offline mode / local AI** — requires connectivity.
- **Token quota per learner** — explicitly out per CONTEXT.md.

## Further Notes

### Migration considerations

- **ConversationMessage.content text→jsonb**: Write a TypeORM migration. `synchronize: true` in dev handles the column type change, but the data conversion (string → `[{type:"text",text:"..."}]`) must be done manually. Add a runtime fallback in the message parser: if `content` is a string, wrap it; if array, use as-is.
- **New `assistant_bar_visible` preference**: SharedPreferences key, default true — no migration needed, missing key falls back to true.
- **StorageService.uploadImage mimetype fix**: Currently hard-codes `'image/jpeg'`. Change to accept mimetype parameter from the Multer file's `mimetype` field.

### Existing code changes summary

| Component | Change |
|---|---|
| `AssistantState` sealed class | Remove `AssistantFull`, add `FullCompose`, `FullLoading`, `FullReading`, `FullError` |
| `AssistantStateMachine` | New transitions for Full states, remove `enterFull`/`exitFull` with priorState, add mirror `enterFull`, `reset`→FullCompose when in Full |
| `AssistantChatNotifier` | `_handleEvent` handles Full states, `sendMessage` handles Full source states, `reset` stays in Full, `enterFull` mirrors, `exitFull`→collapse |
| `AssistantFullScreen` | Full rewrite: stream inline, typing indicator, error bubble, compose bar always ready, image support, message actions |
| `AssistantBar` | Add `onLongPress` → FullCompose, check `assistantBarVisibleProvider` |
| `GlobalAssistantShell` | Check `assistantBarVisibleProvider`, hide bar when false |
| `ConversationDrawer` | Reactive invalidate, search bar, "+ Mới"→FullCompose |
| `PreferencesService` | Add `assistantBar_visible` key |
| Profile screen | Add assistant bar toggle in settings section |
| `AiController.chatStream` | Accept `multipart/form-data`, extract images, save via StorageService |
| `ConversationMessage` entity | `content` column type `text` → `jsonb` |
| `StorageService.uploadImage` | Accept mimetype parameter instead of hard-coding |
| `GenaiService` / `AgentService` | Build Gemini Interactions input with image parts when present |
| New: message delete endpoint | `DELETE /ai/conversations/:id/messages?from=X` |
| New: message pagination | `GET /ai/conversations/:id/messages?before=&limit=` |
