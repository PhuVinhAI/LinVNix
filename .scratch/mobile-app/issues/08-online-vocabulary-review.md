Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the online vocabulary review experience. Review tab shows due review count and a "Start review" button. Review session fetches due items from `GET /vocabularies/due-review` and presents Anki-style flashcards one at a time. Front: Vietnamese word + phonetic + audio play button (just_audio). Back (on tap/flip): translation + example sentence + example translation + part of speech + classifier. After flipping, 4 rating buttons: Again(1), Hard(2), Good(3), Easy(4). Each rating submitted via `POST /vocabularies/:id/review` which returns updated FSRS scheduling (mastery level displayed: learning stability<21, familiar 21-99, mastered 100+). Session continues until all due items reviewed, then shows session summary. Also build the vocabulary browser: `GET /vocabularies/my-vocabularies` with infinite scroll, and search via `GET /vocabularies/search?q=`.

## Acceptance criteria

- [ ] Review tab shows due review count and start button
- [ ] Flashcard front shows Vietnamese word + phonetic + audio button
- [ ] Flashcard back shows translation, example, POS, classifier
- [ ] 4 rating buttons (Again/Hard/Good/Easy) submit to FSRS endpoint
- [ ] Mastery level (learning/familiar/mastered) displayed per word
- [ ] Session continues until all due items reviewed
- [ ] Session summary shown at completion
- [ ] Vocabulary browser shows learned words with infinite scroll
- [ ] Search works with query input and paginated results
- [ ] Audio playback works for vocabulary pronunciation
- [ ] Unit tests for ReviewEngine (FSRS rating→mastery mapping)

## Blocked by

- `02-email-auth-flow`
