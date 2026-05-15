Status: done

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Add a bypass completion dialog to the OnboardingScreen. Between step 0 (level selection) and step 1 (dialect selection), if the selected level is greater than A1, show a dialog asking "Mark lower-level courses as completed?" with Yes/No options. Store the `_completeLowerCourses` bool. When A1 is selected, no dialog appears. Update `_submit()` to call `POST /users/onboarding` instead of `PATCH /users/me` + `repository.updateMe()`, including the `completeLowerCourses` flag along with currentLevel, preferredDialect, and dailyGoal. Use frontend UserLevel enum comparison to determine which courses are lower — no API call needed for the dialog logic.

## Acceptance criteria

- [x] Bypass dialog appears between level step and dialect step when selectedLevel > A1
- [x] Dialog does NOT appear when A1 is selected
- [x] Dialog text: "Mark lower-level courses as completed?" with Yes/No
- [x] `_completeLowerCourses` bool stored locally based on dialog response
- [x] `_submit()` calls `POST /users/onboarding` with `{ currentLevel, preferredDialect, dailyGoal, completeLowerCourses }`
- [x] Level comparison uses frontend enum (no API call for dialog logic)
- [x] If user selects No or skips, `completeLowerCourses=false`
- [x] Widget test: dialog appears when level > A1
- [x] Widget test: dialog does not appear when level = A1
- [x] Widget test: submit payload includes `completeLowerCourses` flag

## Blocked by

- `03-bypass-completion-reset-onboarding` (backend `POST /users/onboarding` endpoint must exist)

## Implementation notes

### Files created

_None_

### Files modified

- `mobile/lib/features/user/data/user_repository.dart` — Thêm `submitOnboarding()` method gọi `POST /users/onboarding`
- `mobile/lib/features/onboarding/presentation/screens/onboarding_screen.dart` — Thêm `_completeLowerCourses` bool, `_a1Index` constant, `_showBypassDialog()` method hiện AppDialog "Mark lower-level courses as completed?" với Yes/No khi level > A1, `_goToNextPage()` helper, cập nhật `_nextStep()` để check level trước khi navigate, cập nhật `_skipStep()` để set `_completeLowerCourses=false` khi skip từ step 0, cập nhật `_submit()` để gọi `submitOnboarding()` thay vì `updateMe()` với payload `{ currentLevel, preferredDialect, dailyGoal, completeLowerCourses }`
- `mobile/test/features/onboarding/presentation/screens/onboarding_screen_test.dart` — Thêm `theme: AppTheme.light()` vào MaterialApp, thay `InkWell`/`FilledButton` finder bằng `GestureDetector`/`AppButton` (fix pre-existing test breakage do AppCard/AppButton refactor), cập nhật test "navigates to dialect step" dùng A1 thay B1 (tránh dialog), cập nhật test "Get Started" và "Skip All" để stub `submitOnboarding` thay `updateMe`, thêm 3 test mới: bypass dialog appears when level > A1, dialog does NOT appear when A1, submit payload includes completeLowerCourses flag

### Files deleted

_None_
