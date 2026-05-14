Status: ready-for-agent

# PRD: Module & Course Custom Practice + Bypass Completion

## Problem Statement

Users can only create AI-generated custom practice at the lesson level. When they want to review an entire module or course, they must manually enter each lesson and create separate custom practices — there is no way to generate a unified review exercise set that spans multiple lessons. Additionally, users who join at a higher proficiency level (e.g. B1) must manually complete lower-level courses (A1, A2) lesson by lesson, even though they already know the material. There is no way to mark those courses as completed in bulk.

## Solution

Extend the custom practice feature to module and course levels. When at least one lesson in a module is completed, a custom practice widget appears on the module detail screen allowing the user to create a review exercise set covering all completed lessons' vocabulary and grammar. Similarly, when at least one module in a course is completed, the course detail screen shows the same widget. The AI generation injects context from completed lessons only, deduplicates vocabulary and grammar, and uses dedicated prompts that emphasize cross-lesson questions.

Additionally, introduce a bypass completion flow: during onboarding, if the user selects a level above A1, a dialog offers to mark all lower-level courses as completed (cascading down to every lesson). Within each course detail, a "Complete All" button appears when the user's level exceeds the course level, and a "Reset" button allows undoing the entire course progress. Both operations are transactional and atomic.

## User Stories

1. As a learner, I want to create a custom practice set from a module detail screen, so that I can review vocabulary and grammar across multiple lessons I've completed
2. As a learner, I want to create a custom practice set from a course detail screen, so that I can review content from all completed modules at once
3. As a learner, I want the custom practice widget to appear as soon as I've completed at least one lesson in a module, so that I can start reviewing even before finishing the whole module
4. As a learner, I want the custom practice widget to appear on a course as soon as at least one module is completed, so that I can review course-level content incrementally
5. As a learner, I want AI-generated exercises to only cover content from lessons I've completed, so that I'm not tested on material I haven't studied yet
6. As a learner, I want to provide a free-text prompt when creating a custom practice, so that the AI can tailor exercises to my specific review goals
7. As a learner, I want the AI to automatically generate a descriptive title and description for my custom practice, so that I can easily identify it later
8. As a learner, I want to tap a custom practice to see a bottom sheet with its title, description, config, stats, and actions (start, regenerate, reset, delete), so that I have a clean professional UI for managing my practices
9. As a learner, I want to provide or override my user prompt when generating or regenerating a custom practice, so that I can refine the AI's output each time
10. As a learner, I want each custom practice to retain the exercises generated at creation time (static scope), so that my progress isn't disrupted if I complete more lessons later
11. As a learner, I want to see module/course custom practice in a bottom sheet form with config and user prompt, so that the creation experience is consistent across all levels
12. As a learner, I want lesson-level custom practice to also get AI-generated title, description, and user prompt support, so that the experience is consistent across all levels
13. As a new user onboarding at level B1, I want to be asked if I want to mark A1 and A2 courses as completed, so that I don't have to manually study content I already know
14. As a new user onboarding at level A1, I do not want to see a completion dialog, so that the onboarding stays simple for beginners
15. As a learner, I want a "Complete All" button on a course detail screen when my level is higher than the course level, so that I can skip courses I've already mastered
16. As a learner, I want a confirmation dialog before completing all lessons in a course, so that I don't accidentally mark things as completed
17. As a learner, I want a "Reset" button on a course detail screen, so that I can undo a bypass completion and study the course from scratch
18. As a learner, I want a confirmation dialog before resetting course progress, so that I don't accidentally lose my data
19. As a learner, I want resetting a course to remove all progress, exercise results, and custom practice sets, so that I start completely fresh
20. As a learner, I want to be able to complete-all and reset a course multiple times, so that I can freely change my mind
21. As a learner, I want module/course completion to be tracked with a ModuleProgress and CourseProgress entity, so that the system knows when I've finished all lessons/modules
22. As a learner, I want bypass-completed lessons to have no score (null), so that I can distinguish them from lessons I actually completed with exercise results
23. As a learner, I want to see "3/5 lessons completed" style progress on modules in the course detail, so that I know how far along I am
24. As a learner, I want the custom practice widget to be hidden entirely when no lessons are completed yet, so that I'm not distracted by unavailable features
25. As an admin, I want adding a new lesson to a completed module to change the module's status to IN_PROGRESS, so that completion status stays accurate
26. As an admin, I want adding a new module to a completed course to change the course's status to IN_PROGRESS, so that completion status stays accurate
27. As a learner, I want the exercise types available in module/course custom practice to be the same as lesson-level (multiple_choice, fill_blank, matching, ordering, translation, listening), so that I get the same variety
28. As a learner, I want the focus area options (vocabulary, grammar, both) to work the same at module/course level, so that the config UI is familiar
29. As a learner, I want module/course custom practice results to be independent of module/course progress scores, so that review practice doesn't inflate my completion scores
30. As a learner, I want AI-generated module/course exercises to include cross-lesson questions (e.g. using vocabulary from lesson 3 in a grammar context from lesson 1), so that the review is truly integrative rather than just a concatenation of lesson exercises
31. As a learner, I want my user prompt to have a maximum of 500 characters, so that the input stays focused and AI token usage is reasonable
32. As a learner, I want the onboarding dialog to appear between the level selection step and the dialect step, so that it's contextual to the level I just chose
33. As a learner, I want the onboarding to use frontend level enum comparison to determine which courses are lower, so that the dialog appears instantly without an API call
34. As a learner, I want the backend to validate that my level is higher than the course level before allowing complete-all, so that the rule can't be bypassed via direct API calls
35. As a learner, I want the complete-all operation to be atomic — either all progress is created or none is — so that I never end up with a half-completed course

## Implementation Decisions

### Schema Changes

- **ExerciseSet entity**: Add nullable `moduleId` (FK → Module, SET NULL), nullable `courseId` (FK → Course, SET NULL), nullable `description` (string), nullable `userPrompt` (string, max 500 chars). Make existing `lessonId` nullable. Keep `title` but it will now be AI-generated instead of hardcoded "Custom Practice".
- **Exercise entity**: Make `lessonId` nullable. Do NOT add `moduleId`/`courseId` — Exercise's level is determined through its `setId` → ExerciseSet relation.
- **ModuleProgress entity** (new, in progress module): Fields — `userId` (FK → User), `moduleId` (FK → Module), `status` (IN_PROGRESS | COMPLETED), `score` (nullable number, average of lesson scores), `completedAt` (nullable Date), `completedLessonsCount` (number), `totalLessonsCount` (number). Unique constraint on (userId, moduleId). Only created when all lessons in module are completed (COMPLETED) or when a completed module needs to transition to IN_PROGRESS due to new lessons being added.
- **CourseProgress entity** (new, in progress module): Fields — `userId` (FK → User), `courseId` (FK → Course), `status` (IN_PROGRESS | COMPLETED), `score` (nullable number, average of module scores), `completedAt` (nullable Date), `completedModulesCount` (number), `totalModulesCount` (number). Unique constraint on (userId, courseId). Only created when all modules in course are completed (COMPLETED) or when a completed course needs to transition to IN_PROGRESS.

### Deep Module: ExerciseContextLoader

A new service in the exercises module with three methods:

- `loadLessonContext(lessonId: string)` → returns `{ title, vocabularies, grammarRules }` for a single lesson
- `loadModuleContext(lessonIds: string[])` → loads vocabularies + grammarRules for all given lesson IDs, deduplicates by word/ruleName (keeps the version from the most recently completed lesson), returns merged context
- `loadCourseContext(lessonIds: string[])` → same merge+dedupe logic as module, for course-level

The loader does NOT query progress or know about users. Callers pass in the list of completed lesson IDs. This separation makes it easy to test in isolation.

### Deep Module: ModuleProgress & CourseProgress

Both entities live in the progress module alongside existing UserProgress. Key behaviors:

- **Creation trigger**: When `completeLesson()` detects all lessons in a module are completed → create ModuleProgress with status=COMPLETED, score=average of lesson scores, completedAt=now. Same for CourseProgress when all modules completed.
- **Invalidation**: When a new lesson is added to a completed module (in CourseContentService), the existing ModuleProgress transitions to IN_PROGRESS (does not delete — preserves completedAt and score). Same for CourseProgress when a new module is added.
- **Bypass creation**: `completeAllCourseProgress(courseId, userId)` cascades: creates CourseProgress COMPLETED (score=null), ModuleProgress COMPLETED for each module (score=null), and UserProgress COMPLETED for every lesson (score=null, contentViewed=true). All wrapped in @Transactional.
- **Reset**: `resetCourseProgress(courseId, userId)` deletes CourseProgress, all ModuleProgress for course's modules, all UserProgress for course's lessons, all UserExerciseResults for course's exercises, and soft-deletes all custom ExerciseSets (isCustom=true) belonging to the course. All wrapped in @Transactional.

### YAML Prompt Templates

Three separate YAML templates replace the hardcoded `buildPrompt()` logic:

- `exercise-generation-lesson.yaml` — current lesson-level prompt (migrated from code)
- `exercise-generation-module.yaml` — includes `{{moduleTitle}}`, `{{lessonCount}}`, `{{lessonContexts}}`, with instructions emphasizing cross-lesson questions and integrative review
- `exercise-generation-course.yaml` — includes `{{courseTitle}}`, `{{moduleCount}}`, `{{lessonContexts}}`, with instructions emphasizing comprehensive review across all modules

Module/course prompts explicitly instruct the AI to create questions that connect concepts across lessons (e.g. vocabulary from one lesson used in grammar context from another), not just repeat per-lesson exercises.

### AI Response Schema Change

The Zod schema for AI response changes from `{ exercises: [...] }` to:

```
{ title: string, description?: string, exercises: [...] }
```

Title is required, description is optional. After parsing, `title` and `description` are persisted to the ExerciseSet entity. Exercises are persisted as before.

### DTO Changes

- **CreateCustomSetDto**: `lessonId` becomes optional. Add optional `moduleId` and `courseId`. Custom XOR validator ensures exactly one of the three is provided. Add optional `userPrompt` (string, max 500 chars).
- **GenerateDto** (new): `{ userPrompt?: string }` — used by both `POST /exercise-sets/:id/generate` and `POST /exercise-sets/:id/regenerate`. If userPrompt provided, it overrides the one stored on the ExerciseSet.
- **OnboardingDto** (new): `{ currentLevel: string, preferredDialect?: string, dailyGoal?: number, completeLowerCourses: boolean }`

### API Endpoints

New endpoints:
- `GET /exercise-sets/module/:moduleId` — returns `{ eligible: boolean, completedLessonsCount, totalLessonsCount, moduleSets: ExerciseSetWithProgress[] }`
- `GET /exercise-sets/course/:courseId` — returns `{ eligible: boolean, completedModulesCount, totalModulesCount, courseSets: ExerciseSetWithProgress[] }`
- `POST /progress/course/:courseId/complete-all` — validates user level > course level, cascades progress creation, @Transactional
- `POST /progress/course/:courseId/reset` — cascades deletion of all progress + exercise results + custom sets, @Transactional
- `POST /users/onboarding` — handles onboarding submission with optional completeLowerCourses flag

Modified endpoints:
- `POST /exercise-sets/custom` — accepts XOR of lessonId/moduleId/courseId, validates eligibility (≥1 completed lesson/module)
- `POST /exercise-sets/:id/generate` — accepts optional body `{ userPrompt? }`, overrides set's userPrompt if provided
- `POST /exercise-sets/:id/regenerate` — same optional userPrompt override
- `PATCH /users/me` — when level increases, also triggers completeAllCourseProgress for lower courses (uses same service method, upsert ensures no duplicates)

### Service Flow: createCustom for Module/Course

1. Validate XOR — exactly one of lessonId/moduleId/courseId
2. If moduleId: query UserProgress for user → count completed lessons in module → if 0 → 400 error "No completed lessons found"
3. If courseId: query ModuleProgress for user → count completed modules in course → if 0 → 400 error "No completed modules found"
4. Create ExerciseSet with isCustom=true, isAIGenerated=false, title="Custom Practice" (placeholder until AI generates), userPrompt if provided, appropriate FK (lessonId/moduleId/courseId)
5. Return created set

### Service Flow: generate for Module/Course

1. Load set, determine level from which FK is non-null
2. ExerciseSetService queries progress to get completed lesson IDs, passes them to ExerciseContextLoader
3. Loader returns merged, deduplicated vocab+grammar context
4. Select appropriate YAML template based on level
5. Inject context + config + userPrompt into template
6. Call AI (synchronous, no timeout — same as current)
7. Parse response with updated Zod schema (title, description, exercises)
8. Persist title+description to ExerciseSet, persist exercises
9. Set generationStatus='ready', isAIGenerated=true

### Dependency Direction (No Circular Dependencies)

- Progress module exports ModuleProgress repository + CourseProgress repository
- Courses module exports modules repository + lessons repository
- Exercises module exports ExerciseContextLoader
- ProgressService injects: courses module repositories (read-only), own repositories
- CourseContentService injects: progress module repositories (for invalidation)
- ExerciseSetService injects: ExerciseContextLoader, progress module repositories (for eligibility checks)
- No service injects another service from a different module — only repositories

### Mobile UI Changes

- **OnboardingScreen**: Between step 0 (level) and step 1 (dialect), if selectedLevel > A1, show dialog asking "Mark lower courses as completed?". Store `_completeLowerCourses` bool, include in `_submit()` payload.
- **Module detail screen**: Add custom practice widget. Widget is hidden when no lessons are completed. When visible, shows "Create Custom Practice" button. Tapping shows bottom sheet form (config + userPrompt). After creation, tapping a set shows info bottom sheet (title, description, stats, actions).
- **Course detail screen**: Same widget pattern as module. Additionally shows "Complete All" button (when user level > course level) and "Reset" button. Both with confirmation dialogs.
- **Lesson custom practice**: Reuse same bottom sheet UI component, adapted for lesson scope. Apply AI-generated title/description and userPrompt support to lesson-level as well.
- **Bottom sheet component**: Shared across all 3 levels. Two modes: (1) creation form — config fields (questionCount, exerciseTypes, focusArea) + userPrompt textarea + Create button; (2) info view — title, description, config summary, progress stats, action buttons (Start/Continue, Regenerate, Reset Progress, Delete).

### Title/Description by Level

- Lesson-level custom practice: title generated by AI based on single lesson context
- Module-level: title like "Module Review — [module title]" or AI-generated equivalent
- Course-level: title like "Course Review — [course title]" or AI-generated equivalent
- Description is always AI-generated, optional (AI may omit if practice is simple)

## Testing Decisions

### What makes a good test

Tests should verify external behavior (inputs → outputs, state changes, error conditions), not implementation details like which repository method was called. Mock repositories at the service boundary. Use the same patterns as existing tests in the codebase.

### Modules to test

1. **ExerciseContextLoader** (unit tests) — Test that:
   - Single lesson context loads correctly
   - Multiple lessons merge and deduplicate vocabularies by word
   - Multiple lessons merge and deduplicate grammar rules by rule name
   - Empty lesson IDs array returns empty context
   - Prior art: `exercise-set.service.spec.ts`

2. **ProgressService — module/course completion** (unit tests) — Test that:
   - `completeLesson()` triggers ModuleProgress creation when all lessons completed
   - `completeLesson()` triggers CourseProgress creation when all modules completed
   - `completeAllCourseProgress()` cascades correctly (CourseProgress + all ModuleProgress + all UserProgress)
   - `completeAllCourseProgress()` validates user level > course level (403 if not)
   - `completeAllCourseProgress()` returns 404 if course doesn't exist
   - `completeAllCourseProgress()` skips if no lower courses exist in DB
   - `resetCourseProgress()` deletes all progress + exercise results + custom sets
   - Bypass completion sets score=null on all created progress
   - Prior art: `progress.service.spec.ts`, `auth.service.spec.ts`

3. **ExerciseSetService — module/course custom practice** (unit tests) — Test that:
   - `createCustom()` with moduleId validates ≥1 completed lesson
   - `createCustom()` with courseId validates ≥1 completed module
   - XOR validation rejects 0 or >1 FK fields
   - `generate()` for module-level set uses ExerciseContextLoader with completed lesson IDs only
   - `generate()` for course-level set uses ExerciseContextLoader with all lesson IDs from completed modules
   - `generate()` overrides userPrompt when provided in body
   - `regenerate()` clones set, override userPrompt at generate step
   - AI response with title+description is persisted correctly
   - Prior art: `exercise-set.service.spec.ts`

4. **CourseContentService — invalidation** (unit tests) — Test that:
   - Adding lesson to completed module → ModuleProgress status becomes IN_PROGRESS
   - Adding module to completed course → CourseProgress status becomes IN_PROGRESS
   - Adding lesson to non-completed module → no effect on ModuleProgress
   - Prior art: `course-content.service.spec.ts`

5. **Controller integration** (e2e tests) — Test that:
   - `POST /exercise-sets/custom` with moduleId creates set
   - `GET /exercise-sets/module/:moduleId` returns eligibility + sets
   - `GET /exercise-sets/course/:courseId` returns eligibility + sets
   - `POST /progress/course/:courseId/complete-all` works for eligible user
   - `POST /progress/course/:courseId/reset` cleans everything
   - `POST /users/onboarding` with completeLowerCourses=true cascades
   - Prior art: `test/*.e2e-spec.ts`

6. **Onboarding flow** (mobile widget tests) — Test that:
   - Dialog appears when level > A1 selected
   - Dialog does not appear when A1 selected
   - `_completeLowerCourses` flag is included in submit payload
   - Prior art: `onboarding_screen_test.dart`

## Out of Scope

- Admin panel changes (no admin UI for managing module/course custom practices)
- Database migration files (dev uses synchronize:true; migrations written later for production)
- Async AI generation (keeping synchronous for now; may add polling for very large courses later)
- Editing userPrompt after creation (use regenerate with new prompt instead)
- Weighted score calculation for ModuleProgress/CourseProgress (using simple average)
- Permission restrictions on module/course custom practice (same `AI_GENERATE_EXERCISE` permission as lesson-level)
- Profile level decrease invalidating bypass progress (level only gates creation, not maintenance)
- Analytics or dashboards for module/course completion rates
- Push notifications when module/course becomes completed

## Further Notes

### Relationship to existing code

- The lesson-level custom practice flow is being upgraded (AI-generated title/description, userPrompt) — existing sets with title="Custom Practice" remain compatible
- ExerciseSet's `promptUsed` field continues to store the system prompt for debugging; `userPrompt` is the user-facing input — these are separate concerns
- The `generationStatus` field already supports 'generating'/'ready'/'failed' — no changes needed for error handling at module/course level
- The `replacesSetId` regeneration flow remains unchanged — clone then generate with optional new userPrompt

### Token considerations

- Module/course context includes all vocabulary terms + grammar rules from completed lessons only (no lesson content body)
- Vocabulary and grammar are deduplicated by word/ruleName across lessons
- AI prompt templates for module/course explicitly instruct cross-lesson integrative questions
- No hard limit on number of lessons — if context becomes very large, AI may truncate naturally; can add chunking later if needed

### Onboarding integration

- Onboarding already has 3 steps: level → dialect → daily goal
- The bypass dialog inserts between step 0 and step 1, triggered only when level > A1
- The `_submit()` method will call `POST /users/onboarding` instead of `PATCH /users/me` + `repository.updateMe()`, including the `completeLowerCourses` flag
- `POST /users/me` level change also triggers complete-all for lower courses (same service method, upsert-safe via unique constraints)
