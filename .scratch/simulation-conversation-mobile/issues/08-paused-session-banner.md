Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add a paused session banner at the top of the tab landing when the learner has an active/paused session. This slice depends on the session lifecycle from slice 07.

**Banner:** Shows at top of tab landing ListView when `pausedSessionProvider` detects an incomplete session (ACTIVE or PAUSED). Displays session info (scenario title, character name). Two buttons:
- "Continue" → push chat screen `/practice/sessions/:id` → `getSession()` triggers PAUSED→ACTIVE on backend → chat resumes with full message history
- "Cancel" → `AppDialog` confirmation ("Are you sure you want to cancel this session?") → `DELETE /sessions/:id` → refresh providers → banner disappears

Create `pausedSessionProvider` (AsyncNotifier) that checks for incomplete sessions. This may call a dedicated endpoint or check existing session state — for MVP, can poll `GET /simulations/sessions` filtered by status, or use a dedicated check. Coordinate with `simulationSessionProvider`.

## Acceptance criteria

- [x] Banner appears at top of tab landing when learner has an ACTIVE or PAUSED session
- [x] Banner shows scenario title + character name
- [x] "Continue" button pushes to chat screen and resumes session (messages loaded, chat continues)
- [x] "Cancel" button shows `AppDialog` confirmation before deleting session
- [x] After cancel, banner disappears and scenario list refreshes
- [x] Banner disappears when no incomplete session exists
- [x] `pausedSessionProvider` fetches incomplete session on tab landing build

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/07-session-lifecycle-pause-cancel-completed.md`

## Implementation notes

### Files created

- `mobile/lib/features/simulation/domain/active_session.dart` — Domain model for incomplete session data (id, scenarioId, scenarioTitle, chosenCharacterId, chosenCharacterName, status, nextTurnCharacterId)

### Files modified

- `backend/src/modules/simulations/presentation/simulations.controller.ts` — Added `GET /simulations/sessions/active` endpoint (placed before `GET /sessions/:id` to avoid route conflict). Returns null when no incomplete session, or session with scenario title + character name.
- `backend/src/modules/simulations/application/simulation-session.service.ts` — Added `getActiveSession(userId)` method that uses `findIncompleteByUserWithRelations` to return enriched session data.
- `backend/src/modules/simulations/application/repositories/simulation-sessions.repository.ts` — Added `findIncompleteByUserWithRelations(userId)` that loads `scenario` and `chosenCharacter` relations.
- `backend/test/simulations.e2e-spec.ts` — Added 4 e2e tests for `GET /sessions/active` (null when no session, returns ACTIVE session, returns PAUSED session, null after cancel).
- `mobile/lib/features/simulation/data/simulation_repository.dart` — Added `getActiveSession()` method calling `GET /simulations/sessions/active`. Returns `ActiveSession?` (null when no session).
- `mobile/lib/features/simulation/data/simulation_providers.dart` — Added `PausedSessionNotifier` (AsyncNotifier<ActiveSession?>) and `pausedSessionProvider`. Fetches on build, has `refresh()` for manual invalidation.
- `mobile/lib/features/simulation/presentation/screens/practice_screen.dart` — Added `_PausedSessionBanner` widget (AppCard with pause icon, scenario title, character name, "Tiếp tục" and "Huỷ" buttons). Integrated into `PracticeScreen` via `pausedSessionProvider` watch. Cancel flow uses `AppDialog` confirmation. Pull-to-refresh also refreshes paused session.
- `mobile/lib/features/simulation/presentation/screens/chat_screen.dart` — Added `ref.invalidate(pausedSessionProvider)` in `_onBack()`, `_doCancelSession()`, and `_navigateToResult()` so banner refreshes when user returns from chat.
- `mobile/test/features/simulation/data/simulation_repository_test.dart` — Added 3 unit tests for `getActiveSession` (returns ActiveSession, returns null, throws NetworkException).
