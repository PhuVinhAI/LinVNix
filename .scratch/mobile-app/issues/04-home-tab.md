Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the Home tab showing two primary cards: "Continue learning" and "Due reviews". The continue card fetches the user's latest in-progress lesson via `GET /progress` (find latest `IN_PROGRESS` or last `COMPLETED`), displays course name + lesson name, and taps into the lesson wizard at `/lessons/:id`. The due reviews card fetches count from `GET /vocabularies/due-review` and displays "N words due for review"; tapping navigates to `/review/session`. Both cards show loading shimmer and error states with retry. An empty state shows when no progress exists (prompt to browse courses) or no reviews are due.

## Acceptance criteria

- [ ] "Continue learning" card shows current course and lesson name
- [ ] Tapping continue card navigates to the active lesson wizard
- [ ] "Due reviews" card shows count of due vocabulary items
- [ ] Tapping due reviews card navigates to review session
- [ ] Cards show shimmer loading state while fetching
- [ ] Error states show retry buttons
- [ ] Empty states shown when no progress or no due reviews
- [ ] Data refreshes on pull-to-refresh and on tab focus

## Blocked by

- `02-email-auth-flow`
