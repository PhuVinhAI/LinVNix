Status: `ready-for-agent`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Add Custom Practice mode — a "Luyện tập tự do" feature that lets users configure their own AI-generated exercises after completing basic tier.

Backend: New endpoint `POST /exercise-sets/custom` with body `{lessonId, config: CustomSetConfig}` where CustomSetConfig = `{questionCount, exerciseTypes: ExerciseType[], focusArea: 'vocabulary' | 'grammar' | 'both'}`. Validates config (questionCount bounds, non-empty exerciseTypes). Creates ExerciseSet with `isCustom: true`, `tier: null` or virtual tier, and triggers AI generation via ExerciseGenerationService with user config overriding tier defaults. Guarded by `AI_GENERATE_EXERCISE` permission. Custom practice unlocks after completing basic (same condition as easy tier).

Mobile: On ExerciseTierScreen, below the 5-tier timeline, a separate "Luyện tập tự do" section with a custom card. Tapping it opens config form (number of questions, exercise types multi-select, focus area selector). Submit → AI generation → exercise play. Custom sets displayed separately from tier timeline. Custom sets can be regenerated same as tier sets.

## Acceptance criteria

- [ ] POST /exercise-sets/custom validates CustomSetConfig (bounds, non-empty types)
- [ ] Custom ExerciseSet created with isCustom=true, user config stored in customConfig JSONB
- [ ] AI generation uses user config overriding tier defaults
- [ ] Custom practice unlocks after completing basic tier
- [ ] Guarded by AI_GENERATE_EXERCISE permission
- [ ] Mobile: "Luyện tập tự do" section below tier timeline
- [ ] Mobile: config form with questionCount, exerciseTypes, focusArea
- [ ] Mobile: custom sets separate from tier display
- [ ] Unit tests for custom config validation and generation orchestration
- [ ] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/02-tier-progress-unlock.md`
