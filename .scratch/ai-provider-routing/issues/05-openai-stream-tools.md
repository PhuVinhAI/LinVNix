# `OpenaiProvider.chatStream()` + tool call delta accumulation

Type: AFK
Covers user stories: 11, 12, 19

Status: done

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Implement streaming cho `OpenaiProvider`. Phức tạp nhất là tool call deltas — OpenAI stream từng phần JSON arguments cho mỗi tool call, phải buffer nội bộ rồi emit `AiChatChunk` cuối với `functionCalls` hoàn chỉnh (giống Gemini ở `GenaiProvider`).

Behavior:

- `chatStream(messages, options)` return `AsyncIterable<AiChatChunk>`.
- Text delta: từng chunk text emit ngay với field `text`.
- Tool call delta: OpenAI stream emit `delta.tool_calls: [{ index, id, function: { name, arguments } }]` với arguments là string fragment JSON. Accumulate per `index` thành map nội bộ `Map<number, { id, name, argumentsBuffer: string }>`.
- Khi `chunk.choices[0].finish_reason === 'tool_calls'` (hoặc stream end với buffer non-empty), parse `argumentsBuffer` JSON, emit 1 chunk cuối với `functionCalls: AiFunctionCall[]` đã hoàn chỉnh.
- Error mid-stream: catch lỗi từ async iterator của SDK, map qua `openai-errors.ts`, throw exception tương ứng (không silent fail).
- Abort: nếu signal abort, đóng iterator client. Best-effort — không block slice nếu SDK chưa expose clean abort.

## Acceptance criteria

- [x] `openai.provider.ts` thay implementation `chatStream()` (đang throw `MethodNotSupportedException` từ slice #2) bằng logic thật.
- [x] Helper internal `accumulateToolCalls()` build `Map<index, ToolCallBuilder>`.
- [x] `openai.provider.spec.ts` thêm cases:
  - Stream text-only: mock SDK emit 3 chunk text deltas → provider emit 3 `AiChatChunk` mỗi cái có `text` đúng.
  - Stream với 1 tool call: mock chunks deltas (name ở chunk 1, arguments split 3 chunk, finish_reason ở chunk cuối) → 1 chunk emit cuối có `functionCalls: [{ name, arguments: parsedObject }]`.
  - Stream với 2 tool call parallel (khác index): chunks interleaved → chunk cuối có `functionCalls: [call_index_0, call_index_1]` đúng thứ tự.
  - Stream text + tool mixed: text chunks emit ngay, tool chunk emit khi finish.
  - Stream error mid-flight: mock SDK throw rate-limit error giữa stream → provider throw `AiRateLimitException`, không silent close.
  - Arguments JSON malformed cuối stream → throw `AiInvalidRequestException` (hoặc tương đương) với message hint provider trả JSON sai.
- [x] Build, lint, tests pass.

## Blocked by

- `02-openai-provider-non-streaming.md`

## Implementation notes

### Files modified

- **`backend/src/infrastructure/openai/openai.provider.ts`** — Replaced `chatStream()` stub (threw `MethodNotSupportedException`) with a real async generator. Added two private helpers: `accumulateToolCalls()` builds the `Map<index, ToolCallBuilder>` from OpenAI streaming deltas, and `buildToolCallChunk()` parses accumulated JSON arguments and emits a single `AiChatChunk` with `functionCalls`. SDK stream errors (rate-limit, timeout, etc.) caught in a try/catch wrapping the async iteration and mapped via `mapOpenaiError`. JSON parse errors thrown outside that catch so they surface as `AiInvalidRequestException` directly. Added `AiInvalidRequestException` to imports.

- **`backend/src/infrastructure/openai/openai.provider.spec.ts`** — Removed the old `chatStream() throws MethodNotSupportedException` test from the unsupported-methods block. Added a new `describe('chatStream()')` block with 6 test cases covering: text-only streaming (3 chunks), single tool call delta accumulation, two parallel tool calls by index, mixed text + tool call, rate-limit error mid-stream, and malformed JSON arguments. Added `AiChatChunk` import from `@linvnix/shared`.

### Files created

_(none)_

### Files deleted

_(none)_
