Status: done

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the exercise rendering and submission system within the lesson wizard. Implement a strategy pattern with abstract `ExerciseRenderer` and 6 concrete implementations, each with `buildQuestion(options)`, `buildInput()`, `validateAnswer()`, `submitAnswer()`. The 6 types and their UI:

- **multiple_choice**: selectable chips, single selection
- **fill_blank**: TextField(s) per blank, supports accepted answers
- **matching**: tap-to-pair left items with right items
- **ordering**: reorderable list via long-press + drag
- **translation**: text input, supports accepted translations
- **listening**: audio player + text input for transcription

Exercise options/answer use sealed class discriminated unions matching the backend JSONB schema. Shared widgets: QuestionHeader, TimerBar (countdown per exercise, 60s–180s by type), SubmitButton, ExplanationPanel (shows correct answer + explanation on incorrect). Answer submission via `POST /exercises/:id/submit` returns `{ isCorrect, score }`. After all exercises, calculate and display overall lesson score, then call `POST /progress/lesson/:id/complete` with score. Users can view exercise stats via `GET /exercises/my-stats` and `GET /exercises/my-results`.

## Acceptance criteria

- [x] All 6 exercise types render with correct UI per type
- [x] multiple_choice: tap chips, single select, submit
- [x] fill_blank: text fields per blank, accepted answers matched
- [x] matching: tap-to-pair left/right items, visual feedback
- [x] ordering: long-press drag to reorder
- [x] translation: text input, accepted translations matched
- [x] listening: audio plays, text input for transcription
- [x] Timer bar counts down per exercise (60s–180s by type)
- [x] Immediate correct/incorrect feedback after submission
- [x] Explanation panel shows correct answer and explanation on incorrect
- [x] Lesson score calculated and displayed after all exercises
- [x] `POST /progress/lesson/:id/complete` called with final score
- [x] Exercise stats accessible (accuracy, time, totals)
- [x] Unit tests for ExerciseRenderer (each type: validation, answer construction, options parsing)

## Implementation notes

**Files created:**
- `lib/features/lessons/domain/exercise_models.dart` — Exercise, sealed ExerciseOptions (6 subtypes), sealed ExerciseAnswer (6 subtypes), ExerciseSubmissionResult
- `lib/features/lessons/domain/exercise_renderer.dart` — abstract ExerciseRenderer interface
- `lib/features/lessons/domain/exercise_renderer_registry.dart` — getRenderer() factory
- `lib/features/lessons/domain/exercise_renderers/` — 6 concrete renderers (multiple_choice, fill_blank, matching, ordering, translation, listening)
- `lib/features/lessons/presentation/widgets/question_header.dart`
- `lib/features/lessons/presentation/widgets/timer_bar.dart`
- `lib/features/lessons/presentation/widgets/submit_button.dart`
- `lib/features/lessons/presentation/widgets/explanation_panel.dart`
- `lib/features/lessons/presentation/widgets/exercise_step.dart` — stateful widget combining all exercise widgets
- `test/features/lessons/domain/exercise_models_test.dart` — 48 unit tests

**Files modified:**
- `lib/features/lessons/data/lesson_repository.dart` — added getExercisesByLesson(), submitExerciseAnswer()
- `lib/features/lessons/data/lesson_providers.dart` — added lessonExercisesProvider
- `lib/features/lessons/presentation/screens/lesson_wizard_screen.dart` — replaced placeholder with ExerciseStepWidget, score tracking, completion dialog
- `lib/features/user/data/user_repository.dart` — added getMyResults()

## Blocked by

- `06-lesson-content-progress`
