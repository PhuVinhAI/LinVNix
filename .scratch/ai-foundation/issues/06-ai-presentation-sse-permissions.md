Status: ready-for-agent

## Parent

`.scratch/ai-foundation/PRD.md`

## What to build

Create the thin `ai/` presentation module containing `AiController`, DTOs, and AI permissions. This module imports `genai/`, `agent/`, and `conversations/` modules and exposes the AI endpoints to the outside world.

Endpoints from PRD:

```
POST   /api/v1/ai/chat              → Create message, start AI turn, return conversationId + initial response
GET    /api/v1/ai/chat/:id/stream   → SSE streaming for active conversation (id = conversationId)
POST   /api/v1/ai/chat/simple       → Non-streaming chat (AiChatResponse)
GET    /api/v1/ai/conversations     → List user's conversations (paginated)
GET    /api/v1/ai/conversations/:id → Get conversation detail + messages
DELETE /api/v1/ai/conversations/:id → Soft-delete conversation
```

Chat flow: client sends `POST /api/v1/ai/chat` with `{ message, conversationId?, lessonId? }`. If new conversation, one is created. If `stream: true` (default), returns `{ conversationId }` then client connects to `GET /api/v1/ai/chat/:conversationId/stream` for SSE events. If `stream: false`, returns full `AiChatResponse` directly. This two-step approach is necessary because `@Sse()` requires GET route and SSE spec doesn't support POST body.

AI permissions added to `Permission` enum: `AI_CHAT`, `AI_CHAT_STREAM`, `AI_GENERATE_EXERCISE`, `AI_CORRECT_GRAMMAR`, `AI_VIEW_CONVERSATIONS`. Each endpoint uses `@RequirePermissions()` accordingly.

All endpoints protected by `JwtAuthGuard` (default global guard). `@CurrentUser()` decorator used to get the authenticated user.

## Acceptance criteria

- [ ] `ai/` module created with controller, DTOs, module file; imports `GenaiModule`, `AgentModule`, `ConversationsModule`
- [ ] `POST /api/v1/ai/chat` — creates message + starts AI turn, returns `{ conversationId }` for stream or full `AiChatResponse` for non-stream; protected by `@RequirePermissions(Permission.AI_CHAT_STREAM)` when streaming, `@RequirePermissions(Permission.AI_CHAT)` when non-stream
- [ ] `GET /api/v1/ai/chat/:id/stream` — SSE endpoint using `@Sse()`, streams `AiChatChunk` events for conversation `:id`, protected by `@RequirePermissions(Permission.AI_CHAT_STREAM)`
- [ ] `POST /api/v1/ai/chat/simple` — returns `AiChatResponse` (wrapped in `{ data }` by `TransformInterceptor`), protected by `@RequirePermissions(Permission.AI_CHAT)`
- [ ] `GET /api/v1/ai/conversations` — paginated list of current user's conversations, protected by `@RequirePermissions(Permission.AI_VIEW_CONVERSATIONS)`
- [ ] `GET /api/v1/ai/conversations/:id` — conversation detail with messages, ownership check (only own conversations), protected by `@RequirePermissions(Permission.AI_VIEW_CONVERSATIONS)`
- [ ] `DELETE /api/v1/ai/conversations/:id` — soft-delete, ownership check, protected by `@RequirePermissions(Permission.AI_CHAT)`
- [ ] `Permission` enum updated with 5 new AI permissions: `AI_CHAT`, `AI_CHAT_STREAM`, `AI_GENERATE_EXERCISE`, `AI_CORRECT_GRAMMAR`, `AI_VIEW_CONVERSATIONS`
- [ ] DTOs for request/response validation (chat request DTO with `message` and optional `conversationId`, `lessonId`)
- [ ] SSE response format: `data: ${JSON.stringify(chunk)}\n\n` per chunk, proper `Content-Type: text/event-stream`
- [ ] All endpoints use `@CurrentUser()` for user identification
- [ ] Module registered in `AppModule`
- [ ] Unit tests pass with mocked services: endpoint routing, SSE response format, permission guards, DTO validation, ownership checks

## Blocked by

- `.scratch/ai-foundation/issues/03-genaiservice-iaiprovider-impl.md` (needs GenaiService as IAiProvider)
- `.scratch/ai-foundation/issues/04-conversation-persistence.md` (needs ConversationService for CRUD)
- `.scratch/ai-foundation/issues/05-agentservice-tool-loop.md` (needs AgentService for runTurn)
