Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Create ModuleProgress and CourseProgress entities in the progress module. When `completeLesson()` detects all lessons in a module are completed, auto-create ModuleProgress (status=COMPLETED, score=average of lesson scores, completedAt=now). Same cascade for CourseProgress when all modules in a course are completed. Add new controller endpoints: `GET /progress/module/:moduleId` and `GET /progress/course/:courseId` returning progress with `completedLessonsCount`/`completedModulesCount` and `totalLessonsCount`/`totalModulesCount`. These entities enable all downstream features (bypass completion, custom practice eligibility, progress display).

## Acceptance criteria

- [ ] ModuleProgress entity created with fields: userId, moduleId, status (IN_PROGRESS | COMPLETED), score (nullable number), completedAt (nullable Date), completedLessonsCount, totalLessonsCount; unique constraint on (userId, moduleId)
- [ ] CourseProgress entity created with fields: userId, courseId, status (IN_PROGRESS | COMPLETED), score (nullable number), completedAt (nullable Date), completedModulesCount, totalModulesCount; unique constraint on (userId, courseId)
- [ ] `completeLesson()` in ProgressService triggers ModuleProgress creation (COMPLETED) when all lessons in the module are completed, with score = average of lesson scores
- [ ] ModuleProgress completion triggers CourseProgress creation (COMPLETED) when all modules in the course are completed, with score = average of module scores
- [ ] `GET /progress/module/:moduleId` returns module progress for authenticated user (404 if none)
- [ ] `GET /progress/course/:courseId` returns course progress for authenticated user (404 if none)
- [ ] Unit tests for ProgressService completion cascade logic
- [ ] `synchronize: true` handles schema — no manual migration needed

## Blocked by

None — can start immediately
