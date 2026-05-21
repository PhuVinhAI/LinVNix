Status: ready-for-agent

# PRD: Hội thoại mô phỏng (Simulation Conversation)

## Problem Statement

Học viên trên LinVNix hiện chỉ có thể luyện tiếng Việt qua bài tập dạng trắc nghiệm, điền từ, ghép đôi — thiếu cơ hội thực hành giao tiếp trong tình huống thực tế. **Trợ lý AI** hiện tại hỗ trợ hỏi đáp về bài học nhưng không mô phỏng được hội thoại nhiều người, không chấm điểm theo tiêu chí, và không kiểm tra ngữ pháp/chính tả theo từng câu.

Học viên cần một cách để giả lập trò chuyện nhóm trong các tình huống giao tiếp thực tế (nhà hàng, chợ, bệnh viện, ...) để rèn luyện kỹ năng nói/viết tiếng Việt với AI chấm điểm và nhận xét chi tiết.

## Solution

Xây dựng tính năng **Hội thoại mô phỏng** — một hệ thống hoàn toàn mới, nằm ở tab riêng trên bottom nav, cho phép học viên:

1. Duyệt **Danh mục tình huống** (Mua sắm, Ăn uống, Di chuyển, ...) và chọn **Tình huống** phù hợp trình độ
2. Chọn **Nhân vật** muốn hóa thân trong tình huống đó
3. Trò chuyện tiếng Việt với AI đóng vai các nhân vật còn lại, trong luồng hội thoại nhóm do AI điều phối
4. Nhận **Phản hồi lượt nhắn** (gạch chân lỗi chính tả inline + nhận xét chi tiết qua bottom sheet)
5. Nhận **Kết quả mô phỏng** với điểm số chi tiết theo từng tiêu chí khi AI kết thúc phiên

Tính năng độc lập hoàn toàn với cây học liệu (Khóa học/Chủ đề/Bài học) và hệ thống tiến trình hiện tại.

## User Stories

1. As a **Học viên**, I want to browse **Danh mục tình huống** on a dedicated tab, so that I can find conversation scenarios organized by real-life topics
2. As a **Học viên**, I want to filter **Tình huống** by my CEFR level and difficulty, so that I practice at an appropriate challenge level
3. As a **Học viên**, I want to see estimated time, difficulty, and number of characters on each **Tình huống** card, so that I can choose one that fits my available time
4. As a **Học viên**, I want to view a **Tình huống** detail page showing description, characters, and scoring criteria, so that I know what to expect before starting
5. As a **Học viên**, I want to choose which **Nhân vật** to roleplay as, so that I can practice different communication styles and roles
6. As a **Học viên**, I want to see only playable characters in the selection list, so that I don't accidentally choose a narrator or non-playable role
7. As a **Học viên**, I want the simulation to start with an opening message or context-setting, so that I understand the scenario before my first turn
8. As a **Học viên**, I want AI to orchestrate who speaks next in the group conversation, so that the dialogue flows naturally without rigid turn order
9. As a **Học viên**, I want to see each character's name and avatar on their chat bubble, so that I can follow who is speaking in group conversations
10. As a **Học viên**, I want an input field to appear only when it's my character's turn, so that I know when to respond
11. As a **Học viên**, I want AI to check my spelling and grammar on each message I send, so that I learn from my mistakes in real-time
12. As a **Học viên**, I want misspelled words underlined on my chat bubble with severity-based colors (red = error, yellow = warning), so that I can see mistakes at a glance
13. As a **Học viên**, I want to tap a "Xem nhận xét" button to see detailed AI feedback in a bottom sheet, so that I understand why my message was incorrect and how to improve
14. As a **Học viên**, I want the review button to only appear when AI actually has feedback, so that I'm not distracted by empty reviews
15. As a **Học viên**, I want AI feedback to reference my current learning progress and level, so that suggestions match my ability (e.g. "At A2, try using...")
16. As a **Học viên**, I want AI to end the conversation when the topic is naturally completed, so that I get a proper conclusion and scoring
17. As a **Học viên**, I want AI to stop the conversation and ask me to study more if I make too many errors, so that I don't waste time on content above my level
18. As a **Học viên**, I want AI to handle inappropriate or abusive language by ending the session with appropriate feedback, so that the platform stays respectful
19. As a **Học viên**, I want to receive a detailed **Kết quả mô phỏng** when the session ends, showing total score, per-criteria scores, and AI summary, so that I know what I did well and what to improve
20. As a **Học viên**, I want to pause a simulation by leaving the screen and resume it later, so that I can continue where I left off
21. As a **Học viên**, I want a banner prompting me to continue my paused session when I return to the simulation tab, so that I don't lose progress
22. As a **Học viên**, I want to be told I must finish or cancel my current session before starting a new one, so that I stay focused on one scenario at a time
23. As a **Học viên**, I want to replay the same **Tình huống** multiple times, so that I can improve my score
24. As a **Học viên**, I want to view my history of **Kết quả mô phỏng** for a specific scenario, so that I can track my improvement over time
25. As a **Học viên**, I want to see simulation statistics on my profile (scenarios attempted, average score), so that I have an overview of my conversation practice progress
26. As a **Quản trị viên**, I want seed data to pre-populate categories, scenarios, characters, and scoring criteria, so that the feature is usable immediately after deployment

## Implementation Decisions

### Architecture — Separate backend module

- New module `simulations/` under `backend/src/modules/`, completely separate from the existing `conversations/` module
- Follows the same layered structure as other modules: `domain/` (entities), `application/` (services), `presentation/` (controllers), `dto/`
- Does not share entities with the Trợ lý AI conversation system — schema, business logic, and prompt templates are all different

### Entities

Six new entities, all extending `BaseEntity` (uuid id, createdAt, updatedAt, soft-delete deletedAt):

**ScenarioCategory**
- `name: string` — display name (e.g. "Mua sắm")
- `description: text` — short description
- `icon: string` — icon identifier for mobile
- `color: string` — hex color for mobile
- `orderIndex: int` — display order

**Scenario**
- `categoryId: FK → ScenarioCategory`
- `title: string` — display title
- `description: text` — UI description
- `systemPrompt: text` — AI prompt template with variables
- `openingMessage: text, nullable` — fixed opening (null = AI generates)
- `requiredLevel: enum UserLevel` — minimum CEFR level (reuses existing enum)
- `difficulty: enum Difficulty` — EASY / MEDIUM / HARD (new enum)
- `scoringCriteria: jsonb` — array of `{ name, description, weight }`
- `maxTurns: int, nullable` — safety net turn limit
- `estimatedMinutes: int` — estimated duration for UI card
- `isPublished: boolean, default true` — admin can unpublish

**ScenarioCharacter**
- `scenarioId: FK → Scenario` — 1-N, tightly coupled
- `name: string` — display name on bubble
- `role: string` — role description (e.g. "Người bán rau")
- `personality: text` — personality traits for AI
- `speechStyle: text` — speech patterns, dialect, quirks
- `avatarKey: string, nullable` — mobile asset key
- `isPlayable: boolean, default true` — learner can choose this character
- `orderIndex: int` — display order in selection

**SimulationSession**
- `userId: FK → User`
- `scenarioId: FK → Scenario`
- `chosenCharacterId: FK → ScenarioCharacter`
- `status: enum SimulationSessionStatus` — ACTIVE / PAUSED / COMPLETED
- `totalTokens: int, default 0` — AI token tracking

**SimulationMessage**
- `sessionId: FK → SimulationSession`
- `speakerCharacterId: FK → ScenarioCharacter, nullable` — null for system messages
- `isLearner: boolean` — whether this message is from the learner
- `content: text` — message content
- `feedback: jsonb, nullable` — `{ corrections: [...], review: string, reviewAvailable: boolean }` — only present on learner messages
- `orderIndex: int` — message sequence number

**SimulationResult**
- `userId: FK → User`
- `sessionId: FK → SimulationSession` — unique (one result per completed session)
- `scenarioId: FK → Scenario`
- `chosenCharacterId: FK → ScenarioCharacter`
- `totalScore: int` — 0-100
- `criteriaScores: jsonb` — `[{ name, score, maxScore, comment }]`
- `endReason: enum SimulationEndReason` — COMPLETED / TOO_MANY_ERRORS / INAPPROPRIATE / ABUSIVE
- `aiSummary: text` — overall AI commentary
- `totalMessages: int` — message count for stats

### New enums

```typescript
enum Difficulty { EASY = 'EASY', MEDIUM = 'MEDIUM', HARD = 'HARD' }
enum SimulationSessionStatus { ACTIVE = 'ACTIVE', PAUSED = 'PAUSED', COMPLETED = 'COMPLETED' }
enum SimulationEndReason { COMPLETED = 'COMPLETED', TOO_MANY_ERRORS = 'TOO_MANY_ERRORS', INAPPROPRIATE = 'INAPPROPRIATE', ABUSIVE = 'ABUSIVE' }
```

Add `SIMULATION_ACCESS = 'SIMULATION_ACCESS'` to the existing `Permission` enum. Assign to USER role by default.

### API contract — 8 endpoints under `/api/v1/simulations`

All guarded by `@RequirePermissions(Permission.SIMULATION_ACCESS)`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/categories` | List all scenario categories |
| GET | `/scenarios` | List scenarios with filters (`categoryId`, `level`, `difficulty`) |
| GET | `/scenarios/:id` | Scenario detail with characters |
| POST | `/sessions` | Create session `{ scenarioId, chosenCharacterId }` → returns session + opening |
| POST | `/sessions/:id/messages` | Send learner message → returns AI response(s) + metadata |
| GET | `/sessions/:id` | Get session with message history (for resume) |
| GET | `/results` | List results with optional `scenarioId` filter |
| GET | `/results/:id` | Result detail |

### Message endpoint response shape

```typescript
{
  messages: Array<{
    speakerCharacterId: string;
    speakerName: string;
    content: string;
  }>;
  nextTurnCharacterId: string;
  feedback: {
    corrections: Array<{
      original: string;
      corrected: string;
      type: 'spelling' | 'grammar';
      severity: 'error' | 'warning';
      startIndex: number;
      endIndex: number;
    }>;
    review: string | null;
    reviewAvailable: boolean;
  } | null;
  sessionEnded: boolean;
  endReason?: SimulationEndReason;
  result?: SimulationResult;  // included when sessionEnded = true
}
```

### Communication protocol — Request-response, not streaming

Simulation messages are short (1-3 sentences of character dialogue) and carry complex structured metadata (feedback, corrections, next turn, session end). Standard JSON request-response is simpler and sufficient — no SSE streaming needed.

### AI integration

- **Reuse** existing `GenaiService` (infrastructure layer) for Gemini API calls
- **New** `SimulationAiService` in `simulations/application/` handles: prompt construction from scenario template + character data + learner progress, structured response parsing, turn orchestration logic
- **New** prompt template `simulation-conversation.yaml` in `infrastructure/genai/prompts/`
- **Inject** `ProgressService` directly to read learner progress for contextual feedback — no agent loop or AI Tool system needed
- AI response must be structured JSON (using Gemini's JSON mode or response schema)

### Session lifecycle

- Only **1 incomplete session** (ACTIVE or PAUSED) per user at any time — enforced by service-level constraint
- Leaving screen → session auto-marked PAUSED
- Returning → resume from stored messages (AI context reconstructed from SimulationMessage history)
- AI decides completion → COMPLETED + SimulationResult created
- User cancels → session soft-deleted, no result

### No impact on existing systems

- Simulation does **not** count toward Mục tiêu ngày (daily goals)
- Phút truy cập app still counts (it's app foreground time, screen-agnostic)
- No new progress entities — simulation stats derived from `SimulationResult` queries
- Existing `conversations/` module untouched

### Seed data

- 6 **Danh mục tình huống**: Mua sắm, Ăn uống, Di chuyển, Y tế, Công việc, Đời sống
- ~15 **Tình huống** total (2-3 per category), spanning A1–B2
- Each scenario includes 2-3 **Nhân vật** with Vietnamese-appropriate names, personalities, and speech styles
- Each scenario includes 3-5 **Tiêu chí chấm điểm** with weights summing to 100
- Each scenario includes a `systemPrompt` template and optionally an `openingMessage`
- Seed runs via a NestJS seeder or CLI command

## Testing Decisions

Good tests verify external behavior through the module's public interface — not internal implementation details. Tests should be resilient to refactoring (changing internal structure without changing behavior should not break tests).

### Unit tests (`*.spec.ts`)

**SimulationAiService**
- Test prompt building: given scenario + characters + learner progress → verify constructed prompt contains correct data
- Test response parsing: given raw AI JSON response → verify correctly parsed into typed response with messages, feedback, next turn
- Test turn orchestration: given conversation history → verify correct next turn decisions
- Test edge cases: malformed AI response, missing fields, empty corrections
- Mock: `GenaiService`, `ProgressService`

**SimulationSessionService**
- Test session creation: verify 1-session constraint (reject if existing incomplete session)
- Test lifecycle transitions: ACTIVE → PAUSED → ACTIVE → COMPLETED
- Test message sending: verify message persisted, AI service called, response stored
- Test session completion: verify SimulationResult created with correct scores
- Test cancellation: verify soft-delete, no result created
- Mock: repositories, `SimulationAiService`

**ScenariosService**
- Test query/filter: by category, level, difficulty
- Test detail retrieval: includes characters, excludes non-playable from selection
- Mock: repositories

### E2E tests (`*.e2e-spec.ts`)

**Full API flow tests**
- List categories → list scenarios with filters → get scenario detail
- Create session → send messages → receive AI responses → session completes → get result
- Verify 1-session constraint via API (reject second session creation)
- Verify pause/resume flow
- Verify permission guard (unauthorized user rejected)

Prior art: existing e2e tests in `backend/test/` using jest with `test/jest-e2e.json`

### Integration tests (`scripts/test/suites/`)

**Seed data verification**
- Run seed → verify categories, scenarios, characters created with correct relationships and data integrity
- Verify scoringCriteria weights sum to 100 for each scenario

Prior art: existing integration test scripts in `backend/scripts/test/suites/`

## Out of Scope

- **Mobile (Flutter) UI** — this PRD covers backend only. Mobile implementation is a separate effort
- **Admin panel CRUD for scenarios** — seed data is sufficient for MVP. Admin management (`SIMULATION_MANAGE` permission) deferred to V2
- **Level C1/C2 scenarios** — seed data only covers A1–B2. Higher levels added later based on demand
- **Simulation counting toward Mục tiêu ngày** — would require new goal type and aggregation logic. Deferred to V2
- **Speech/audio in simulations** — text-only for now. Voice/TTS integration deferred
- **AI-generated scenarios** — all scenarios are admin-seeded. Dynamic scenario generation deferred
- **Leaderboard/social features** — no ranking or sharing of simulation results between users

## Further Notes

- The `systemPrompt` field on Scenario is a template with Handlebars-style variables (`{{learner.level}}`, `{{learner.nativeLanguage}}`, `{{characters[0].name}}`, etc.) — rendered by `SimulationAiService` before sending to Gemini
- AI must return structured JSON for every response. Consider using Gemini's `responseMimeType: "application/json"` with a response schema to enforce structure
- The `feedback` on learner messages includes `startIndex`/`endIndex` for inline error highlighting — these indices refer to character positions in the learner's original message text
- When multiple AI characters speak in sequence before the learner's turn, the backend makes multiple AI calls internally and returns all messages in a single response array
- Session timeout: consider a background job or lazy check that auto-marks sessions PAUSED/ABANDONED after 30 minutes of inactivity (implementation detail, not domain requirement)
