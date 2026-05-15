Status: done

## Parent

`.scratch/daily-goals/PRD.md`

## What to build

Learners set goals during onboarding — replace step-3 slider "words per day" with 3 preset toggles + sliders. Each preset: goal type label, toggle on/off, slider with appropriate range. Defaults: EXERCISES=10 (on), STUDY_MINUTES=15 (on), LESSONS=2 (off). Submit creates goals via DailyGoals API. Migration for existing users: when opening app with no backend goals, create defaults.

## Acceptance criteria

- [x] Mobile: replace `_DailyGoalStep` with new widget having 3 rows (EXERCISES, STUDY_MINUTES, LESSONS)
- [x] Each row: goal type label + icon, toggle switch, slider (visible when on) with appropriate range
- [x] Defaults: EXERCISES=10 (on), STUDY_MINUTES=15 (on), LESSONS=2 (off)
- [x] On submit: call DailyGoals CRUD API to create each enabled goal (instead of sending `dailyGoal` in onboarding payload)
- [x] Remove `_dailyGoalKey` from PreferencesService (and `setDailyGoal` method, `dailyGoal` getter, `clearOnboardingState` no longer removes this key)
- [x] Migration for existing users: when app opens + user has completed onboarding + backend goals list is empty → auto-create defaults (EXERCISES=10, STUDY_MINUTES=15)
- [x] Onboarding test updated: verify goals created via API instead of `dailyGoal` field
- [x] Lint + typecheck pass

## Blocked by

- `.scratch/daily-goals/issues/01-daily-goal-crud.md`

## Implementation notes

### Files created

- `mobile/test/features/daily_goals/data/daily_goals_notifier_test.dart` — 4 unit tests for migration logic: auto-creates defaults when onboarding completed + goals empty, does not migrate when onboarding not completed, does not migrate when goals exist, does not migrate when already migrated

### Files modified

- `mobile/lib/core/storage/preferences_service.dart` — Removed `_dailyGoalKey`, `dailyGoal` getter, `setDailyGoal` method; removed `_dailyGoalKey` removal from `clearOnboardingState`; added `_dailyGoalsMigratedKey`, `isDailyGoalsMigrated` getter, `setDailyGoalsMigrated` method
- `mobile/lib/features/daily_goals/data/daily_goals_providers.dart` — Added migration logic in `fetchFromApi()`: when goals list is empty AND user has completed onboarding AND not yet migrated, auto-creates EXERCISES=10 and STUDY_MINUTES=15 goals via API and sets migration flag
- `mobile/test/features/onboarding/presentation/screens/onboarding_screen_test.dart` — Updated all tests: added `MockDailyGoalsRepository` with `dailyGoalsRepositoryProvider` override; updated daily goal step assertions to Vietnamese text (`Đặt mục tiêu hàng ngày`, `Bài tập`, `Phút học`, `Bài học`) and 3 toggles / 2 sliders; removed `'dailyGoal': 20` from all `submitOnboarding` verify calls; added `verify` calls for `createGoal` on enabled goal types (EXERCISES=10, STUDY_MINUTES=15) and `verifyNever` for LESSONS

### Files deleted

None
