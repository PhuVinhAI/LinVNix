Status: ready-for-agent

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

- [ ] When AI returns `sessionEnded: true`, session status transitions to `COMPLETED`
- [ ] A `SimulationResult` is created with correct `totalScore`, `criteriaScores`, `endReason`, and `aiSummary`
- [ ] `criteriaScores` align with the scenario's `scoringCriteria` definitions
- [ ] `totalMessages` correctly counts all messages in the session
- [ ] `maxTurns` safety net triggers forced completion when reached
- [ ] `TOO_MANY_ERRORS` end reason produces appropriate AI feedback suggesting the learner study more
- [ ] `INAPPROPRIATE`/`ABUSIVE` end reasons produce appropriate AI feedback
- [ ] Unique constraint on `SimulationResult.sessionId` prevents duplicate results
- [ ] The result is included in the message endpoint response when `sessionEnded: true`
- [ ] `bun run typecheck` passes

## Blocked by

- [06 — Send message endpoint](./06-send-message-endpoint.md)
