Status: completed

# 03 — Seed data — categories, scenarios, characters, scoring criteria

## Parent

[PRD: Hội thoại mô phỏng](../PRD.md)

## What to build

Create a seeder that populates the database with a complete set of simulation scenarios so the feature is immediately usable after deployment. The seed data defines the content learners will interact with.

**6 Danh mục tình huống (ScenarioCategory)**:
- Mua sắm (Shopping)
- Ăn uống (Food & Dining)
- Di chuyển (Transportation)
- Y tế (Healthcare)
- Công việc (Work)
- Đời sống (Daily Life)

**~15 Tình huống (Scenario)** — 2-3 per category, spanning levels A1 through B2:
- Each with a descriptive `title` and `description` in Vietnamese
- Each with a `systemPrompt` template using Handlebars-style variables (`{{learner.level}}`, `{{learner.nativeLanguage}}`, `{{characters[0].name}}`, etc.)
- Optional `openingMessage` for context-setting
- 3-5 `scoringCriteria` entries per scenario with `{ name, description, weight }` where weights sum to 100
- `estimatedMinutes`, `difficulty`, `requiredLevel` set appropriately
- `maxTurns` safety net where appropriate

**Nhân vật (ScenarioCharacter)** — 2-3 per scenario:
- Vietnamese-appropriate names (e.g. Chị Lan, Anh Minh, Cô Hoa)
- Realistic role descriptions (e.g. "Người bán rau", "Bác sĩ khoa nội")
- Distinct `personality` and `speechStyle` traits that produce varied AI responses
- At least one `isPlayable` character per scenario
- Ordered by `orderIndex`

**Seeder implementation** — a NestJS CLI command or seed script that:
- Is idempotent (can be run multiple times safely)
- Uses `upsert` or check-before-insert pattern
- Runs against the existing TypeORM connection

## Acceptance criteria

- [x] Seed command/script exists and can be run from `backend/`
- [x] 6 categories created with correct names, icons, colors, and ordering
- [x] ~15 scenarios created spanning A1–B2 with correct category relationships
- [x] Each scenario has 2-3 characters with Vietnamese-appropriate names and distinct personalities
- [x] Each scenario has 3-5 scoring criteria with weights summing to exactly 100
- [x] Each scenario has a `systemPrompt` template with Handlebars variables
- [x] At least one `isPlayable` character exists per scenario
- [x] Seed is idempotent — running twice does not create duplicates
- [x] `bun run typecheck` passes

## Blocked by

- [01 — Enums, entities, and module scaffold](./01-enums-entities-module-scaffold.md)

## Implementation notes

### Files created

1. **[seed-simulations.ts](file:///c:/Users/tomis/Docs/LinVNix/backend/scripts/seed-simulations.ts)**:
   - Database seeder script that bootstraps NestJS and leverages TypeORM repositories.
   - Populates the database with **6 categories** and **exactly 15 scenarios** (spanning CEFR levels A1-B2 and difficulties Easy-Hard).
   - Seeds **2 characters** per scenario (exactly 1 playable + 1 AI NPC).
   - Configures **3-5 scoring criteria** per scenario whose weights sum to exactly 100.
   - Uses transactional checking/saving and character recreation to guarantee complete idempotency.

2. **[simulations-seed.test.ts](file:///c:/Users/tomis/Docs/LinVNix/backend/scripts/test/suites/simulations-seed.test.ts)**:
   - Live integration test suite connecting to the actual Postgres database.
   - Asserts exact scenario counts (15), category counts (6), character counts (30), and playable character constraints.
   - Verifies scoring criteria properties and checks that all weights sum to exactly 100.
   - Asserts seeder idempotency by running the seed function twice and verifying record counts do not duplicate.

### Files modified

1. **[package.json](file:///c:/Users/tomis/Docs/LinVNix/backend/package.json)**:
   - Registered the seeder script under `seed:simulations` command.
   - Registered the integration test runner under `test:integration:simulations-seed` command.

### Files deleted

- *None*
