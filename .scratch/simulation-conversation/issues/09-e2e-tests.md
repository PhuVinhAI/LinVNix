Status: ready-for-agent

# 09 — E2E tests — full API flow

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement end-to-end tests that verify the complete simulation conversation API flow through HTTP requests against a running application with a real database. Follow the existing e2e test patterns in `backend/test/` using jest with `test/jest-e2e.json`.

**Test scenarios**:

1. **Happy path — full simulation flow**:
   - List categories → list scenarios with filters → get scenario detail
   - Create session → verify opening message
   - Send messages → receive AI responses with feedback
   - Session completes → get result with scores
   - Verify result appears in results list

2. **1-session constraint**:
   - Create a session → attempt to create a second session → verify 409 Conflict
   - Complete or cancel the first session → verify a new session can be created

3. **Pause/resume flow**:
   - Create session → send a message → pause (or GET session while PAUSED) → verify resume with full message history

4. **Permission guard**:
   - Attempt all endpoints without authentication → verify 401
   - Attempt with a user lacking `SIMULATION_ACCESS` → verify 403

5. **Validation**:
   - Create session with non-existent scenario → verify 404
   - Create session with non-playable character → verify 400
   - Send message to completed session → verify 400
   - Send message to another user's session → verify 403

**Test file**: `backend/test/simulations.e2e-spec.ts`

Note: E2E tests require `db:up` (postgres + redis running). The AI service may need to be mocked at the HTTP level or use a test double to avoid real Gemini API calls.

## Acceptance criteria

- [ ] E2E test file exists at `backend/test/simulations.e2e-spec.ts`
- [ ] Full happy-path flow test passes (browse → create → message → complete → results)
- [ ] 1-session constraint is verified via API
- [ ] Pause/resume flow is verified via API
- [ ] Permission guard tests pass (401 and 403 cases)
- [ ] Validation error cases are tested (404, 400, 403)
- [ ] Tests follow existing e2e patterns in the project
- [ ] `bun run test:e2e` passes with all simulation tests

## Blocked by

- [06 — Send message endpoint](./06-send-message-endpoint.md)
- [07 — Session completion and results](./07-session-completion-and-results.md)
