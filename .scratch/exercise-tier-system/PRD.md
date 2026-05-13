# PRD: Hệ thống Cấp Bài Tập (Exercise Tier System)

Status: `ready-for-agent`

## Problem Statement

Người học hiện tại phải làm bài tập lẫn trong luồng bài học (wizard 4 bước: content → vocab → grammar → exercise). Bài tập chỉ có 1 cấp độ, không có hệ thống tiến bộ, không có AI tạo bài tự động. Người học không có động lực luyện thêm, không biết mình ở mức nào, và trải nghiệm làm bài bị lẫn với xem nội dung.

## Solution

Tách hoàn toàn exercise ra screen riêng. Sau khi xem xong nội dung bài học, hiện prompt hỏi có muốn làm bài tập không — nếu có, chuyển sang tier selector screen nơi người học chọn cấp bài tập. Hệ thống 5 cấp (basic → easy → medium → hard → expert) mở khóa tuần tự theo tiến độ (làm hết + ≥80% đúng). Các cấp từ easy trở lên do AI tạo dựa trên nội dung bài học, sử dụng Gemini structured output. Thêm chế độ "Luyện tập tự do" (custom) cho phép người học tự cấu hình bài AI. Lesson list card hiện border màu theo tier cao nhất đã unlock + compact timeline tiến độ.

## User Stories

1. As a learner, I want exercises separated from lesson content, so that I can focus on learning material without being interrupted by exercises
2. As a learner, I want to be asked whether I want to start exercises after finishing lesson content, so that I am not forced into exercises immediately
3. As a learner, I want to skip exercises and still have my content viewing tracked, so that I can return to exercises later
4. As a learner, I want to see a tier selector screen after choosing to do exercises, so that I can choose my difficulty level
5. As a learner, I want 5 exercise tiers (basic, easy, medium, hard, expert), so that I have a clear progression path
6. As a learner, I want basic tier exercises pre-created by the system, so that I have a reliable starting point
7. As a learner, I want to unlock the easy tier after completing basic at ≥80% accuracy, so that I feel rewarded for mastering fundamentals
8. As a learner, I want to unlock each subsequent tier sequentially (basic → easy → medium → hard → expert), so that I have a clear progression path
9. As a learner, I want to be able to practice lower tiers even after unlocking higher ones, so that I can review easier material
10. As a learner, I want unlock to be permanent (never re-locked), so that my achievements are never taken away
11. As a learner, I want to see a "🎉 Next tier unlocked!" animation immediately upon meeting the unlock condition, so that I feel a sense of accomplishment
12. As a learner, I want AI-generated exercises for tiers easy through expert, so that content scales with difficulty and stays fresh
13. As a learner, I want AI exercises generated on-demand the first time I open a tier, so that I don't wait for content I may never use
14. As a learner, I want a "Generate new exercises" button to regenerate AI content, so that I can practice with fresh questions
15. As a learner, I want old AI exercises soft-deleted when regenerating, so that the interface stays clean with only one active set per tier
16. As a learner, I want a "Custom Practice" mode unlocked after completing basic, so that I can configure my own AI-generated exercises
17. As a learner, I want to configure custom exercises by setting: number of questions, exercise types (multi-select), and focus area (vocabulary/grammar/both), so that I can target my weak areas
18. As a learner, I want custom practice displayed separately from the tier timeline under a "Luyện tập tự do" section, so that I understand it's a tool, not a tier to unlock
19. As a learner, I want to do exercises one question at a time on a dedicated play screen, so that I can focus on each question
20. As a learner, I want no countdown timer during exercises, so that I don't feel pressured
21. As a learner, I want my time per question tracked silently (not displayed), so that the system can analyze my performance without stressing me
22. As a learner, I want immediate feedback after each question submission (correct/incorrect + explanation), so that I learn from mistakes instantly
23. As a learner, I want a summary panel after completing all questions in a set, so that I see my overall performance at a glance
24. As a learner, I want to see which questions I got wrong in the summary, so that I can identify weak areas
25. As a learner, I want the summary to show if a new tier was unlocked, so that I know I can progress
26. As a learner, I want a "Return to tier selector" button after summary, so that I can choose my next activity
27. As a learner, I want to resume an incomplete exercise set with a dialog asking "Continue? (5/10 done)", so that I don't lose progress when leaving mid-set
28. As a learner, I want to choose "Start over" when resuming, so that I can redo a set from scratch if I want
29. As a learner, I want the lesson list card to show a colored border indicating my highest unlocked tier, so that I see my achievement at a glance
30. As a learner, I want the lesson list card to show a compact tier timeline (e.g. "Basic ✓ · Easy 80% · 🔒🔒🔒"), so that I know my progress toward the next tier
31. As a learner, I want the lesson wizard to only contain content + vocabulary + grammar steps (no exercises), so that viewing and practicing are clearly separated
32. As a learner, I want my content viewing tracked (contentViewed flag on UserProgress), so that the system knows I've seen the lesson material
33. As a learner, I want content to be marked as viewed when I reach the last wizard page, so that I don't need an extra confirmation step
34. As a learner, I want to jump straight to the exercise tier selector on revisits after viewing content, so that I don't have to re-read material I've already seen
35. As a learner, I want to still have the option to review content on revisits, so that I can refresh my memory
36. As a learner, I want binary scoring (correct/incorrect) at every tier, so that scoring is simple and consistent
37. As a learner, I want AI exercises to use the same 6 exercise types (multiple choice, fill blank, matching, ordering, translation, listening) with increasing complexity at higher tiers, so that I don't have to learn new question formats
38. As a learner, I want AI exercises to mix Vietnamese and English naturally per exercise type (e.g. matching: Việt↔Anh, translation: Việt→Anh, listening: nghe Việt viết Việt), so that I practice all language skills
39. As a developer, I want a proper ExerciseSet entity with tier, custom config, and AI metadata, so that the data model supports the tier system cleanly
40. As a developer, I want unlock status computed on-the-fly from exercise results (not cached), so that it's always accurate
41. As a developer, I want AI generation to use Gemini structured output, so that parsing is reliable
42. As a developer, I want AI generation to receive full lesson context (content + vocab + grammar + basic exercises), so that generated exercises are relevant and non-duplicate
43. As a developer, I want AI tier config derived from lesson content (e.g. more matching questions if lesson has more vocabulary), so that exercises match lesson material
44. As a developer, I want only 1 active exercise set per tier per lesson (unique constraint), so that progress tracking is unambiguous
45. As a developer, I want a dedicated ExerciseGenerationService (deep module), so that AI generation logic is testable in isolation
46. As a developer, I want a dedicated TierProgressService (deep module), so that unlock logic is testable in isolation

## Implementation Decisions

### Data Model

- **ExerciseSet entity** — new entity extending BaseEntity with fields:
  - `lessonId: string` (FK to Lesson)
  - `tier: ExerciseTier` enum (BASIC, EASY, MEDIUM, HARD, EXPERT)
  - `isCustom: boolean` — distinguishes custom practice sets from tier-linear sets
  - `customConfig?: JSONB` — `{questionCount: number, exerciseTypes: ExerciseType[], focusArea: 'vocabulary' | 'grammar' | 'both'}`
  - `isAIGenerated: boolean` — true for AI-created sets, false for system/seeded basic sets
  - `title: string` — display name (e.g. "Basic Exercises", "AI Generated - Easy", "Custom Practice")
  - `generatedById?: string` — userId of the user who triggered AI generation (for analytics)
  - `promptUsed?: string` — the AI prompt used, for reproducibility and debugging
  - `orderIndex: number`
  - BaseEntity fields: id, createdAt, updatedAt, deletedAt
  - Unique constraint: (lessonId, tier, deletedAt IS NULL) — only 1 active set per tier per lesson; custom sets use a virtual tier or separate constraint

- **Exercise entity** — add `setId: string` (FK to ExerciseSet). Retain `lessonId` for backward compatibility and dual-direction querying. Migration: assign existing exercises to the basic set of their lesson.

- **ExerciseTier enum** — `BASIC | EASY | MEDIUM | HARD | EXPERT`

- **UserProgress entity** — add `contentViewed: boolean` (default false). Track separately from exercise completion. Lesson "completed" requires both contentViewed=true and at least basic tier completed.

- **CustomSetConfig type** — JSONB shape:
  ```
  { questionCount: number, exerciseTypes: ExerciseType[], focusArea: 'vocabulary' | 'grammar' | 'both' }
  ```

### Unlock Logic

- Sequential unlock: complete tier N → unlock tier N+1
- Completion condition: all exercises in set attempted AND ≥80% correct
- Unlock is permanent — regenerating a lower tier's exercises never re-locks a higher tier
- At tier N, user can practice any tier ≤ N
- Custom practice unlocks after completing basic (same condition as easy tier)
- Unlock is computed on-the-fly per request (no persistent unlock table). TierProgressService queries exercise results and computes percentages.

### AI Exercise Generation

- **On-demand**: first time a user opens a non-basic tier, backend generates exercises and persists them. Subsequent users see the already-generated set.
- **Regenerate**: user can request new exercises. Old set is soft-deleted (deletedAt), new set created. User exercise results linked to old exercises remain but are not displayed.
- **Gemini structured output**: use Gemini JSON mode to enforce response schema matching Exercise entity shape.
- **Input to AI**: full lesson context — lesson contents (text/dialogue), vocabulary list, grammar rules, and basic tier exercises (to avoid duplication).
- **Tier config**: derived from lesson content. AI receives tier name + guidelines (e.g. "easy: ~8 questions, prefer matching + multiple choice, use vocabulary and grammar from lesson"). Higher tiers increase question count and complexity (more blanks, harder vocabulary, complex grammar).
- **Language**: mix Vietnamese and English per exercise type naturally (matching: Việt↔Anh pairs, translation: either direction, listening: hear Vietnamese, fill blank/MC/ordering: Vietnamese).
- **Rate limiting**: rely on existing ThrottlerGuard (1000 req/60s). No additional per-user generation limits.
- **Error handling**: GenaiService already has retry + fallback model logic. If all retries fail, return error to user with retry button.
- **Permission**: existing `AI_GENERATE_EXERCISE` permission in Permission enum will guard the generate/regenerate endpoints.

### API Contracts

**New endpoints:**

- `GET /exercise-sets/lesson/:lessonId` — list active sets by tier with user progress. Response includes tier, title, isCustom, isAIGenerated, progress stats per set, and `unlockedTiers: ExerciseTier[]`
- `GET /exercise-sets/:id` — set detail with full exercises
- `POST /exercise-sets/:id/generate` — AI generate exercises for an empty non-basic set. Requires `AI_GENERATE_EXERCISE` permission.
- `POST /exercise-sets/:id/regenerate` — soft-delete existing exercises, regenerate via AI. Requires `AI_GENERATE_EXERCISE` permission.
- `POST /exercise-sets/custom` — create custom set. Body: `{lessonId, config: CustomSetConfig}`. Requires `AI_GENERATE_EXERCISE` permission.
- `GET /exercise-sets/:id/progress` — detailed progress for unlock computation. Returns: `{totalExercises, attempted, correct, percentCorrect, percentComplete, nextTierUnlocked}`

**Modified endpoints:**

- `GET /lessons/module/:moduleId` — add `tierSummary` field to each lesson in response:
  ```
  tierSummary: {
    currentTier: ExerciseTier,
    unlockedTiers: ExerciseTier[],
    tiers: Array<{tier: ExerciseTier, status: 'completed'|'in_progress'|'locked', percentCorrect: number}>
  }
  ```
- `GET /lessons/:id` — remove exercises from response (now fetched via exercise-sets)
- `POST /exercises/:id/submit` — add `nextTierUnlocked?: ExerciseTier` in response when unlock condition is met
- `POST /progress/lesson/:lessonId/complete` — consider both contentViewed and exercise completion

**Removed:** No PATCH/DELETE for exercise-sets. Sets are created by seed (basic), AI (non-basic), or user (custom). To fix: regenerate.

### Mobile Screen Flow

1. **Lesson list** → tap card → **Lesson wizard** (content + vocab + grammar only, no exercises)
2. Reach last wizard page → `contentViewed = true` → prompt dialog: "Bắt đầu bài tập?" (Yes / No)
3. No → back to lesson list. Yes → **ExerciseTierScreen**
4. **ExerciseTierScreen**: timeline of 5 tiers (showing lock/unlock/progress) + separate "Luyện tập tự do" section below with custom card. Tap a tier → **ExercisePlayScreen**
5. **ExercisePlayScreen**: one question at a time, no timer, submit → immediate feedback (correct/incorrect + explanation). After last question → summary panel in-place (stats, wrong questions, unlock animation if applicable). "Return to tier selector" button.
6. On revisit (contentViewed=true): user can choose "Review content" or "Do exercises" directly.

### Lesson List Card UI

- Border color corresponds to highest unlocked tier (achievement display)
- Compact tier timeline below card title: "Basic ✓ · Easy 80% · 🔒🔒🔒"
- Each tier shows: ✓ (completed), % (in progress), 🔒 (locked)
- Information only — no tap-to-navigate shortcut on tier badges

### Exercise Play Screen

- No timer bar (removed from current design)
- Silent time tracking: backend still records `timeTaken` per exercise
- Binary scoring: 10 points correct, 0 incorrect (same as current)
- Resume support: if user returns to an incomplete set, dialog "Continue? (N/M done)" with options to continue or start over

### Backend Module Organization

- Expand existing **ExercisesModule** with ExerciseSet entity, ExerciseSetService, ExerciseSetController
- **ExerciseGenerationService** (new deep module within ExercisesModule) — handles AI generation: load context, build prompt, call Gemini structured output, parse, persist. Injects GenaiService from AiModule.
- **TierProgressService** (new deep module within ExercisesModule) — computes tier summaries and unlock status. Pure query + computation, no side effects.

### Seed Data

- Keep existing seed JSON structure (exercises nested in lessons)
- Seed script auto-creates one basic ExerciseSet per lesson that has exercises, assigns existing exercises to that set via `setId`
- Non-basic sets are created at runtime by AI generation, not seeded
- Dev environment: drop + re-seed for migration (synchronize:true handles schema)

### Scoring & Results

- Re-attempts update existing UserExerciseResult (same as current — unique constraint on userId+exerciseId)
- % completion = attempted exercises / total exercises in set
- % correct = correct exercises / total exercises in set (only counted among attempted)
- Unlock requires: percentComplete === 100% AND percentCorrect ≥ 80%

## Testing Decisions

### What makes a good test

- Test external behavior, not implementation details
- For services: test inputs → outputs, mock external dependencies (DB, AI)
- For AI generation: test prompt construction and response parsing with mocked GenaiService — do NOT test actual AI output quality
- For unlock logic: test boundary conditions (79% vs 80%, missing 1 exercise, etc.)

### Modules to test

1. **ExerciseGenerationService** — Deep module, most complex logic
   - Prompt construction includes correct lesson context
   - Tier config applied correctly per tier level
   - Gemini structured output parsing handles valid/invalid responses
   - Custom config overrides defaults correctly
   - Basic exercises included in prompt to avoid duplication
   - Tests: unit tests with mocked GenaiService and repository

2. **TierProgressService** — Deep module, critical business logic
   - Unlock computation: exact boundary at 80% correct
   - Sequential unlock enforcement (can't skip tiers)
   - Custom unlock after basic only
   - Percent calculation with partial attempts
   - Empty set handling
   - Tests: unit tests with mocked repositories

3. **ExerciseSetService** — Orchestration
   - Generate: creates set + calls ExerciseGenerationService
   - Regenerate: soft-deletes old + creates new
   - Custom: validates config + creates set
   - Unique constraint enforcement
   - Tests: unit tests with mocked ExerciseGenerationService and TierProgressService

### Prior art

- Unit tests follow `*.spec.ts` pattern in `src/` directory
- Existing exercise checkers tested in `backend/src/modules/exercises/application/checkers/`
- Existing service tests mock repositories via Jest mocks

## Out of Scope

- New exercise types (sentence_building, error_correction, dictation, conversation_fill) — deferred to Phase 2
- Partial credit scoring — defined in AssessmentResult interface but not implemented, stays that way
- Admin panel CRUD for exercise sets — data managed via seed JSON + AI generation
- Production database migration script — dev re-seeds, production migration deferred
- AI chat integration within exercise screen — conversations remain separate
- Leaderboard or social features tied to tier progress
- Spaced repetition / FSRS integration with exercise tiers
- Embedding-based semantic similarity for translation checking
- Mobile AI conversation/chat screens

## Further Notes

- The `AI_GENERATE_EXERCISE` permission already exists in the Permission enum but has no backing endpoint. This PRD activates it.
- The GenaiService already supports retry logic, key pool rotation, and fallback models — no new infrastructure needed for AI generation reliability.
- The `@Transactional()` decorator is available for exercise submission + unlock check atomicity.
- Translation checker already uses Levenshtein similarity (0.8 threshold) — this may naturally produce "harder" scoring at higher tiers without code changes.
- When generating custom exercises, the same ExerciseGenerationService is reused with user-provided config overriding tier defaults.
- The prompt templates directory (`infrastructure/genai/prompts/`) does not exist yet — it should be created as part of this implementation.
