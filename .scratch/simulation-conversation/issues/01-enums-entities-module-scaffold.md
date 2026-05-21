Status: done

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

- [x] Three new enum files exist in `common/enums/` and are re-exported from `common/enums/index.ts`
- [x] `SIMULATION_ACCESS` is added to the existing `Permission` enum
- [x] Six entity files exist in `modules/simulations/domain/` with correct column types, relations, and decorators
- [x] `SimulationsModule` registers all entities and is imported by `AppModule`
- [x] `bun run typecheck` passes with no errors
- [x] `bun run build` compiles successfully
- [x] With `synchronize: true`, the dev database creates all expected tables with correct columns and relations

## Blocked by

None — can start immediately

## Implementation notes

### Files created

- `backend/src/common/enums/difficulty.enum.ts` — New `Difficulty` enum (`EASY`, `MEDIUM`, `HARD`)
- `backend/src/common/enums/simulation-session-status.enum.ts` — New `SimulationSessionStatus` enum (`ACTIVE`, `PAUSED`, `COMPLETED`)
- `backend/src/common/enums/simulation-end-reason.enum.ts` — New `SimulationEndReason` enum (`COMPLETED`, `TOO_MANY_ERRORS`, `INAPPROPRIATE`, `ABUSIVE`)
- `backend/src/modules/simulations/domain/scenario-category.entity.ts` — `ScenarioCategory` entity with name, description, icon, color, orderIndex columns
- `backend/src/modules/simulations/domain/scenario.entity.ts` — `Scenario` entity with FK to category, all content fields, jsonb `scoringCriteria`, enums for level/difficulty
- `backend/src/modules/simulations/domain/scenario-character.entity.ts` — `ScenarioCharacter` entity with FK to scenario, personality/speechStyle, nullable avatarKey, isPlayable flag
- `backend/src/modules/simulations/domain/simulation-session.entity.ts` — `SimulationSession` entity with FK to user/scenario/chosenCharacter, status enum, token tracking
- `backend/src/modules/simulations/domain/simulation-message.entity.ts` — `SimulationMessage` entity with jsonb feedback (corrections with startIndex/endIndex for inline highlighting)
- `backend/src/modules/simulations/domain/simulation-result.entity.ts` — `SimulationResult` entity with unique index on sessionId, jsonb criteriaScores, endReason enum
- `backend/src/modules/simulations/simulations.module.ts` — `SimulationsModule` registering all 6 entities via `TypeOrmModule.forFeature`
- `backend/src/modules/simulations/application/.gitkeep` — Placeholder for application layer (services added in next slices)
- `backend/src/modules/simulations/presentation/.gitkeep` — Placeholder for presentation layer (controllers added in next slices)
- `backend/src/modules/simulations/dto/.gitkeep` — Placeholder for DTO layer (DTOs added in next slices)

### Files modified

- `backend/src/common/enums/permission.enum.ts` — Added `SIMULATION_ACCESS = 'SIMULATION_ACCESS'` to the `Permission` enum
- `backend/src/common/enums/index.ts` — Re-exported three new simulation enums
- `backend/src/modules/auth/application/rbac.service.ts` — Registered `SIMULATION_ACCESS` permission in seed definitions and added it to USER role default permissions
- `backend/src/app.module.ts` — Imported `SimulationsModule` and added it to the `imports` array

### Files deleted

None
