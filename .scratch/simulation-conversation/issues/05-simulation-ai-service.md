Status: ready-for-agent

# 05 — SimulationAiService — prompt construction, response parsing, turn orchestration

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement the AI integration service that handles prompt construction, structured response parsing, and turn orchestration for simulation conversations. This service is the brain of the simulation feature — it talks to Gemini via the existing `GenaiService` and returns typed, structured responses.

**SimulationAiService** (in `modules/simulations/application/`):

1. **Prompt construction** — Render the scenario's `systemPrompt` template by substituting Handlebars-style variables:
   - `{{learner.level}}`, `{{learner.nativeLanguage}}` — from user profile/progress
   - `{{characters[0].name}}`, `{{characters[0].role}}`, etc. — from scenario characters
   - `{{chosenCharacter.name}}` — the learner's chosen character
   - Inject `ProgressService` to read the learner's current level and progress data
   - Append conversation history as context for subsequent turns

2. **Structured response parsing** — AI must return JSON matching this shape:
   ```typescript
   {
     messages: Array<{ speakerCharacterId: string; speakerName: string; content: string }>;
     nextTurnCharacterId: string;
     feedback: {
       corrections: Array<{ original: string; corrected: string; type: 'spelling' | 'grammar'; severity: 'error' | 'warning'; startIndex: number; endIndex: number }>;
       review: string | null;
       reviewAvailable: boolean;
     } | null;
     sessionEnded: boolean;
     endReason?: SimulationEndReason;
     totalScore?: number;
     criteriaScores?: Array<{ name: string; score: number; maxScore: number; comment: string }>;
     aiSummary?: string;
   }
   ```
   - Use Gemini's `responseMimeType: "application/json"` with a response schema to enforce structure
   - Handle malformed responses gracefully (retry or return error)

3. **Turn orchestration** — Determine which character speaks next based on conversation flow. The AI decides turn order (not rigid round-robin), producing one or more character messages per call.

4. **Prompt template** — Create `simulation-conversation.yaml` in `infrastructure/genai/prompts/` defining the system prompt structure, response schema expectations, and turn orchestration rules.

**Dependencies**: Reuses existing `GenaiService` for Gemini API calls. Injects `ProgressService` for learner context.

**Unit tests**:
- Prompt building: given scenario + characters + learner progress → verify constructed prompt contains correct data
- Response parsing: given raw AI JSON → verify correctly parsed into typed response
- Turn orchestration: given conversation history → verify correct next turn decisions
- Edge cases: malformed AI response, missing fields, empty corrections array

## Acceptance criteria

- [ ] `SimulationAiService` constructs prompts from scenario templates with all variables substituted
- [ ] Learner progress data (level, native language) is injected into prompts via `ProgressService`
- [ ] Conversation history is included as context for multi-turn conversations
- [ ] AI responses are parsed into the typed response shape
- [ ] Malformed AI responses are handled gracefully (retry or error, not crash)
- [ ] Prompt template file `simulation-conversation.yaml` exists in `infrastructure/genai/prompts/`
- [ ] Gemini JSON mode or response schema is used to enforce structured output
- [ ] Unit tests cover prompt building, response parsing, and edge cases
- [ ] `bun run typecheck` passes

## Blocked by

- [01 — Enums, entities, and module scaffold](./01-enums-entities-module-scaffold.md)
