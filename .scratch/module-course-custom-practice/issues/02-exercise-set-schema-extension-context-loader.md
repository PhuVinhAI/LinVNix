Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Extend ExerciseSet entity: make `lessonId` nullable, add nullable `moduleId` (FK → Module, SET NULL on delete), nullable `courseId` (FK → Course, SET NULL on delete), nullable `description` (string), nullable `userPrompt` (string, max 500 chars). Make Exercise's `lessonId` nullable as well. Create ExerciseContextLoader service in the exercises module with three methods: `loadLessonContext(lessonId)` (migrated from existing inline logic in ExerciseGenerationService), `loadModuleContext(lessonIds[])` (merge + deduplicate vocabularies by word, grammar rules by ruleName across lessons), `loadCourseContext(lessonIds[])` (same merge logic as module). The loader does NOT query progress — callers pass completed lesson IDs. This enables module/course custom practice generation without circular dependencies.

## Acceptance criteria

- [ ] ExerciseSet: `lessonId` nullable, `moduleId` nullable (FK → Module, SET NULL), `courseId` nullable (FK → Course, SET NULL), `description` nullable string, `userPrompt` nullable string (max 500)
- [ ] Exercise: `lessonId` nullable
- [ ] ExerciseContextLoader service with `loadLessonContext(lessonId)`, `loadModuleContext(lessonIds[])`, `loadCourseContext(lessonIds[])`
- [ ] `loadModuleContext` and `loadCourseContext` deduplicate vocabularies by word and grammar rules by ruleName (keep version from most recently completed lesson — callers sort before passing)
- [ ] `loadModuleContext([])` and `loadCourseContext([])` return empty context
- [ ] ExerciseSetService.generate() migrated to use ExerciseContextLoader.loadLessonContext() instead of inline loading
- [ ] Unit tests for ExerciseContextLoader: single lesson, multi-lesson merge+dedupe, empty input
- [ ] No circular dependencies: exercises module exports ExerciseContextLoader, progress module does not import exercises module services

## Blocked by

None — can start immediately
