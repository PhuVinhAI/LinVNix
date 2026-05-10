Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the lesson wizard — the step-by-step flow for consuming a lesson. Fetch lesson detail from `GET /lessons/:id` which returns contents, vocabularies, grammar rules, and exercises all at once. The wizard uses a PageController with a progress bar. Steps flow: Content steps (one per content item) → Vocabulary step (all vocabulary cards) → Grammar step (all grammar rules) → Exercise steps (one per exercise, but exercise rendering is slice 07; show placeholder for now).

Content rendering by type: **text** — VietnameseText + translation + phonetic; **audio** — audio player bar (just_audio) + speed control chip [0.5x–2.0x]; **image** — cached_network_image with placeholder; **video** — chewie player; **dialogue** — Vietnamese dialogue lines + translation + audio playback.

Vocabulary step shows each word with translation, phonetic, part of speech, classifier, dialect variants (per user's preferredDialect), and a "Learn" button calling `POST /vocabularies/:vocabularyId/learn`.

Grammar step shows each rule with structure, explanation, and examples (Vietnamese + English).

Progress tracking: call `POST /progress/lesson/:id/start` when entering a lesson. Smart resume — if `UserProgress.status = IN_PROGRESS`, show "Continue from exercises?" dialog to skip content/vocab/grammar and jump to first exercise. On lesson completion (after exercises in slice 07), call `POST /progress/lesson/:id/complete` with score.

## Acceptance criteria

- [ ] Lesson wizard shows step-by-step with PageController and progress bar
- [ ] 5 content types render correctly (text, audio, image, video, dialogue)
- [ ] Audio player has speed control (0.5x–2.0x cycle chip)
- [ ] Video plays via chewie player
- [ ] Vocabulary step shows word, translation, phonetic, POS, classifier, dialect variants
- [ ] "Learn" button adds vocabulary to learning list via API
- [ ] Grammar step shows structure, explanation, examples
- [ ] `POST /progress/lesson/:id/start` called on lesson entry
- [ ] Smart resume dialog appears for IN_PROGRESS lessons
- [ ] `POST /progress/lesson/:id/complete` called after lesson done (placeholder score until exercises)
- [ ] Error and loading states handled
- [ ] Be Vietnam Pro font applied to Vietnamese text content

## Blocked by

- `05-courses-browser`
