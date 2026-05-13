Status: `done`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Add Custom Practice mode — a "Luyện tập tự do" feature that lets users configure their own AI-generated exercises after completing basic tier.

Backend: New endpoint `POST /exercise-sets/custom` with body `{lessonId, config: CustomSetConfig}` where CustomSetConfig = `{questionCount, exerciseTypes: ExerciseType[], focusArea: 'vocabulary' | 'grammar' | 'both'}`. Validates config (questionCount bounds, non-empty exerciseTypes). Creates ExerciseSet with `isCustom: true`, `tier: null`, and triggers AI generation via ExerciseGenerationService with user config overriding tier defaults. Guarded by `AI_GENERATE_EXERCISE` permission. Custom practice unlocks after completing basic (same condition as easy tier).

Mobile: On ExerciseTierScreen, below the 5-tier timeline, a separate "Luyện tập tự do" section with a custom card. Tapping it opens config form (number of questions, exercise types multi-select, focus area selector). Submit → AI generation → exercise play. Custom sets displayed separately from tier timeline. Custom sets can be regenerated same as tier sets.

## Acceptance criteria

- [x] POST /exercise-sets/custom validates CustomSetConfig (bounds, non-empty types)
- [x] Custom ExerciseSet created with isCustom=true, user config stored in customConfig JSONB
- [x] AI generation uses user config overriding tier defaults
- [x] Custom practice unlocks after completing basic tier
- [x] Guarded by AI_GENERATE_EXERCISE permission
- [x] Mobile: "Luyện tập tự do" section below tier timeline
- [x] Mobile: config form with questionCount, exerciseTypes, focusArea
- [x] Mobile: custom sets separate from tier display
- [x] Unit tests for custom config validation and generation orchestration
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/02-tier-progress-unlock.md`

## Implementation notes

### Files created

- `backend/src/modules/exercises/dto/create-custom-set.dto.ts` — DTO with class-validator: CreateCustomSetDto (lessonId + CustomSetConfigDto with questionCount 1-30, exerciseTypes non-empty, focusArea enum)

### Files modified

- `backend/src/modules/exercises/domain/exercise-set.entity.ts` — Made `tier` nullable (`ExerciseTier | null`) for custom sets; added `CustomSetConfig` interface export; added static `isValidCustomConfig()` validation method; changed `customConfig` type from `any` to `CustomSetConfig`
- `backend/src/modules/exercises/application/exercise-generation.service.ts` — Added `generateCustom()` method for custom set generation; updated `doGenerate()` to derive guidelines from `customConfig` when `isCustom=true` (overrides questionCount, preferredTypes, description via focusArea); updated `regenerate()` to preserve `isCustom`/`customConfig`/`tier: null` for custom sets; changed `buildPrompt()` tier param from `ExerciseTier` to `string`; added `getFocusAreaDescription()` helper; made `tierToDifficulty()` handle null tier
- `backend/src/modules/exercises/application/exercise-generation.service.spec.ts` — Added `generateCustom` describe (4 tests: not found, not custom, already has exercises, generates with custom config); added `buildPrompt with custom config` describe (1 test: includes custom question count and focus area)
- `backend/src/modules/exercises/application/exercise-set.service.ts` — Added `createCustom()` method: validates config via `isValidCustomConfig()`, checks `customPracticeUnlocked`, creates ExerciseSet with `isCustom: true, tier: null, orderIndex: 100`, then triggers `generateCustom()`
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Added `createCustom` describe (4 tests: creates set+generates when unlocked, throws when locked, throws when invalid config, throws when questionCount exceeds bounds); added `generateCustom` mock
- `backend/src/modules/exercises/application/tier-progress.service.ts` — Changed `TierProgress.tier` from `ExerciseTier` to `ExerciseTier | null`; added `customSets: TierProgress[]` and `customPracticeUnlocked: boolean` to `LessonTierSummary`; updated `getLessonTierSummary()` to separate custom vs tier sets, compute `customPracticeUnlocked` (true when EASY is in unlockedTiers); guarded `getNextTier()` against null tier in `getSetProgress()`
- `backend/src/modules/exercises/application/tier-progress.service.spec.ts` — Added `customPracticeUnlocked` tests (true when basic completed, false when not); added `separates custom sets from tier sets` test
- `backend/src/modules/exercises/application/repositories/exercise-sets.repository.ts` — Added `findActiveCustomSetsByLesson()` method
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — Added `POST exercise-sets/custom` endpoint (guarded by AI_GENERATE_EXERCISE permission, uses CreateCustomSetDto)
- `mobile/lib/features/lessons/domain/exercise_set_models.dart` — Made `ExerciseSetModel.tier` nullable (`ExerciseTier?`); made `TierProgress.tier` nullable; added `setId` field to `TierProgress`; added `FocusArea` enum; added `CustomSetConfig` class with fromJson/toJson; added `customSets` and `customPracticeUnlocked` to `LessonTierSummary`; updated all fromJson to handle null tier
- `mobile/lib/features/lessons/data/lesson_repository.dart` — Added `createCustomSet()` and `regenerateExercises()` methods
- `mobile/lib/features/lessons/presentation/screens/exercise_tier_screen.dart` — Added `_CustomPracticeSection` widget (lock/unlock state, "Tạo bài tập tự do" button, custom set cards with progress + regenerate); added `_CustomConfigForm` bottom sheet (questionCount slider 1-30, exerciseTypes FilterChip multi-select, focusArea SegmentedButton); added `_CustomSetCard` widget; added custom create/regenerate state management
- `mobile/lib/features/lessons/presentation/screens/exercise_play_screen.dart` — Added `customSetId` optional parameter; updated `_loadExercises()` to load by setId when `customSetId` is provided
- `mobile/lib/core/router/app_router.dart` — Added route `/lessons/:id/exercises/play/custom/:setId` for custom practice play

### Files deleted

None
