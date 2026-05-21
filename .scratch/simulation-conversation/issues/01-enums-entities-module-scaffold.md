Status: ready-for-agent

# 01 — Enums, entities, and module scaffold

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Create the foundational data model and module wiring for the Simulation Conversation feature. This slice delivers all new enums, all six TypeORM entities, and a compilable `SimulationsModule` — but no controllers, services, or business logic yet.

**Enums** (in `common/enums/`):

- `Difficulty` — `EASY`, `MEDIUM`, `HARD`
- `SimulationSessionStatus` — `ACTIVE`, `PAUSED`, `COMPLETED`
- `SimulationEndReason` — `COMPLETED`, `TOO_MANY_ERRORS`, `INAPPROPRIATE`, `ABUSIVE`
- Add `SIMULATION_ACCESS = 'SIMULATION_ACCESS'` to the existing `Permission` enum and assign it to the USER role by default (same mechanism as existing permissions like `AI_CHAT`)

**Entities** (in `modules/simulations/domain/`), all extending `BaseEntity`:

- `ScenarioCategory` — name, description, icon, color, orderIndex
- `Scenario` — FK to category, title, description, systemPrompt, openingMessage (nullable), requiredLevel (enum UserLevel), difficulty (enum Difficulty), scoringCriteria (jsonb), maxTurns (nullable), estimatedMinutes, isPublished
- `ScenarioCharacter` — FK to scenario, name, role, personality, speechStyle, avatarKey (nullable), isPlayable, orderIndex
- `SimulationSession` — FK to user, FK to scenario, FK to chosenCharacter, status (enum), totalTokens
- `SimulationMessage` — FK to session, FK to speakerCharacter (nullable), isLearner, content, feedback (jsonb, nullable), orderIndex
- `SimulationResult` — FK to user, FK to session (unique), FK to scenario, FK to chosenCharacter, totalScore, criteriaScores (jsonb), endReason (enum), aiSummary, totalMessages

**Module** (`modules/simulations/simulations.module.ts`):

- Register all entities with TypeORM
- Export the module so it can be imported by `AppModule`

Follow the same layered directory structure as `conversations/`: `domain/`, `application/`, `presentation/`, `dto/`.

## Acceptance criteria

- [ ] Three new enum files exist in `common/enums/` and are re-exported from `common/enums/index.ts`
- [ ] `SIMULATION_ACCESS` is added to the existing `Permission` enum
- [ ] Six entity files exist in `modules/simulations/domain/` with correct column types, relations, and decorators
- [ ] `SimulationsModule` registers all entities and is imported by `AppModule`
- [ ] `bun run typecheck` passes with no errors
- [ ] `bun run build` compiles successfully
- [ ] With `synchronize: true`, the dev database creates all expected tables with correct columns and relations

## Blocked by

None — can start immediately
