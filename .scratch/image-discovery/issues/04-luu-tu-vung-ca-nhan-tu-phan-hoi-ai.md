Status: done

## Parent

.scratch/image-discovery/PRD.md

## What to build

Học viên can save AI-extracted vocabulary as Từ vựng cá nhân with one tap from the Khám phá ảnh chat.

**Backend**: ImageAnalysis response `vocabularies` array now populated (was empty `[]` in slice 02 schema definition; this slice makes AI actually extract words). New endpoint `POST /api/v1/personal-vocabularies/from-analysis` — accepts a vocabulary object from the AI response, creates PersonalVocabulary + auto-creates Bookmark in a single `@Transactional()` call (single tap = create vocab + bookmark).

**Mobile**: `VocabularyCard` widget rendered inline in AI markdown response — displays word, translation, phonetic, partOfSpeech, with a "＋ Thêm" button. Tapping "＋ Thêm" calls the from-analysis endpoint, shows success state (button changes to "Đã thêm" disabled). Vocabulary cards only appear when AI response includes non-empty `vocabularies` array.

## Acceptance criteria

- [x] ImageAnalysis AI response populates `vocabularies` array with structured word data when relevant
- [x] `POST /api/v1/personal-vocabularies/from-analysis` creates PersonalVocabulary + Bookmark in one transaction
- [x] Endpoint requires `@Transactional()` — both succeed or both roll back
- [x] VocabularyCard widget renders inline in AI response with word fields + "＋ Thêm" button
- [x] Tapping "＋ Thêm" calls API, button transitions to "Đã thêm" (disabled) on success
- [x] Saved words appear in Yêu sách with personal icon (from slice 01)
- [x] Widget test for VocabularyCard rendering and add callback
- [x] Unit test for from-analysis transactional service method

## Blocked by

- .scratch/image-discovery/issues/01-tu-vung-ca-nhan-crud-hien-thi-yeu-sach.md
- .scratch/image-discovery/issues/02-kham-pha-anh-chup-1-anh-chat-ai.md

## Implementation notes

### Files created

- `backend/src/modules/personal-vocabularies/dto/create-personal-vocabulary-from-analysis.dto.ts` - Request DTO for AI-extracted vocabulary saved from Image Discovery without requiring client-provided `source`.
- `mobile/lib/features/image_discovery/presentation/widgets/vocabulary_card.dart` - Reusable inline vocabulary card with word fields, add button, loading state, and success state.
- `mobile/test/features/image_discovery/presentation/widgets/vocabulary_card_test.dart` - Widget test covering field rendering, add callback, and disabled success state.

### Files modified

- `backend/src/modules/personal-vocabularies/application/personal-vocabularies.service.ts` - Added `createFromAnalysis()` with `@Transactional()`, `DataSource`, and query-runner manager saves for PersonalVocabulary plus Bookmark.
- `backend/src/modules/personal-vocabularies/application/personal-vocabularies.service.spec.ts` - Added transaction success and rollback tests for from-analysis saves.
- `backend/src/modules/personal-vocabularies/presentation/personal-vocabularies.controller.ts` - Added `POST /personal-vocabularies/from-analysis`.
- `backend/src/modules/personal-vocabularies/presentation/personal-vocabularies.controller.spec.ts` - Added controller coverage for the from-analysis endpoint.
- `backend/src/modules/personal-vocabularies/personal-vocabularies.module.ts` - Registered Bookmark with the module TypeORM feature entities for transactional saves.
- `mobile/lib/features/image_discovery/domain/image_analysis_models.dart` - Added JSON serialization for `ImageAnalysisVocabulary`.
- `mobile/lib/features/image_discovery/data/image_analysis_api.dart` - Added `addVocabularyFromAnalysis()` API call.
- `mobile/lib/features/image_discovery/application/image_discovery_notifier.dart` - Added save action that calls the API and emits bookmark cache invalidation.
- `mobile/lib/features/image_discovery/presentation/screens/image_discovery_screen.dart` - Renders public `VocabularyCard` inline for assistant messages and wires its add callback.
- `mobile/test/features/image_discovery/data/image_analysis_api_test.dart` - Added endpoint payload coverage for saving AI vocabulary.
- `mobile/test/features/image_discovery/presentation/image_discovery_screen_test.dart` - Extended screen test to tap add and verify success state.
- `mobile/lib/features/bookmarks/domain/bookmark_models.dart` - Added `BookmarkType`, `personalVocabularyId`, and personal bookmark parsing.
- `mobile/lib/features/bookmarks/data/bookmark_repository.dart` - Added optional `personalVocabularyId` support when toggling personal bookmarks.
- `mobile/lib/features/bookmarks/data/bookmark_providers.dart` - Keeps system bookmark IDs separate and supports personal bookmark removal through the shared repository.
- `mobile/lib/features/bookmarks/presentation/screens/bookmarks_screen.dart` - Shows a distinct personal icon and toggles personal bookmarks by `personalVocabularyId`.
- `mobile/lib/features/assistant/data/builders/bookmark_context_summaries.dart` - Includes bookmark type and personal vocabulary id in assistant context summaries.
- `mobile/test/features/bookmarks/data/bookmark_repository_test.dart` - Added personal bookmark parsing and personal toggle payload coverage.

### Files deleted

- None.
