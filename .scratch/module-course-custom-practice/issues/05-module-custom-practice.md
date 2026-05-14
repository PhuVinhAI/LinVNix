Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Enable custom practice creation and AI generation at the module level. Add XOR validation to CreateCustomSetDto so exactly one of lessonId/moduleId/courseId is provided. Update `ExerciseSetService.createCustom()` to accept moduleId: query UserProgress for completed lessons in the module, reject if 0 completed lessons (400), create ExerciseSet with moduleId FK. Update `ExerciseSetService.generate()` to detect module-level sets, query completed lesson IDs via progress repositories, pass them to ExerciseContextLoader.loadModuleContext(), use `exercise-generation-module.yaml` template (includes moduleTitle, lessonCount, lessonContexts, emphasizes cross-lesson integrative questions). Add `GET /exercise-sets/module/:moduleId` endpoint returning eligibility (≥1 completed lesson), counts, and module's custom practice sets.

## Acceptance criteria

- [ ] CreateCustomSetDto: XOR validator ensures exactly one of lessonId/moduleId/courseId is provided (400 on violation)
- [ ] `createCustom()` with moduleId: queries UserProgress for completed lessons in module, 400 if 0 completed, creates ExerciseSet with moduleId FK
- [ ] `generate()` for module-level set: queries completed lesson IDs via progress repos, passes to ExerciseContextLoader.loadModuleContext()
- [ ] `exercise-generation-module.yaml` created with variables `{{moduleTitle}}`, `{{lessonCount}}`, `{{lessonContexts}}`, `{{userPrompt}}`, instructions emphasizing cross-lesson questions
- [ ] Module-level generation uses `renderPrompt('exercise-generation-module', ...)` and persists AI-generated title + description
- [ ] `GET /exercise-sets/module/:moduleId` returns `{ eligible: boolean, completedLessonsCount, totalLessonsCount, moduleSets: ExerciseSetWithProgress[] }`
- [ ] ExerciseSet is static scope — only uses lessons completed at creation time, not lessons completed later
- [ ] Unit tests: createCustom with moduleId (eligible, not eligible), XOR validation, generate with module context
- [ ] E2E test: `POST /exercise-sets/custom` with moduleId, `GET /exercise-sets/module/:moduleId`

## Blocked by

- `01-module-course-progress-entities` (ModuleProgress needed for eligibility)
- `02-exercise-set-schema-extension-context-loader` (ExerciseContextLoader + schema changes needed)
