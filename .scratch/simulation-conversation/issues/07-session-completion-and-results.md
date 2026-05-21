Status: done

# 07 — Session completion — AI-triggered end, SimulationResult, end reasons

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement the session completion flow that creates a `SimulationResult` when the AI decides to end the conversation. The AI triggers completion for one of four reasons, and the system records detailed scoring and feedback.

**Completion triggers** (detected from `SimulationAiService` response):

1. `COMPLETED` — conversation topic naturally concluded (AI determines the scenario goal has been met)
2. `TOO_MANY_ERRORS` — learner is making too many errors, AI recommends studying more
3. `INAPPROPRIATE` — learner used inappropriate language
4. `ABUSIVE` — learner used abusive language

**When `sessionEnded: true` is returned from AI**:

1. Transition `SimulationSession.status` → `COMPLETED`
2. Create a `SimulationResult` with:
   - `totalScore` (0-100) — from AI scoring
   - `criteriaScores` (jsonb) — per-criteria breakdown: `[{ name, score, maxScore, comment }]`, aligned with the scenario's `scoringCriteria`
   - `endReason` — the enum value
   - `aiSummary` — overall AI commentary on the learner's performance
   - `totalMessages` — count of messages in the session
3. Return the result in the message endpoint response (when `sessionEnded: true`)

**Edge cases**:
- `maxTurns` safety net: if the session reaches `scenario.maxTurns`, force-trigger completion via AI with a "wrap up" instruction
- Completion for `INAPPROPRIATE`/`ABUSIVE` may have lower/zero scores with specific feedback
- The `SimulationResult.sessionId` has a unique constraint — one result per session

**Integration with issue 06**: This logic is triggered within the `POST /sessions/:id/messages` flow when the AI response indicates `sessionEnded: true`. The send-message endpoint already returns `result` in its response shape.

## Acceptance criteria

- [x] When AI returns `sessionEnded: true`, session status transitions to `COMPLETED`
- [x] A `SimulationResult` is created with correct `totalScore`, `criteriaScores`, `endReason`, and `aiSummary`
- [x] `criteriaScores` align with the scenario's `scoringCriteria` definitions
- [x] `totalMessages` correctly counts all messages in the session
- [x] `maxTurns` safety net triggers forced completion when reached
- [x] `TOO_MANY_ERRORS` end reason produces appropriate AI feedback suggesting the learner study more
- [x] `INAPPROPRIATE`/`ABUSIVE` end reasons produce appropriate AI feedback
- [x] Unique constraint on `SimulationResult.sessionId` prevents duplicate results
- [x] The result is included in the message endpoint response when `sessionEnded: true`
- [x] `bun run typecheck` passes

## Blocked by

- [06 — Send message endpoint](./06-send-message-endpoint.md)

## Implementation notes

### Files modified

- `backend/src/modules/simulations/application/simulation-session.service.ts` — Added `alignCriteriaScores()` function to normalize criteria scores against scenario scoring criteria; added learner message count check with `forceWrapUp` flag passed to AI when `maxTurns` is reached; uses `alignCriteriaScores()` when creating SimulationResult to ensure criteria names match
- `backend/src/modules/simulations/application/simulation-ai.service.ts` — Added `forceWrapUp?: boolean` to `SimulationAiTurnRequest` interface; passed `forceWrapUp` through `processTurn()` to `buildSystemInstruction()`; added `forceWrapUp` parameter to `buildSystemInstruction()` with `forceWrapUpInstruction` and `maxTurns` template variables
- `backend/src/infrastructure/genai/prompts/simulation-conversation.yaml` — Added `{{maxTurns}}` and `{{forceWrapUpInstruction}}` template variables in new "Turn limit" section; enhanced session end rules with specific guidance per end reason (TOO_MANY_ERRORS suggests studying more, INAPPROPRIATE explains why language was inappropriate, ABUSIVE states zero tolerance)
- `backend/src/modules/simulations/application/simulation-session.service.spec.ts` — Added 8 new tests: `forceWrapUp=true` when learner reaches maxTurns, no forceWrapUp below maxTurns, no forceWrapUp when maxTurns is null, criteriaScores alignment with missing criteria filled with zeros, default criteriaScores when AI returns empty array, TOO_MANY_ERRORS end reason creates correct result, INAPPROPRIATE end reason creates correct result, ABUSIVE end reason creates correct result
- `backend/src/modules/simulations/application/simulation-ai.service.spec.ts` — Added 6 new tests: maxTurns in prompt variables, "unlimited" when maxTurns is null, forceWrapUpInstruction when forceWrapUp is true, empty forceWrapUpInstruction when false, empty when not provided, processTurn passes forceWrapUp through to buildSystemInstruction

### Files created

(none)

### Files deleted

(none)

### Test results

669 tests passing across 44 suites. lint: 0 errors. typecheck: passes.
