# Implement `OpenaiProvider` non-streaming: `chat()` + `chatStructured()` + error mapping

Type: AFK
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

- [ ] `openai` npm package cài vào `backend/package.json` (latest stable).
- [ ] `backend/src/infrastructure/openai/openai.provider.ts` class `OpenaiProvider implements IAiProvider`.
- [ ] `backend/src/infrastructure/openai/openai-errors.ts` export `mapOpenaiError(err): AiException`, `isOpenaiRateLimitError(err): boolean`, `getOpenaiCooldownMs(err): number`. Map từ `openai.APIError`, `openai.RateLimitError`, `openai.APITimeoutError`, etc.
- [ ] Constructor signature: `(config: { baseUrl: string, apiKeys: string[], model: string, fallbackModel?: string, timeout?: number, maxRetries?: number })`. Internal tạo `KeyPool` + 1 OpenAI client cho mỗi `getKey()` call (hoặc 1 client với `apiKey` rotate — pick whichever cleaner).
- [ ] `openai.provider.spec.ts` với mock OpenAI client. Cases:
  - `chat()` text-only: messages convert đúng order/role, response normalize đúng (text, usage tokens).
  - `chat()` với tools: tools convert sang format OpenAI; mock response `tool_calls` normalize ngược về `AiFunctionCall[]` với `arguments` đã parse JSON.
  - `chatStructured()`: verify `response_format.json_schema.schema` nhận đúng schema input, parse JSON trả về thành object typed.
  - Error mapping: simulate 429 → `AiRateLimitException`; timeout error → `AiTimeoutException`; 400 → `AiInvalidRequestException`; 503 → `AiServiceUnavailableException`.
  - `embed()`, `uploadFile()`, `generateImage()` throw `MethodNotSupportedException`.
  - `chatStream()` tạm thời throw `MethodNotSupportedException` (sẽ thay ở slice #5).
- [ ] `OpenaiProvider` **chưa** được export từ `ai.module.ts` — provider sẽ được instantiate trực tiếp bởi `AiProviderRouter` ở slice #3 (mỗi feature OpenAI có config riêng nên không singleton).
- [ ] Build, lint, tests pass.

## Blocked by

- `01-refactor-iaiprovider-keypool.md` (cần `MethodNotSupportedException`, `IAiProvider.chatStructured()`, generalized `KeyPool`)
