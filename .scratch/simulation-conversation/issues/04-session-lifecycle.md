Status: ready-for-agent

# 04 — Session lifecycle — create, pause, resume, cancel

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement the session management layer that controls how learners start, pause, resume, and cancel simulation sessions. This slice does NOT include the AI message exchange logic (that's issue 06) — it focuses purely on session state management and the create/resume endpoints.

**Two endpoints**, guarded by `@RequirePermissions(Permission.SIMULATION_ACCESS)`:

1. `POST /api/v1/simulations/sessions` — Create a new session
   - Body: `{ scenarioId: string, chosenCharacterId: string }`
   - Validates: scenario exists and is published, character belongs to scenario and is playable
   - Enforces: only 1 incomplete session (ACTIVE or PAUSED) per user — returns 409 Conflict if another exists
   - Creates `SimulationSession` with status `ACTIVE`
   - If scenario has an `openingMessage`, creates a `SimulationMessage` with that content (system message)
   - Returns: session data + opening message (if any)

2. `GET /api/v1/simulations/sessions/:id` — Get session with message history (for resume)
   - Returns session data + all `SimulationMessage` records ordered by `orderIndex`
   - Verifies the session belongs to `@CurrentUser()`
   - If session was PAUSED, transitions it back to ACTIVE

**Session state transitions**:
- Create → ACTIVE
- Leave screen (client calls a PATCH or the session is lazily detected as inactive) → PAUSED
- Resume (GET with PAUSED status) → ACTIVE
- Cancel (DELETE) → soft-delete, no result created
- Complete (triggered by AI, handled in issue 07) → COMPLETED

**Service layer** — `SimulationSessionService`:
- `createSession(userId, dto)` — with 1-session constraint
- `getSessionWithMessages(userId, sessionId)` — with resume logic
- `cancelSession(userId, sessionId)` — soft-delete

**Unit tests** for `SimulationSessionService`:
- Session creation happy path
- Reject second session when incomplete one exists (1-session constraint)
- Lifecycle transitions: ACTIVE → PAUSED → ACTIVE → COMPLETED
- Cancel: verify soft-delete, no result
- Authorization: reject if session doesn't belong to user

## Acceptance criteria

- [ ] `POST /sessions` creates a session with ACTIVE status and returns session + opening
- [ ] `POST /sessions` returns 409 if user already has an incomplete session
- [ ] `POST /sessions` validates that scenario is published and character is playable
- [ ] `GET /sessions/:id` returns session with full message history
- [ ] `GET /sessions/:id` transitions PAUSED → ACTIVE on resume
- [ ] `GET /sessions/:id` rejects if session belongs to a different user
- [ ] Cancel (DELETE) soft-deletes the session without creating a result
- [ ] Unit tests for `SimulationSessionService` pass
- [ ] `bun run typecheck` passes

## Blocked by

- [01 — Enums, entities, and module scaffold](./01-enums-entities-module-scaffold.md)
