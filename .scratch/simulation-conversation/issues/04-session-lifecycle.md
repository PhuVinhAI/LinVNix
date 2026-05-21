Status: done

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

- [x] `POST /sessions` creates a session with ACTIVE status and returns session + opening
- [x] `POST /sessions` returns 409 if user already has an incomplete session
- [x] `POST /sessions` validates that scenario is published and character is playable
- [x] `GET /sessions/:id` returns session with full message history
- [x] `GET /sessions/:id` transitions PAUSED → ACTIVE on resume
- [x] `GET /sessions/:id` rejects if session belongs to a different user
- [x] Cancel (DELETE) soft-deletes the session without creating a result
- [x] Unit tests for `SimulationSessionService` pass
- [x] `bun run typecheck` passes

## Blocked by

- [01 — Enums, entities, and module scaffold](./01-enums-entities-module-scaffold.md)

## Implementation notes

**Test results**: 17/17 unit tests pass. Full suite: 608 tests, 43 suites — all pass.

**Check order**: lint (0 errors, warnings only) → typecheck ✅ → test ✅

### Files created

- `backend/src/modules/simulations/application/simulation-session.service.ts` — Core service with `createSession`, `getSessionWithMessages`, `cancelSession`. Validates scenario/character, enforces 1-session constraint, handles PAUSED→ACTIVE transition on resume, soft-deletes on cancel without creating result.
- `backend/src/modules/simulations/application/simulation-session.service.spec.ts` — 17 unit tests covering all acceptance criteria: creation happy path, opening message, 409 conflict, scenario/character validation, resume transition, authorization, cancel soft-delete.
- `backend/src/modules/simulations/application/repositories/simulation-sessions.repository.ts` — TypeORM repository with `findIncompleteByUser` (checks ACTIVE|PAUSED), `create`, `findByIdWithMessages`, `updateStatus`, `softDelete`.
- `backend/src/modules/simulations/application/repositories/simulation-messages.repository.ts` — TypeORM repository with `create` method for persisting messages.
- `backend/src/modules/simulations/dto/create-session.dto.ts` — DTO for `POST /sessions` with `scenarioId` and `chosenCharacterId` UUID validation.

### Files modified

- `backend/src/modules/simulations/presentation/simulations.controller.ts` — Added `POST /sessions`, `GET /sessions/:id`, `DELETE /sessions/:id` endpoints with full Swagger documentation and `@CurrentUser()` injection.
- `backend/src/modules/simulations/simulations.module.ts` — Registered `SimulationSessionService`, `SimulationSessionsRepository`, `SimulationMessagesRepository` as providers; exported `SimulationSessionService`.
