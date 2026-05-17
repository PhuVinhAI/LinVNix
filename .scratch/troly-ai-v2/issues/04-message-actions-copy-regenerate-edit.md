Status: ready-for-agent

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Add message actions (copy, regenerate, edit) to Full mode messages. Mid mode stays simple — only system text selection, no action icons.

**Backend**: New endpoint `DELETE /api/v1/ai/conversations/:id/messages?from=<messageId>`. Hard-deletes (not soft-delete) the specified message and all messages with `createdAt >= that message's createdAt` within the same conversation. Ownership-checked (only conversation owner). Guarded by `AI_CHAT` permission. Returns `{ deletedCount: number }`.

**Mobile Full screen**: Tap a message bubble → reveal action icons below the bubble. Tap outside → hide. User messages: Copy, Regenerate, Edit. AI messages: Copy only.

- **Copy**: Clipboard.setData with raw text (user) or raw markdown (AI). No API call.
- **Regenerate** (user message): Cancel any in-flight stream. Call DELETE endpoint with `from=<messageId>`. Remove deleted messages from local list. Resend original user text via `notifier.sendMessage(originalText)` — same conversationId.
- **Edit** (user message): Cancel any in-flight stream. Bubble transforms inline into a text field pre-filled with original text, with Send and Cancel buttons. On Send: same as regenerate but with edited text. On Cancel: revert bubble to display mode.

Both regenerate and edit cancel any in-flight AI stream immediately.

## Acceptance criteria

- [ ] `DELETE /api/v1/ai/conversations/:id/messages?from=<messageId>` endpoint exists, ownership-checked, AI_CHAT guarded
- [ ] Hard-deletes specified message and all subsequent messages (by createdAt >=)
- [ ] Returns `{ deletedCount: number }`
- [ ] Unit + e2e tests: ownership check, cascade delete, subsequent messages gone
- [ ] Full screen: tap message → action icons appear; tap outside → hide
- [ ] User messages show Copy, Regenerate, Edit icons; AI messages show Copy only
- [ ] Copy puts raw text/markdown on clipboard
- [ ] Regenerate: cancels stream → deletes from point → resends original text
- [ ] Edit: bubble transforms to text field inline → Send sends edited text (delete+resend) → Cancel reverts
- [ ] Regenerate and edit cancel any in-flight stream immediately
- [ ] Mid mode has no action icons — only `selectable: true` for system text selection

## Blocked by

- .scratch/troly-ai-v2/issues/01-full-mode-independent-chat-surface.md (Full mode chat surface must exist)
