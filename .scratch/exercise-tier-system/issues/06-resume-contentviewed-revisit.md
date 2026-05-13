Status: `ready-for-agent`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Add content viewing tracking, exercise resume support, revisit flow, and detailed exercise summary.

Backend: Add `contentViewed: boolean` (default false) to UserProgress entity. Content marked as viewed when user reaches last wizard page. Modified: `POST /progress/lesson/:lessonId/complete` considers both contentViewed and exercise completion. Exercise summary endpoint or enhanced progress response includes list of wrong questions.

Mobile: When user reaches last page of content wizard, `contentViewed` is set to true. Resume: if user returns to an incomplete exercise set, show dialog "Continue? (5/10 done)" with options "Continue" and "Start over". Revisit: if contentViewed=true on lesson revisit, offer choice "Review content" or "Do exercises". Summary panel after completing a set: overall stats, list of wrong questions with correct answers, unlock notification if applicable.

## Acceptance criteria

- [ ] UserProgress entity has `contentViewed: boolean` (default false)
- [ ] contentViewed set to true when user reaches last wizard page
- [ ] Lesson "completed" requires contentViewed=true AND at least basic tier completed
- [ ] Resume dialog appears on incomplete set revisit: "Continue? (N/M done)"
- [ ] "Start over" option resets attempt progress for that set
- [ ] Revisit flow: if contentViewed, offer "Review content" or "Do exercises"
- [ ] Summary panel shows: overall stats, wrong questions with correct answers
- [ ] Summary shows unlock notification if new tier unlocked
- [ ] Unit tests for contentViewed logic, resume, and completion conditions
- [ ] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/01-exerciseset-basic-tier.md`
