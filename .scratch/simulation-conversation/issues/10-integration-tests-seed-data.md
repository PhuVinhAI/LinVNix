Status: ready-for-agent

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

**Test script**: `backend/scripts/test/suites/simulation-seed.ts`

Run via: `bun run test:integration:simulation-seed` (add script to `package.json`)

Note: Integration tests require `db:up` (postgres running) and seed data to have been run first.

## Acceptance criteria

- [ ] Integration test script exists at `backend/scripts/test/suites/simulation-seed.ts`
- [ ] Script entry added to `backend/package.json` as `test:integration:simulation-seed`
- [ ] Test verifies exactly 6 categories with correct data
- [ ] Test verifies ~15 scenarios with valid relationships and enum values
- [ ] Test verifies each scenario has ≥2 characters with at least one playable
- [ ] Test verifies scoring criteria weights sum to 100 for every scenario
- [ ] Test verifies system prompt templates contain expected variables
- [ ] `bun run test:integration:simulation-seed` passes after running seed

## Blocked by

- [03 — Seed data](./03-seed-data.md)
