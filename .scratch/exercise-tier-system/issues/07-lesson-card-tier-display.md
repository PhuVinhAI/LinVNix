Status: `done`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Show tier achievement and progress on lesson list cards so users see their status at a glance.

Backend: Add `tierSummary` field to each lesson in `GET /lessons/module/:moduleId` response. Shape: `{currentTier: ExerciseTier, unlockedTiers: ExerciseTier[], tiers: Array<{tier: ExerciseTier, status: 'completed'|'in_progress'|'locked', percentCorrect: number}>}`. Computed by TierProgressService.

Mobile: Lesson list card (`_LessonCard` in module_detail_screen) shows a colored border corresponding to the highest unlocked tier. Below the card title, a compact tier timeline: "Basic ✓ · Easy 80% · 🔒🔒🔒" where each tier shows ✓ (completed), % (in progress), 🔒 (locked). Information only — no tap-to-navigate shortcut on tier badges.

## Acceptance criteria

- [x] GET /lessons/module/:moduleId includes tierSummary per lesson
- [x] tierSummary computed correctly by TierProgressService
- [x] Mobile lesson card shows colored border matching highest unlocked tier
- [x] Compact tier timeline below card title with ✓ / % / 🔒 per tier
- [x] Tier badges are informational only (no tap navigation)
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/02-tier-progress-unlock.md`

## Implementation notes

### Files created

None (all changes to existing files)

### Files modified

- `backend/src/modules/exercises/application/tier-progress.service.ts` — Added `TierSummaryItem` and `TierSummary` interfaces, added `getCompactTierSummary(lessonId, userId)` method that transforms `LessonTierSummary` into compact format with `currentTier`, `unlockedTiers`, and `tiers` array (each tier with status: completed/in_progress/locked + percentCorrect)
- `backend/src/modules/exercises/application/tier-progress.service.spec.ts` — Added 3 tests for `getCompactTierSummary`: completed BASIC unlocks EASY, in_progress for partial attempt, handles lesson with no exercise sets. Fixed pre-existing lint error (unused `idx` param in TIER_ORDER.map)
- `backend/src/modules/courses/presentation/lessons.controller.ts` — Changed `findByModule` from `@Public()` to `@UseGuards(JwtAuthGuard)` + `@CurrentUser()`, injected `TierProgressService`, enriched each lesson with `tierSummary` via `getCompactTierSummary`
- `backend/src/modules/courses/courses.module.ts` — Added `ExercisesModule` to imports so `TierProgressService` is available for injection into `LessonsController`
- `mobile/lib/features/lessons/domain/exercise_set_models.dart` — Added `TierStatus` enum, `TierSummaryItem` class (with fromJson), `TierSummary` class (with fromJson parsing currentTier, unlockedTiers, tiers)
- `mobile/lib/features/lessons/data/lesson_repository.dart` — Added `getModuleTierSummaries(moduleId)` method calling `GET /lessons/module/:moduleId` and mapping response to `Map<String, TierSummary>`
- `mobile/lib/features/lessons/data/lesson_providers.dart` — Added `moduleTierSummariesProvider` (FutureProvider.family) for fetching tier summaries by moduleId
- `mobile/lib/features/courses/presentation/screens/module_detail_screen.dart` — Updated `ModuleDetailScreen` to watch `moduleTierSummariesProvider`, pass `tierSummariesMap` to `_ModuleDetailContent`. Updated `_LessonCard` to accept `TierSummary?`, show colored `borderColor` on AppCard matching highest unlocked tier (BASIC=primary, EASY=green, MEDIUM=orange, HARD=red, EXPERT=purple), added `_TierTimeline` widget showing compact format "Basic ✓ · Easy 80% · 🔒🔒🔒" below description

### Files deleted

None
