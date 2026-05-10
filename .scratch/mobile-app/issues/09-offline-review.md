Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Add offline vocabulary review capability. Set up Drift SQLite with three tables: `vocabularies` (word, translation, phonetic, partOfSpeech, exampleSentence, exampleTranslation, audioUrl, classifier, difficultyLevel), `user_vocabularies` (vocabularyId, masteryLevel, reviewCount, correctCount, nextReviewAt, stability, difficulty, state, reps, lapses), `review_queue` (pending offline reviews: vocabularyId, rating, reviewedAt). When connectivity drops (detected via `connectivity_plus` stream via Riverpod ConnectivityProvider), prefetch due reviews into Drift from `GET /vocabularies/due-review`. During offline, review from local cache and enqueue ratings in `review_queue`. When connectivity restores, flush queue via `POST /vocabularies/review/batch`. Show an offline indicator banner when disconnected. Server FSRS state is authoritative — on sync, accept server scheduling results over local estimates.

## Acceptance criteria

- [ ] Drift SQLite tables created for vocabularies, user_vocabularies, review_queue
- [ ] Due reviews prefetched into Drift when connectivity drops
- [ ] Review session works offline using local cache
- [ ] Offline ratings enqueued in review_queue table
- [ ] Queue flushed via batch review endpoint when back online
- [ ] Offline indicator banner shown when disconnected
- [ ] Server FSRS state accepted as authoritative on sync
- [ ] Unit tests for LocalCache (Drift CRUD, due review queries, queue enqueue/dequeue)
- [ ] Unit tests for ReviewEngine (prefetch logic, batch sync ordering, conflict handling)

## Blocked by

- `08-online-vocabulary-review`
