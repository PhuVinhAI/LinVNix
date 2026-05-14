Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Upgrade lesson-level custom practice to support AI-generated title and description, user prompt, and YAML prompt templates. Migrate the hardcoded `buildPrompt()` in ExerciseGenerationService to use YAML template via `GenaiService.renderPrompt()`. Create `exercise-generation-lesson.yaml` (migrated from current inline prompt). Update AI response Zod schema from `{ exercises: [...] }` to `{ title: string, description?: string, exercises: [...] }`. Persist `title` and `description` to ExerciseSet after generation. Add optional `userPrompt` field to `POST /exercise-sets/custom` (CreateCustomSetDto) and new `GenerateDto { userPrompt?: string }` to `POST /exercise-sets/:id/generate` and `POST /exercise-sets/:id/regenerate` — when provided, overrides the stored userPrompt. Inject userPrompt into the YAML template. Existing sets with title="Custom Practice" remain compatible.

## Acceptance criteria

- [ ] `exercise-generation-lesson.yaml` created, migrated from inline `buildPrompt()` logic
- [ ] ExerciseGenerationService uses `GenaiService.renderPrompt('exercise-generation-lesson', ...)` instead of inline buildPrompt
- [ ] AI response Zod schema updated to `{ title: string, description?: string, exercises: [...] }`
- [ ] `title` and `description` from AI response persisted to ExerciseSet after generation
- [ ] CreateCustomSetDto: optional `userPrompt` field (string, max 500 chars)
- [ ] GenerateDto: `{ userPrompt?: string }` — accepted by both `POST /exercise-sets/:id/generate` and `POST /exercise-sets/:id/regenerate`
- [ ] When userPrompt provided in GenerateDto, it overrides the one stored on ExerciseSet for that generation call only
- [ ] userPrompt injected into YAML template as `{{userPrompt}}` variable
- [ ] Regenerate flow: clones set, then generates with optional new userPrompt override
- [ ] Existing ExerciseSets with title="Custom Practice" remain compatible (no breaking change)
- [ ] Unit tests for ExerciseSetService: userPrompt override, AI title/description persistence
- [ ] Unit tests for ExerciseGenerationService: YAML rendering with userPrompt, new response schema parsing

## Blocked by

- `02-exercise-set-schema-extension-context-loader` (ExerciseSet fields userPrompt + description must exist)
