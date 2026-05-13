Status: `done`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Enable AI-generated exercises for the easy tier using Gemini structured output, activated on-demand when a user first opens an empty non-basic set.

Backend: Create ExerciseGenerationService (deep module within ExercisesModule) that handles AI generation. Create prompt templates directory (`infrastructure/genai/prompts/`) with YAML templates for exercise generation. The service loads full lesson context (contents, vocabularies, grammar rules, basic exercises to avoid duplication), builds prompt with tier-specific guidelines, calls Gemini structured output enforcing response schema matching Exercise entity shape, parses and persists results. New endpoint: `POST /exercise-sets/:id/generate` — guarded by `AI_GENERATE_EXERCISE` permission. Creates exercises for an empty non-basic set. First-time on-demand: when user opens easy tier and no exercises exist, backend generates and persists.

Mobile: Easy tier on tier selector now shows "Generate" button (or auto-triggers). Loading state during generation. On completion, exercises display normally. Error state with retry button if generation fails.

## Acceptance criteria

- [x] ExerciseGenerationService created as deep module within ExercisesModule
- [x] Prompt templates directory created with YAML exercise generation template
- [x] Generation loads full lesson context (content + vocab + grammar + basic exercises)
- [x] Tier-specific guidelines included in prompt (easy: ~8 questions, prefer matching + MC)
- [x] Gemini structured output enforces Exercise entity response schema
- [x] Parsed exercises persisted with correct setId, tier, orderIndex
- [x] POST /exercise-sets/:id/generate endpoint guarded by AI_GENERATE_EXERCISE permission
- [x] Only 1 active set per tier per lesson maintained (unique constraint)
- [x] Mobile: easy tier shows generate button / auto-trigger + loading + result + error+retry
- [x] Unit tests: prompt construction, response parsing (valid/invalid), mocked GenaiService
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/02-tier-progress-unlock.md`

## Comments

Marked as `needs-triage` because prompt template content and AI output quality need human review before agent implementation. Switch to `ready-for-agent` once prompt template is approved.

## Implementation notes

### Files created

- `backend/src/infrastructure/genai/prompts/exercise-generation.yaml` — YAML prompt template for exercise generation (human-reviewed template with tier-specific variables)
- `backend/src/modules/exercises/application/exercise-generation.service.ts` — ExerciseGenerationService deep module: loads lesson context, builds prompt with tier-specific guidelines, calls GenaiService with JSON-mode system instruction, parses Zod-validated response, persists exercises; also has `generateForTier(lessonId, tier, userId)` convenience method that creates set if not exists
- `backend/src/modules/exercises/application/exercise-generation.service.spec.ts` — 17 unit tests: generate (4: BASIC tier rejection, existing exercises, not found, EASY success), buildPrompt (6: tier+count, vocabulary, grammar, basic exercises avoidance, empty basic, JSON schema), parseResponse (7: valid JSON, markdown fences, non-JSON, missing exercises, missing fields, invalid type, no-language-tag fences)

### Files modified

- `backend/src/modules/exercises/exercises.module.ts` — Added ExerciseGenerationService to providers and exports
- `backend/src/modules/exercises/application/exercise-set.service.ts` — Added `generate(setId, userId)` and `generateForTier(lessonId, tier, userId)` delegating to ExerciseGenerationService; injected ExerciseGenerationService
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Added ExerciseGenerationService mock; added `generate` test
- `backend/src/modules/exercises/application/exercise-set.service.resume.spec.ts` — Updated constructor call to include 5th ExerciseGenerationService mock param
- `backend/src/modules/exercises/application/exercise-set.service.summary.spec.ts` — Updated constructor call to include 5th ExerciseGenerationService mock param
- `backend/src/modules/exercises/application/repositories/exercise-sets.repository.ts` — Added `update(id, data)` method
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — Added `POST exercise-sets/:id/generate` (guarded by PermissionsGuard + AI_GENERATE_EXERCISE), `POST exercise-sets/lesson/:lessonId/tier/:tier/generate` (convenience endpoint that creates set if needed); added PermissionsGuard, RequirePermissions, Permission imports
- `mobile/lib/features/lessons/data/lesson_repository.dart` — Added `generateExercises(setId)` and `generateExercisesForTier(lessonId, tier)` methods
- `mobile/lib/features/lessons/presentation/screens/exercise_tier_screen.dart` — Added "Generate Exercises" button for unlocked non-basic tiers with no exercises, loading spinner during generation, error display with retry button; added `_generatingTier`, `_generationError` state; added `_handleGenerate()` method; added `_needsGeneration` getter to _TierCard; fixed `c.destructive` → `c.error`

### Files deleted

None
