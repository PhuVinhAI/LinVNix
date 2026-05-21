Status: done

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

- [x] `SimulationAiService` constructs prompts from scenario templates with all variables substituted
- [x] Learner progress data (level, native language) is injected into prompts via `ProgressService`
- [x] Conversation history is included as context for multi-turn conversations
- [x] AI responses are parsed into the typed response shape
- [x] Malformed AI responses are handled gracefully (retry or error, not crash)
- [x] Prompt template file `simulation-conversation.yaml` exists in `infrastructure/genai/prompts/`
- [x] Gemini JSON mode or response schema is used to enforce structured output
- [x] Unit tests cover prompt building, response parsing, and edge cases
- [x] `bun run typecheck` passes

## Blocked by

- [01 — Enums, entities, and module scaffold](./01-enums-entities-module-scaffold.md)

## Implementation notes

### Files created

- `backend/src/infrastructure/genai/prompts/simulation-conversation.yaml` — Prompt template with system instruction for simulation AI: scenario context, learner profile, character descriptions, turn orchestration rules, feedback rules, session end rules, scoring criteria, and JSON response format spec
- `backend/src/modules/simulations/application/simulation-ai.service.ts` — `SimulationAiService` with `processTurn()`, `buildSystemInstruction()`, `buildChatMessages()`, `parseAiResponse()`, `buildPromptContext()`; uses GenaiService.renderPrompt + chatStructured with Gemini JSON mode response schema; Zod validation for response parsing; exports typed interfaces (SimulationAiTurnRequest, SimulationAiTurnResponse, SimulationMessageFeedback, etc.)
- `backend/src/modules/simulations/application/simulation-ai.service.spec.ts` — 28 unit tests covering prompt construction (5), chat message building (4), response parsing (11), processTurn integration (5), buildPromptContext (3)

### Files modified

- `backend/src/modules/simulations/simulations.module.ts` — Added `SimulationAiService` to providers/exports; imported `forwardRef(() => UsersModule)` for learner data access
