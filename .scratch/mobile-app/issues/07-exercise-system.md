Status: ready-for-agent

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

Exercise options/answer use freezed discriminated unions matching the backend JSONB schema. Shared widgets: QuestionHeader, TimerBar (countdown per exercise, 60s–180s by type), SubmitButton, ExplanationPanel (shows correct answer + explanation on incorrect). Answer submission via `POST /exercises/:id/submit` returns `{ isCorrect, correctAnswer, explanation, score }`. After all exercises, calculate and display overall lesson score, then call `POST /progress/lesson/:id/complete` with score. Users can view exercise stats via `GET /exercises/my-stats` and `GET /exercises/my-results`.

## Acceptance criteria

- [ ] All 6 exercise types render with correct UI per type
- [ ] multiple_choice: tap chips, single select, submit
- [ ] fill_blank: text fields per blank, accepted answers matched
- [ ] matching: tap-to-pair left/right items, visual feedback
- [ ] ordering: long-press drag to reorder
- [ ] translation: text input, accepted translations matched
- [ ] listening: audio plays, text input for transcription
- [ ] Timer bar counts down per exercise (60s–180s by type)
- [ ] Immediate correct/incorrect feedback after submission
- [ ] Explanation panel shows correct answer and explanation on incorrect
- [ ] Lesson score calculated and displayed after all exercises
- [ ] `POST /progress/lesson/:id/complete` called with final score
- [ ] Exercise stats accessible (accuracy, time, totals)
- [ ] Unit tests for ExerciseRenderer (each type: validation, answer construction, options parsing)

## Blocked by

- `06-lesson-content-progress`
