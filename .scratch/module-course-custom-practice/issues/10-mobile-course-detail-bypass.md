Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Add a custom practice widget and bypass completion controls to the CourseDetailScreen. Custom practice section follows same pattern as module: hidden when no modules completed, "Create Custom Practice" button opens shared bottom sheet creation form, tapping a set opens info view. Display "X/Y modules completed" progress. Add "Complete All" button that appears when user's level is higher than the course level — tapping shows confirmation dialog, then calls `POST /progress/course/:courseId/complete-all`. Add "Reset" button — tapping shows confirmation dialog, then calls `POST /progress/course/:courseId/reset`. Both buttons update the UI reactively after the operation. Add API client methods for course-level exercise sets and progress bypass operations.

## Acceptance criteria

- [ ] Custom practice section on CourseDetailScreen, hidden when 0 modules completed
- [ ] "Create Custom Practice" button opens shared bottom sheet creation form
- [ ] Tapping existing set opens shared bottom sheet info view
- [ ] Course progress displayed as "X/Y modules completed"
- [ ] "Complete All" button visible only when user level > course level
- [ ] Confirmation dialog before complete-all: "Mark all lessons as completed?"
- [ ] "Reset" button visible when course has any progress (including bypass)
- [ ] Confirmation dialog before reset: "Reset all progress? This cannot be undone."
- [ ] Both operations update UI reactively after completion
- [ ] API client methods: fetchCourseExerciseSets, completeAllCourseProgress, resetCourseProgress
- [ ] Widget test: Complete All button only shows when user level > course level
- [ ] Widget test: confirmation dialogs appear before both operations
- [ ] Widget test: Reset button hidden when no progress exists

## Blocked by

- `06-course-custom-practice` (backend course custom practice endpoints must exist)
- `03-bypass-completion-reset-onboarding` (complete-all + reset backend endpoints must exist)
- `08-mobile-shared-bottom-sheet` (shared bottom sheet component must exist)
