Status: done

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Enable custom practice creation and AI generation at the module level. Add XOR validation to CreateCustomSetDto so exactly one of lessonId/moduleId/courseId is provided. Update `ExerciseSetService.createCustom()` to accept moduleId: query UserProgress for completed lessons in the module, reject if 0 completed lessons (400), create ExerciseSet with moduleId FK. Update `ExerciseSetService.generate()` to detect module-level sets, query completed lesson IDs via progress repositories, pass them to ExerciseContextLoader.loadModuleContext(), use `exercise-generation-module.yaml` template (includes moduleTitle, lessonCount, lessonContexts, emphasizes cross-lesson integrative questions). Add `GET /exercise-sets/module/:moduleId` endpoint returning eligibility (≥1 completed lesson), counts, and module's custom practice sets.

## Acceptance criteria

- [x] CreateCustomSetDto: XOR validator ensures exactly one of lessonId/moduleId/courseId is provided (400 on violation)
- [x] `createCustom()` with moduleId: queries UserProgress for completed lessons in module, 400 if 0 completed, creates ExerciseSet with moduleId FK
- [x] `generate()` for module-level set: queries completed lesson IDs via progress repos, passes to ExerciseContextLoader.loadModuleContext()
- [x] `exercise-generation-module.yaml` created with variables `{{moduleTitle}}`, `{{lessonCount}}`, `{{lessonContexts}}`, `{{userPrompt}}`, instructions emphasizing cross-lesson questions
- [x] Module-level generation uses `renderPrompt('exercise-generation-module', ...)` and persists AI-generated title + description
- [x] `GET /exercise-sets/module/:moduleId` returns `{ eligible: boolean, completedLessonsCount, totalLessonsCount, moduleSets: ExerciseSetWithProgress[] }`
- [x] ExerciseSet is static scope — only uses lessons completed at creation time, not lessons completed later
- [x] Unit tests: createCustom with moduleId (eligible, not eligible), XOR validation, generate with module context
- [x] E2E test: `POST /exercise-sets/custom` with moduleId, `GET /exercise-sets/module/:moduleId`

## Blocked by

- `01-module-course-progress-entities` (ModuleProgress needed for eligibility)
- `02-exercise-set-schema-extension-context-loader` (ExerciseContextLoader + schema changes needed)

## Implementation notes

### Files created

- `backend/src/infrastructure/genai/prompts/exercise-generation-module.yaml` — YAML prompt template for module-level exercise generation with variables {{moduleTitle}}, {{lessonCount}}, {{lessonContexts}}, {{userPromptSection}}; emphasizes cross-lesson integrative questions
- `backend/test/module-custom-practice.e2e-spec.ts` — E2E tests for POST /exercise-sets/custom with moduleId (eligible/not eligible, XOR validation), GET /exercise-sets/module/:moduleId (eligibility, sets, 404)

### Files modified

- `backend/src/modules/exercises/dto/create-custom-set.dto.ts` — lessonId became optional; added optional moduleId and courseId fields; added `@IsXorScope()` custom validator ensuring exactly one of lessonId/moduleId/courseId is provided
- `backend/src/modules/exercises/application/exercise-set.service.ts` — Changed `createCustom()` signature from `(lessonId, config, userId, userPrompt)` to `(scope: {lessonId?, moduleId?, courseId?}, config, userId, userPrompt)`; added moduleId eligibility check (queries module lessons + UserProgress, 400 if 0 completed); added courseId eligibility check; added `findByModuleId()` method returning `{ eligible, completedLessonsCount, totalLessonsCount, moduleSets }`; injected ProgressRepository, ModuleProgressRepository, ModulesRepository, CoursesRepository; added `ModuleExerciseSummary` interface
- `backend/src/modules/exercises/application/exercise-generation.service.ts` — Updated `doGenerate()` to detect module-level sets (set.moduleId), query completed lesson IDs via progress repo, call `contextLoader.loadModuleContext()`, render with `exercise-generation-module` template; added `formatMergedContext()` method; injected ProgressRepository, ModuleProgressRepository, ModulesRepository
- `backend/src/modules/exercises/application/repositories/exercise-sets.repository.ts` — Replaced `findActiveCustomSetsByLesson()` with `findActiveCustomSetsByModule()` and `findActiveCustomSetsByCourse()`
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — Updated `createCustom` handler to pass scope object `{ lessonId, moduleId, courseId }`; added `GET /exercise-sets/module/:moduleId` endpoint with Swagger docs
- `backend/src/modules/exercises/exercises.module.ts` — Added `forwardRef(() => ProgressModule)` and `forwardRef(() => CoursesModule)` imports to inject progress/course repositories
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Updated createCustom call signatures to use scope object; added XOR violation tests (no scope, multiple scopes); added moduleId eligible/not-eligible tests; added findByModuleId tests; added mock providers for ProgressRepository, ModuleProgressRepository, ModulesRepository, CoursesRepository
- `backend/src/modules/exercises/application/exercise-generation.service.spec.ts` — Added module-level generation tests (uses loadModuleContext, renders with exercise-generation-module template, throws when module not found); added mock providers for ProgressRepository, ModuleProgressRepository, ModulesRepository
- `backend/src/modules/exercises/application/exercise-set.service.resume.spec.ts` — Updated constructor to include new dependencies
- `backend/src/modules/exercises/application/exercise-set.service.summary.spec.ts` — Updated constructor to include new dependencies

### Files deleted

- None
