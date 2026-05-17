Status: ready-for-agent

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Make the conversation sidebar reactive — CRUD operations update the list immediately without reopening the drawer. Add a search bar for filtering conversations by title.

**Reactive CRUD**: Invalidate `conversationListProvider` on every mutation (rename, delete, new conversation). New conversation row appears when `conversation_started` SSE event fires (not just on drawer reopen). The chat notifier exposes this event to the drawer via provider invalidation. "+ Mới" button in drawer → FullCompose (stays in Full mode, not Mid). Rename and delete already call backend + update — verify they invalidate properly so UI reflects instantly.

**Search bar**: Add a `TextField` at the top of the drawer (below header, above list). Filters conversations locally by title substring match. When search is empty, show all. Instant, works offline (filters loaded list, no server call).

`conversationListProvider` must support adding a conversation locally without a full refresh. Simplest correct approach: invalidate on every mutation — the list is small (typically <50) and fetch is fast.

## Acceptance criteria

- [ ] Sidebar list updates immediately after rename (no need to reopen drawer)
- [ ] Sidebar list updates immediately after delete (row disappears)
- [ ] New conversation row appears when `conversation_started` SSE fires (not on next drawer open)
- [ ] "+ Mới" in drawer → FullCompose (stays in Full mode)
- [ ] Search bar at top of drawer filters conversations by title substring locally
- [ ] Empty search shows all conversations; search is instant (no server call)
- [ ] `conversationListProvider` invalidates on every mutation (rename, delete, new conversation)

## Blocked by

- .scratch/troly-ai-v2/issues/01-full-mode-independent-chat-surface.md (Full mode must exist for "+ Mới" → FullCompose)
