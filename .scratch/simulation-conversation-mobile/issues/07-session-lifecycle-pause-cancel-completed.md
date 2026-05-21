Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add session lifecycle management to the chat screen: auto-pause on back, cancel via bottom sheet menu, completed state, and read-only chat history.

**Back button → auto-pause:** No confirmation dialog. When learner presses back on chat screen, mark session as paused. For MVP, rely on backend's lazy PAUSED detection (resume via `GET /sessions/:id` which transitions PAUSED→ACTIVE).

**Cancel session:** AppBar bottom sheet menu with "Huỷ phiên" and "Xem tình huống" options. "Huỷ phiên" → `AppDialog` confirmation → `DELETE /sessions/:id` → pop to tab landing. "Xem tình huống" → push scenario detail for the current session's scenario.

**Completed state:** When `sessionEnded: true` in API response, chat screen transitions:
- Hide input field
- Show bottom banner "Phiên đã kết thúc" + `AppButton.outline("Xem kết quả")` → push result screen (route added in slice 09)
- Feedback bubbles still tappable

**Read-only chat history:** Same chat screen widget with `isHistory: true` flag. Hides input, shows "Phiên đã kết thúc" banner with "Xem kết quả" button (unless already navigated from result screen — in that case, just the banner without the button). Back → pop to result screen.

Add `cancelSession(String sessionId)` to `SimulationRepository` (calls `DELETE /sessions/:id`).

## Acceptance criteria

- [ ] Pressing back on active chat auto-pauses session (no confirmation); returns to tab landing
- [ ] Resuming a paused session (via `GET /sessions/:id`) restores chat with full message history
- [ ] Cancel: AppBar menu bottom sheet shows "Huỷ phiên" + "Xem tình huống"
- [ ] "Huỷ phiên" → `AppDialog` confirm → `DELETE /sessions/:id` → pop to tab landing
- [ ] "Xem tình huống" → push scenario detail screen
- [ ] When `sessionEnded: true`: input hidden, bottom banner "Phiên đã kết thúc" + "Xem kết quả" button
- [ ] Feedback bubbles remain tappable in completed state
- [ ] `isHistory: true` mode: no input, "Phiên đã kết thúc" banner, "Xem kết quả" button only if not accessed from result screen
- [ ] `SimulationRepository.cancelSession()` calls `DELETE /sessions/:id`

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/05-chat-core-group-bubbles-compose-bar.md`
