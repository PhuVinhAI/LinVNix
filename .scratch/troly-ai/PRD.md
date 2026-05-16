Status: ready-for-agent

# PRD: Trợ lý AI (AI Assistant)

## Problem Statement

Learners studying Vietnamese in LinVNix have no contextual way to ask the AI for help. The existing AI module ships a partial backend — an `AgentService` with a ReAct tool loop, a Gemini provider, and SSE streaming — but no production tools (only `EchoTool`), no mobile UI, no per-screen context awareness, and a known bug where SSE streaming bypasses the agent loop so tools cannot be called during streaming.

When a learner is mid-lesson and confused about a vocabulary item, mid-exercise and unsure of a phrase, or scanning their bookmarks and wondering what to study next, they have to context-switch out of the app to look something up. The product cannot help them on the screen they're already on. Conversations, when they happen, are also poorly scoped: today's `Conversation` entity is permanently bound to a lesson at creation time and forbids re-binding, which makes it incompatible with a "follow the user across screens" assistant.

## Solution

Build the **Trợ lý AI** feature as a persistent UI surface that lives on every authenticated screen, captures the learner's current screen context, and lets them have short, focused Q&A sessions with an AI tutor that can read user-scoped data and propose actions.

The surface has three states:

1. **Thanh Trợ lý AI** (collapsed bar) — a thin bar pinned to the very bottom of every authenticated screen, below the bottom nav where present. Shows a screen-aware placeholder ("Ask about this lesson?", "Need a hint?", etc.) and is the only UI affordance for opening the assistant.

2. **Trạng thái Hỏi** (mid, single-exchange focused) — slides up when the learner taps the bar. Deliberately minimal: not a chat list. Cycles through three phases — **Compose** (textarea ≤ 5 lines + Send), **Loading** (spinner + "Đang suy nghĩ..." + Stop, with granular per-tool status text), **Read** (AI response with markdown, auto-grows to ≤75% screen, Stop while streaming, "Soạn tiếp" when done). Tap "Soạn tiếp" → back to Compose; the prior AI message is hidden but the server-side Conversation continues.

3. **Trạng thái Toàn màn hình** (full screen) — traditional chat list. Drawer toggle reveals Conversation list with rename + delete + "+ New". Header shows the current Flutter screen name so the learner knows what context is included. User messages are right-aligned with a background, AI messages span full width with markdown rendering.

Each time the learner opens the bar to ask, a new **Conversation** is created lazily on first message, with the **Screen Context** (a rich JSONB snapshot the mobile app builds reactively) frozen at that moment. The Conversation stays scoped to that single screen context — even if the learner navigates to a different screen while the assistant is open. A **Reset** button in both Mid and Full states ends the current Conversation and starts a fresh one with the now-current Screen Context.

The AI has access to **12 AI Tools** in V1 — reads, one direct-write, and three propose-and-confirm writes — letting it pull cross-screen history, search the vocabulary/grammar catalog, look up lessons, toggle bookmarks, and propose daily goals or custom exercise sets. Tool authorization is scoped server-side to the Conversation owner's `userId`; the AI never specifies who the tools act on.

## User Stories

### Discovering and opening the assistant

1. As a learner, I want to see a thin bar at the bottom of every screen I'm on (except auth/onboarding), so that I know I can ask the AI for help without searching for it
2. As a learner, I want the bar's placeholder text to hint at what I can ask on this screen (e.g., "Hỏi về bài học?" on a lesson screen, "Cần gợi ý?" on an exercise screen), so that I learn what the assistant can do for me
3. As a learner, I want to tap or swipe up on the bar to open the assistant, so that I can ask my question quickly
4. As a learner, I want the assistant to be hidden during splash, login, register, password reset, and onboarding flows, so that I'm not distracted during one-time linear flows
5. As a learner, I want the bar to also appear while I'm doing an exercise, so that I can ask for hints without losing my place

### Asking a question (Mid mode)

6. As a learner, I want to see a focused text input area when I open the assistant, so that nothing distracts me while I compose my question
7. As a learner, I want the text input to grow up to 5 lines as I type, so that I can write a medium-length question comfortably
8. As a learner, I want to tap a Send button at the bottom to submit my question, so that I know exactly how to send
9. As a learner, I want to see a "Đang suy nghĩ..." spinner immediately after I tap Send, so that I don't think the app froze when the backend is slow
10. As a learner, I want the spinner text to update to reflect what the AI is doing (e.g., "Đang tra cứu từ vựng..."), so that I trust the AI is working on my question
11. As a learner, I want the AI's response to stream in word-by-word once it starts, so that I can begin reading right away
12. As a learner, I want the assistant area to grow as the AI's response grows, up to about 75% of the screen, so that I can read most responses inline without going full screen
13. As a learner, I want the AI's response to be rendered with markdown (bold, lists, inline code), so that complex answers are easy to scan
14. As a learner, I want to tap a Stop button while the AI is responding, so that I can interrupt a long answer I no longer need
15. As a learner, I want partial AI responses to be saved when I stop, so that I can still see what was generated before I interrupted
16. As a learner, I want a clear "Soạn tiếp" affordance after the AI finishes, so that I can ask a follow-up question without going to full screen
17. As a learner, I want tapping "Soạn tiếp" to clear the visible AI message and show a fresh text input, so that I stay in the focused single-exchange mode
18. As a learner, I want my follow-up questions to be remembered server-side within the same Conversation, so that the AI has continuity even though the UI only shows one exchange at a time

### Managing Conversations (Full mode)

19. As a learner, I want to drag the assistant further up to enter a full-screen chat view, so that I can see the entire Conversation history
20. As a learner, I want to see the name of the screen I came from in the full-screen header, so that I know which screen context is attached to this Conversation
21. As a learner, I want to open a left drawer in full-screen mode, so that I can see all my prior Conversations
22. As a learner, I want to tap a prior Conversation in the drawer to open it, so that I can continue or review past discussions
23. As a learner, I want to rename a Conversation, so that I can find it again later
24. As a learner, I want to delete a Conversation, so that I can clean up my list
25. As a learner, I want to tap "+ New" in the drawer to start a new Conversation with my current Screen Context, so that I don't have to close the assistant first
26. As a learner, I want my own messages to be right-aligned with a background and the AI's messages to span full width without a background, so that the conversation is visually clear
27. As a learner, I want both Mid and Full modes to render AI messages with markdown, so that the formatting is consistent

### Reset and Conversation lifecycle

28. As a learner, I want a Reset button visible in both Mid and Full states, so that I can quickly end the current Conversation and start a new one
29. As a learner, I want pressing Reset to leave the old Conversation in my history (not delete it), so that I don't lose past discussions
30. As a learner, I want a new Conversation to start with the screen I'm currently on (not the screen where the old one started), so that Reset is the natural way to "rebind" to my current context
31. As a learner, I want Conversations to be created only when I send a message (not when I just open the bar and close it), so that my history isn't cluttered with empty Conversations
32. As a learner, I want the assistant bar to stay open as I navigate between screens, so that I can keep typing without the bar disappearing
33. As a learner, I want a Conversation that started on screen A to still be about screen A even if I navigate to screen B while the assistant is open, so that the AI doesn't get confused mid-conversation

### AI capabilities — Reads (user data)

34. As a learner, I want to ask "How am I doing?" and have the AI summarize my level, streak, today's goals, and overall progress, so that I get a quick snapshot
35. As a learner, I want to ask "What did I get wrong last time?" and have the AI fetch my recent exercise results, so that I can review my mistakes
36. As a learner, I want to ask "What words have I bookmarked recently?" and have the AI list my recent bookmarks, so that I can revise them
37. As a learner, I want to ask "What course should I focus on?" and have the AI use my progress data to recommend, so that I get personalized guidance

### AI capabilities — Reads (catalog)

38. As a learner, I want to ask "What's the Northern Vietnamese variant of 'xe đạp'?" and have the AI search the vocabulary catalog respecting my preferred dialect, so that I learn the right variant
39. As a learner, I want to ask about a grammar rule by name or example and have the AI find and explain it, so that I can build my grammar knowledge
40. As a learner, I want to ask "Find me a lesson on family vocabulary" and have the AI search the lesson catalog by topic/level, so that I can discover what to study next
41. As a learner, I want the AI to fetch the full content of a lesson by ID when I'm asking about something not on my current screen, so that it can give accurate information

### AI capabilities — Writes (direct and propose)

42. As a learner, I want to ask "Bookmark this word for me" and have the AI immediately toggle the bookmark, so that I save time
43. As a learner, I want the AI to propose a new daily goal (e.g., "Want me to set a 30-minute study goal?") and to confirm it explicitly before it's created, so that I'm always in control of changes to my profile
44. As a learner, I want to see an inline confirm card with "Có"/"Không" buttons when the AI proposes an action, so that the confirmation is unambiguous
45. As a learner, I want to ask the AI to generate a custom exercise set on a topic and to confirm before it starts generating, so that I don't waste my time waiting on something I didn't really want
46. As a learner, I want the AI to never silently mutate my progression (mark lessons complete, change my CEFR level, delete my data), so that I trust the assistant

### Persona and language

47. As a learner, I want the AI to reply in the language I configured in my profile (e.g., English if my native language is English), so that I understand the answer
48. As a learner, I want Vietnamese vocabulary and example sentences to remain in Vietnamese even when the explanation is in my native language, so that I'm exposed to the target language
49. As a learner, I want the AI to respect my preferred dialect when giving examples, so that the variants I learn match my interest
50. As a learner, I want the AI to give hints (not direct answers) when I'm in the middle of an exercise, so that I learn instead of cheating
51. As a learner, I want the AI to be friendly, patient, and concise, so that talking to it is pleasant

### Error and edge cases

52. As a learner, I want to see a clear error message and a "Thử lại" button if the AI request fails before any token arrives, so that I can retry without losing my question
53. As a learner, I want the app to gracefully handle me tapping Send rapidly multiple times by replacing the in-flight stream with the new one, so that I don't have to wait or see errors
54. As a learner, I want the partial response (if any) to be visible with an "Đã dừng" indicator when I stop the AI, so that I know the message was interrupted

## Implementation Decisions

### Conversation model — short, screen-scoped, lazy-created

A **Conversation** in this product is a short focused Q&A session, not a long ChatGPT-style thread. Each time the learner opens the bar to ask, a brand new Conversation is created (lazily, on first message send). The Conversation's Screen Context is frozen at creation. The bar never resumes a previous Conversation — that's only possible via the Full mode Conversation list. A **Reset** button ends the current Conversation (preserving it in history) and starts a new one bound to the now-current Screen Context.

This is a meaningful shift from the existing `Conversation` entity, which is permanently bound to `lessonId` at creation. We keep `lessonId`/`courseId` columns for filter/query convenience but stop treating them as semantic identity — the source of truth is now `screenContext`.

### Screen Context — rich JSONB snapshot pushed by mobile

The mobile app composes a `ScreenContext { route, displayName, barPlaceholder, data }` structure reactively from the current route and watched domain providers. On first message send, it pushes the full snapshot (including user-visible content: lesson body, current exercise question + user's tentative answer, bookmark filter state, etc.) in the request body. The backend stores it in a new `screenContext: jsonb` column on `Conversation`.

User identity (CEFR level, native language, preferred dialect) is NOT pushed by mobile — the backend merges those values from the Conversation owner's `User` entity at prompt-render time.

The cap is "rich snapshot" because the product's lesson content is small (a few KB per screen at most). Payload size is not a concern, and a dense snapshot eliminates many tool round-trips for simple questions.

### AI Tools — three categories, scoped to Conversation owner

Extend `BaseTool` to accept a `ToolContext { userId, conversationId, screenContext, user }` as the second argument of `execute`. `AgentService` passes this context every call. Tools NEVER accept `userId` as an LLM-controlled parameter — this prevents the AI from accidentally (or maliciously, in a prompt-injection scenario) reading data belonging to another learner.

Three categories:

- **Read tools** — return user-scoped or catalog data. Execute directly inside the agent loop.
- **Direct-write tools** — perform reversible, low-risk mutations (V1: only `toggle_bookmark`). Execute directly.
- **Propose tools** — return a structured proposal payload `{ endpoint, payload, ... }` rather than mutating state. The mobile app renders an inline confirm card; on the learner's "Có" tap, the mobile client calls the real REST endpoint (using the learner's normal auth). The propose tools themselves don't write to the database — the audit trail is the tool result stored in `ConversationMessage.toolResults[]` plus the regular endpoint log.

Every tool also exposes a `displayName: string` field — a Vietnamese status text the mobile app shows during Phase B so the learner knows what the AI is doing (e.g., "Đang tra cứu từ vựng...").

V1 catalog (12 tools):
- Reads (user): `get_user_summary`, `get_progress_overview`, `list_recent_exercise_results`, `list_bookmarks`
- Reads (catalog): `search_vocabulary`, `search_grammar_rules`, `find_lessons`, `get_lesson_detail`
- Direct write: `toggle_bookmark`
- Propose: `propose_create_daily_goal`, `propose_update_daily_goal`, `propose_generate_custom_exercise_set`

Excluded from V1 entirely: any tool that mutates progression (e.g., `mark_lesson_complete`), identity (`update_profile.level`), or destructively deletes (`propose_delete_*`).

**Service extensions required by V1 tools** (small, additive, behavior-preserving — applied during the corresponding tool-category slices):
- `VocabulariesService.search` — accept `{ query, lessonId?, dialect? }` (today only `query`). When `dialect` is absent in tool params, the tool falls back to `ctx.user.preferredDialect`.
- `GrammarRepository` — add `search(query, opts?)` ILIKE on `title` + `explanation` (no full-text search exists today).
- `CourseContentService` — add `findLessons({ topic?, level?, type?, limit? })` (no topic/level lesson search exists today).
- `LessonsRepository.findById` — extend relations to include `exercises` and `exerciseSets` for `get_lesson_detail` (today loads only `module`, `contents`, `vocabularies`, `grammarRules`).
- `UserExerciseResultsRepository.findByUserId` — accept `{ limit?: number }` (default 10, max 50; existing `attemptedAt: DESC` order preserved).

**Tool-implementation constraint:** `get_user_summary` reads goals + streak via `DailyGoalsService.findAll` + `DailyStreakService.getStreak` directly. It must NOT call `DailyGoalProgressService.getTodayProgress`, which has a side effect of mutating streak state via `updateStreak`.

### Streaming protocol — single SSE endpoint with typed events

Replace the current 2-step flow (`POST /ai/chat` to create + `GET /ai/chat/:id/stream` for SSE) with a single endpoint `POST /ai/chat/stream` that accepts `{ conversationId?, message, screenContext? }` and returns an SSE response. This eliminates the race condition between message-create and stream-start, halves the round trips, and lets the same handler drive the full agent loop.

The existing `GET /ai/chat/:id/stream` is removed. The current `POST /ai/chat/simple` (non-streaming) is kept for tooling and development.

The stream emits typed SSE events:

```
event: tool_start
data: {"name":"search_vocabulary","displayName":"Đang tra cứu từ vựng...","args":{...}}

event: tool_result
data: {"name":"search_vocabulary","ok":true}

event: text_chunk
data: {"text":"Bạn có thể "}

event: propose
data: {"kind":"create_daily_goal","title":"...","description":"...","endpoint":"POST /daily-goals","payload":{...}}

event: error
data: {"code":"...","message":"..."}

event: done
data: {"messageId":"...","interrupted":false}
```

This requires a new `AgentService.runTurnStream()` async generator that internally drives the tool loop and yields events at each interesting boundary. The old non-streaming `runTurn()` stays as a thin wrapper over `runTurnStream` (collect to single response), or vice versa — the streaming path is the new primary path and tool support must work in both.

### Abort — Dio cancel + backend cleanup + interrupted flag

When the learner taps Stop, the mobile client cancels the Dio request (closes the SSE connection). The NestJS `Observable` subscriber receives `unsubscribe`, which triggers cleanup:
- Cancel the Gemini stream (verify `@google/genai` supports abort; if not, accept that background tokens are discarded)
- Save the partial assistant message with a new column `interrupted: boolean default false` set to `true`

Mobile UI shows the partial text plus a small "Đã dừng" label and switches the bottom button to "Soạn tiếp".

### Mobile architecture — global shell via `MaterialApp.router.builder`

Wrap the entire router output with a new `GlobalAssistantShell` widget via `MaterialApp.router.builder`. This widget is a `Stack` that renders the route child plus the assistant surface (bar + sheet + full). It watches the current route to decide visibility (hidden on splash/auth/onboarding).

This approach was chosen over `Overlay` (modal dialogs would float above the assistant — correct UX) and over a top-level `ShellRoute` (go_router redirect logic becomes more complex with nested shells).

### Mobile state — reactive Riverpod `currentScreenContextProvider`

A single global Riverpod provider auto-computes the current `ScreenContext` from the current route plus the relevant domain providers. Each route family (`/`, `/courses`, `/lessons/:id`, etc.) has a registered `ScreenContextBuilder` (a pure function `(ref) -> ScreenContext`). Adding a new screen means registering a new builder; the rest of the assistant code is screen-agnostic.

This is preferred over imperative push-from-screen patterns because there's no dispose race when navigating quickly, and because the provider recomputes naturally as underlying providers (lesson progress, exercise state, etc.) change.

When the learner sends a message, the assistant chat notifier reads the provider's current value once and serializes it. Subsequent screen changes do NOT update the Conversation's `screenContext` — the snapshot is frozen.

### Mobile UI state machine — Assistant State Machine

A pure-logic state machine encodes the UI states and valid transitions:

```
States:
  Collapsed
  MidCompose
  MidLoading
  MidReading (streaming)
  MidReading (done)
  Full

Triggers (selected):
  Bar tap, drag-up                      → Collapsed → MidCompose
  Send tapped (Compose phase)           → MidCompose → MidLoading
  First text_chunk received             → MidLoading → MidReading(streaming)
  Stream done event received            → MidReading(streaming) → MidReading(done)
  Stop tapped (Loading or Streaming)    → → MidReading(done, interrupted)
  "Soạn tiếp" tapped                    → MidReading(done) → MidCompose
  Reset tapped (any non-Collapsed)     → → MidCompose (fresh Conversation)
  Drag-up further (Mid)                 → Mid* → Full
  Back gesture (Full)                   → Full → prior Mid* or Collapsed
  Backdrop tap, "−" button, drag-down  → Mid* → Collapsed
```

The machine is exposed as a Riverpod notifier and is tested in isolation from any widget.

### Persona prompt — single YAML template with placeholders

Add `backend/src/infrastructure/genai/prompts/assistant-tutor.yaml`. The template references `{{user.nativeLanguage}}`, `{{user.currentLevel}}`, `{{user.preferredDialect}}`, `{{screenContext.displayName}}`, `{{screenContext.route}}`, `{{screenContext.data}}`. The existing `GenaiService.renderPrompt` does flat `{{key}}` substitution only (no Jinja filters); pre-serialize `screenContext.data` to a JSON string in the controller before passing it as a template variable. No new `SystemPromptRenderer` class is introduced — the existing `GenaiService.renderPrompt` is reused. It enforces:
- Respond in `user.nativeLanguage` (hard rule)
- Keep Vietnamese only for target vocabulary, example sentences, and quoted lesson content
- Respect dialect preference in examples
- When the learner is on any route matching `*/exercises/play/*` (nested under courses, modules, or lessons — there is no top-level `/exercises/play` in this app), give hints instead of direct answers
- Use tools to fetch user-history or catalog data when relevant; use propose tools for actions

### Conversation entity changes

- ADD `screenContext: jsonb` — the frozen Screen Context snapshot
- ADD `title: varchar` — auto-generated from first user message; user-editable via rename
- ADD `interrupted: boolean default false` ON `ConversationMessage`
- REMOVE `status: ConversationStatus` enum and column (already deprecated in CONTEXT.md)
- KEEP `lessonId`, `courseId` but reinterpret as derived hints only — they're populated when the Screen Context contains the corresponding ID, and they exist solely to support efficient "list my conversations about this lesson" queries

### Permissions and rate limit

Permissions:
- Reuse existing `AI_CHAT` for `POST /ai/chat/stream` (covers tools and propose)
- Reuse existing `AI_VIEW_CONVERSATIONS` for read endpoints
- DEPRECATE `AI_CHAT_STREAM` — merge into `AI_CHAT` (no behavioral change since both are seeded on USER role)

No new permissions are added in V1. (`AI_GENERATE_EXERCISE` already guards `POST /exercise-sets/custom`, `:id/generate`, and `:id/regenerate` — confirmed during PRD reality-check; no missing-guard fix is required.)

Rate limit: V1 keeps the existing global `ThrottlerGuard` (1000/60s, basically infinite per individual user). No per-user limit, no per-endpoint override, no concurrency cap. Gemini KeyPool cooldown handles provider-side budget. Mobile self-imposes "one stream at a time" by cancelling the in-flight stream when the learner sends a new message.

### Propose flow — mobile executes, AI is not notified on decline

When a propose tool is invoked:
1. The backend emits an SSE `propose` event carrying a structured `endpoint` + `payload` + UI labels
2. Mobile renders an inline confirm card inside the assistant
3. On "Có" → mobile calls the real REST endpoint (e.g., `POST /daily-goals`) with the learner's normal auth token → standard permission check runs server-side → success/error feedback is shown locally
4. On "Không" → the card is dismissed; the AI is NOT notified that the proposal was declined

This means the AI may re-propose the same action in a later turn. V1 accepts that trade-off in exchange for simplicity (no state to thread back into the next turn). A V2 enhancement could inject a synthetic system message on the next turn.

### What does NOT change in this PRD

- The Gemini provider integration (`GenaiService`), KeyPool, and YAML prompt loader stay as-is structurally; only a new template is added (and one pre-existing bug — `mapResponseToAiChatResponse` dropping `functionCalls` from the SDK response — is fixed in passing; see "Existing inconsistencies fixed by this PRD" below).
- The exercise generation pipeline stays as-is — its `AI_GENERATE_EXERCISE` guard is already in place.
- Existing courses, lessons, vocabularies, bookmarks, daily goals, and progress modules are not refactored — tools call their existing services. A handful of services receive small additive extensions to support tool params; see "Service extensions required by V1 tools" in the AI Tools section above.

## Testing Decisions

### What makes a good test

Tests should verify observable behavior, not implementation details. Avoid mocking what you own; prefer testing the public interface of a module with realistic inputs and asserting on its outputs or persisted state. State machines are tested by driving inputs and asserting state transitions, not by reaching into internal fields. Streaming is tested by collecting events from a mock provider and asserting on the event sequence and final database state.

Scope chosen: **Recommended (β)** — backend tools + agent stream + SSE encoder/decoder + critical screen context builders + one e2e happy path.

### Backend — modules to test

**Each AI Tool (12 of them) — unit tests (`*.spec.ts`):**
- Drive `execute(params, ctx)` with realistic params and a mocked underlying service
- Assert: correct service method is called, `userId` flows from `ctx` (not from `params`), output shape matches the declared schema, errors are returned as `{ error }` not thrown
- Tools that touch DB use a mocked repository in their `*.spec.ts`; one integration test per tool category (one read, one write, one propose) hits the real DB via the bun integration suite pattern

**`AgentService.runTurnStream()` — unit tests with a mock AI provider:**
- Mock `IAiProvider` to return scripted sequences (function calls → tool execution → final text)
- Assert: tool loop terminates correctly, tool messages persisted, partial response saved with `interrupted=true` when subscriber unsubscribes mid-stream
- Multi-iteration tool loops (e.g., two `function_calls` in one turn) are covered explicitly

**`assistant-tutor.yaml` rendering — unit tests via existing `GenaiService.renderPrompt`:**
- Given a user + screen context (with `screenContext.data` pre-serialized to JSON), call `genaiService.renderPrompt('assistant-tutor', vars)`
- Assert: placeholders substituted, dialect/level rules visible in output, no template syntax leaks
- Note: no new `SystemPromptRenderer` class — the existing `GenaiService.renderPrompt` is reused

**`SseEventEncoder` — unit tests:**
- Given typed events, produce SSE wire-format strings
- Assert: each event has the right `event:` prefix and JSON-encoded `data:` line; multi-line text chunks are escaped correctly

**End-to-end — `*.e2e-spec.ts`:**
- One happy-path test for `POST /ai/chat/stream`: authenticated user posts a message, server emits a known event sequence (mock AI provider) including one tool call and one text response, partial response is persisted, response stream closes cleanly

### Mobile — modules to test

**`AssistantStateMachine` — unit tests:**
- Drive triggers in sequence (open bar → compose → send → loading → first chunk → done → reset)
- Assert: state matches expected at each step, invalid transitions throw, machine is reproducible across runs

**`SseEventDecoder` — unit tests:**
- Given byte streams (including chunks split mid-event, multi-line `data:`), produce typed event objects
- Assert: parsing tolerates network chunking, malformed events surface as errors not silent drops

**Three critical `ScreenContextBuilder`s — unit tests:**
- `lessonScreenContextBuilder`, `exercisePlayScreenContextBuilder`, `homeScreenContextBuilder`
- Set up minimal Riverpod container overrides for the watched domain providers
- Assert: shape, displayName, barPlaceholder, and `data` fields match the spec for each route

**`AiApi.chatStream` — integration test (against a fake HTTP server):**
- POST a message, receive a scripted SSE response, assert the yielded event stream is correctly decoded and CancelToken aborts cleanly

### Prior art

- Backend unit tests follow the `*.spec.ts` pattern next to the source (e.g., `conversation.service.spec.ts` already in `modules/conversations/application/`)
- Backend integration tests follow `scripts/test/suites/` (custom bun scripts, not jest) — `auth` is the canonical example
- Backend e2e tests follow `test/*.e2e-spec.ts`
- Mobile has no existing widget or unit test pattern — this feature establishes the first one. Use `flutter_test` + `ProviderContainer` overrides for Riverpod-based tests

### Skipped in V1

- Widget tests for `AssistantQuestionSheet` 3-phase transitions — UI shells, less ROI per the testing scope chosen
- Widget tests for `AssistantBar`, `AssistantFullScreen`, `ProposalCard` — same reason
- `AssistantChatNotifier` integration tests — covered indirectly via the e2e test of the full POST endpoint plus the state machine unit tests
- Exhaustive `ScreenContextBuilder` tests for all 10+ screens — only the three critical ones are tested

## Out of Scope

- **AI grammar/pronunciation correction from text** — explicitly deferred per CONTEXT.md "Nghi vấn đã giải quyết". Will be grilled separately and likely become either a new AI Tool or a built-in prompt capability in a later PRD.
- **`User.aiResponseLanguage` field** — V1 uses `nativeLanguage` as the source of truth for the AI's response language. A separate configurable field is deferred.
- **Pin Conversations** — drawer list sorts by `updatedAt` only in V1.
- **Notify AI when learner declines a propose** — declined proposals are silent in V1; AI may re-propose.
- **Tool concurrency (parallel calls within a single turn)** — V1 executes tool calls sequentially even if the model emits multiple in one response.
- **Listening exercises with TTS audio** — already deferred at the project level; the AI cannot generate or play audio in V1.
- **Token quota or rate limit per learner** — explicitly out per CONTEXT.md "không giới hạn token cho học viên".
- **Tools that mutate learner progression or identity** — `mark_lesson_complete`, `update_profile.level`, etc. are excluded from V1 by design.
- **Tools that delete data** — `propose_delete_daily_goal`, `propose_delete_conversation`, etc. are V2.
- **Conversation list tool** (`list_conversations`) — privacy/loop concerns; defer.
- **Multi-provider AI support** — V1 stays on Google Gemini (model `gemini-2.0-flash`).
- **Conversation export, share, or print** — V1 does not expose any conversation outside the app.
- **Admin panel for managing AI prompts or tool registry** — backend-only configuration in V1.
- **Tablet/web-specific layouts** — V1 ships mobile (Flutter) only; landscape and large-screen layouts may share the same UI but are not separately designed.
- **Auth-token-expiry-mid-stream graceful handling** — long-running streams are short enough (< 2 min typical) that token refresh during stream is not addressed.

## Further Notes

### Existing inconsistencies fixed by this PRD

- **`AI_CHAT_STREAM` permission** is redundant once the single streaming endpoint replaces the two-step flow. Deprecate it in `RbacService` seeding.
- **`GenaiService.mapResponseToAiChatResponse` drops `functionCalls`** — the existing `runTurn` tool loop never actually sees function calls from the SDK because the response mapper omits the field. Fix in passing while shipping `runTurnStream`; covered by a regression test in `genai.service.spec.ts`.
- **`ConversationStatus` enum** — already noted as deprecated in CONTEXT.md but still in the entity. Remove the column and enum.

An earlier draft of this PRD claimed `AI_GENERATE_EXERCISE` was missing from the exercise generation endpoint; the reality-check confirmed it is already applied to `POST /exercise-sets/custom`, `:id/generate`, and `:id/regenerate`. No fix needed.

### Migration considerations

- **`Conversation.screenContext`** is a new column on an existing table. Default to `'{}'::jsonb` so existing rows (from any dev testing) remain valid.
- **`Conversation.title`** new column. Default empty string; mobile shows "Hội thoại mới" when empty.
- **`Conversation.status`** column drop is destructive but safe — the field was never used in practice.
- **`ConversationMessage.interrupted`** new column with default false.
- TypeORM `synchronize: true` in dev handles all of these automatically; for production, plan a manual migration file when production deploy is on the horizon.

### Dependencies that need verification

- `@google/genai` abort/cancellation support — verify the SDK actually stops generation when a stream is unsubscribed. If not, the partial-response behavior still works (we save what we have) but the provider continues consuming budget in the background; flag as an issue if observed.
- Dio SSE support — Dio can stream responses via `ResponseType.stream` and `CancelToken`; the SSE parsing layer in the mobile `SseEventDecoder` is custom and is part of this PRD's deliverables.
- `flutter_markdown` (or equivalent) for rendering the AI's markdown — pick at implementation time.

### Rollout

This is a single coherent feature with no feature flag. Ship behind no toggle but in a single PR per vertical slice (see the per-issue breakdown that will live alongside this PRD).
