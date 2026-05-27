# Implement `OpenaiProvider` non-streaming: `chat()` + `chatStructured()` + error mapping

Type: AFK
Status: done
Covers user stories: 13, 14, 19

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Thêm provider OpenAI-compatible thứ hai implements `IAiProvider`. Slice này chỉ phần non-streaming (`chat()` + `chatStructured()`); streaming + tool delta accumulation để slice #5. Sau slice này có code OpenaiProvider testable isolated, **chưa wire vào feature nào** — dead code có chủ đích, slice #3 mới wire.

Behavior:

- `chat()` non-streaming: convert messages từ `IAiProvider` format → OpenAI SDK `chat.completions.create()`, normalize response về `{ text, usage, functionCalls }`.
- `chat()` với tools: convert `tools: [{name, description, parameters}]` → `tools: [{type:'function', function:{name, description, parameters}}]` của OpenAI. Normalize response `choices[0].message.tool_calls` → `functionCalls: AiFunctionCall[]` (parse JSON arguments).
- `chatStructured(messages, schema)`: dùng `response_format: { type: 'json_schema', json_schema: { name: 'response', schema, strict: false } }`. Strict tắt mặc định (PRD lý do tương thích schema Gemini).
- `embed()`, `uploadFile()`, `generateImage()`: throw `MethodNotSupportedException` rõ ràng.
- `chatStream()`: tạm thời throw `MethodNotSupportedException` (slice #5 sẽ implement).
- Error mapping: 429 → `AiRateLimitException`, `APITimeoutError` → `AiTimeoutException`, 4xx → `AiInvalidRequestException`, 5xx → `AiServiceUnavailableException`.
- KeyPool reuse: constructor nhận `apiKeys: string[]`, build internal `KeyPool` với callbacks từ `openai-errors.ts`. Rotate khi rate-limited.

## Acceptance criteria

- [x] `openai` npm package cài vào `backend/package.json` (latest stable — `^6.39.0`).
- [x] `backend/src/infrastructure/openai/openai.provider.ts` class `OpenaiProvider implements IAiProvider`.
- [x] `backend/src/infrastructure/openai/openai-errors.ts` export `mapOpenaiError(err): AiException`, `isOpenaiRateLimitError(err): boolean`, `getOpenaiCooldownMs(err): number`. Map từ `openai.APIError`, `openai.RateLimitError`, `openai.APIConnectionTimeoutError`, etc.
- [x] Constructor signature: `(config: { baseUrl: string, apiKeys: string[], model: string, fallbackModel?: string, timeout?: number, maxRetries?: number })`. Internal tạo `KeyPool` + Map<key, OpenAI> client per key.
- [x] `openai.provider.spec.ts` với mock OpenAI client. Cases:
  - `chat()` text-only: messages convert đúng order/role, response normalize đúng (text, usage tokens).
  - `chat()` với tools: tools convert sang format OpenAI; mock response `tool_calls` normalize ngược về `AiFunctionCall[]` với `arguments` đã parse JSON.
  - `chatStructured()`: verify `response_format.json_schema.schema` nhận đúng schema input, parse JSON trả về thành object typed.
  - Error mapping: simulate 429 → `AiRateLimitException`; timeout error → `AiTimeoutException`; 400 → `AiInvalidRequestException`; 503 → `AiServiceUnavailableException`.
  - `embed()`, `uploadFile()`, `generateImage()` throw `MethodNotSupportedException`.
  - `chatStream()` tạm thời throw `MethodNotSupportedException` (sẽ thay ở slice #5).
- [x] `OpenaiProvider` **chưa** được export từ `ai.module.ts` — provider sẽ được instantiate trực tiếp bởi `AiProviderRouter` ở slice #3 (mỗi feature OpenAI có config riêng nên không singleton).
- [x] Build, lint, tests pass. (743/743 tests, 0 lint errors, typecheck clean)

## Blocked by

- `01-refactor-iaiprovider-keypool.md` (cần `MethodNotSupportedException`, `IAiProvider.chatStructured()`, generalized `KeyPool`)

## Implementation notes

### Files created

- `backend/src/infrastructure/openai/openai-errors.ts` — Error mapping layer: `isOpenaiRateLimitError`, `getOpenaiCooldownMs` (30s), `mapOpenaiError`. Detects timeout via `err.name === 'APIConnectionTimeoutError'`, maps status codes: 429→`AiRateLimitException`, ≥500→`AiServiceUnavailableException`, ≥400→`AiInvalidRequestException`.
- `backend/src/infrastructure/openai/openai.provider.ts` — `OpenaiProvider implements IAiProvider`. Plain class (no NestJS DI), constructor takes `OpenaiProviderConfig`. Internally builds `KeyPool` + `Map<key, OpenAI>` (one client per API key, `baseURL` + `timeout` configured, SDK `maxRetries: 0` to delegate retry to our loop). `executeWithRetry` mirrors GenaiProvider pattern. `chatStream()` throws `MethodNotSupportedException` synchronously (non-generator to satisfy `require-yield` lint rule). `embed/uploadFile/generateImage` throw `MethodNotSupportedException`.
- `backend/src/infrastructure/openai/openai.provider.spec.ts` — 18 tests covering: message conversion, system instruction prepend, model override, tools conversion→OpenAI format, tool_calls normalization→`AiFunctionCall[]` with parsed JSON args, `chatStructured` schema passthrough + JSON parse, all 4 error mappings, retry with 2-key pool, all 4 unsupported methods.

### Files modified

- `backend/package.json` — Added `"openai": "^6.39.0"` to `dependencies`.

### Files deleted

_None_

### Design notes

- OpenAI SDK v6 introduced `ChatCompletionMessageCustomToolCall` in the `tool_calls` union, so `normalizeResponse` filters `call.type === 'function'` before accessing `.function`.
- `chatStream()` is a regular method (not `async *`) that throws synchronously — this satisfies the `require-yield` ESLint rule while keeping behavior correct (callers using `for await` still see the exception).
