Status: `done`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Implement tier progress computation and sequential unlock logic so users can progress through tiers.

Backend: Create TierProgressService (deep module within ExercisesModule) that computes unlock status on-the-fly from exercise results. Unlock condition: all exercises in set attempted (percentComplete === 100%) AND ≥80% correct. Sequential enforcement: must complete tier N before tier N+1 unlocks. Unlock is permanent — never re-locked. At tier N, user can practice any tier ≤ N. New endpoint: `GET /exercise-sets/:id/progress` returning `{totalExercises, attempted, correct, percentCorrect, percentComplete, nextTierUnlocked}`. Modified: `POST /exercises/:id/submit` adds `nextTierUnlocked?: ExerciseTier` in response when unlock condition is met after submission.

Mobile: Tier selector shows lock/unlock/progress state per tier. Completed tiers show ✓, in-progress show %, locked show 🔒. Unlock animation (🎉) appears immediately when meeting unlock condition. User can tap any unlocked tier to practice (including lower ones).

## Acceptance criteria

- [x] TierProgressService computes unlock on-the-fly (no persistent unlock table)
- [x] Unlock boundary: 79% correct does NOT unlock, 80% does
- [x] Sequential unlock enforced (cannot skip tiers)
- [x] Unlock is permanent (regenerating lower tier exercises never re-locks)
- [x] At tier N, all tiers ≤ N are accessible
- [x] GET /exercise-sets/:id/progress returns correct stats + nextTierUnlocked
- [x] POST /exercises/:id/submit includes nextTierUnlocked when condition met
- [x] GET /exercise-sets/lesson/:lessonId includes unlockedTiers array
- [x] Mobile tier selector shows ✓ / % / 🔒 per tier
- [x] Unlock animation plays when new tier unlocked
- [x] User can practice any unlocked lower tier
- [x] Unit tests for TierProgressService (boundary conditions, sequential, empty sets)
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/01-exerciseset-basic-tier.md`

## Implementation notes

### Files created

None (all changes to existing files)

### Files modified

- `backend/src/modules/exercises/application/tier-progress.service.ts` — Added `SetProgressDetail` interface, `getSetProgress()` method (computes per-set progress with nextTierUnlocked), `checkUnlockAfterSubmission()` helper, and `getNextTier()` private helper
- `backend/src/modules/exercises/application/tier-progress.service.spec.ts` — Expanded from 9 to 29 tests: added `getSetProgress` tests (8 tests: condition met/not met, not fully attempted, EXPERT no next, unknown set, empty set, boundary 79%/80%), `computeUnlockedTiers` tests (skip tiers, EXPERT no beyond), `getLessonTierSummary` tests (empty set, permanence, tier N accessibility)
- `backend/src/modules/exercises/application/exercise-set.service.ts` — Added `getSetProgress()` method delegating to TierProgressService with NotFoundException for missing sets
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Added `getSetProgress` tests (2 tests: delegate + NotFoundException), added `findById` mock to repo
- `backend/src/modules/exercises/application/exercises.service.ts` — Added `SubmitAnswerResult` interface with `nextTierUnlocked` field
- `backend/src/modules/exercises/presentation/exercises.controller.ts` — Injected `TierProgressService`, modified `submitAnswer` endpoint to compute before/after unlock comparison and include `nextTierUnlocked` in response
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — Added `GET /exercise-sets/:id/progress` endpoint with Swagger docs
- `mobile/lib/features/lessons/domain/exercise_models.dart` — Added `nextTierUnlocked` field to `ExerciseSubmissionResult`
- `mobile/lib/features/lessons/domain/exercise_set_models.dart` — Added `SetProgressDetail` class with fromJson
- `mobile/lib/features/lessons/data/lesson_repository.dart` — Added `getSetProgress()` method calling `GET /exercise-sets/:id/progress`
- `mobile/lib/features/lessons/presentation/screens/exercise_tier_screen.dart` — Refactored `_TierCard` to StatefulWidget with animation, status text now shows ✓/%/🔒, added 🎉 unlock animation via AnimationController, added `showUnlockAnimation()` method
- `mobile/lib/features/lessons/presentation/screens/exercise_play_screen.dart` — Updated `_showSummary()` to detect `nextTierUnlocked` from submission result, show unlock celebration in summary dialog, invalidate exerciseSetsProvider on return

### Files deleted

None
