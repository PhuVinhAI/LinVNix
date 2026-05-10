Status: done

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build a multi-step onboarding wizard shown after first registration (before landing on Home). Three steps: (1) "What's your current level?" — select A1–C2, (2) "Which dialect do you prefer?" — select Standard/Northern/Central/Southern, (3) "Set your daily goal" — optional review target. Each step is skippable with defaults from registration. Data submitted via `PATCH /users/me` (UpdateUserDto). After completion (or skip-all), mark onboarding as completed in shared_preferences and navigate to Home. On subsequent logins, skip onboarding entirely. The wizard uses a PageController with progress indicator matching the lesson wizard pattern.

## Acceptance criteria

- [x] Onboarding wizard appears after first registration
- [x] Step 1 shows A1–C2 level selector
- [x] Step 2 shows dialect selector (Standard/Northern/Central/Southern)
- [x] Step 3 shows optional daily goal input
- [x] Each step is skippable; defaults applied from registration values
- [x] Data is persisted via `PATCH /users/me` on completion
- [x] Onboarding completed flag stored in shared_preferences
- [x] Wizard does not appear on subsequent logins
- [x] Progress indicator shows current step

## Blocked by

- `02-email-auth-flow`
