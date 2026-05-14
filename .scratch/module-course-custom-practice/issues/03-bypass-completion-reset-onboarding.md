Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Implement bypass completion flow on the backend. Add `POST /progress/course/:courseId/complete-all` that validates the user's level is higher than the course level (403 if not), then transactionally creates CourseProgress (COMPLETED, score=null), ModuleProgress (COMPLETED, score=null) for every module, and UserProgress (COMPLETED, score=null, contentViewed=true) for every lesson in the course. Add `POST /progress/course/:courseId/reset` that transactionally deletes CourseProgress, all ModuleProgress for the course's modules, all UserProgress for the course's lessons, all UserExerciseResults for the course's exercises, and soft-deletes all custom ExerciseSets (isCustom=true) belonging to the course. Add `POST /users/onboarding` endpoint that accepts OnboardingDto with `completeLowerCourses` flag — when true, calls completeAllCourseProgress for all courses whose level is below the user's current level. Also update `PATCH /users/me` to trigger completeAllCourseProgress for lower courses when level increases.

## Acceptance criteria

- [ ] `POST /progress/course/:courseId/complete-all` — validates user level > course level (403 if not, 404 if course not found), transactionally creates CourseProgress + all ModuleProgress + all UserProgress with score=null
- [ ] `POST /progress/course/:courseId/reset` — transactionally deletes CourseProgress + all ModuleProgress + all UserProgress + all UserExerciseResults + soft-deletes custom ExerciseSets for the course
- [ ] Both operations are atomic (@Transactional) — either all changes persist or none do
- [ ] Bypass-completed lessons have score=null (distinguishable from normal completion)
- [ ] `POST /users/onboarding` with `completeLowerCourses=true` cascades complete-all for all lower-level courses
- [ ] `PATCH /users/me` level increase triggers complete-all for newly lower courses (upsert-safe via unique constraints)
- [ ] `completeAllCourseProgress()` skips if no lower courses exist in DB (no error)
- [ ] Reset can be called multiple times (idempotent after first reset)
- [ ] Complete-all can be called again after reset
- [ ] OnboardingDto: `{ currentLevel: string, preferredDialect?: string, dailyGoal?: number, completeLowerCourses: boolean }`
- [ ] Unit tests for ProgressService bypass + reset logic
- [ ] E2E tests for complete-all, reset, and onboarding endpoints

## Blocked by

- `01-module-course-progress-entities` (ModuleProgress & CourseProgress entities must exist)
