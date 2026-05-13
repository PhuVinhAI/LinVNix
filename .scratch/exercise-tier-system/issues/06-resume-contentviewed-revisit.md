Status: `done`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Add content viewing tracking, exercise resume support, revisit flow, and detailed exercise summary.

Backend: Add `contentViewed: boolean` (default false) to UserProgress entity. Content marked as viewed when user reaches last wizard page. Modified: `POST /progress/lesson/:lessonId/complete` considers both contentViewed and exercise completion. Exercise summary endpoint or enhanced progress response includes list of wrong questions.

Mobile: When user reaches last page of content wizard, `contentViewed` is set to true. Resume: if user returns to an incomplete exercise set, show dialog "Continue? (5/10 done)" with options "Continue" and "Start over". Revisit: if contentViewed=true on lesson revisit, offer choice "Review content" or "Do exercises". Summary panel after completing a set: overall stats, list of wrong questions with correct answers, unlock notification if applicable.

## Acceptance criteria

- [x] UserProgress entity has `contentViewed: boolean` (default false)
- [x] contentViewed set to true when user reaches last wizard page
- [x] Lesson "completed" requires contentViewed=true AND at least basic tier completed
- [x] Resume dialog appears on incomplete set revisit: "Continue? (N/M done)"
- [x] "Start over" option resets attempt progress for that set
- [x] Revisit flow: if contentViewed, offer "Review content" or "Do exercises"
- [x] Summary panel shows: overall stats, wrong questions with correct answers
- [x] Summary shows unlock notification if new tier unlocked
- [x] Unit tests for contentViewed logic, resume, and completion conditions
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/01-exerciseset-basic-tier.md`

## Implementation notes

### Files created

- `backend/src/modules/progress/application/progress.service.spec.ts` — Unit tests for ProgressService: markContentReviewed (3 tests), completeLesson with contentViewed+basic tier conditions (4 tests)
- `backend/src/modules/exercises/application/exercise-set.service.resume.spec.ts` — Unit tests for resume & reset: getResumeInfo (4 tests), resetProgress (3 tests)
- `backend/src/modules/exercises/application/exercise-set.service.summary.spec.ts` — Unit tests for summary: getSummary (4 tests)

### Files modified

- `backend/src/modules/progress/domain/user-progress.entity.ts` — Added `contentViewed: boolean` column (default false, name: 'content_viewed')
- `backend/src/modules/progress/application/progress.service.ts` — Added `markContentReviewed()` method, modified `completeLesson()` to require contentViewed=true AND basic tier completed (with TierProgressService injection), added `getLessonExerciseStatus()` for revisit flow
- `backend/src/modules/progress/presentation/progress.controller.ts` — Added `POST /progress/lesson/:lessonId/content-viewed` endpoint, added `GET /progress/lesson/:lessonId/exercise-status` endpoint for revisit flow
- `backend/src/modules/progress/progress.module.ts` — Added `forwardRef(() => ExercisesModule)` import to enable TierProgressService injection
- `backend/src/modules/exercises/application/exercise-set.service.ts` — Added `getResumeInfo()`, `resetProgress()`, `getSummary()` methods with ExercisesRepository + UserExerciseResultsRepository injection; exported ResumeInfo, WrongQuestion, ExerciseSetSummary interfaces
- `backend/src/modules/exercises/application/tier-progress.service.ts` — Added `setId` field to TierProgress interface and populated it in getLessonTierSummary
- `backend/src/modules/exercises/presentation/exercise-set.controller.ts` — Added `GET /exercise-sets/:id/resume`, `POST /exercise-sets/:id/reset`, `GET /exercise-sets/:id/summary` endpoints
- `backend/src/modules/exercises/application/repositories/user-exercise-results.repository.ts` — Added `deleteByUserAndExerciseIds()` method for resetting set progress
- `backend/src/modules/exercises/exercises.module.ts` — Added ExercisesRepository and UserExerciseResultsRepository to exports for ProgressModule consumption
- `backend/src/modules/exercises/application/exercise-set.service.spec.ts` — Updated constructor to include ExercisesRepository and UserExerciseResultsRepository mocks
- `backend/src/modules/exercises/application/tier-progress.service.spec.ts` — Added `setId` field to all TierProgress mock objects

### Files deleted

None
