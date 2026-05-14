Status: done

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Upgrade lesson-level custom practice to support AI-generated title and description, user prompt, and YAML prompt templates. Migrate the hardcoded `buildPrompt()` in ExerciseGenerationService to use YAML template via `GenaiService.renderPrompt()`. Create `exercise-generation-lesson.yaml` (migrated from current inline prompt). Update AI response Zod schema from `{ exercises: [...] }` to `{ title: string, description?: string, exercises: [...] }`. Persist `title` and `description` to ExerciseSet after generation. Add optional `userPrompt` field to `POST /exercise-sets/custom` (CreateCustomSetDto) and new `GenerateDto { userPrompt?: string }` to `POST /exercise-sets/:id/generate` and `POST /exercise-sets/:id/regenerate` — when provided, overrides the stored userPrompt. Inject userPrompt into the YAML template. Existing sets with title="Custom Practice" remain compatible.

## Acceptance criteria

- [x] `exercise-generation-lesson.yaml` created, migrated from inline `buildPrompt()` logic
- [x] ExerciseGenerationService uses `GenaiService.renderPrompt('exercise-generation-lesson', ...)` instead of inline buildPrompt
- [x] AI response Zod schema updated to `{ title: string, description?: string, exercises: [...] }`
- [x] `title` and `description` from AI response persisted to ExerciseSet after generation
- [x] CreateCustomSetDto: optional `userPrompt` field (string, max 500 chars)
- [x] GenerateDto: `{ userPrompt?: string }` — accepted by both `POST /exercise-sets/:id/generate` and `POST /exercise-sets/:id/regenerate`
- [x] When userPrompt provided in GenerateDto, it overrides the one stored on ExerciseSet for that generation call only
- [x] userPrompt injected into YAML template as `{{userPromptSection}}` variable
- [x] Regenerate flow: clones set, then generates with optional new userPrompt override
- [x] Existing ExerciseSets with title="Custom Practice" remain compatible (no breaking change)
- [x] Unit tests for ExerciseSetService: userPrompt override, AI title/description persistence
- [x] Unit tests for ExerciseGenerationService: YAML rendering with userPrompt, new response schema parsing

## Blocked by

- `02-exercise-set-schema-extension-context-loader` (ExerciseSet fields userPrompt + description must exist)

## Implementation notes

### Files created
- `backend/src/infrastructure/genai/prompts/exercise-generation-lesson.yaml` — YAML prompt template migrated from inline `buildPrompt()`, with variables: `{{questionCount}}`, `{{label}}`, `{{focusAreaDescription}}`, `{{preferredTypes}}`, `{{lessonTitle}}`, `{{lessonContext}}`, `{{existingExercises}}`, `{{userPromptSection}}`; includes instruction for AI to generate title and description
- `backend/src/modules/exercises/dto/generate.dto.ts` — New DTO with optional `userPrompt` field (string, max 500 chars), accepted by both generate and regenerate endpoints

### Files modified
- `backend/src/infrastructure/genai/genai.service.ts` — Updated `parseYamlPrompts()` to handle multi-line template values using YAML `|`/`| `-`/`>`/`>-` block scalar syntax; multi-line values are collected from indented continuation lines after the block indicator
- `backend/src/modules/exercises/application/exercise-generation.service.ts` — Removed `buildPrompt()` method; `doGenerate()` now calls `genaiService.renderPrompt('exercise-generation-lesson', ...)` with formatted context variables; added `userPromptOverride` param to `generate()`, `generateCustom()`, `createRegeneratedSet()`; `createRegeneratedSet` uses `effectiveUserPrompt = userPromptOverride ?? set.userPrompt` and always sets `title: 'Custom Practice'` on new set; `doGenerate()` computes `userPromptSection` (formatted `### User Request` section or empty string) and passes as template variable; persists `generated.title` and `generated.description` to ExerciseSet after generation; Zod schema `GenerationResponseSchema` now requires `title: z.string().min(1)` and optional `description: z.string()`; `EXERCISE_RESPONSE_SCHEMA` (Gemini API) updated with `title` (required) and `description` (nullable) top-level fields; `required` changed from `['exercises']` to `['title', 'exercises']`; `persistExercises()` removed unused `_prompt` param; `finalizeRegeneration()` renamed `newSetId` to `_newSetId`
- `backend/src/modules/exercises/application/exercise-set.service.ts` — `createCustom()` accepts optional `userPrompt` param, passes to repo create as `userPrompt || undefined`; `generate()` accepts optional `userPromptOverride`, forwards to `exerciseGenerationService.generate()`; `regenerate()` accepts optional `userPromptOverride`, forwards to `exerciseGenerationService.createRegeneratedSet()`
- `backend/src/modules/exercises/dto/create-custom-set.dto.ts` — Added optional `userPrompt` field (string, max 500 chars) with `@IsOptional()`, `@IsString()`, `@MaxLength(500)`; added `IsOptional` and `MaxLength` imports
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — `generate()` now accepts optional `@Body() dto?: GenerateDto` and passes `dto?.userPrompt`; `regenerate()` same; `createCustom()` passes `dto.userPrompt`; updated API descriptions for generate/regenerate; added `GenerateDto` import
- `backend/src/modules/exercises/domain/exercise-set.entity.ts` — Removed unused `Unique` import from typeorm
- `backend/src/modules/exercises/presentation/exercises.controller.ts` — Removed unused `exercise` variable in `submitAnswer()`
- `backend/src/modules/exercises/application/exercise-generation.service.spec.ts` — Updated `validAiResponse` to include `title` and `description`; added `renderPrompt` mock; added tests: `generate` passes userPrompt override, `createRegeneratedSet` overrides userPrompt, `createRegeneratedSet` keeps original userPrompt when undefined, `renderPrompt` usage with exercise-generation-lesson template, `renderPrompt` omits userPromptSection when no userPrompt, persists AI title/description, persists undefined description when AI omits it, parses response with title/description, parses response without description, throws when title missing, throws when exercises empty
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Updated `createCustom` test to expect `userPrompt: undefined`; added tests: `generate` passes userPrompt override, `regenerate` passes userPrompt override, `createCustom` with userPrompt

### Files deleted
- None
