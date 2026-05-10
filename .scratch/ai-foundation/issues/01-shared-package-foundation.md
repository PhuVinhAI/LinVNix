Status: ready-for-agent

## Parent

`.scratch/ai-foundation/PRD.md`

## What to build

Create the `packages/shared` package (`@linvnix/shared`) registered in the bun workspace root `package.json`. This package holds every cross-cutting AI abstraction so that `genai/`, `agent/`, and `conversations/` can import shared types without circular dependency.

End-to-end: after this slice, any backend module can `import { IAiProvider, AiException, BaseTool } from '@linvnix/shared'` and the import resolves through the bun workspace. The abstract types (`AiChatRequest`, `AiChatResponse`, `AiChatChunk`, `AiEmbedding`, `AiFileRef`, `AiImageRef`) fully describe an AI interaction without referencing any SDK. The `AiException` hierarchy maps each subclass to an HTTP status code. `BaseTool<TParams, TResult>` auto-generates a `FunctionDeclaration` from a Zod schema via `zodToJsonSchema()`. Prompt template types are defined for later YAML rendering.

Key design decisions from PRD. Reference SDK samples at `C:\Users\tomis\Docs\js-genai\sdk-samples` — specifically `interactions_tool_call_with_functions.ts` for function call shapes, `generate_content_with_function_calling_accept_json_schema.ts` for Zod→JSON Schema pattern, `generate_content_with_safety_settings.ts` for safety category/threshold types.

```typescript
interface IAiProvider {
  chat(req: AiChatRequest): Promise<AiChatResponse>
  chatStream(req: AiChatRequest): AsyncIterable<AiChatChunk>
  embed(texts: string[]): Promise<AiEmbedding[]>
  uploadFile(file: AiFileUpload): Promise<AiFileRef>
  generateImage(prompt: AiImageRequest): Promise<AiImageRef>
}
```

```typescript
abstract class BaseTool<TParams, TResult> {
  abstract name: string
  abstract description: string
  abstract parameters: ZodSchema<TParams>
  abstract execute(params: TParams): Promise<TResult>
  toDeclaration(): ToolDeclaration  // SDK-agnostic type, auto from zodToJsonSchema(parameters)
}

// ToolDeclaration is our own abstract type (NOT @google/genai FunctionDeclaration)
// GenaiService maps ToolDeclaration → SDK FunctionDeclaration when building requests
interface ToolDeclaration {
  name: string
  description: string
  parameters: Record<string, any>  // JSON Schema object from zodToJsonSchema()
}
```

```
AiException (base, extends Error)
  ├── AiRateLimitException        → 429
  ├── AiQuotaExceededException    → 429
  ├── AiTimeoutException          → 504
  ├── AiSafetyBlockedException    → 422
  ├── AiInvalidRequestException   → 400
  └── AiServiceUnavailableException → 503
```

## Acceptance criteria

- [ ] `packages/shared/package.json` exists with name `@linvnix/shared`, proper `exports`/`types` fields, and is listed in root `package.json` workspaces
- [ ] `packages/shared/tsconfig.json` extends or is compatible with backend tsconfig (single quotes, trailing commas `"all"`, `removeComments: true`)
- [ ] `IAiProvider` interface exported with `chat`, `chatStream`, `embed`, `uploadFile`, `generateImage` methods
- [ ] Abstract AI types exported: `AiChatRequest` (with `messages`, `systemInstruction?`, `tools?`, `model?`, and `functionResults?: AiFunctionResult[]` for tool loop round-trips), `AiChatResponse` (with `text`, `functionCalls?: AiFunctionCall[]`, `usageMetadata`), `AiChatChunk` (streaming text delta), `AiEmbedding`, `AiFileRef`, `AiImageRef` (and `AiFileUpload`, `AiImageRequest` input types)
- [ ] `AiFunctionCall` type: `{ name: string, arguments: Record<string, any> }`
- [ ] `AiFunctionResult` type: `{ name: string, result: any }`
- [ ] `AiException` hierarchy: base class + 6 subclasses, each with correct HTTP status code property
- [ ] `BaseTool<TParams, TResult>` abstract class with `toDeclaration()` returning `ToolDeclaration` (SDK-agnostic), auto-converted from `this.parameters` via `zodToJsonSchema()`
- [ ] `ToolDeclaration` interface exported: `{ name, description, parameters }` (plain JSON Schema, no SDK types)
- [ ] Prompt template types exported (for YAML rendering in agent module)
- [ ] Barrel export (`index.ts`) re-exports all public types
- [ ] Unit tests pass: exception status codes, BaseTool Zod→JSON Schema conversion, type contracts
- [ ] `bun install` from root succeeds (workspace resolves `@linvnix/shared`)
- [ ] Backend can import from `@linvnix/shared` without path alias

## Blocked by

None — can start immediately
