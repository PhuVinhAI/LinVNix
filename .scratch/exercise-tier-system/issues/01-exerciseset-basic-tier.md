Status: `ready-for-agent`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Separate exercises from the lesson wizard and establish the foundational data model + basic tier flow.

Backend: Create the `ExerciseSet` entity (lessonId, tier, isCustom, customConfig JSONB, isAIGenerated, title, generatedById, promptUsed, orderIndex) and `ExerciseTier` enum (BASIC, EASY, MEDIUM, HARD, EXPERT). Add `setId` FK to the existing Exercise entity. Add unique constraint: one active set per tier per lesson. Seed script auto-creates one basic ExerciseSet per lesson that has exercises, assigning existing exercises to that set via `setId`. New API endpoints: `GET /exercise-sets/lesson/:lessonId` (list active sets by tier with progress stats + `unlockedTiers`), `GET /exercise-sets/:id` (set detail with full exercises). Remove exercises from `GET /lessons/:id` response.

Mobile: Remove exercise steps from the lesson wizard — wizard now only shows content + vocabulary + grammar. When the user reaches the last wizard page, show a prompt dialog "Bắt đầu bài tập?" with Yes/No. No → back to lesson list. Yes → navigate to new ExerciseTierScreen showing only the basic tier (others locked). Tap basic → new ExercisePlayScreen: one question at a time, no timer bar, submit → immediate feedback (correct/incorrect + explanation), after last question → summary panel (stats). "Return to tier selector" button.

## Acceptance criteria

- [ ] ExerciseSet entity created with all fields per PRD, extends BaseEntity
- [ ] ExerciseTier enum created (BASIC, EASY, MEDIUM, HARD, EXPERT)
- [ ] Exercise entity has `setId` FK, backward compatible with existing `lessonId`
- [ ] Unique constraint on (lessonId, tier, deletedAt IS NULL) enforced
- [ ] Seed creates basic ExerciseSet per lesson, assigns existing exercises
- [ ] GET /exercise-sets/lesson/:lessonId returns sets with progress + unlockedTiers
- [ ] GET /exercise-sets/:id returns set detail with exercises
- [ ] Exercises removed from GET /lessons/:id response
- [ ] Mobile wizard has only content + vocab + grammar steps (no exercises)
- [ ] Prompt dialog "Bắt đầu bài tập?" appears on last wizard page
- [ ] ExerciseTierScreen displays basic tier (others locked)
- [ ] ExercisePlayScreen: one question at a time, no timer, immediate feedback, summary
- [ ] Existing exercise submission still works through new flow
- [ ] Unit tests for ExerciseSet service (CRUD, unique constraint)
- [ ] Lint + typecheck pass

## Blocked by

None — can start immediately
