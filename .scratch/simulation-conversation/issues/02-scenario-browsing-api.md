Status: ready-for-agent

# 02 — Scenario browsing API — categories, list, detail

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement the read-only browsing endpoints that let learners discover scenario categories, filter scenarios, and view scenario details with character information. This is the "catalog" part of the simulation feature.

**Three endpoints**, all guarded by `@RequirePermissions(Permission.SIMULATION_ACCESS)`:

1. `GET /api/v1/simulations/categories` — List all scenario categories, ordered by `orderIndex`. Response includes `id`, `name`, `description`, `icon`, `color`.

2. `GET /api/v1/simulations/scenarios` — List published scenarios with optional filters:
   - `categoryId` (uuid) — filter by category
   - `level` (UserLevel enum) — filter by `requiredLevel`
   - `difficulty` (Difficulty enum) — filter by difficulty
   - Response includes: `id`, `title`, `description`, `requiredLevel`, `difficulty`, `estimatedMinutes`, character count, category info

3. `GET /api/v1/simulations/scenarios/:id` — Scenario detail with:
   - Full scenario data including `scoringCriteria`
   - All characters for the scenario (with `isPlayable` flag so the client can filter the selection list)
   - Characters ordered by `orderIndex`

**Service layer** — `ScenariosService` with query methods and proper DTO validation for filter params.

**Unit tests** — Test query/filter logic, detail retrieval, exclusion of unpublished scenarios.

## Acceptance criteria

- [ ] `GET /categories` returns all categories ordered by `orderIndex`
- [ ] `GET /scenarios` returns only published scenarios
- [ ] `GET /scenarios?categoryId=X` correctly filters by category
- [ ] `GET /scenarios?level=A1` correctly filters by required level
- [ ] `GET /scenarios?difficulty=EASY` correctly filters by difficulty
- [ ] Filters can be combined (e.g. `?categoryId=X&level=A1&difficulty=EASY`)
- [ ] `GET /scenarios/:id` returns scenario with all characters ordered by `orderIndex`
- [ ] All endpoints are guarded by `SIMULATION_ACCESS` permission
- [ ] All responses wrapped in `{ data: T }` by the existing `TransformInterceptor`
- [ ] Unit tests for `ScenariosService` pass
- [ ] `bun run typecheck` passes

## Blocked by

- [01 — Enums, entities, and module scaffold](./01-enums-entities-module-scaffold.md)
