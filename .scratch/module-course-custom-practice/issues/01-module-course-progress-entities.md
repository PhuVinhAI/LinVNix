Status: done

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Create ModuleProgress and CourseProgress entities in the progress module. When `completeLesson()` detects all lessons in a module are completed, auto-create ModuleProgress (status=COMPLETED, score=average of lesson scores, completedAt=now). Same cascade for CourseProgress when all modules in a course are completed. Add new controller endpoints: `GET /progress/module/:moduleId` and `GET /progress/course/:courseId` returning progress with `completedLessonsCount`/`completedModulesCount` and `totalLessonsCount`/`totalModulesCount`. These entities enable all downstream features (bypass completion, custom practice eligibility, progress display).

## Acceptance criteria

- [x] ModuleProgress entity created with fields: userId, moduleId, status (IN_PROGRESS | COMPLETED), score (nullable number), completedAt (nullable Date), completedLessonsCount, totalLessonsCount; unique constraint on (userId, moduleId)
- [x] CourseProgress entity created with fields: userId, courseId, status (IN_PROGRESS | COMPLETED), score (nullable number), completedAt (nullable Date), completedModulesCount, totalModulesCount; unique constraint on (userId, courseId)
- [x] `completeLesson()` in ProgressService triggers ModuleProgress creation (COMPLETED) when all lessons in the module are completed, with score = average of lesson scores
- [x] ModuleProgress completion triggers CourseProgress creation (COMPLETED) when all modules in the course are completed, with score = average of module scores
- [x] `GET /progress/module/:moduleId` returns module progress for authenticated user (404 if none)
- [x] `GET /progress/course/:courseId` returns course progress for authenticated user (404 if none)
- [x] Unit tests for ProgressService completion cascade logic
- [x] `synchronize: true` handles schema — no manual migration needed

## Blocked by

None — can start immediately

## Implementation notes

### Files created

- `backend/src/modules/progress/domain/module-progress.entity.ts` — ModuleProgress entity with userId, moduleId, status, score, completedAt, completedLessonsCount, totalLessonsCount; @Unique(['userId', 'moduleId'])
- `backend/src/modules/progress/domain/course-progress.entity.ts` — CourseProgress entity with userId, courseId, status, score, completedAt, completedModulesCount, totalModulesCount; @Unique(['userId', 'courseId'])
- `backend/src/modules/progress/application/module-progress.repository.ts` — Repository with create, findByUserAndModule, update, findCompletedByUserInModules
- `backend/src/modules/progress/application/course-progress.repository.ts` — Repository with create, findByUserAndCourse, update

### Files modified

- `backend/src/modules/progress/application/progress.repository.ts` — Added findCompletedByUserInLessons(userId, lessonIds) using In() operator
- `backend/src/modules/progress/application/progress.service.ts` — Added completeLesson cascade: checkModuleCompletion + checkCourseCompletion private methods; added getModuleProgress + getCourseProgress public methods with NotFoundException; injects ModuleProgressRepository, CourseProgressRepository, ModulesRepository, CoursesRepository
- `backend/src/modules/progress/application/progress.service.spec.ts` — Expanded from 5 to 17 tests: cascade tests (module completion, course completion, partial completion, re-completion/update, avg score with nulls) + getModuleProgress/getCourseProgress 404 tests
- `backend/src/modules/progress/presentation/progress.controller.ts` — Added GET /progress/module/:moduleId and GET /progress/course/:courseId endpoints with Swagger docs
- `backend/src/modules/progress/progress.module.ts` — Registered ModuleProgress + CourseProgress in TypeOrmModule.forFeature; added forwardRef(() => CoursesModule); added ModuleProgressRepository + CourseProgressRepository as providers and exports
- `backend/src/modules/courses/courses.module.ts` — Changed ProgressModule import to forwardRef(() => ProgressModule); exported CoursesRepository, ModulesRepository, LessonsRepository

### Files deleted

None
