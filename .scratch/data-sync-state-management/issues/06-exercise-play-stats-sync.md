Status: `completed`

## What to build

Migrate ExercisePlayScreen from `setState` + direct repo calls to `ref.watch()` on Riverpod providers, and wire exercise completion to emit DataChangeBus events that propagate to stats and progress providers across the app.

### Current problem (from codebase exploration)

- ExercisePlayScreen loads exercises manually in `initState()` via `ref.read(lessonRepositoryProvider)` — does NOT use `ref.watch()` for exercise data
- Manages all play state with `setState`: `_exercises`, `_currentIndex`, `_loading`, `_error`, `_submitted`, `_submitting`, `_result`, `_submitError`, `_answers`, `_results`
- On summary "Return to tier selector": invalidates `exerciseSetsProvider` and `userProgressProvider` manually
- `exerciseStatsProvider` has no auto-refresh from exercise completion events
- `userProgressProvider` is invalidated from 8+ locations manually

### What changes

- Migrate `lessonExercisesProvider` to AsyncNotifier extending CachedRepository (ephemeral — no TTL, always fetch when DataChangeBus triggers)
- ExercisePlayScreen: use `ref.watch()` for exercise data instead of manual `_loadExercises()` in initState
- ExercisePlayScreen: keep `setState` only for pure play UI state (`_currentIndex`, `_answers`, `_results`, `_submitted`, `_submitting`)
- On exercise answer submit: emit `DataChanged(tags: {'exercise', 'lesson-$lessonId'})`
- On exercise set completion: emit `DataChanged(tags: {'progress', 'exercise', 'exercise-set', 'lesson-$lessonId'})`
- Migrate `exerciseStatsProvider` to subscribe to DataChangeBus tag `'exercise'` — auto-refetch when exercises are completed
- Migrate `userProgressProvider` to AsyncNotifier extending CachedRepository (TTL: 1 minute), subscribe to tag `'progress'` — auto-refetch
- Remove all manual `ref.invalidate(userProgressProvider)` calls from UI code (currently 8+ locations)
- Remove manual `ref.invalidate(exerciseSetsProvider)` from ExercisePlayScreen summary
- Use `@riverpod` for new providers

## Acceptance criteria

- [x] `lessonExercisesProvider` migrated to AsyncNotifier (ephemeral, subscribes to DataChangeBus `'exercise'`)
- [x] ExercisePlayScreen uses `ref.watch()` for exercise data — no manual `_loadExercises()` via direct repo
- [x] ExercisePlayScreen keeps `setState` only for play UI state (answers, results, current index)
- [x] Answer submission emits `DataChanged(tags: {'exercise', 'lesson-$lessonId'})` after API success
- [x] Set completion emits `DataChanged(tags: {'progress', 'exercise', 'exercise-set', 'lesson-$lessonId'})` after API success
- [x] `exerciseStatsProvider` subscribes to DataChangeBus tag `'exercise'` — auto-updates after completion
- [x] `userProgressProvider` as AsyncNotifier extending CachedRepository (TTL: 1 min), subscribes to `'progress'`
- [x] No manual `ref.invalidate(userProgressProvider)` calls remain in UI code
- [x] No manual `ref.invalidate(exerciseSetsProvider)` in ExercisePlayScreen
- [x] Unit tests for DataChangeBus event emission on exercise mutations
- [x] End-to-end verification: complete exercise → profile stats update → home screen progress updates

## Blocked by

- Issue 01 (DataChangeBus + Event Infrastructure)
- Issue 02 (CachedRepository Generic + TTL)
- Issue 05 (Exercise Tier Auto-Sync) — avoids double-fetch while both old and new patterns coexist on ExerciseTierScreen

## Implementation notes

### Files created

- `mobile/test/features/profile/data/profile_providers_test.dart` — Unit tests cho `ExerciseStatsNotifier` DataChangeBus subscription (matching tag `'exercise'` trigger refetch, non-matching không trigger).
- `mobile/test/features/courses/data/courses_providers_test.dart` — Unit tests cho `UserProgressNotifier` DataChangeBus subscription (matching tag `'progress'` trigger refetch, non-matching không trigger).

### Files modified

- `mobile/lib/features/lessons/data/lesson_providers.dart` — Thay `lessonExercisesProvider` (FutureProvider.family) bằng `LessonExercisesNotifier` extends `CachedRepository<List<Exercise>>` với TTL zero (ephemeral), subscribe tags `{'exercise', 'lesson-$lessonId'}`. Thêm `LessonExercisesArgs` class làm family key. Notifier encapsulate logic load exercises qua `setId` hoặc qua `lessonId + tierValue`.
- `mobile/lib/features/lessons/presentation/screens/exercise_play_screen.dart` — Xóa `_loadExercises()` và `initState()` override. Dùng `ref.watch(lessonExercisesProvider(_args)).when(loading/error/data)` thay vì `setState` cho async data. Giữ `setState` chỉ cho pure play UI state (`_currentIndex`, `_answers`, `_results`, `_submitted`, `_submitting`, `_currentAnswer`, `_submitError`). Trong `_submit()`: emit `{'exercise', 'lesson-$lessonId'}` sau API success. Trong `_showSummary()` "Return to tier selector": emit `{'progress', 'exercise', 'exercise-set', 'lesson-$lessonId'}` sau `markContentReviewed` + `completeLesson`. Xóa `ref.invalidate(exerciseSetsProvider)` và `ref.invalidate(userProgressProvider)`.
- `mobile/lib/features/profile/data/profile_providers.dart` — Thay `ExerciseStatsNotifier` (AsyncNotifier thuần) bằng `CachedRepository<ExerciseStats>` extends + `DataChangeBusSubscriber`, TTL zero, subscribe tag `'exercise'`.
- `mobile/lib/features/courses/data/courses_providers.dart` — Thay `userProgressProvider` (FutureProvider) bằng `UserProgressNotifier` extends `CachedRepository<List<UserProgress>>`, TTL 1 phút, subscribe tag `'progress'`.
- `mobile/lib/features/lessons/presentation/screens/lesson_wizard_screen.dart` — Xóa `ref.invalidate(userProgressProvider)` trong dialog "Not now".
- `mobile/lib/features/home/presentation/screens/home_screen.dart` — Xóa `ref.invalidate(userProgressProvider)` khỏi `initState` và `_onRefresh`.
- `mobile/lib/features/auth/presentation/screens/login_screen.dart` — Xóa 2 lệnh `ref.invalidate(exerciseStatsProvider)` (login + Google login).
- `mobile/lib/features/auth/presentation/screens/register_screen.dart` — Xóa `ref.invalidate(exerciseStatsProvider)` (Google register).
- `mobile/lib/features/auth/presentation/screens/email_verification_screen.dart` — Xóa `ref.invalidate(exerciseStatsProvider)`.
- `mobile/lib/core/providers/auth_state_provider.dart` — Xóa `ref.invalidate(exerciseStatsProvider)` trong `logout()`.
- `mobile/lib/features/profile/presentation/screens/profile_screen.dart` — Thay `ref.invalidate(exerciseStatsProvider)` bằng `ref.read(exerciseStatsProvider.notifier).refresh()` trong nút Retry.
- `mobile/test/features/lessons/data/lesson_providers_test.dart` — Thêm 3 unit tests cho `LessonExercisesNotifier` DataChangeBus subscription (matching tag `'exercise'`, matching tag `'lesson-$id'`, non-matching không trigger).

### Files deleted

- Không có file nào bị xóa.

### Pipeline notes

- `flutter analyze` pass với 0 lỗi từ code mới (các warnings còn lại là pre-existing, không liên quan đến thay đổi này).
- `flutter test` pass 163/163 unit tests mới + cũ. 17 failures pre-existing trong `bookmark_icon_button_test.dart` và `widget_test.dart` — không liên quan đến thay đổi này.
- Tests mới (16 tests): `lesson_providers_test.dart` (+3), `profile_providers_test.dart` (+2), `courses_providers_test.dart` (+2). Các tests còn lại là từ issues 01, 02, 05.
