Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Enable custom practice creation and AI generation at the course level. Update `ExerciseSetService.createCustom()` to accept courseId: query ModuleProgress for completed modules in the course, reject if 0 completed modules (400), create ExerciseSet with courseId FK. Update `ExerciseSetService.generate()` to detect course-level sets, collect all lesson IDs from completed modules (via ModuleProgress → Module → Lessons), pass them to ExerciseContextLoader.loadCourseContext(), use `exercise-generation-course.yaml` template (includes courseTitle, moduleCount, lessonContexts, emphasizes comprehensive cross-module review). Add `GET /exercise-sets/course/:courseId` endpoint returning eligibility (≥1 completed module), counts, and course's custom practice sets.

## Acceptance criteria

- [ ] `createCustom()` with courseId: queries ModuleProgress for completed modules in course, 400 if 0 completed modules, creates ExerciseSet with courseId FK
- [ ] `generate()` for course-level set: collects all lesson IDs from completed modules, passes to ExerciseContextLoader.loadCourseContext()
- [ ] `exercise-generation-course.yaml` created with variables `{{courseTitle}}`, `{{moduleCount}}`, `{{lessonContexts}}`, `{{userPrompt}}`, instructions emphasizing comprehensive cross-module review
- [ ] Course-level generation uses `renderPrompt('exercise-generation-course', ...)` and persists AI-generated title + description
- [ ] `GET /exercise-sets/course/:courseId` returns `{ eligible: boolean, completedModulesCount, totalModulesCount, courseSets: ExerciseSetWithProgress[] }`
- [ ] Course-level exercises only cover content from lessons in completed modules (not in-progress modules)
- [ ] Unit tests: createCustom with courseId (eligible, not eligible), generate with course context
- [ ] E2E test: `POST /exercise-sets/custom` with courseId, `GET /exercise-sets/course/:courseId`

## Blocked by

- `01-module-course-progress-entities` (CourseProgress needed for eligibility)
- `02-exercise-set-schema-extension-context-loader` (ExerciseContextLoader + schema changes needed)
