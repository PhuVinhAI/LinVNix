Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

When an admin adds a new lesson to a completed module, the existing ModuleProgress must transition from COMPLETED to IN_PROGRESS (score and completedAt preserved). Similarly, when a new module is added to a completed course, the CourseProgress transitions to IN_PROGRESS. This keeps completion status accurate as course content evolves. No effect on non-completed modules/courses. Update CourseContentService to inject progress module repositories and perform invalidation after content changes.

## Acceptance criteria

- [ ] Adding a lesson to a completed module transitions ModuleProgress status to IN_PROGRESS (preserves score and completedAt)
- [ ] Adding a module to a completed course transitions CourseProgress status to IN_PROGRESS (preserves score and completedAt)
- [ ] Adding a lesson to a non-completed module has no effect on ModuleProgress (no-op if no progress exists)
- [ ] Adding a module to a non-completed course has no effect on CourseProgress
- [ ] CourseContentService injects progress module repositories (not services) for invalidation checks
- [ ] Unit tests for CourseContentService invalidation logic

## Blocked by

- `01-module-course-progress-entities` (ModuleProgress & CourseProgress entities must exist)
