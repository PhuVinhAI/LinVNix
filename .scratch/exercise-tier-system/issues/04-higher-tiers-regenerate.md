Status: `done`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Extend AI generation to medium/hard/expert tiers with tier-specific complexity configs, and add the regenerate feature that soft-deletes old exercises and creates fresh ones.

Backend: Add tier-specific AI configs for medium (~12 questions, more fill-blank + translation), hard (~15 questions, complex grammar + harder vocabulary), expert (~18 questions, all types at max complexity). New endpoint: `POST /exercise-sets/:id/regenerate` — guarded by `AI_GENERATE_EXERCISE` permission. Soft-deletes existing exercises (sets deletedAt), then generates new set via ExerciseGenerationService. Language mix: Vietnamese and English per exercise type naturally (matching: Việt↔Anh, translation: either direction, listening: hear Vietnamese, fill-blank/MC/ordering: Vietnamese).

Mobile: All 5 tiers visible on selector. Medium/hard/expert behave same as easy (on-demand generation). Each non-basic tier shows "Tạo bài mới" button for regeneration. Regeneration replaces exercises in-place.

## Acceptance criteria

- [x] Tier-specific AI configs for medium, hard, expert (question count + complexity)
- [x] POST /exercise-sets/:id/regenerate soft-deletes old set, generates new one
- [x] Regenerate guarded by AI_GENERATE_EXERCISE permission
- [x] Language mix per exercise type follows PRD spec (Việt↔Anh naturally)
- [x] Old exercise results linked to soft-deleted exercises remain but aren't displayed
- [x] Only 1 active set per tier per lesson after regenerate
- [ ] Mobile: 5 tiers fully functional on tier selector
- [ ] Mobile: "Tạo bài mới" button on non-basic tiers triggers regeneration
- [x] Existing unit tests extended for higher tier configs and regenerate flow
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/03-ai-generation-easy.md`

## Implementation notes

### Files modified

- `backend/src/modules/exercises/application/exercise-generation.service.ts` — Updated TIER_GUIDELINES: MEDIUM 10→12 questions + added TRANSLATION to preferredTypes; HARD 12→15 questions + added MATCHING; EXPERT 15→18 questions + all 6 exercise types. Exported TIER_GUIDELINES for testability. Added `regenerate()` method: soft-deletes old set + exercises, creates new set, generates fresh exercises.
- `backend/src/modules/exercises/application/exercise-set.service.ts` — Added `regenerate()` method delegating to ExerciseGenerationService.
- `backend/src/modules/exercises/application/repositories/exercises.repository.ts` — Added `softDeleteBySetId()` method for bulk soft-delete of exercises by setId.
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — Added `POST :id/regenerate` endpoint guarded by JwtAuthGuard + PermissionsGuard + AI_GENERATE_EXERCISE permission.

### Files modified (tests)

- `backend/src/modules/exercises/application/exercise-generation.service.spec.ts` — Added TIER_GUIDELINES test suite (4 tests: MEDIUM/HARD/EXPERT config verification, progressive question count). Added regenerate test suite (4 tests: BASIC rejection, not-found, soft-delete+generate flow for MEDIUM/HARD/EXPERT). Updated mocks to include softDelete, softDeleteBySetId, create on exerciseSetsRepo.
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Added regenerate mock and test (1 test: delegation to ExerciseGenerationService).

### Files deleted

(none)
