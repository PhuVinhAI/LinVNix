Status: `ready-for-agent`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Implement tier progress computation and sequential unlock logic so users can progress through tiers.

Backend: Create TierProgressService (deep module within ExercisesModule) that computes unlock status on-the-fly from exercise results. Unlock condition: all exercises in set attempted (percentComplete === 100%) AND ≥80% correct. Sequential enforcement: must complete tier N before tier N+1 unlocks. Unlock is permanent — never re-locked. At tier N, user can practice any tier ≤ N. New endpoint: `GET /exercise-sets/:id/progress` returning `{totalExercises, attempted, correct, percentCorrect, percentComplete, nextTierUnlocked}`. Modified: `POST /exercises/:id/submit` adds `nextTierUnlocked?: ExerciseTier` in response when unlock condition is met after submission.

Mobile: Tier selector shows lock/unlock/progress state per tier. Completed tiers show ✓, in-progress show %, locked show 🔒. Unlock animation (🎉) appears immediately when meeting unlock condition. User can tap any unlocked tier to practice (including lower ones).

## Acceptance criteria

- [ ] TierProgressService computes unlock on-the-fly (no persistent unlock table)
- [ ] Unlock boundary: 79% correct does NOT unlock, 80% does
- [ ] Sequential unlock enforced (cannot skip tiers)
- [ ] Unlock is permanent (regenerating lower tier exercises never re-locks)
- [ ] At tier N, all tiers ≤ N are accessible
- [ ] GET /exercise-sets/:id/progress returns correct stats + nextTierUnlocked
- [ ] POST /exercises/:id/submit includes nextTierUnlocked when condition met
- [ ] GET /exercise-sets/lesson/:lessonId includes unlockedTiers array
- [ ] Mobile tier selector shows ✓ / % / 🔒 per tier
- [ ] Unlock animation plays when new tier unlocked
- [ ] User can practice any unlocked lower tier
- [ ] Unit tests for TierProgressService (boundary conditions, sequential, empty sets)
- [ ] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/01-exerciseset-basic-tier.md`
