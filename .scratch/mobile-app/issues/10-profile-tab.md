Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the Profile tab. Fetch user profile via `GET /users/me`. Display and allow editing: full name, avatar (avatarUrl), native language, preferred dialect (Standard/Northern/Central/Southern), current level (A1–C2). Edits submitted via `PATCH /users/me`. Show basic stats: lessons completed, words learned, exercises done (from progress and vocabulary endpoints). Show exercise statistics (accuracy, time) from `GET /exercises/my-stats`. Include a logout button. All changes persist to backend and update local auth state.

## Acceptance criteria

- [ ] Profile displays name, avatar, native language, dialect, level
- [ ] All fields are editable and saved via `PATCH /users/me`
- [ ] Dialect change affects vocabulary display in other tabs
- [ ] Basic stats shown (lessons completed, words learned, exercises done)
- [ ] Exercise statistics shown (accuracy, time)
- [ ] Logout button works (revokes token, clears local state, redirects to login)
- [ ] Error and loading states handled

## Blocked by

- `02-email-auth-flow`
