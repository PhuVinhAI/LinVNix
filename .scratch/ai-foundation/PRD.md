# PRD: AI Foundation — Nền móng trí tuệ nhân tạo cho Backend

Status: ready-for-agent

## Problem Statement

Backend LinVNix hiện tại là một REST API hoàn chỉnh cho language learning CRUD + auth + FSRS, nhưng hoàn toàn chưa có bất kỳ layer AI nào. Đề tài tốt nghiệp yêu cầu tích hợp trí tuệ nhân tạo đa phương thức (xử lý văn bản, hình ảnh, âm thanh) ở tuần 6-8, nhưng không có móng kiến trúc nào sẵn sàng. Nếu AI features được implement ad-hoc mà không có abstract layer, key management, error handling, và conversation persistence, mỗi feature sẽ phải tự giải quyết lại các bài toán chung — dẫn đến trùng lặp, khó test, khó thay đổi SDK, và dễ hit rate limit mà không có fallback.

## Solution

Xây nền móng AI hoàn chỉnh: 4 module NestJS mới + 1 shared package, bao phủ toàn bộ cross-cutting concern (SDK client, key rotation, abstract types, agent loop, conversation persistence, streaming, error hierarchy, permissions, config). Khi AI features cụ thể (sửa ngữ pháp, tạo bài tập, luyện phát âm) được implement ở tuần 6-8, developer chỉ cần tạo `BaseTool` subclass, viết YAML prompt, và gọi `IAiProvider.chat()` — mọi plumbing đã sẵn.

## User Stories

1. As a developer, I want a `GenaiService` that wraps the Google GenAI SDK behind `IAiProvider` interface, so that I can swap SDK or add Vertex AI later without changing consumers
2. As a developer, I want a `KeyPool` that manages multiple API keys with priority-based selection and auto-fallback on 429, so that users don't experience errors when one key hits rate limit
3. As a developer, I want pooled `GoogleGenAI` instances (one per key), so that there is zero init cost per request
4. As a developer, I want abstract AI types (`AiChatRequest`, `AiChatResponse`, `AiChatChunk`, `AiEmbedding`, `AiFileRef`, `AiImageRef`) in `packages/shared`, so that consumers never import `@google/genai` directly
5. As a developer, I want `GenaiService` to implement `IAiProvider` with methods like `chat()`, `chatStream()`, `embed()`, `uploadFile()`, `generateImage()`, so that the interface is clean and SDK-agnostic
6. As a developer, I want retry + fallback model on AI call failure (429, timeout, 500), so that the app degrades gracefully instead of crashing
7. As a developer, I want a `genai` config namespace (`registerAs('genai')`) with API keys, models per use case, safety settings, timeout, and max retries, so that all AI behavior is configurable without code changes
8. As a developer, I want YAML prompt templates with `{{variable}}` placeholders stored in `genai/prompts/`, so that prompts are version-controlled and easy to modify
9. As a developer, I want a custom `AiException` hierarchy (`AiRateLimitException`, `AiTimeoutException`, `AiSafetyBlockedException`, `AiQuotaExceededException`, `AiInvalidRequestException`, `AiServiceUnavailableException`) in `packages/shared`, so that consumers can catch specific errors and respond appropriately
10. As a developer, I want `AgentService` that manages the tool call loop (call model → detect function calls → execute tools → return results → repeat), so that multi-step AI interactions are orchestrated in one place
11. As a developer, I want `BaseTool<TParams, TResult>` abstract class with Zod schema for parameters, auto-generating `ToolDeclaration` (SDK-agnostic) via `zodToJsonSchema()`, so that adding a new tool is just extending a class
12. As a developer, I want `AgentModule` to manually register all `BaseTool` subclasses as providers, so that tools are TypeScript-compile-safe and NestJS-DI-compatible
13. As a developer, I want `AgentService` to inject `IAiProvider` (not `GenaiService` directly), so that agent logic is decoupled from SDK implementation via Dependency Inversion Principle
14. As a developer, I want `Conversation` and `ConversationMessage` entities in a `conversations/` module, so that AI chat history is persisted in the database independently of any AI provider
15. As a developer, I want `Conversation` to have optional FK to `Course` and `Lesson`, so that AI chats can be contextualized within a specific learning context or used for free-form chat
16. As a developer, I want `ConversationMessage` to store role (user/assistant/tool), content, toolCalls, toolResults, and tokenCount, so that the full interaction is reconstructible
17. As a developer, I want token usage to be accumulated in `Conversation.totalTokens` and `KeyPool.keyStats`, so that I can track cost per conversation and per API key without a separate accounting table
18. As a developer, I want SSE streaming via NestJS `@Sse()` decorator for AI chat endpoints, so that users see responses token-by-token without WebSocket overhead
19. As a developer, I want `AiController` in a thin `ai/` presentation module, so that AI endpoints are namespaced under `/api/v1/ai/...` and separated from infrastructure, logic, and data concerns
20. As a developer, I want fine-grained AI permissions (`AI_CHAT`, `AI_CHAT_STREAM`, `AI_GENERATE_EXERCISE`, `AI_CORRECT_GRAMMAR`, `AI_VIEW_CONVERSATIONS`) in the `Permission` enum, so that RBAC can control each AI capability independently
21. As a developer, I want `GenaiService` to use the Interactions API as primary, falling back to `generateContent`/`models.embedContent`/`models.generateImages` for capabilities not covered by Interactions, so that the most feature-rich API path is used by default
22. As a developer, I want config-driven model selection per use case (`genai.models.chat`, `genai.models.embed`, `genai.models.image`, `genai.models.tts`) with optional override per request, so that I don't need to hardcode model names
23. As a developer, I want config-driven safety settings per use case and environment, so that dev can be lenient while prod is strict
24. As a developer, I want `KeyPool` to track per-key stats (totalCalls, totalTokens, totalErrors, cooldownUntil), so that I can identify which keys are approaching quota limits
25. As a developer, I want `KeyPool` to mark keys with cooldown on 429 (with exponential backoff), so that rate-limited keys are automatically skipped until they recover
26. As a developer, I want `GenaiService.executeWithRetry(fn)` that wraps every SDK call with key rotation → retry → fallback model, so that all resilience logic is centralized
27. As a developer, I want `ConversationService` to provide CRUD for conversations and messages, so that AI controller and agent service can persist and retrieve chat history
28. As a developer, I want `AgentService.runTurn()` to inject lesson/vocabulary context into system prompt when `Conversation.lessonId` is set, so that AI responses are relevant to the user's current study material
29. As a developer, I want a `packages/shared` package registered in the bun workspace, so that both `genai/` and `agent/` can import shared types without circular dependency
30. As a student, I want to have AI-powered conversations that persist across sessions, so that I can review my learning history later
31. As a student, I want AI responses to stream in real-time, so that I don't wait staring at a blank screen
32. As an admin, I want to see which API keys are consuming the most tokens, so that I can manage costs
33. As an admin, I want to control which users can access which AI features, so that I can offer tiered access
34. As an admin, I want to view conversation history, so that I can monitor AI interactions for quality and safety

## Implementation Decisions

### Architecture: 4 new modules + 1 shared package

- **`genai/`** (infrastructure) — SDK wrapper, KeyPool, config, prompts. Global module like existing `CacheModule`/`StorageModule`.
- **`agent/`** (domain-logic) — Tool loop orchestration, prompt rendering. Domain module like `ExercisesModule`.
- **`conversations/`** (domain-data) — `Conversation` + `ConversationMessage` entities, CRUD service. Domain module following DDD structure.
- **`ai/`** (presentation) — Thin module containing only `AiController`, DTOs. Imports the other 3 modules.
- **`packages/shared`** — Cross-cutting types and abstractions. Published as `@linvnix/shared` in bun workspace.

### Dependency graph

```
ai/ → agent/ → IAiProvider ← genai/ (implements IAiProvider)
ai/ → conversations/
agent/ → conversations/ (persist messages)
genai/ → packages/shared (implement IAiProvider, throw AiExceptions)
agent/ → packages/shared (BaseTool, types)
conversations/ → packages/shared (types, exceptions)
```

### IAiProvider interface shape

```typescript
interface IAiProvider {
  chat(req: AiChatRequest): Promise<AiChatResponse>
  chatStream(req: AiChatRequest): AsyncIterable<AiChatChunk>
  embed(texts: string[]): Promise<AiEmbedding[]>
  uploadFile(file: AiFileUpload): Promise<AiFileRef>
  generateImage(prompt: AiImageRequest): Promise<AiImageRef>
}

// AiChatRequest includes functionResults for tool loop round-trips
interface AiChatRequest {
  messages: AiMessage[]
  systemInstruction?: string
  tools?: ToolDeclaration[]
  functionResults?: AiFunctionResult[]
  model?: string
}

// AiChatResponse includes functionCalls when model requests tool execution
interface AiChatResponse {
  text: string
  functionCalls?: AiFunctionCall[]
  usageMetadata: { promptTokens: number, completionTokens: number, totalTokens: number }
}

interface AiFunctionCall { name: string, arguments: Record<string, any> }
interface AiFunctionResult { name: string, result: any }
```

### KeyPool design

- Pool of pre-initialized `GoogleGenAI` instances, one per API key
- Priority selection: prefer key with lowest `totalTokens` usage
- On 429: mark key with `cooldownUntil` (exponential backoff: 30s, 60s, 120s), try next key
- On all keys exhausted + fallback model configured: retry with `chatFallback` model
- On still failing after `maxRetries`: throw `AiServiceUnavailableException`
- Per-key stats: `{ totalCalls, totalTokens, totalErrors, cooldownUntil }`

### BaseTool design

```typescript
abstract class BaseTool<TParams, TResult> {
  abstract name: string
  abstract description: string
  abstract parameters: ZodSchema<TParams>
  abstract execute(params: TParams): Promise<TResult>
  toDeclaration(): ToolDeclaration  // SDK-agnostic, auto from zodToJsonSchema(parameters)
}

// ToolDeclaration is our own abstract type (NOT @google/genai FunctionDeclaration)
// GenaiService maps ToolDeclaration → SDK FunctionDeclaration when building requests
interface ToolDeclaration {
  name: string
  description: string
  parameters: Record<string, any>  // JSON Schema object from zodToJsonSchema()
}
```

- Tools registered manually as providers in `AgentModule.providers`
- `AgentService` injects all `BaseTool` instances, builds tool map by name
- Tool params validated with `schema.parse(params)` before `execute()`

### AgentService tool loop

```
runTurn(conversationId, userMessage):
  1. Load conversation history from ConversationService
  2. Render system prompt from YAML + inject lesson context if lessonId set
  3. Build AiChatRequest with history + tools
  4. Call IAiProvider.chat(req)
  5. If response.functionCalls → execute tools → build functionResults
  6. Call IAiProvider.chat(with functionResults appended)
  7. Repeat until no functionCalls or AI_TOOL_MAX_ITERATIONS (10) reached
  8. Persist assistant message + tool calls/results via ConversationService
  9. Return final response
```

Note: `AI_TOOL_MAX_ITERATIONS` is a separate constant (default 10) for the agent tool loop — distinct from `genai.maxRetries` which controls 429 retry attempts.

### Conversation entity schema

```
Conversation {
  id: uuid (BaseEntity)
  createdAt, updatedAt, deletedAt (BaseEntity)
  userId: FK → User (required)
  courseId: FK → Course? (nullable)
  lessonId: FK → Lesson? (nullable)
  model: string
  systemInstruction: text
  totalTokens: number (default 0)
  totalPromptTokens: number (default 0)
  totalCompletionTokens: number (default 0)
  status: enum (active, archived)
  messages: ConversationMessage[]
}

ConversationMessage {
  id: uuid (BaseEntity)
  createdAt, updatedAt, deletedAt (BaseEntity)
  conversationId: FK → Conversation
  role: enum (user, assistant, tool)
  content: text
  toolCalls: jsonb? (array of {name, arguments})
  toolResults: jsonb? (array of {name, result})
  tokenCount: number (default 0)
}
```

### Config namespace: `genai`

```
genai:
  apiKey: string              (single key fallback)
  apiKeys: string[]           (pool, comma-separated in env)
  vertexai: false             (MLDev mode)
  models:
    chat: 'gemini-2.5-flash'
    chatFallback: 'gemini-2.0-flash'
    embed: 'text-embedding-004'
    image: 'imagen-4.0-generate-001'
    tts: 'gemini-2.5-flash-preview-tts'
  maxRetries: 2
  timeout: 30000
  safety:
    chat: [{ category, threshold }]
    image: [{ category, threshold }]
    default: [{ category, threshold }]
```

Environment variables added to `.env.example`:
- `GEMINI_API_KEY` — single key (fallback)
- `GENAI_API_KEYS` — comma-separated pool of keys
- `GENAI_CHAT_MODEL` — override default chat model
- `GENAI_CHAT_FALLBACK_MODEL` — fallback model on 429
- `GENAI_EMBED_MODEL` — override default embed model
- `GENAI_IMAGE_MODEL` — override default image model
- `GENAI_TTS_MODEL` — override default TTS model
- `GENAI_MAX_RETRIES` — max retry attempts
- `GENAI_TIMEOUT` — request timeout in ms

### API endpoints

```
POST   /api/v1/ai/chat              → Create message + start AI turn, return { conversationId } for stream or full AiChatResponse for non-stream
GET    /api/v1/ai/chat/:id/stream   → SSE streaming for active conversation (id = conversationId)
POST   /api/v1/ai/chat/simple       → Non-streaming chat (AiChatResponse)
GET    /api/v1/ai/conversations     → List user's conversations (paginated)
GET    /api/v1/ai/conversations/:id → Get conversation detail + messages
DELETE /api/v1/ai/conversations/:id → Soft-delete conversation
```

Chat flow: client sends `POST /api/v1/ai/chat` with `{ message, conversationId?, lessonId?, stream? }`. If new conversation, one is created. If `stream: true` (default), returns `{ conversationId }` then client connects to `GET /api/v1/ai/chat/:conversationId/stream` for SSE events. If `stream: false`, returns full `AiChatResponse` directly. Two-step approach because `@Sse()` requires GET route and SSE spec doesn't support POST body.

### AI Permissions (added to Permission enum)

```
AI_CHAT
AI_CHAT_STREAM
AI_GENERATE_EXERCISE
AI_CORRECT_GRAMMAR
AI_VIEW_CONVERSATIONS
```

### AiException hierarchy

```
AiException (base, extends Error)
  ├── AiRateLimitException        → 429
  ├── AiQuotaExceededException    → 429
  ├── AiTimeoutException          → 504
  ├── AiSafetyBlockedException    → 422
  ├── AiInvalidRequestException   → 400
  └── AiServiceUnavailableException → 503
```

### Prompt template format

YAML files in `genai/prompts/`:
```yaml
system: |
  You are a Vietnamese language tutor...
  Target language: {{targetLanguage}}
  Student level: {{level}}
  {{#lessonContext}}
  Current lesson context: {{lessonContext}}
  {{/lessonContext}}
parameters:
  - name: targetLanguage
    default: Vietnamese
  - name: level
    default: beginner
  - name: lessonContext
    required: false
```

### SSE streaming pattern

- Two-step flow: `POST /api/v1/ai/chat` initiates turn → `GET /api/v1/ai/chat/:id/stream` streams response
- `GET /api/v1/ai/chat/:id/stream` uses NestJS `@Sse()` decorator (GET route, standard SSE)
- `GenaiService.chatStream()` returns `AsyncIterable<AiChatChunk>` (wrapping SDK Interactions streaming)
- Controller converts to `Observable` via `fromAsyncIterable()` → `@Sse()` returns `Observable<MessageEvent>`
- Each chunk: `data: ${JSON.stringify(chunk)}\n\n`
- Active stream tracking: `AgentService` maintains a map of active conversation streams

### Token tracking

- After every AI call, `usageMetadata` from response is parsed
- `Conversation.totalTokens += promptTokens + completionTokens`
- `KeyPool.keyStats[key].totalTokens += totalTokens`
- `ConversationMessage.tokenCount = promptTokens | completionTokens` per message

## Testing Decisions

### What makes a good test

- Test external behavior (inputs → outputs), not implementation details (how KeyPool selects keys internally)
- Mock `IAiProvider` at the interface boundary — never mock internal methods of the module under test
- For `GenaiService`: mock `GoogleGenAI` SDK to test retry/fallback/key rotation without real API calls
- For `AgentService`: mock `IAiProvider` to test tool loop orchestration in isolation
- For `ConversationService`: use in-memory SQLite (TypeORM testing pattern) to test entity persistence
- For `AiController`: use NestJS `@nestjs/testing` with mocked services to test endpoint behavior
- For `packages/shared`: test type invariants and utility functions (zodToJsonSchema conversion in BaseTool, prompt template rendering)

### Modules to test

1. **`packages/shared`** — `BaseTool.toDeclaration()` Zod→JSON Schema conversion, `IAiProvider` type contracts, `AiException` hierarchy status codes, prompt template rendering with placeholders
2. **`genai/`** — `KeyPool` key selection, cooldown, rotation on 429, stats tracking; `GenaiService` retry/fallback logic, abstract type mapping (SDK types → app types), config loading
3. **`agent/`** — `AgentService.runTurn()` tool loop (mock IAiProvider returning functionCalls then final text), max iterations guard, tool execution dispatch, prompt context injection for lessonId
4. **`conversations/`** — `ConversationService` CRUD, message persistence, token accumulation, soft-delete, filtering by courseId/lessonId
5. **`ai/`** — `AiController` endpoint routing, SSE response format, permission guards, DTO validation

### Prior art

- `backend/src/modules/exercises/domain/exercise-options.spec.ts` — unit test pattern for domain types
- `backend/src/modules/exercises/application/answer-normalizer.spec.ts` — unit test for application logic
- `backend/src/modules/vocabularies/application/repositories/user-exercise-results.repository.spec.ts` — repository test pattern
- Tests use Jest with `*.spec.ts` convention

## Out of Scope

- **Specific AI feature implementation** (grammar correction tool, exercise generation tool, pronunciation feedback tool) — these are Week 6-8 features, built on top of this foundation
- **Live API / WebSocket** — real-time bidirectional streaming for live pronunciation practice; deferred until Week 8
- **Context caching** (`caches.create/get/list`) — optimization for reducing token costs; deferred until baseline is stable
- **Image generation (Imagen)** — full implementation deferred; only scaffold (`generateImage` method on IAiProvider)
- **TTS generation** — full implementation deferred; only scaffold in IAiProvider
- **Embedding generation** — full implementation deferred; only scaffold in IAiProvider
- **File upload for multimodal input** — full implementation deferred; only scaffold in IAiProvider
- **Admin panel UI for AI** — viewing conversations, managing prompts, monitoring key stats via admin Electron app
- **Mobile app integration** — Flutter client consuming AI endpoints
- **Vertex AI support** — dual-backend toggle; architecture supports it via IAiProvider but no implementation
- **MCP (Model Context Protocol) integration** — future capability for connecting external tool servers
- **UsageRecord entity** — per-call granular accounting; deferred, aggregate tracking is sufficient for MVP
- **Human-in-the-loop approval gate** — requiring user confirmation before tool execution; future enhancement
- **Parallel tool call execution** — when model requests multiple function calls simultaneously; future enhancement
- **Batch embedding** — batch processing of embeddings via SDK batch API; deferred

## SDK Reference

The official `@google/genai` SDK samples are at `C:\Users\tomis\Docs\js-genai\sdk-samples`. Agent MUST consult these samples for correct SDK usage patterns. Key samples by capability:

| Capability | Sample file | Relevance |
|---|---|---|
| Interactions API (stateless) | `interactions_stateless.ts` | Primary chat pattern — `steps[]` history, `store: false` |
| Interactions streaming | `interactions_streaming.ts` | SSE chunk format — `step.delta` events |
| Interactions with functions | `interactions_tool_call_with_functions.ts` | Declarative tool definitions |
| Interactions FC client state | `interactions_function_calling_client_state.ts` | Manual function call loop pattern |
| Interactions structured output | `interactions_structured_output_json.ts` | JSON response mode |
| Interactions multimodal input | `interactions_multimodal_input_text_and_image.ts` | Image input format |
| Interactions multimodal output (TTS) | `interactions_multimodal_response_audio.ts` | Audio output config |
| Embeddings | `embed_content.ts` | `models.embedContent()` pattern |
| Image generation | `generate_image.ts` | Imagen `models.generateImages()` |
| File upload | `generate_content_with_file_upload.ts` | Upload + poll + createPartFromUri |
| Function calling (classic) | `generate_content_with_function_calling.ts` | `FunctionDeclaration` + `FunctionCallingConfigMode` |
| AFC (auto function calling) | `generate_content_afc_streaming.ts` | `CallableTool` interface |
| MCP client | `mcp_client.ts` | `mcpToTool()` conversion |
| Zod → JSON Schema | `generate_content_with_function_calling_accept_json_schema.ts` | `parametersJsonSchema` usage |
| Safety settings | `generate_content_with_safety_settings.ts` | `HarmCategory` + `HarmBlockThreshold` |
| Config/model selection | `generate_content_with_model_configuration.ts` | `candidateCount`, `temperature`, etc. |
| Token counting | `count_tokens.ts` | `models.countTokens()` |
| Caches | `caches.ts` | Context caching (deferred but reference ready) |

SDK dual-backend toggle: `GOOGLE_GENAI_USE_VERTEXAI` env var. We use MLDev only (`vertexai: false`).

Client init pattern (MLDev):
```typescript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY });
```

## Further Notes

- This PRD establishes the architectural foundation only. No user-visible AI features are delivered — all 5 `IAiProvider` methods are scaffolded (with real SDK wiring for `chat` and `chatStream`), but tools, prompts, and frontend integration are separate PRDs for Weeks 6-8.
- The `packages/shared` package does not exist yet — it must be created as the first implementation step, with `@linvnix/shared` name, proper `package.json`, tsconfig, and barrel export.
- The primary SDK API is `interactions` (MLDev-only, stateless mode — backend sends `steps[]` history from DB). Fallback to `generateContent`/`models.*` for capabilities Interactions doesn't cover (embed, image gen, file upload).
- `GenaiService` should be a `@Global()` module like `CacheModule`/`StorageModule`, so that any module can inject `IAiProvider` without explicit import.
- FSRS (existing spaced repetition algorithm) is not AI/GenAI — it remains in `progress/` module untouched.
- The conversation `status` enum initially has only `active` and `archived`. The `archived` status is set when a conversation is soft-deleted or explicitly archived by the user.
