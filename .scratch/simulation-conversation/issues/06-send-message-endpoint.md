Status: ready-for-agent

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

- [ ] `POST /sessions/:id/messages` accepts learner message and returns AI responses
- [ ] Learner message is persisted as `SimulationMessage` with correct metadata
- [ ] AI character responses are persisted as `SimulationMessage` records with correct `speakerCharacterId`
- [ ] Feedback with corrections (including `startIndex`/`endIndex`) is stored on the learner's message
- [ ] `reviewAvailable` is `true` only when there is actual feedback to show
- [ ] Multiple AI character messages are returned in correct order in a single response
- [ ] Session `totalTokens` is updated after each AI call
- [ ] Endpoint rejects requests when session is not ACTIVE or doesn't belong to the user
- [ ] Endpoint rejects requests when it's not the learner's turn
- [ ] `bun run typecheck` passes

## Blocked by

- [04 — Session lifecycle](./04-session-lifecycle.md)
- [05 — SimulationAiService](./05-simulation-ai-service.md)
