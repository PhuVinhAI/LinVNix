Status: done

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

When an admin adds a new lesson to a completed module, the existing ModuleProgress must transition from COMPLETED to IN_PROGRESS (score and completedAt preserved). Similarly, when a new module is added to a completed course, the CourseProgress transitions to IN_PROGRESS. This keeps completion status accurate as course content evolves. No effect on non-completed modules/courses. Update CourseContentService to inject progress module repositories and perform invalidation after content changes.

## Acceptance criteria

- [x] Adding a lesson to a completed module transitions ModuleProgress status to IN_PROGRESS (preserves score and completedAt)
- [x] Adding a module to a completed course transitions CourseProgress status to IN_PROGRESS (preserves score and completedAt)
- [x] Adding a lesson to a non-completed module has no effect on ModuleProgress (no-op if no progress exists)
- [x] Adding a module to a non-completed course has no effect on CourseProgress
- [x] CourseContentService injects progress module repositories (not services) for invalidation checks
- [x] Unit tests for CourseContentService invalidation logic

## Implementation notes

### Files modified

- `backend/src/modules/courses/application/course-content.service.ts` — Injected `ModuleProgressRepository` and `CourseProgressRepository`; added `invalidateModuleProgress()` and `invalidateCourseProgress()` private methods; `createLesson()` calls invalidation after persist; `createModule()` calls invalidation after persist
- `backend/src/modules/courses/application/course-content.service.spec.ts` — Added mocks for both progress repos; added 8 new tests covering all invalidation behaviors (completed→IN_PROGRESS transition, no-op on non-completed, score/completedAt preservation, multiple progress records)
- `backend/src/modules/progress/application/module-progress.repository.ts` — Added `findCompletedByModule(moduleId)` query method
- `backend/src/modules/progress/application/course-progress.repository.ts` — Added `findCompletedByCourse(courseId)` query method

### Files created

(none)

### Files deleted

(none)
