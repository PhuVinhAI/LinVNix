Status: `ready-for-agent`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Extend AI generation to medium/hard/expert tiers with tier-specific complexity configs, and add the regenerate feature that soft-deletes old exercises and creates fresh ones.

Backend: Add tier-specific AI configs for medium (~12 questions, more fill-blank + translation), hard (~15 questions, complex grammar + harder vocabulary), expert (~18 questions, all types at max complexity). New endpoint: `POST /exercise-sets/:id/regenerate` — guarded by `AI_GENERATE_EXERCISE` permission. Soft-deletes existing exercises (sets deletedAt), then generates new set via ExerciseGenerationService. Language mix: Vietnamese and English per exercise type naturally (matching: Việt↔Anh, translation: either direction, listening: hear Vietnamese, fill-blank/MC/ordering: Vietnamese).

Mobile: All 5 tiers visible on selector. Medium/hard/expert behave same as easy (on-demand generation). Each non-basic tier shows "Tạo bài mới" button for regeneration. Regeneration replaces exercises in-place.

## Acceptance criteria

- [ ] Tier-specific AI configs for medium, hard, expert (question count + complexity)
- [ ] POST /exercise-sets/:id/regenerate soft-deletes old set, generates new one
- [ ] Regenerate guarded by AI_GENERATE_EXERCISE permission
- [ ] Language mix per exercise type follows PRD spec (Việt↔Anh naturally)
- [ ] Old exercise results linked to soft-deleted exercises remain but aren't displayed
- [ ] Only 1 active set per tier per lesson after regenerate
- [ ] Mobile: 5 tiers fully functional on tier selector
- [ ] Mobile: "Tạo bài mới" button on non-basic tiers triggers regeneration
- [ ] Existing unit tests extended for higher tier configs and regenerate flow
- [ ] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/03-ai-generation-easy.md`
