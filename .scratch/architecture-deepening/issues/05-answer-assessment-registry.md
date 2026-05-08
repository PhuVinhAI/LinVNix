Status: ready-for-agent

## Parent

PRD: `.scratch/architecture-deepening/PRD.md`

## What to build

Tạo module AnswerAssessment với registry pattern thay switch. Interface:

- `assessAnswer(exerciseType, userAnswer, correctAnswer) → AssessmentResult`
- `AssessmentResult = { isCorrect: boolean, similarity?: number, partialCredit?: number, feedback?: string }`

Mỗi loại bài tập implement `CheckerAdapter` interface: `check(userAnswer, correctAnswer) → AssessmentResult`. Registry: `Map<ExerciseType, CheckerAdapter>` — thêm loại mới = thêm entry, không sửa switch.

6 CheckerAdapter tồn tại cho 6 ExerciseType hiện có (MULTIPLE_CHOICE, FILL_BLANK, MATCHING, ORDERING, TRANSLATION, LISTENING). Mỗi adapter xử lý đúng định dạng mới (ExerciseAnswer types), KHÔNG xử lý old format (shim ở slice #6).

ExercisesService gọi `AnswerAssessment.assessAnswer()` thay vì `ExerciseCheckerService.checkAnswer()`. HTTP API contract không đổi (controller vẫn trả boolean `isCorrect` từ `AssessmentResult.isCorrect`).

Viết Jest *.spec.ts cho AnswerAssessment — test từng CheckerAdapter độc lập qua cùng interface, assert trên `AssessmentResult`.

## Acceptance criteria

- [ ] `AnswerAssessment` module tồn tại với `assessAnswer` trả `AssessmentResult`
- [ ] 6 `CheckerAdapter` tồn tại, mỗi cái xử lý đúng định dạng mới
- [ ] Registry `Map<ExerciseType, CheckerAdapter>` hoạt động, không có switch
- [ ] `ExercisesService` gọi `AnswerAssessment.assessAnswer()` thay vì `ExerciseCheckerService`
- [ ] Jest *.spec.ts cho mỗi CheckerAdapter pass, assert trên `AssessmentResult`
- [ ] Exercise integration tests (`exercises.test.ts`) vẫn pass
- [ ] HTTP API contract không đổi

## Blocked by

None - can start immediately
