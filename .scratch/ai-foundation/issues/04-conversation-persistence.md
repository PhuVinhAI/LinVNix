Status: ready-for-agent

## Parent

`.scratch/ai-foundation/PRD.md`

## What to build

Create the `conversations/` domain-data module following the existing DDD structure. `Conversation` and `ConversationMessage` entities persist AI chat history in the database independently of any AI provider. `ConversationService` provides CRUD for conversations and messages, token accumulation, and soft-delete.

Entity schemas from PRD:

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

End-to-end: after this slice, `ConversationService` can create a conversation (with optional course/lesson context), append messages (user/assistant/tool), accumulate token usage, list conversations filtered by user with pagination, retrieve a conversation with all its messages, and soft-delete. The `ConversationStatus` enum has `active` and `archived` values.

## Acceptance criteria

- [ ] `conversations/` module follows DDD structure: `domain/` (entities), `application/` (service, repository), `dto/`, module file
- [ ] `Conversation` entity extends `BaseEntity`, has all fields from schema above, FK to User (required), Course (nullable), Lesson (nullable)
- [ ] `ConversationMessage` entity extends `BaseEntity`, has all fields from schema above, FK to Conversation
- [ ] `ConversationStatus` enum: `active`, `archived` (added to `common/enums/`)
- [ ] `ConversationMessageRole` enum: `user`, `assistant`, `tool` (added to `common/enums/`)
- [ ] `ConversationService` methods: `create(userId, dto)`, `findById(id)`, `findByUser(userId, pagination)`, `addMessage(conversationId, message)`, `accumulateTokens(conversationId, promptTokens, completionTokens)`, `archive(id)`, `softDelete(id)`
- [ ] Token accumulation: `totalTokens += promptTokens + completionTokens`, `totalPromptTokens += promptTokens`, `totalCompletionTokens += completionTokens`
- [ ] Soft-delete sets `deletedAt` and changes status to `archived`
- [ ] Module registered in `AppModule`
- [ ] TypeORM auto-creates tables (synchronize: true in dev)
- [ ] Unit tests pass: CRUD operations, token accumulation, soft-delete, pagination, filtering by courseId/lessonId (use in-memory SQLite or mocked repository)

## Blocked by

- `.scratch/ai-foundation/issues/01-shared-package-foundation.md` (needs @linvnix/shared for shared types)
