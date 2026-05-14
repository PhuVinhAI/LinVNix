Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Add a bypass completion dialog to the OnboardingScreen. Between step 0 (level selection) and step 1 (dialect selection), if the selected level is greater than A1, show a dialog asking "Mark lower-level courses as completed?" with Yes/No options. Store the `_completeLowerCourses` bool. When A1 is selected, no dialog appears. Update `_submit()` to call `POST /users/onboarding` instead of `PATCH /users/me` + `repository.updateMe()`, including the `completeLowerCourses` flag along with currentLevel, preferredDialect, and dailyGoal. Use frontend UserLevel enum comparison to determine which courses are lower — no API call needed for the dialog logic.

## Acceptance criteria

- [ ] Bypass dialog appears between level step and dialect step when selectedLevel > A1
- [ ] Dialog does NOT appear when A1 is selected
- [ ] Dialog text: "Mark lower-level courses as completed?" with Yes/No
- [ ] `_completeLowerCourses` bool stored locally based on dialog response
- [ ] `_submit()` calls `POST /users/onboarding` with `{ currentLevel, preferredDialect, dailyGoal, completeLowerCourses }`
- [ ] Level comparison uses frontend enum (no API call for dialog logic)
- [ ] If user selects No or skips, `completeLowerCourses=false`
- [ ] Widget test: dialog appears when level > A1
- [ ] Widget test: dialog does not appear when level = A1
- [ ] Widget test: submit payload includes `completeLowerCourses` flag

## Blocked by

- `03-bypass-completion-reset-onboarding` (backend `POST /users/onboarding` endpoint must exist)
