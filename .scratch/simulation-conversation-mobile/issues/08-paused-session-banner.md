Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add a paused session banner at the top of the tab landing when the learner has an active/paused session. This slice depends on the session lifecycle from slice 07.

**Banner:** Shows at top of tab landing ListView when `pausedSessionProvider` detects an incomplete session (ACTIVE or PAUSED). Displays session info (scenario title, character name). Two buttons:
- "Tiếp tục" → push chat screen `/practice/sessions/:id` → `getSession()` triggers PAUSED→ACTIVE on backend → chat resumes with full message history
- "Huỷ" → `AppDialog` confirmation ("Bạn có chắc muốn huỷ phiên này?") → `DELETE /sessions/:id` → refresh providers → banner disappears

Create `pausedSessionProvider` (AsyncNotifier) that checks for incomplete sessions. This may call a dedicated endpoint or check existing session state — for MVP, can poll `GET /simulations/sessions` filtered by status, or use a dedicated check. Coordinate with `simulationSessionProvider`.

## Acceptance criteria

- [ ] Banner appears at top of tab landing when learner has an ACTIVE or PAUSED session
- [ ] Banner shows scenario title + character name
- [ ] "Tiếp tục" button pushes to chat screen and resumes session (messages loaded, chat continues)
- [ ] "Huỷ" button shows `AppDialog` confirmation before deleting session
- [ ] After cancel, banner disappears and scenario list refreshes
- [ ] Banner disappears when no incomplete session exists
- [ ] `pausedSessionProvider` fetches incomplete session on tab landing build

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/07-session-lifecycle-pause-cancel-completed.md`
