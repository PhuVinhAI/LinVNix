Status: completed

# 10 — Integration tests — seed data verification

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Implement integration tests that verify the seed data is correctly populated with proper relationships and data integrity. Follow the existing integration test patterns in `backend/scripts/test/suites/` — these are custom bun scripts, NOT jest tests.

**Test cases**:

1. **Categories created correctly**:
   - Verify exactly 6 categories exist
   - Verify each has a name, description, icon, color, and orderIndex
   - Verify ordering is correct

2. **Scenarios created correctly**:
   - Verify ~15 scenarios exist
   - Each scenario has a valid `categoryId` pointing to an existing category
   - Each has `title`, `description`, `systemPrompt`, `requiredLevel`, `difficulty`, `estimatedMinutes`
   - `requiredLevel` values are valid `UserLevel` enum values (A1–B2)
   - `difficulty` values are valid `Difficulty` enum values

3. **Characters created correctly**:
   - Each scenario has at least 2 characters
   - Each character has `name`, `role`, `personality`, `speechStyle`
   - At least one character per scenario has `isPlayable = true`
   - Characters have sequential `orderIndex` values

4. **Scoring criteria integrity**:
   - Each scenario's `scoringCriteria` is a valid JSON array
   - Each criterion has `name`, `description`, and `weight` (number)
   - **Weights sum to exactly 100** for each scenario

5. **System prompt template validity**:
   - Each scenario's `systemPrompt` contains expected Handlebars variables
   - Template is non-empty and meaningful

**Test script**: `backend/scripts/test/suites/simulations-seed.test.ts`

Run via: `bun run test:integration:simulations-seed`

Note: Integration tests require `db:up` (postgres running) and seed data to have been run first.

## Acceptance criteria

- [x] Integration test script exists at `backend/scripts/test/suites/simulations-seed.test.ts`
- [x] Script entry added to `backend/package.json` as `test:integration:simulations-seed`
- [x] Test verifies exactly 6 categories with correct data (name, description, icon, color, orderIndex, hex color format, ordering)
- [x] Test verifies ~15 scenarios with valid relationships and enum values (categoryId FK, requiredLevel ∈ UserLevel, difficulty ∈ Difficulty, all required fields present)
- [x] Test verifies each scenario has ≥2 characters with at least one playable (plus name, role, personality, speechStyle, sequential orderIndex)
- [x] Test verifies scoring criteria weights sum to 100 for every scenario (plus valid array, each criterion has name/description/weight, 3-5 criteria per scenario)
- [x] Test verifies system prompt templates contain expected variables (core: learner.level, learner.nativeLanguage, scenario.title, scenario.description; NPC: npc.name/role/personality/speechStyle, playable.name; group: characters[0].name/role)
- [x] `bun run test:integration:simulations-seed` passes after running seed

## Blocked by

- [03 — Seed data](./03-seed-data.md)

## Implementation notes

### Files created

- *None* (test file already existed from issue #03)

### Files modified

1. **[simulations-seed.test.ts](file:///c:/Users/tomis/Docs/LinVNix/backend/scripts/test/suites/simulations-seed.test.ts)**:
   - Expanded from 2 tests (basic count check + idempotency) to 19 tests across 6 describe blocks.
   - **Categories created correctly** (4 tests): exact count (6), all required fields present (name/description/icon/color/orderIndex), correct ordering by orderIndex 1-6 with expected names, valid hex color format.
   - **Scenarios created correctly** (7 tests): exact count (15), valid categoryId FK references, all required fields present (title/description/systemPrompt/requiredLevel/difficulty/estimatedMinutes), valid UserLevel enum values (A1-C2), valid Difficulty enum values (EASY/MEDIUM/HARD), all published, openingMessage present.
   - **Characters created correctly** (4 tests): ≥2 characters per scenario, ≥1 playable per scenario, each character has name/role/personality/speechStyle, sequential orderIndex values within each scenario.
   - **Scoring criteria integrity** (4 tests): valid JSON array, each criterion has name/description/weight, weights sum to exactly 100, 3-5 criteria per scenario.
   - **System prompt template validity** (4 tests): non-empty meaningful content (>50 chars), core Handlebars variables present (learner.level, learner.nativeLanguage, scenario.title, scenario.description), NPC variables for non-group scenarios (npc.name/role/personality/speechStyle, playable.name), group scenario variables (characters[0].name/role).
   - **Idempotency** (1 test): running seed twice produces identical category/scenario/character counts.
   - Added helper functions `assertString` and `assertNumber` for field-level validation with descriptive error messages.
   - Imports `UserLevel` and `Difficulty` enums for enum value validation.

### Files deleted

- *None*
