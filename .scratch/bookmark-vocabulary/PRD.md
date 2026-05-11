# PRD: Xóa Vocabulary Review/Mastery, Thay bằng Bookmark + Flashcard + Stats

## Problem Statement

Hệ thống vocabulary hiện tại quá phức tạp cho giai đoạn hiện tại: FSRS spaced-repetition algorithm, mastery level tracking (learning/familiar/mastered), review scheduling, batch review, due-review counting — toàn bộ over-engineered cho một app đang ở giai đoạn đầu. User không cần thuật toán ôn tập tự động; họ chỉ muốn lưu các từ yêu thích vào sổ ghi nhớ để xem lại, và duyệt qua chúng dạng flashcard đơn giản.

## Solution

Xóa toàn bộ hệ thống FSRS/review/mastery tracking (UserVocabulary entity, VocabularyReviewService, FSRSService, SpacedRepetitionService, review DTOs, review endpoints, mobile review feature). Thay bằng:

1. **Bookmark** — Đánh dấu từ vựng yêu thích, CRUD thuần (toggle bookmark + danh sách + search + sort). Nằm trong VocabulariesModule, không tách module riêng.
2. **Flashcard đơn giản** — Xem từ đã bookmark dạng lật card, không có rating/mastery/scheduling. Chỉ duyệt tự do.
3. **Stats trong Profile** — Tổng số từ bookmark + phân bố theo partOfSpeech.

## User Stories

### Bookmark CRUD

1. As a learner, I want to bookmark a vocabulary word from a lesson, so that I can save it to my notebook for later review
2. As a learner, I want to unbookmark a word I already saved, so that I can remove words I no longer need
3. As a learner, I want to toggle bookmark with a single tap on a bookmark icon, so that the interaction is fast and intuitive
4. As a learner, I want to see which words are already bookmarked while browsing a lesson's vocabulary, so that I know at a glance what I've saved
5. As a learner, I want to see which words are already bookmarked in search results, so that I know at a glance what I've saved
6. As a learner, I want to open my bookmarked words list from my profile, so that I can review all saved words in one place
7. As a learner, I want to search my bookmarked words by word or translation, so that I can quickly find a specific word
8. As a learner, I want to sort my bookmarked words by newest, oldest, alphabetical, reverse-alphabetical, or difficulty, so that I can browse in the order I prefer
9. As a learner, I want to unbookmark a word directly from the bookmarks list, so that I don't have to navigate elsewhere
10. As a learner, I want to tap a bookmarked word to see its full details (phonetic, example, classifier, etc.), so that I can review all information about it
11. As a learner, I want my bookmarks list to paginate as I scroll, so that the list loads efficiently even with many words

### Flashcard

12. As a learner, I want to start a flashcard session from my bookmarks screen, so that I can review my saved words interactively
13. As a learner, I want to see the word on the front of a flashcard and flip to see the translation on the back, so that I can test my memory
14. As a learner, I want to hear audio pronunciation when viewing a flashcard, so that I can practice listening
15. As a learner, I want to swipe to move between flashcards, so that I can navigate at my own pace
16. As a learner, I want to see a progress indicator (e.g. 3/20) during a flashcard session, so that I know how far along I am
17. As a learner, I want to exit a flashcard session at any time, so that I'm not locked in

### Stats

18. As a learner, I want to see the total number of bookmarked words in my profile, so that I can track my vocabulary growth
19. As a learner, I want to see a breakdown of my bookmarked words by part of speech, so that I can understand my vocabulary composition

### Admin (unchanged)

20. As an admin, I want to CRUD vocabulary words (create, read, update, soft-delete), so that I can manage lesson content
21. As an admin, I want to upload audio files for vocabulary words, so that learners can hear pronunciation
22. As an admin, I want to upload images for vocabulary words, so that learners can see visual aids

### Cleanup

23. As a developer, I want the FSRS/mastery/review code completely removed, so that the codebase is not burdened with unused over-engineered logic
24. As a developer, I want the "Review" tab removed from the mobile bottom navigation, so that the UI no longer references a deleted feature
25. As a developer, I want the DueReviewCard removed from the home screen, so that the UI no longer references a deleted feature
26. As a developer, I want the bookmark toggle to replace the "Learn" button in the lesson vocabulary step, so that learners save words using the new bookmark paradigm

## Implementation Decisions

### Data model

**Bookmark entity** (table `bookmarks`):
- Extends `BaseEntity` (uuid `id`, `createdAt`, `updatedAt`, soft-delete `deletedAt`)
- `userId` — FK to User, onDelete CASCADE
- `vocabularyId` — FK to Vocabulary, onDelete CASCADE (when vocabulary is soft-deleted, bookmark cascade-deleted)
- Unique constraint on `(userId, vocabularyId)`
- No `note` field — pure bookmark toggle

**Deleted:**
- `UserVocabulary` entity + entire `user_vocabularies` table
- `MasteryLevel` enum
- `ReviewVocabularyDto`, `BatchReviewDto`
- FSRS fields (stability, difficulty, state, elapsedDays, scheduledDays, reps, lapses) — all gone with UserVocabulary

### API contract

**New endpoints** (within `/api/v1/vocabularies`):

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/vocabularies/:vocabularyId/bookmark` | JWT | Toggle bookmark. Returns `{ data: { isBookmarked: boolean } }`. If not bookmarked → create; if already bookmarked → delete. |
| GET | `/vocabularies/bookmarks` | JWT | List bookmarked vocabularies. Query params: `page`, `limit` (default 20), `search` (ILIKE word/translation), `sort` (`newest`|`oldest`|`az`|`za`|`difficulty`, default `newest`). Returns paginated list with full Vocabulary data + `bookmarkedAt`. |

**Deleted endpoints:**

| Method | Path |
|---|---|
| POST | `/vocabularies/:vocabularyId/learn` |
| POST | `/vocabularies/:vocabularyId/review` |
| POST | `/vocabularies/review/batch` |
| GET | `/vocabularies/my-vocabularies` |
| GET | `/vocabularies/due-review` |

**Modified responses:**
- `GET /vocabularies/search` — when user is authenticated, each vocabulary item includes `isBookmarked: boolean`
- `GET /vocabularies/lesson/:lessonId` — when user is authenticated, each vocabulary item includes `isBookmarked: boolean`
- When user is not authenticated, `isBookmarked` is absent or `false`

### Backend module structure

All bookmark logic stays within `VocabulariesModule` — no separate module:

```
vocabularies/
  domain/
    vocabulary.entity.ts          (unchanged)
    bookmark.entity.ts            (NEW)
  dto/
    create-vocabulary.dto.ts      (unchanged)
    review-vocabulary.dto.ts      (DELETED)
    batch-review.dto.ts           (DELETED)
    bookmark-query.dto.ts         (NEW — page, limit, search, sort)
  application/
    vocabularies.service.ts       (MODIFIED — inject BookmarksService for isBookmarked enrichment)
    vocabularies.repository.ts   (unchanged)
    user-vocabularies.service.ts  (DELETED)
    user-vocabularies.repository.ts (DELETED)
    vocabulary-review.service.ts  (DELETED)
    bookmarks.service.ts          (NEW — toggle, list, isBookmarked checks)
    bookmarks.repository.ts      (NEW — CRUD + search + sort)
  presentation/
    vocabularies.controller.ts    (MODIFIED — remove 5 endpoints, add 2 bookmark endpoints)
  vocabularies.module.ts         (MODIFIED — register Bookmark entity + new providers, remove UserVocabulary)
```

**Progress module changes:**
- Remove `vocabularyUpdates` parameter from `ProgressTransactionService.completeLessonWithTransaction()`
- Remove `UserVocabulariesRepository` import and `updateMastery()` call
- Delete `FSRSService` and `SpacedRepetitionService` from progress module
- The transaction only updates lesson progress + exercise results

### Mobile structure

**Deleted:** entire `features/review/` directory (11 files)

**New:**

```
features/bookmarks/
  data/
    bookmark_repository.dart      (toggleBookmark, getBookmarks)
    bookmark_providers.dart       (providers)
  domain/
    bookmark_models.dart          (Bookmark, BookmarkWithVocabulary)
  presentation/
    screens/
      bookmarks_screen.dart      (list + search + sort)
      flashcard_screen.dart      (simple flip card browser)
    widgets/
      bookmark_icon_button.dart  (toggle icon, used in lesson vocab step)
```

**Modified:**
- `features/home/` — remove DueReviewCard, remove dueReviewCountProvider references
- `features/lessons/presentation/widgets/vocabulary_step.dart` — replace "Learn" button with BookmarkIconButton
- `features/profile/` — add "Từ đã lưu" entry + Stats section
- `core/presentation/shell_screen.dart` — remove "Review" tab from bottom nav
- `core/router/app_router.dart` — remove `/review`, `/review/session`, `/vocabulary` routes; add `/bookmarks/flashcard`
- `core/services/audio_player_service.dart` — moved from review feature to core

**AudioPlayerService** relocated from `features/review/presentation/services/` to `core/services/` so flashcard can use it.

### Flashcard behavior

- Opens from BookmarksScreen via a "Học" button
- Full-screen route: `/bookmarks/flashcard`
- Loads all bookmarked vocabularies
- Front: word + phonetic + audio play button
- Back: translation + partOfSpeech + classifier + example sentence + example translation
- Swipe left/right to navigate between cards
- Progress indicator: "3/20" format
- No rating buttons, no mastery tracking, no scheduling
- User can exit at any time via app bar close button

### Stats in Profile

- "Thống kê từ vựng" section in Profile screen
- Total bookmarked words count
- Breakdown by partOfSpeech (e.g., "12 danh từ, 8 động từ, 5 tính từ")
- Data fetched from backend via a dedicated query or derived from bookmarks list

### Database migration

New migration:
- DROP TABLE `user_vocabularies` (all FSRS data gone)
- CREATE TABLE `bookmarks` with columns: id (uuid PK), userId (FK), vocabularyId (FK), createdAt, updatedAt, deletedAt
- ADD unique constraint on (userId, vocabularyId)
- ADD FK with ON DELETE CASCADE for vocabularyId

Existing migration `AddFSRSFields` is left untouched (already ran).

### Sort options for bookmarks list

| Sort value | Order |
|---|---|
| `newest` (default) | bookmarkedAt DESC |
| `oldest` | bookmarkedAt ASC |
| `az` | word ASC |
| `za` | word DESC |
| `difficulty` | difficultyLevel ASC |

### Kept unchanged

- `Vocabulary` entity and its CRUD admin endpoints
- `LessonType.VOCABULARY` enum value
- Upload audio/image endpoints
- Search endpoint
- Lesson ↔ Vocabulary OneToMany relationship

## Testing Decisions

### What makes a good test

Tests verify external behavior, not implementation details. For services: verify correct return values and that repository methods are called with the right arguments. For controllers: verify service methods are called and response format is correct. Mock all dependencies at the boundary.

### Modules to test

1. **BookmarksService** — Test toggle logic (create if not exists, delete if exists), list with pagination/search/sort, isBookmarked batch check. This is the deepest new module and most critical business logic.
2. **BookmarksRepository** — Test CRUD operations, search query building, sort ordering. Standard repository test pattern with mock TypeORM Repository.
3. **VocabulariesController** (bookmark endpoints only) — Test toggle endpoint returns correct `{ isBookmarked }`, test bookmarks list endpoint accepts query params and returns paginated results.
4. **BookmarkIconButton** (widget test) — Test toggle state visually (filled vs outlined icon).

### Modules NOT tested

- FlashcardScreen — pure UI presentation, no logic
- BookmarksScreen — pure UI presentation, delegates to providers
- Stats — simple count query, trivial

### Prior art

- Service specs follow pattern from `vocabulary-review.service.spec.ts` and `progress-transaction.service.spec.ts`
- Repository specs follow pattern from `user-vocabularies.repository.spec.ts`
- Controller specs follow pattern from `ai.controller.spec.ts`
- Widget tests follow Flutter widget test conventions

## Out of Scope

- AI-powered features (not implemented yet)
- Export bookmarks (PDF/CSV)
- Share vocabulary to messaging apps
- Note/annotation on bookmarks
- Bookmark folders/categories
- Spaced repetition or any scheduling algorithm
- Mastery level tracking of any kind
- Admin UI for managing bookmarks (admin manages Vocabulary content, bookmarks are user-owned)
- CONTEXT.md creation or ADRs (not required for this PRD)

## Further Notes

- The `review-vocabulary.dto.ts` file was already unused before this PRD — the controller accepted inline `{ rating, reviewDate? }` body instead of the DTO. This cleanup resolves that orphan.
- MasteryLevel enum was used in both `UserVocabulary` and `ProgressTransactionService`. With UserVocabulary gone, MasteryLevel has no remaining consumers and can be deleted.
- FSRSService was instantiated directly (not injected) in VocabularyReviewService, while a separate FSRSService existed in ProgressModule. Both are deleted, eliminating this duplication.
- The `LessonType.VOCABULARY` enum value is kept — it classifies lesson content type, unrelated to the review system.
- `synchronize: true` in dev means the new `bookmarks` table will be auto-created by TypeORM without running migrations manually. The migration is still created for production use.
