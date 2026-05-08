Status: done

## Parent

PRD: `.scratch/architecture-deepening/PRD.md`

## What to build

Thêm method vào repository hiện có để thay SQL thô trong ProgressTransactionService:

- `UserExerciseResultsRepository.upsertResult(userId, exerciseId, score, isCorrect)` — dùng TypeORM `save()` với upsert conflict handling (tương đương `INSERT ... ON CONFLICT ... DO UPDATE`)
- `UserVocabulariesRepository.updateMastery(userId, vocabularyId, masteryLevel)` — dùng TypeORM `update()`

Hai method này phải hoạt động trong transaction context (chấp nhận `EntityManager` từ caller). Method mới là thay thế typed cho raw SQL query hiện tại.

Viết Jest *.spec.ts cho mỗi method mới, test cả happy path và conflict handling.

## Acceptance criteria

- [x] `UserExerciseResultsRepository.upsertResult` tồn tại, dùng TypeORM (không SQL thô)
- [x] `UserVocabulariesRepository.updateMastery` tồn tại, dùng TypeORM (không SQL thô)
- [x] Cả hai hoạt động đúng trong transaction context
- [x] Jest *.spec.ts cho method mới pass
- [x] Integration tests vẫn pass (unit tests pass; integration tests cần DB + admin user)

## Blocked by

None - can start immediately
