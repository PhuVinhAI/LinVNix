Status: done

# 08 — Results API — list results, result detail, replay

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement the results endpoints that let learners view their simulation history, track improvement over time, and replay scenarios. Also expose basic simulation statistics for the profile screen.

**Two endpoints**, guarded by `@RequirePermissions(Permission.SIMULATION_ACCESS)`:

1. `GET /api/v1/simulations/results` — List the current user's simulation results
   - Optional filter: `scenarioId` (uuid) — to view history for a specific scenario
   - Ordered by `createdAt` descending (most recent first)
   - Includes: `id`, `totalScore`, `endReason`, `createdAt`, scenario title, chosen character name
   - Scoped to `@CurrentUser()` — users can only see their own results

2. `GET /api/v1/simulations/results/:id` — Result detail
   - Full result data: `totalScore`, `criteriaScores`, `endReason`, `aiSummary`, `totalMessages`
   - Includes scenario and character info for context
   - Scoped to `@CurrentUser()`

**Replay support**: Replaying a scenario is simply creating a new session via `POST /sessions` with the same `scenarioId` and `chosenCharacterId`. No additional endpoint needed — the client calls the existing create session endpoint. The results list with `scenarioId` filter lets the learner compare scores across attempts.

**Profile statistics** (can be a separate endpoint or included in user profile response):
- Scenarios attempted (distinct `scenarioId` count from results)
- Average score (average `totalScore` across all results)
- This can be exposed as `GET /api/v1/simulations/stats` or as part of the results list response metadata.

## Acceptance criteria

- [x] `GET /results` returns the current user's results ordered by most recent first
- [x] `GET /results?scenarioId=X` correctly filters results for a specific scenario
- [x] `GET /results/:id` returns full result detail with criteria scores and AI summary
- [x] Both endpoints are scoped to the current user (cannot view other users' results)
- [x] Simulation statistics (scenarios attempted, average score) are available
- [x] Replay is supported by creating a new session for the same scenario (no new endpoint needed)
- [x] All responses wrapped in `{ data: T }` by the existing `TransformInterceptor`
- [x] `bun run typecheck` passes

## Blocked by

- [07 — Session completion and results](./07-session-completion-and-results.md)

## Implementation notes

### Files created

- `backend/src/modules/simulations/dto/list-results.dto.ts` — DTO with optional `scenarioId` filter param
- `backend/src/modules/simulations/application/simulation-results.service.ts` — Service with `listResults`, `getResultDetail`, `getStats` methods; user scoping and NotFound/Forbidden checks
- `backend/src/modules/simulations/application/simulation-results.service.spec.ts` — 10 unit tests covering all AC behaviors

### Files modified

- `backend/src/modules/simulations/application/repositories/simulation-results.repository.ts` — Added `findByUserId` (with optional scenarioId filter), `findById` (with relations), `getUserStats` (aggregate query using QueryBuilder)
- `backend/src/modules/simulations/presentation/simulations.controller.ts` — Added 3 endpoints: `GET results`, `GET results/:id`, `GET stats`; injected `SimulationResultsService`
- `backend/src/modules/simulations/simulations.module.ts` — Registered `SimulationResultsService` as provider

### Files deleted

(none)
