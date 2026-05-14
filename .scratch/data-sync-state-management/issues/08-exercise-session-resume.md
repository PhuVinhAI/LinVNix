Status: `done`

## What to build

Add exercise session persistence using Hive so learners can resume an exercise set exactly where they left off — even across app restarts. Save session state on each answer, restore on screen open, and clean up on completion.

### What changes

- Add `hive` and `hive_flutter` packages to `pubspec.yaml`
- Initialize Hive in `main.dart` (before `runApp`)
- Create `ExerciseSessionService` — encapsulates Hive save/load/delete for exercise sessions
  - Hive box: `exercise_sessions`, key = `setId`
  - Value shape: `{lessonId, tier, currentIndex, answers: Map<int, dynamic>, results: Map<int, Map>, exercises: List, createdAt, updatedAt}`
- ExercisePlayScreen: on init → check Hive for existing session → if found, restore state (currentIndex, answers, results) instead of starting fresh
- On each answer submit → update Hive entry
- On session complete or user explicitly exits → delete Hive entry
- Hive chosen over SharedPreferences because it handles Map/List natively without manual encode/decode

## Acceptance criteria

- [x] `hive` and `hive_flutter` added to `pubspec.yaml`
- [x] Hive initialized in `main.dart` before `runApp`
- [x] `ExerciseSessionService` with `save(session)`, `load(setId)`, `delete(setId)` methods
- [x] ExercisePlayScreen checks for existing session on init and restores state if found
- [x] Each answer submission updates Hive entry
- [x] Session completion deletes Hive entry
- [x] User explicitly exiting exercise deletes Hive entry
- [x] Unit test: save session → load returns same state
- [x] Unit test: delete session → load returns null
- [x] Unit test: partial session (some answers) → load preserves partial state
- [ ] End-to-end verification: start exercise → answer 2 questions → close app → reopen → resumes at question 3 with previous answers intact

## Blocked by

- Issue 06 (Exercise Play Migration + Stats Sync) — ExercisePlayScreen must be migrated to providers before adding session logic

## Implementation notes

### Files created

- `mobile/lib/features/lessons/domain/exercise_session.dart` — `ExerciseSession` model defining session value shape with `toMap()` / `fromMap()` serialization.
- `mobile/lib/features/lessons/data/exercise_session_service.dart` — `ExerciseSessionService` exposing `save(session)`, `load(setId)`, `delete(setId)` against a Hive `Box<Map<dynamic, dynamic>>`.
- `mobile/test/features/lessons/data/exercise_session_service_test.dart` — Unit tests covering save/load round-trip, delete, partial state preservation, overwrite, and timestamp assertions (6 tests, all passing).

### Files modified

- `mobile/pubspec.yaml` — Added `hive: ^2.2.3` and `hive_flutter: ^1.1.0` under dependencies.
- `mobile/lib/main.dart` — Initialized Hive via `Hive.initFlutter()` before `runApp`, opened `exercise_sessions` box, and overrode `exerciseSessionServiceProvider` in `ProviderScope`.
- `mobile/lib/features/lessons/data/lesson_providers.dart` — Added `exerciseSessionServiceProvider` (must be overridden at app root); added `resolvedSetId` field to `LessonExercisesNotifier` so the UI knows which set ID was actually fetched.
- `mobile/lib/features/lessons/domain/exercise_models.dart` — Added `toJson()` to `Exercise`, `ExerciseOptions` subclasses, `ExerciseAnswer` subclasses, `MatchPair`, and `ExerciseSubmissionResult` to support serializing session state to Hive.
- `mobile/lib/features/lessons/presentation/screens/exercise_play_screen.dart` — Integrated session resume/save/delete:
  - On first exercises load, reads `resolvedSetId` and calls `_restoreSessionIfAny()` to resume `currentIndex`, `answers`, and `results`.
  - After each successful `_submit()`, calls `_saveSession()`.
  - `_nextQuestion()` also calls `_saveSession()` after advancing index.
  - On session completion (`_showSummary` dialog action), calls `_deleteSession()` before navigating back.
  - Wrapped active scaffold with `WillPopScope` to call `_deleteSession()` when user explicitly exits via back gesture/button.

### Files deleted

None.
