Status: done

## Parent

`.scratch/ai-foundation/PRD.md`

## What to build

Create the `agent/` domain-logic module with `AgentService` that orchestrates the tool call loop and `BaseTool` registration. `AgentService.runTurn()` manages the full cycle: load conversation history → render system prompt from YAML template → inject lesson/vocabulary context if `lessonId` is set → build `AiChatRequest` with tools → call `IAiProvider.chat()` → detect function calls → execute matching `BaseTool` subclass → return results → repeat until no function calls or `maxIterations` reached → persist all messages via `ConversationService`.

`AgentModule` manually registers all `BaseTool` subclasses as providers (TypeScript-compile-safe, NestJS-DI-compatible). Tool parameters are validated with `schema.parse(params)` before `execute()`. `AgentService` injects `IAiProvider` (not `GenaiService` directly) per Dependency Inversion Principle.

Tool loop from PRD. Reference SDK sample `interactions_function_calling_client_state.ts` at `C:\Users\tomis\Docs\js-genai\sdk-samples` for the manual function call loop pattern (detect `function_call` step → execute → send `function_result` back):

```
runTurn(conversationId, userMessage):
  1. Load conversation history from ConversationService
  2. Render system prompt from YAML + inject lesson context if lessonId set
  3. Build AiChatRequest with history + tools
  4. Call IAiProvider.chat(req)
  5. If response.functionCalls → execute tools → build functionResults
  6. Call IAiProvider.chat(with functionResults appended)
  7. Repeat until no functionCalls or maxIterations reached
  8. Persist assistant message + tool calls/results via ConversationService
  9. Return final response
```

No concrete tools are built in this slice — the tool loop is verified with a test `BaseTool` subclass.

## Acceptance criteria

- [x] `agent/` module created with DDD-like structure: service, module file
- [x] `AgentService` injects `IAiProvider` (via `@Inject('IAiProvider')` token) and `ConversationService`
- [x] `AgentModule.providers` lists `BaseTool` subclasses explicitly (manual registration, compile-safe)
- [x] `AgentService` injects all `BaseTool` instances, builds tool map by name
- [x] `runTurn(conversationId, userMessage)` implements the full tool loop from PRD
- [x] Lesson/vocabulary context injected into system prompt when `Conversation.lessonId` is set
- [x] Tool parameters validated via `schema.parse(params)` before `execute()`; invalid params throw appropriate error
- [x] `maxIterations` guard prevents infinite loops (separate constant `AI_TOOL_MAX_ITERATIONS = 10`, NOT `genai.maxRetries` which is for 429 retry)
- [x] All messages (user, assistant, tool calls, tool results) persisted via `ConversationService`
- [x] Token usage accumulated in Conversation after each AI call
- [x] Unit tests pass with mocked `IAiProvider`: tool loop with functionCalls then final text, max iterations guard, tool dispatch by name, prompt context injection for lessonId, parameter validation
- [x] Module registered in `AppModule`

## Blocked by

- `.scratch/ai-foundation/issues/01-shared-package-foundation.md` (needs BaseTool, IAiProvider, abstract types)
- `.scratch/ai-foundation/issues/03-genaiservice-iaiprovider-impl.md` (needs IAiProvider.chat() implemented to call in tool loop)
- `.scratch/ai-foundation/issues/04-conversation-persistence.md` (needs ConversationService for history and persistence)
