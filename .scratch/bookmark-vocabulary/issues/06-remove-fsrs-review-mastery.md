Status: ready-for-agent

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

Remove the entire FSRS/review/mastery system from both backend and mobile. This is cleanup — all replacement functionality (bookmark, flashcard) must already be in place.

**Backend — DELETE**:
- `modules/vocabularies/domain/user-vocabulary.entity.ts`
- `modules/vocabularies/dto/review-vocabulary.dto.ts`
- `modules/vocabularies/dto/batch-review.dto.ts`
- `modules/vocabularies/application/user-vocabularies.service.ts`
- `modules/vocabularies/application/repositories/user-vocabularies.repository.ts` (+ `.spec.ts`)
- `modules/vocabularies/application/vocabulary-review.service.ts` (+ `.spec.ts`)
- `modules/progress/application/fsrs.service.ts`
- `modules/progress/application/spaced-repetition.service.ts`
- `common/enums/mastery-level.enum.ts`
- Constants in `common/constants/index.ts`: `SPACED_REPETITION_INTERVALS`, `FSRS_CONFIG`, `MASTERY_THRESHOLDS`

**Backend — MODIFY**:
- `vocabularies.controller.ts` — remove 5 endpoints: `POST /:vocabularyId/learn`, `POST /:vocabularyId/review`, `POST /review/batch`, `GET /my-vocabularies`, `GET /due-review`
- `vocabularies.module.ts` — remove UserVocabulary entity, UserVocabulariesRepository, VocabularyReviewService providers
- `progress.module.ts` — remove UserVocabulary entity, FSRSService, SpacedRepetitionService, UserVocabulariesRepository
- `progress-transaction.service.ts` — remove `vocabularyUpdates` parameter, remove `updateMastery()` call
- `user.entity.ts` — remove `@OneToMany('UserVocabulary', 'user')` relation
- `common/constants/index.ts` — remove FSRS/mastery constants

**Mobile — DELETE**:
- Entire `features/review/` directory (11 files)

**Mobile — MODIFY**:
- `core/presentation/shell_screen.dart` — remove "Review" tab (index 2), shift to 3 tabs
- `core/router/app_router.dart` — remove `/review`, `/review/session`, `/vocabulary` routes; add `/bookmarks/flashcard`
- `features/home/` — remove DueReviewCard, remove `dueReviewCountProvider` references
- `features/lessons/presentation/widgets/vocabulary_step.dart` — verify "Learn" button already replaced (should be done by slice 02)

## Acceptance criteria

- [ ] All deleted files and code removed; no remaining imports referencing deleted modules
- [ ] 5 review endpoints removed from controller; no route references them
- [ ] Progress module no longer depends on UserVocabulary or FSRS
- [ ] Mobile Review tab removed; 3-tab bottom nav (Home, Courses, Profile)
- [ ] DueReviewCard removed from Home screen
- [ ] `/review`, `/review/session`, `/vocabulary` routes removed
- [ ] `lint` and `typecheck` pass on both backend and mobile

## Blocked by

- `.scratch/bookmark-vocabulary/issues/02-bookmark-toggle-lesson-search.md` (Learn button must be replaced first)
- `.scratch/bookmark-vocabulary/issues/03-bookmarks-list-screen.md` (BookmarksScreen must exist to replace Review tab destination)
