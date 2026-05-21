Status: ready-for-agent

# PRD: Hội thoại mô phỏng — Mobile (Flutter) UI

## Problem Statement

Backend cho tính năng **Hội thoại mô phỏng** đã hoàn thành (10 issues, all done), nhưng học viên chưa có giao diện mobile để sử dụng tính năng này. Học viên cần một tab riêng trên bottom nav để duyệt **Danh mục tình huống**, chọn **Tình huống** và **Nhân vật**, trò chuyện nhóm với AI đóng vai các nhân vật, nhận **Phản hồi lượt nhắn** inline, và xem **Kết quả mô phỏng** chi tiết — tất cả qua Flutter UI nhất quán với design language hiện tại của app.

## Solution

Xây dựng toàn bộ UI mobile cho Hội thoại mô phỏng trong tab "Thực hành" mới trên bottom nav (index 2, giữa Courses và Profile). Feature bao gồm: tab landing với category-first navigation, scenario detail, character selection, group chat screen với inline corrections + feedback bottom sheet, result screen, results history, và profile stats integration. Tất cả dùng existing widget library (`AppCard`, `AppBadge`, `AppAvatar`, `AppButton`, `AppBottomSheet`, `AppListItem`, `AppProgress`, `AppDialog`, `AppInput`, `AppSpinner`, `AppShimmer`), existing patterns (AsyncNotifier + shimmer loading + centered error/empty), và existing data layer conventions (Repository + Dio + `mapDioException`).

## User Stories

### Navigation & Tab

1. As a **Học viên**, I want a "Thực hành" tab on the bottom nav between Courses and Profile, so that I can access Hội thoại mô phỏng from anywhere in the app
2. As a **Học viên**, I want the Thực hành tab icon to be distinct from other tabs, so that I can find it quickly

### Tab Landing — Category & Scenario Browsing

3. As a **Học viên**, I want to see a 2x3 grid of **Danh mục tình huống** cards (icon + name + color), so that I can browse by real-life topic
4. As a **Học viên**, I want to tap a category card to see **Tình huống** filtered by that category below the grid, so that I can explore scenarios within a topic
5. As a **Học viên**, I want a "Xem tất cả" option to clear the category filter and see all scenarios, so that I can browse without category constraint
6. As a **Học viên**, I want to open a filter bottom sheet with Danh mục, Trình độ, and Độ khó selectors, so that I can combine filters to find appropriate scenarios
7. As a **Học viên**, I want the filter bottom sheet to apply all filters at once when I tap "Áp dụng", so that the grid doesn't re-render while I'm still selecting
8. As a **Học viên**, I want the filter button on the AppBar to show which category is currently active, so that I know my current filter at a glance
9. As a **Học viên**, I want each **Tình huống** card to show title, description, level badge, difficulty badge, estimated time, and character count, so that I can decide which scenario to try
10. As a **Học viên**, I want to tap a scenario card to see its full detail, so that I can learn more before starting

### Paused Session Banner

11. As a **Học viên**, I want a banner at the top of the tab landing when I have a paused session, so that I'm reminded to continue
12. As a **Học viên**, I want a "Tiếp tục" button on the banner to resume my session directly, so that I can pick up where I left off
13. As a **Học viên**, I want a "Huỷ" button on the banner to cancel my paused session, so that I can start a different scenario instead
14. As a **Học viên**, I want a confirmation dialog before cancelling a session, so that I don't accidentally lose progress

### Scenario Detail

15. As a **Học viên**, I want to see the scenario description, scoring criteria list, and character list on the detail screen, so that I know what to expect
16. As a **Học viên**, I want each scoring criterion to show its name, description, and weight percentage, so that I understand how I'll be evaluated
17. As a **Học viên**, I want to see all characters with their avatar, name, and role, with non-playable characters dimmed and marked "NPC", so that I know which roles exist in the scenario
18. As a **Học viên**, I want a sticky "Bắt đầu" button at the bottom of the detail screen, so that I can proceed to character selection
19. As a **Học viên**, I want to see a mini history section showing my past results for this scenario, so that I can track my improvement

### Character Selection

20. As a **Học viên**, I want to see only playable characters on the selection screen, so that I don't accidentally choose an NPC role
21. As a **Học viên**, I want each character card to show avatar, name, and role, so that I can choose a role that interests me
22. As a **Học viên**, I want to tap a character to select it (highlighted), so that I indicate my choice
23. As a **Học viên**, I want a "Bắt đầu hội thoại" button that activates after selecting a character, so that I confirm my choice before starting
24. As a **Học viên**, I want a loading state ("Đang chuẩn bị hội thoại...") while the session is being created, so that I know the app is working

### Chat — Core Interaction

25. As a **Học viên**, I want to see NPC messages as left-aligned chat bubbles with avatar + name + text on a card-colored background, so that I can follow a group conversation
26. As a **Học viên**, I want to see my own messages as right-aligned bubbles on a primary-tinted background without avatar/name, so that my messages are visually distinct
27. As a **Học viên**, I want NPC bubbles to appear with staggered animation (300ms delay each) when AI returns multiple messages, so that the conversation feels natural
28. As a **Học viên**, I want a typing indicator ("Đang suy nghĩ..." + spinner) while waiting for AI response, so that I know the NPCs are "thinking"
29. As a **Học viên**, I want the input field to be disabled with a hint when it's an NPC's turn, so that I know to wait
30. As a **Học viên**, I want the input field to be active with "Lượt bạn" hint when it's my turn, so that I know I can respond
31. As a **Học viên**, I want a pill-shaped input field with a circular send button, matching the existing assistant compose bar pattern, so that the UI is consistent

### Chat — Inline Corrections & Feedback

32. As a **Học viên**, I want misspelled words underlined in red (error) or yellow (warning) on my chat bubbles, so that I can see mistakes at a glance
33. As a **Học viên**, I want to tap a misspelled word on my bubble to open the feedback bottom sheet, so that I can see what's wrong
34. As a **Học viên**, I want a feedback icon on the left side of my bubble (only when feedback exists), so that I can access the full feedback
35. As a **Học viên**, I want the feedback bottom sheet to list all corrections with original (strikethrough red) → corrected (green bold) and type badge (Chính tả/Ngữ pháp), so that I understand each mistake
36. As a **Học viên**, I want the feedback bottom sheet to show AI review text when available, so that I get contextual improvement suggestions
37. As a **Học viên**, I want tapping a correction on my bubble to scroll to that correction in the feedback sheet, so that I can quickly find the relevant feedback

### Chat — Session Lifecycle

38. As a **Học viên**, I want pressing back on the chat screen to auto-pause the session (no confirmation dialog), so that I can leave and return later without friction
39. As a **Học viên**, I want a bottom sheet menu accessible from the AppBar with "Huỷ phiên" and "Xem tình huống" options, so that I can manage my session
40. As a **Học viên**, I want a confirmation dialog before cancelling an active session, so that I don't accidentally lose progress
41. As a **Học viên**, I want the chat screen to show a COMPLETED state (hidden input, "Phiên đã kết thúc" banner + "Xem kết quả" button) when the session ends, so that I know the conversation is over
42. As a **Học viên**, I want to view a completed session's chat history (read-only, no input, feedback still tappable), so that I can review the conversation
43. As a **Học viên**, I want to tap "Xem kết quả" in the completed chat to see the result screen, so that I get my detailed score

### Result Screen

44. As a **Học viên**, I want to see my total score prominently (0-100), so that I know how I did overall
45. As a **Học viên**, I want to see each scoring criterion with a progress bar, score/maxScore, and comment, so that I understand my strengths and weaknesses
46. As a **Học viên**, I want to read the AI summary, so that I get overall commentary on my performance
47. As a **Học viên**, I want a "Chơi lại" button that takes me to character selection (with my previous character pre-selected), so that I can improve my score
48. As a **Học viên**, I want a "Xem lại hội thoại" button that takes me to the read-only chat history, so that I can review the conversation
49. As a **Học viên**, I want different messaging when the session ended due to TOO_MANY_ERRORS ("Hãy ôn lại bài học trước khi thử lại") vs INAPPROPRIATE/ABUSIVE (warning, no replay button), so that the feedback is appropriate

### Results History

50. As a **Học viên**, I want an AppBar icon on the tab landing to open a results history screen, so that I can view all my past simulation results
51. As a **Học viên**, I want results listed newest first with score, end reason, date, scenario title, and character name, so that I can scan my history
52. As a **Học viên**, I want to tap a result to see its full detail, so that I can review specific sessions
53. As a **Học viên**, I want to filter results by scenario on the history screen, so that I can compare attempts for the same scenario
54. As a **Học viên**, I want a mini history section on scenario detail showing past results for that scenario, so that I can see my improvement contextually

### Profile Integration

55. As a **Học viên**, I want to see "Tình huống đã thử" and "Điểm TB" stat cards on my profile, so that I have an overview of my simulation practice

## Implementation Decisions

### Navigation structure — 4-tab bottom nav

Add "Thực hành" tab at index 2 (between Courses and Profile). Update `ShellScreen` to handle 4 destinations. New routes under shell: `/` (home), `/courses`, `/practice` (tab landing), `/profile`. Push routes outside shell: `/practice/scenarios/:id` (detail), `/practice/scenarios/:id/select-character` (character selection), `/practice/sessions/:id` (chat), `/practice/results/:id` (result), `/practice/history` (results list).

Tab icon: `Icons.chat_bubble_outline` / `Icons.chat_bubble` (selected). Label: "Thực hành".

### Backend API contract — 8 endpoints consumed

All under `/api/v1/simulations`, guarded by `SIMULATION_ACCESS`. ResponseUnwrapInterceptor strips `{ data: T }` envelope automatically.

| Method | Path | Mobile Usage |
|--------|------|-------------|
| GET | `/categories` | Tab landing — category grid |
| GET | `/scenarios?categoryId&level&difficulty` | Tab landing — scenario grid with filters |
| GET | `/scenarios/:id` | Scenario detail screen |
| POST | `/sessions` `{ scenarioId, chosenCharacterId }` | Character selection → create session. Response includes opening messages + `nextTurnCharacterId` (always learner after creation) |
| POST | `/sessions/:id/messages` `{ content }` | Chat — send learner message. Response: `{ messages[], nextTurnCharacterId, feedback, sessionEnded, endReason?, result? }` |
| GET | `/sessions/:id` | Resume paused session — returns session + message history. Backend auto-transitions PAUSED→ACTIVE |
| DELETE | `/sessions/:id` | Cancel session — soft-delete, no result |
| GET | `/results?scenarioId` | Results history list |
| GET | `/results/:id` | Result detail |
| GET | `/stats` | Profile stat cards — scenarios attempted + average score |

### Session creation: AI generates opening inline

When `POST /sessions` is called, the backend calls AI once and returns all opening NPC messages in the response `messages[]` array. The `nextTurnCharacterId` is always the learner's character after creation (AI speaks until it's the learner's turn). If the scenario naturally starts with the learner speaking, `messages[]` is empty and the input field is active immediately.

This eliminates the need for a separate "AI turn" endpoint or client-side looping.

### Chat bubble style — group chat app (NOT assistant pattern)

NPC bubbles and learner bubbles use a new group chat bubble style, distinct from the assistant's left-aligned MarkdownBody pattern:

- **NPC bubbles:** Left-aligned. Row: avatar (AppAvatar, 20px radius) + name label (caption/w600) above bubble. Bubble: `c.card` background, `AppRadius.lg` (14), padding `h:lg v:md`, `c.border` 1px. Text: `bodyMedium/c.foreground`, plain text (not markdown — NPC dialogue is short Vietnamese).
- **Learner bubbles:** Right-aligned. Bubble: `c.primary.withAlpha(0.1)` background, same radius + padding. Text: `bodyMedium/c.foreground`. No avatar/name label. Corrections rendered via TextSpan with underline decoration (error=red, warning=amber, thickness 2).
- **Feedback icon:** Left of learner bubble (only when `reviewAvailable: true` or corrections exist). Icon 16px `c.mutedForeground`. Tap opens feedback bottom sheet.
- **System messages:** Centered, muted text, no bubble (for opening messages).

### Corrections inline rendering

Learner message text rendered as `RichText` with `TextSpan` list built from `corrections[]`. Sort corrections by `startIndex`, split original text into runs: uncorrected segments → normal `TextSpan`, corrected segments → `TextSpan` with `decoration: TextDecoration.underline, decorationColor: severity=='error' ? c.error : c.warning, decorationThickness: 2`. Overlapping ranges merged.

Tap gesture on a correction range opens the feedback bottom sheet. Use `GestureRecognizer` per corrected `TextSpan` to detect taps on specific error ranges.

### Feedback bottom sheet

`AppBottomSheet.show` with `DraggableScrollableSheet` (0.4/0.6/0.9). Layout:

- Header: "Phản hồi" (titleSmall/w600) + close icon
- Section 1 — Corrections: List of items, each: original word (strikethrough, c.error) → arrow → corrected word (c.success, w600) + AppBadge for type (Chính tả/Ngữ pháp)
- Divider
- Section 2 — Review: AI commentary text (bodyMedium/c.foreground). Only shown when `reviewAvailable: true` and `review != null`

When opened by tapping a specific correction on bubble, scroll to that correction item in the list with a subtle highlight animation.

### Input field pattern — pill-shaped compose bar

Reuse the assistant's compose bar pattern: `Container(muted/0.4 bg, AppRadius.lg)` wrapping `TextField(maxLines:5, minLines:1, borderless, transparent fill)` + 36px circular primary send button (`Icons.arrow_upward_rounded`). Disabled state: same container but `c.muted` bg, text muted, button hidden, replaced by "Lượt [NPC name]..." hint.

### Typing indicator + staggered bubble animation

While waiting for API response after learner sends a message:

1. Show generic indicator: `AppSpinner` + "Đang suy nghĩ..." text, centered in message area
2. Input field disabled with "[NPC name] đang nhập..." hint
3. When response arrives, remove indicator, insert NPC bubbles with staggered animation: each bubble slides in with 300ms delay after the previous one

### Session lifecycle on mobile

- **Back button** → auto-PAUSE (no confirm). Client calls `DELETE /sessions/:id` only if user explicitly cancels.
- **Pause detection:** When leaving chat screen via back, mark session PAUSED by calling `GET /sessions/:id` which triggers PAUSED→ACTIVE on resume, or by PATCH (if backend adds explicit pause endpoint). For MVP, rely on backend lazy PAUSED detection.
- **Cancel session:** Bottom sheet menu from AppBar → "Huỷ phiên" → `AppDialog` confirm → `DELETE /sessions/:id` → pop to tab landing.
- **Completed state:** When `sessionEnded: true` in API response, chat screen transitions to COMPLETED state: hide input, show bottom banner "Phiên đã kết thúc" + `AppButton.outline("Xem kết quả")`. Auto-push to result screen.

### Read-only chat history

Same chat screen widget with `isHistory: true` flag. Hides input field, shows "Phiên đã kết thúc" banner with "Xem kết quả" button. Bubbles render identically including tappable corrections and feedback icon. Accessible from result screen's "Xem lại hội thoại" button.

### Tab landing layout

```
Scaffold
  AppAppBar(title: "Thực hành", actions: [filter icon, history icon])
  RefreshIndicator > ListView
    Paused session banner (if exists)
    Category grid (2x3, AppCard with icon + name + color tint)
    Section header: "[Category name]" or "Tất cả tình huống"
    Scenario grid (2 columns, AppCard outlined)
```

### Scenario card layout

`AppCard(outlined, lg radius, md padding, onTap:)`. No accent bar.

- Top row: `AppBadge` level (CEFR colors) + Spacer + clock icon + minutes (bodySmall/mutedForeground)
- Title: titleSmall/w600, maxLines: 2
- Description: bodySmall/mutedForeground, maxLines: 2
- Bottom row: `AppBadge` difficulty (EASY=success, MEDIUM=warning, HARD=error) + Spacer + people icon + character count (bodySmall/mutedForeground)

### Scenario detail layout

Push route. AppBar with back + scenario title.

- Description text (bodyMedium/c.foreground)
- Section "Tiêu chí chấm điểm": list of AppListItem items (name, description, trailing = weight % AppBadge)
- Section "Nhân vật": list of AppListItem items (leading: AppAvatar, title: name, subtitle: role). Non-playable dimmed + "NPC" AppBadge
- Mini history section (if past results exist): list of past scores with dates
- Sticky bottom: `AppButton.primary(fullWidth, "Bắt đầu")` → push character selection

### Character selection layout

Push route from scenario detail. Header: scenario name + "Chọn nhân vật của bạn".

- List of playable character cards (AppCard outlined): AppAvatar + name + role
- Tap to select (highlight with primary border + tint)
- Sticky bottom: `AppButton.primary(fullWidth, "Bắt đầu hội thoại")` (disabled until selection)
- On confirm: `POST /sessions` → loading overlay "Đang chuẩn bị hội thoại..." → push chat screen with data

### Result screen layout

Push route (auto from chat when sessionEnded, or from results history).

- Top: total score display (large number 0-100, AppProgress circular or large styled number)
- Middle: criteria list — each item: name + AppProgress linear + score/maxScore + comment
- Bottom: AI summary (bodyMedium text block) + action buttons
- Actions: "Chơi lại" (AppButton.primary → push character selection with old character pre-selected) + "Xem lại hội thoại" (AppButton.outline → push chat history)
- For non-COMPLETED end reasons: context-appropriate message instead of "Chơi lại" (TOO_MANY_ERRORS: study suggestion, INAPPROPRIATE/ABUSIVE: warning, no replay)

### Results history layout

Push route from AppBar history icon or scenario detail mini section.

- AppBar: "Lịch sử hội thoại"
- Optional filter: scenario filter (AppDropdownField or filter bottom sheet)
- ListView of result cards: AppCard(outlined) with score, end reason, date, scenario title, character name
- Tap card → push result detail screen

### Profile stats

Add 2 `_StatCard` items to existing 2x2 grid on profile screen, making it 2x3:

- "Tình huống đã thử" — icon `forum_outlined`, value from `GET /stats` `scenariosAttempted`
- "Điểm TB" — icon `star_outline`, value from `GET /stats` `averageScore`

Use `VietnameseAccentTokens` for accent colors (matching existing stat card pattern).

### Data layer — new SimulationRepository

Follow existing repository pattern (plain class, Dio injection, `mapDioException`):

```dart
class SimulationRepository {
  SimulationRepository(this._dio);
  final Dio _dio;

  Future<List<ScenarioCategory>> listCategories() async { ... }
  Future<List<ScenarioSummary>> listScenarios({String? categoryId, String? level, String? difficulty}) async { ... }
  Future<ScenarioDetail> getScenario(String id) async { ... }
  Future<CreateSessionResponse> createSession(String scenarioId, String chosenCharacterId) async { ... }
  Future<SendMessageResponse> sendMessage(String sessionId, String content) async { ... }
  Future<SessionWithMessages> getSession(String sessionId) async { ... }
  Future<void> cancelSession(String sessionId) async { ... }
  Future<List<SimulationResultSummary>> listResults({String? scenarioId}) async { ... }
  Future<SimulationResultDetail> getResult(String id) async { ... }
  Future<SimulationStats> getStats() async { ... }
}
```

All methods use relative paths (base URL already includes `/api/v1`). `sendMessage` and `createSession` use extended timeout (no streaming, but AI may take 10-15s to respond).

### Domain models

New domain models in `features/simulation/domain/`:

- `ScenarioCategory` — fromJson: id, name, description, icon, color, orderIndex
- `ScenarioSummary` — fromJson: id, title, description, requiredLevel, difficulty, estimatedMinutes, characterCount, categoryInfo
- `ScenarioDetail` — fromJson: summary fields + scoringCriteria[], characters[]
- `ScenarioCharacter` — fromJson: id, name, role, personality, speechStyle, avatarKey, isPlayable, orderIndex
- `ScoringCriterion` — fromJson: name, description, weight
- `SimulationSession` — fromJson: id, scenarioId, chosenCharacterId, status, nextTurnCharacterId
- `SimulationMessage` — fromJson: id, speakerCharacterId, speakerName, isLearner, content, feedback?, orderIndex
- `MessageFeedback` — fromJson: corrections[], review, reviewAvailable
- `Correction` — fromJson: original, corrected, type, severity, startIndex, endIndex
- `CreateSessionResponse` — fromJson: session, messages[], nextTurnCharacterId
- `SendMessageResponse` — fromJson: messages[], nextTurnCharacterId, feedback?, sessionEnded, endReason?, result?
- `SimulationResultSummary` — fromJson: id, totalScore, endReason, createdAt, scenarioTitle, characterName
- `SimulationResultDetail` — fromJson: summary fields + criteriaScores[], aiSummary, totalMessages
- `CriteriaScore` — fromJson: name, score, maxScore, comment
- `SimulationStats` — fromJson: scenariosAttempted, averageScore

### State management — Riverpod AsyncNotifier pattern

Follow existing pattern (same as courses, bookmarks, daily goals):

- `simulationCategoriesProvider` — AsyncNotifier, fetches categories
- `simulationScenariosProvider` — AsyncNotifier with filter params (categoryId, level, difficulty)
- `scenarioDetailProvider` — Family AsyncNotifier, fetches by scenario ID
- `simulationSessionProvider` — Family AsyncNotifier, manages session + messages
- `simulationResultsProvider` — AsyncNotifier with optional scenarioId filter
- `simulationResultDetailProvider` — Family AsyncNotifier
- `simulationStatsProvider` — AsyncNotifier
- `pausedSessionProvider` — AsyncNotifier, checks for incomplete session (ACTIVE/PAUSED)

Chat interaction uses a dedicated `SimulationChatNotifier` (plain Provider, like `AssistantChatNotifier`) that:
- Manages send/receive cycle
- Tracks loading state (AI typing)
- Handles session completion
- Calls repository methods and updates session provider

### Chat screen state: active vs completed

Chat screen widget accepts `sessionId` + `isHistory` flag. States:

- **ACTIVE:** Input visible/enabled on learner's turn, disabled on NPC turn. Back → auto-pause.
- **COMPLETED:** Input hidden. Bottom banner "Phiên đã kết thúc" + "Xem kết quả" button. Feedback bubbles still tappable. Back → pop to tab landing.
- **HISTORY:** Same as COMPLETED but accessed from result screen. No "Xem kết quả" banner (already on result screen). Back → pop to result screen.

### Deep modules for isolated testing

1. **CorrectionTextSpanBuilder** — Pure function: takes message text + corrections[] → returns List<TextSpan> with underline decorations. No Flutter dependencies beyond TextSpan. Testable with unit tests.
2. **SimulationChatNotifier** — Orchestrates chat state transitions (idle, sending, receiving, completed). Mock repository. Test state transitions and message accumulation logic.
3. **SimulationRepository** — Integration-level: verify API contract, error mapping. Mock Dio.

## Testing Decisions

Good tests verify external behavior through the module's public interface, not internal implementation details. Tests should be resilient to refactoring.

### Unit tests

**CorrectionTextSpanBuilder:**
- Given text + corrections → verify TextSpan list with correct underline styles at correct positions
- Overlapping correction ranges → verify merged correctly
- No corrections → verify plain TextSpan
- Mixed error/warning severities → verify correct colors
- Edge cases: correction at start/end of text, empty text, adjacent corrections

**SimulationChatNotifier:**
- Send message → verify loading state → verify messages accumulated → verify input re-enabled
- Session ended → verify completed state with result data
- Multiple NPC messages in response → verify all accumulated in order
- Error during send → verify error state, retry possible

**Domain model fromJson:**
- Verify each model parses correctly from JSON
- Missing/nullable fields handled (feedback null, avatarKey null, etc.)

### Widget tests

- Scenario card renders level badge, difficulty badge, time, character count
- Character selection: tap selects, button activates
- Chat bubble: learner bubble with corrections shows underlines
- Feedback bottom sheet: corrections list, review section
- Result screen: score display, criteria list

Prior art: no existing widget tests in the codebase. These would be the first. Consider whether widget tests add enough value vs relying on manual testing for MVP.

## Out of Scope

- **Backend changes** — all backend work is complete. No new endpoints needed. One behavioral change: session creation should call AI and return opening messages (backend currently returns empty on creation). This requires a backend update tracked separately.
- **Admin panel CRUD for scenarios** — deferred to V2
- **Simulation counting toward Mục tiêu ngày** — deferred to V2
- **Speech/audio in simulations** — text-only for now
- **Streaming responses** — request-response only
- **Offline mode / local caching** — requires network
- **Push notifications for paused session reminders** — just banner on tab landing
- **Dark mode specific tweaks** — use existing theme tokens, no simulation-specific dark adjustments
- **Accessibility (screen reader, large text)** — use standard Flutter semantics, no simulation-specific a11y enhancements beyond defaults

## Further Notes

- The backend currently creates a session with `nextTurnCharacterId = chosenCharacterId` (always learner first). This needs to be updated so that backend calls AI on session creation and returns opening NPC messages. Until this backend change is made, the mobile chat screen must handle the case where `messages[]` is empty on creation (learner speaks first).
- NPC avatar rendering: `ScenarioCharacter.avatarKey` is a nullable string key for mapping to local assets. If null, render a default avatar with the character's initial letter (similar to `AppAvatar` with `child: Text(name[0])`).
- The `ResponseUnwrapInterceptor` strips the `{ data: T }` envelope, so repository methods receive raw JSON directly — no need to unwrap manually.
- Level badge colors should match the existing convention in `courses_screen.dart`: A1=Green, A2=Lime, B1=Amber, B2=Orange, C1=Red, C2=Dark Red.
- The "Thực hành" tab adds a 4th destination to `AppNavBar`. Current `ShellScreen._getCurrentIndex` and `_onTap` need updating for the new index 2 route `/practice`.
