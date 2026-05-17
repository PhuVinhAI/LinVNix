Status: ready-for-agent

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Add message pagination for the Full screen chat. Learners see the 20 most recent messages on open; older messages load automatically when scrolling to the top.

**Backend**: Extend `GET /ai/conversations/:id/messages` to accept query params:
- `before: string` (optional) — ISO timestamp. Return messages with `createdAt < before`
- `limit: number` (optional, default 20, max 50)
- Order: `createdAt ASC` (oldest first, for chat display)
- Response: `{ data: ConversationMessage[], hasMore: boolean }`

**Mobile Full screen**: Maintain local state `_messages`, `_hasMore`. On open, fetch latest 20. Scroll controller listener: when scrolled near top, fetch next page with `before: _messages.first.createdAt`. Show loading indicator at top while fetching. Append older messages above existing ones.

## Acceptance criteria

- [ ] `GET /ai/conversations/:id/messages` accepts `before` (ISO timestamp) and `limit` (default 20, max 50) query params
- [ ] Response shape is `{ data: ConversationMessage[], hasMore: boolean }`
- [ ] Messages ordered `createdAt ASC`
- [ ] `hasMore` is false when no older messages exist
- [ ] Unit tests: pagination with cursor, hasMore flag, boundary (no messages before cursor)
- [ ] Full screen loads 20 most recent messages on open
- [ ] Scrolling near top auto-fetches next page with `before` cursor
- [ ] Loading indicator shown at top while fetching older messages
- [ ] Older messages prepended to list; no jump/flicker during load

## Blocked by

- .scratch/troly-ai-v2/issues/01-full-mode-independent-chat-surface.md (Full mode chat surface must exist)
