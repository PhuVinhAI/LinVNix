Status: done

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the online vocabulary review experience. Review tab shows due review count and a "Start review" button. Review session fetches due items from `GET /vocabularies/due-review` and presents Anki-style flashcards one at a time. Front: Vietnamese word + phonetic + audio play button (just_audio). Back (on tap/flip): translation + example sentence + example translation + part of speech + classifier. After flipping, 4 rating buttons: Again(1), Hard(2), Good(3), Easy(4). Each rating submitted via `POST /vocabularies/:id/review` which returns updated FSRS scheduling (mastery level displayed: learning stability<21, familiar 21-99, mastered 100+). Session continues until all due items reviewed, then shows session summary. Also build the vocabulary browser: `GET /vocabularies/my-vocabularies` with infinite scroll, and search via `GET /vocabularies/search?q=`.

## Acceptance criteria

- [x] Review tab shows due review count and start button
- [x] Flashcard front shows Vietnamese word + phonetic + audio button
- [x] Flashcard back shows translation, example, POS, classifier
- [x] 4 rating buttons (Again/Hard/Good/Easy) submit to FSRS endpoint
- [x] Mastery level (learning/familiar/mastered) displayed per word
- [x] Session continues until all due items reviewed
- [x] Session summary shown at completion
- [x] Vocabulary browser shows learned words with infinite scroll
- [x] Search works with query input and paginated results
- [x] Audio playback works for vocabulary pronunciation
- [x] Unit tests for ReviewEngine (FSRS rating→mastery mapping)

## Implementation notes

- Created domain models: Vocabulary, UserVocabulary, ReviewResult, DueReviewItem, SessionSummary
- Implemented ReviewEngine with FSRS rating→mastery mapping (stability<21=learning, 21-99=familiar, 100+=mastered)
- Added 15 unit tests for ReviewEngine covering all scenarios
- Created VocabularyRepository and ReviewRepository for API calls
- Added Riverpod providers for state management
- Implemented ReviewScreen with flashcard UI and flip animation
- Created RatingButtons widget with Again/Hard/Good/Easy options
- Built VocabularyBrowserScreen with infinite scroll pagination
- Added VocabularySearchDelegate for search functionality
- Integrated audio playback via just_audio
- Added route `/vocabulary` and updated HomeScreen with navigation

## Blocked by

- `02-email-auth-flow`
