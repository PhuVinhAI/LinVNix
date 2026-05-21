Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the character selection screen and session creation flow. Route: `/practice/scenarios/:id/select-character` (outside shell, push).

Header shows scenario name + "Chọn nhân vật của bạn". Lists only playable characters (`isPlayable: true`) as `AppCard` outlined items with `AppAvatar` + name + role. Tap to select (highlight with primary border + tint). Sticky bottom: `AppButton.primary(fullWidth, "Bắt đầu hội thoại")` — disabled until a character is selected.

On confirm: call `POST /sessions { scenarioId, chosenCharacterId }`. Show loading overlay "Đang chuẩn bị hội thoại..." while waiting. On success, push chat screen at `/practice/sessions/:id` with the `CreateSessionResponse` data (session, opening messages, nextTurnCharacterId).

Add `createSession(String scenarioId, String chosenCharacterId)` to `SimulationRepository`. Create models: `SimulationSession` (fromJson: id, scenarioId, chosenCharacterId, status, nextTurnCharacterId), `SimulationMessage` (fromJson: id, speakerCharacterId, speakerName, isLearner, content, feedback?, orderIndex), `MessageFeedback` (fromJson: corrections[], review, reviewAvailable), `Correction` (fromJson: original, corrected, type, severity, startIndex, endIndex), `CreateSessionResponse` (fromJson: session, messages[], nextTurnCharacterId). `createSession` uses extended timeout (15s) since AI may generate opening messages.

## Acceptance criteria

- [ ] Character selection screen shows only playable characters from the scenario
- [ ] Each character card shows avatar, name, role
- [ ] Tap selects a character (primary border + tint highlight); tap again deselects
- [ ] "Bắt đầu hội thoại" button activates only after selecting a character
- [ ] Confirming shows loading overlay "Đang chuẩn bị hội thoại..."
- [ ] On success, pushes to chat screen `/practice/sessions/:id` with session data + opening messages
- [ ] `SimulationRepository.createSession()` calls `POST /simulations/sessions` with extended timeout
- [ ] `CreateSessionResponse`, `SimulationSession`, `SimulationMessage`, `MessageFeedback`, `Correction` models parse from JSON
- [ ] Error during creation shows snackbar/toast and returns to selection (no stuck loading)

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/03-tinh-huong-detail-screen.md`
