Status: ready-for-agent

## Parent

`.scratch/bookmark-vocabulary/PRD.md`

## What to build

A simple flashcard screen that lets users browse bookmarked words as flip cards. No rating, no mastery, no scheduling — just free browsing.

**Screen**: `FlashcardScreen` in `features/bookmarks/presentation/screens/` — opens from BookmarksScreen via a "Học" button. Full-screen route `/bookmarks/flashcard`. Loads all bookmarked vocabularies.

**Card layout**:
- Front: word + phonetic + audio play button
- Back: translation + partOfSpeech + classifier + example sentence + example translation
- Tap to flip between front and back
- Swipe left/right to navigate between cards
- Progress indicator: "3/20" format
- Exit via app bar close button

**AudioPlayerService** relocated from `features/review/presentation/services/` to `core/services/` so flashcard can use it.

## Acceptance criteria

- [ ] "Học" button on BookmarksScreen opens FlashcardScreen
- [ ] Front of card shows word, phonetic, audio play button
- [ ] Back of card shows translation, partOfSpeech, classifier, example, example translation
- [ ] Tap card to flip; swipe to navigate between cards
- [ ] Progress indicator shows current/total (e.g. "3/20")
- [ ] Close button exits session at any time
- [ ] No rating buttons, no mastery tracking, no scheduling
- [ ] AudioPlayerService moved to core/services/

## Blocked by

- `.scratch/bookmark-vocabulary/issues/03-bookmarks-list-screen.md` (must have BookmarksScreen to open from)
