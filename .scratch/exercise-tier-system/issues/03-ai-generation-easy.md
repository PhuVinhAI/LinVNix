Status: `needs-triage`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Enable AI-generated exercises for the easy tier using Gemini structured output, activated on-demand when a user first opens an empty non-basic set.

Backend: Create ExerciseGenerationService (deep module within ExercisesModule) that handles AI generation. Create prompt templates directory (`infrastructure/genai/prompts/`) with YAML templates for exercise generation. The service loads full lesson context (contents, vocabularies, grammar rules, basic exercises to avoid duplication), builds prompt with tier-specific guidelines, calls Gemini structured output enforcing response schema matching Exercise entity shape, parses and persists results. New endpoint: `POST /exercise-sets/:id/generate` — guarded by `AI_GENERATE_EXERCISE` permission. Creates exercises for an empty non-basic set. First-time on-demand: when user opens easy tier and no exercises exist, backend generates and persists.

Mobile: Easy tier on tier selector now shows "Generate" button (or auto-triggers). Loading state during generation. On completion, exercises display normally. Error state with retry button if generation fails.

## Acceptance criteria

- [ ] ExerciseGenerationService created as deep module within ExercisesModule
- [ ] Prompt templates directory created with YAML exercise generation template
- [ ] Generation loads full lesson context (content + vocab + grammar + basic exercises)
- [ ] Tier-specific guidelines included in prompt (easy: ~8 questions, prefer matching + MC)
- [ ] Gemini structured output enforces Exercise entity response schema
- [ ] Parsed exercises persisted with correct setId, tier, orderIndex
- [ ] POST /exercise-sets/:id/generate endpoint guarded by AI_GENERATE_EXERCISE permission
- [ ] Only 1 active set per tier per lesson maintained (unique constraint)
- [ ] Mobile: easy tier shows generate button / auto-trigger + loading + result + error+retry
- [ ] Unit tests: prompt construction, response parsing (valid/invalid), mocked GenaiService
- [ ] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/02-tier-progress-unlock.md`

## Comments

Marked as `needs-triage` because prompt template content and AI output quality need human review before agent implementation. Switch to `ready-for-agent` once prompt template is approved.
