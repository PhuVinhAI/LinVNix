Status: done

# 06 — Send message endpoint — learner message → AI response(s) with feedback

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement the core message exchange endpoint that accepts a learner's message, processes it through the AI, and returns AI character responses with inline feedback. This is the heart of the simulation conversation loop.

**One endpoint**, guarded by `@RequirePermissions(Permission.SIMULATION_ACCESS)`:

`POST /api/v1/simulations/sessions/:id/messages`
- Body: `{ content: string }`
- Validates: session exists, belongs to `@CurrentUser()`, status is ACTIVE
- Validates: it is the learner's turn (based on `nextTurnCharacterId` from last AI response or initial state)

**Processing flow**:
1. Persist the learner's message as a `SimulationMessage` (isLearner=true, speakerCharacterId=chosenCharacterId)
2. Reconstruct conversation context from stored `SimulationMessage` history
3. Call `SimulationAiService.processMessage()` with scenario, characters, history, and learner message
4. AI may return multiple character messages (when several AI characters speak in sequence before the learner's next turn) — persist all as `SimulationMessage` records
5. Store `feedback` (corrections + review) on the learner's `SimulationMessage` record
6. Update `totalTokens` on the session
7. Return the full response shape:

```typescript
{
  messages: Array<{ speakerCharacterId, speakerName, content }>;
  nextTurnCharacterId: string;
  feedback: { corrections: [...], review, reviewAvailable } | null;
  sessionEnded: boolean;
  endReason?: SimulationEndReason;
  result?: SimulationResult;
}
```

**Multi-character turns**: When the AI indicates that multiple characters should speak before returning to the learner, the backend makes multiple AI calls internally or processes a single AI response containing multiple character messages, then returns all messages in a single response array.

**Feedback**: The `feedback` field on learner messages includes:
- `corrections[]` with `startIndex`/`endIndex` for inline error highlighting on the learner's original message
- `review` — detailed AI commentary (null if no issues)
- `reviewAvailable` — boolean so the client knows whether to show the "Xem nhận xét" button

## Acceptance criteria

- [x] `POST /sessions/:id/messages` accepts learner message and returns AI responses
- [x] Learner message is persisted as `SimulationMessage` with correct metadata
- [x] AI character responses are persisted as `SimulationMessage` records with correct `speakerCharacterId`
- [x] Feedback with corrections (including `startIndex`/`endIndex`) is stored on the learner's message
- [x] `reviewAvailable` is `true` only when there is actual feedback to show
- [x] Multiple AI character messages are returned in correct order in a single response
- [x] Session `totalTokens` is updated after each AI call
- [x] Endpoint rejects requests when session is not ACTIVE or doesn't belong to the user
- [x] Endpoint rejects requests when it's not the learner's turn
- [x] `bun run typecheck` passes

## Blocked by

- [04 — Session lifecycle](./04-session-lifecycle.md)
- [05 — SimulationAiService](./05-simulation-ai-service.md)

## Implementation notes

**Test results**: 36/36 unit tests pass. Full suite: 655 tests, 44 suites — all pass.

**Check order**: lint (0 errors, warnings only) → typecheck ✅ → test ✅

### Files created

- `backend/src/modules/simulations/dto/send-message.dto.ts` — DTO for `POST /sessions/:id/messages` with `content` string field (min length 1)
- `backend/src/modules/simulations/application/repositories/simulation-results.repository.ts` — Repository for `SimulationResult` entity with `create()` method for persisting results on session completion

### Files modified

- `backend/src/modules/simulations/domain/simulation-session.entity.ts` — Added `nextTurnCharacterId` column for turn tracking; initially set to `chosenCharacterId` when session is created
- `backend/src/modules/simulations/application/simulation-session.service.ts` — Added `sendMessage(userId, sessionId, content)` method implementing full message exchange flow: validates session ownership/status/turn, persists learner message, calls `SimulationAiService.processTurn()`, persists AI character responses, stores feedback on learner message, updates `nextTurnCharacterId` and `totalTokens`, handles session completion (creates `SimulationResult` when `sessionEnded=true`); added `SendMessageResult` interface for response shape; injected `SimulationResultsRepository` and `SimulationAiService` as dependencies; updated `createSession` to set `nextTurnCharacterId` on creation
- `backend/src/modules/simulations/application/simulation-session.service.spec.ts` — Rewrote test suite with full mock setup including `SimulationResultsRepository` and `SimulationAiService`; added 19 new `sendMessage` tests covering all acceptance criteria: session validation (not found, wrong user, not ACTIVE, not learner turn), learner message persistence, AI response persistence, multi-character message ordering, feedback storage, `reviewAvailable` logic, `totalTokens` update, `nextTurnCharacterId` update, session completion with `SimulationResult` creation
- `backend/src/modules/simulations/application/repositories/simulation-sessions.repository.ts` — Added `findById()`, `updateNextTurnCharacterId()`, `incrementTokens()` methods; updated `create()` signature to accept `nextTurnCharacterId`
- `backend/src/modules/simulations/application/repositories/simulation-messages.repository.ts` — Added `findBySessionId()` for querying messages by session, `updateFeedback()` for storing AI feedback on learner messages
- `backend/src/modules/simulations/presentation/simulations.controller.ts` — Added `POST /sessions/:id/messages` endpoint with `@RequirePermissions(Permission.SIMULATION_ACCESS)`, Swagger docs, and `SendMessageDto` body validation
- `backend/src/modules/simulations/simulations.module.ts` — Registered `SimulationResultsRepository` as provider

### Files deleted

None
