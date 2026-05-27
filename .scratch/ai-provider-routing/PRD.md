# PRD: Multi-provider AI routing với OpenAI-compatible gateways

Status: ready-for-agent

## Problem Statement

Hiện tại toàn bộ AI features của LinVNix (Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh, Sinh bài tập tùy chỉnh) đều bắt buộc dùng Google Gemini qua `@google/genai` SDK. Là người vận hành sản phẩm, tôi muốn linh hoạt hơn:

- Một số tác vụ (vd sinh bài tập, simulation đơn giản) có thể chạy ở model rẻ/nhanh hơn Gemini qua OpenAI-compatible gateways (OpenRouter, LiteLLM, vLLM, Ollama, LM Studio).
- Đôi khi muốn A/B model khác nhau cho từng tính năng để tối ưu chất lượng/chi phí.
- Phải hỗ trợ self-hosted LLM (Ollama, vLLM, LM Studio) qua base URL tùy chỉnh.

Không có cơ chế nào để chọn provider/model riêng cho từng tính năng, cũng không có khả năng trỏ tới base URL OpenAI-compatible. Mọi thay đổi đều đụng vào code `GenaiService`.

## Solution

Thêm OpenAI SDK làm provider thứ hai, đứng sau cùng `IAiProvider` interface với Gemini. Mỗi tính năng AI (`exercise`, `simulation`, `assistant`) được cấu hình provider/URL/key/model riêng qua env var inline. Khám phá ảnh giữ nguyên Gemini hard-coded vì vision yêu cầu Gemini multimodal (đã được xác nhận ưu việt ở use case này, và OpenAI vision không nằm trong scope v1).

Domain services nhận một `AiProviderRouter` thay vì token `AI_PROVIDER` cũ, và truy cập provider qua API fluent `router.forFeature('exercise').chat(...)`. Khi không cấu hình per-feature env, mặc định route về Gemini với config global hiện tại — đảm bảo backwards compat 100%, opt-in OpenAI khi cần.

## User Stories

1. Là người vận hành sản phẩm, tôi muốn cấu hình `AI_EXERCISE_PROVIDER=openai` với base URL của OpenRouter và 1 model rẻ hơn để giảm chi phí sinh bài tập, mà không thay đổi code.
2. Là người vận hành sản phẩm, tôi muốn cấu hình `AI_SIMULATION_PROVIDER=openai` chỉ tới LiteLLM gateway nội bộ để tận dụng cache prompt giữa nhiều môi trường.
3. Là người vận hành sản phẩm, tôi muốn dùng Ollama local cho Trợ lý AI ở dev environment qua `AI_ASSISTANT_BASE_URL=http://localhost:11434/v1`, để dev không tốn quota Gemini.
4. Là developer, tôi muốn khi không set bất kỳ `AI_*_PROVIDER` env nào thì app vẫn chạy y hệt hiện tại với Gemini, không phải migrate gì cả.
5. Là developer, tôi muốn KeyPool rotate được nhiều key cho từng OpenAI feature (vd 3 key OpenRouter), giống Gemini hiện tại có `GENAI_API_KEYS=k1,k2,k3`.
6. Là developer, tôi muốn `GENAI_API_KEYS` global tiếp tục hoạt động cho cả Khám phá ảnh và bất kỳ feature nào đang để provider=genai, share chung KeyPool global.
7. Là developer khi đọc code, tôi muốn thấy `router.forFeature('exercise').chat(...)` trong domain service, không phải biết bên dưới là Gemini hay OpenAI.
8. Là developer, tôi muốn `IAiProvider` interface có sẵn `chatStructured()` (hiện tại chỉ có trên `GenaiService` concrete) để service exercise generation không khoá cứng vào Gemini.
9. Là developer, tôi muốn `KeyPool` được tách khỏi `infrastructure/genai/` lên `infrastructure/ai/` để tái sử dụng cho cả 2 provider, với error mapping của từng provider được tách ra riêng.
10. Là developer, tôi muốn khi 1 model OpenAI fail (rate limit/timeout/5xx), feature tự thử `AI_EXERCISE_FALLBACK_MODEL` cùng provider (mirror hành vi `GENAI_CHAT_FALLBACK_MODEL` hiện tại).
11. Là developer khi triển khai feature mới có tool calling, tôi muốn OpenaiProvider tự convert tools từ format `{name, description, parameters}` của `IAiProvider` sang format `tools: [{type:'function', function:{...}}]` của OpenAI SDK.
12. Là developer khi đọc streaming chunks từ OpenAI, tôi muốn provider tự accumulate tool call deltas (OpenAI stream từng phần argument) và emit ra `AiChatChunk` với `functionCalls` đã hoàn chỉnh — giống Gemini.
13. Là developer, tôi muốn OpenaiProvider hỗ trợ structured output (JSON Schema) qua `response_format: { type: 'json_schema' }` của OpenAI, để exercise generation chạy được trên gateway.
14. Là developer, tôi muốn `embed()`/`uploadFile()`/`generateImage()` trên OpenaiProvider throw `MethodNotSupportedException` rõ ràng — không silently fail.
15. Là người vận hành sản phẩm, tôi muốn `.env.example` có ghi rõ caveat: "Nếu chọn provider không hỗ trợ tool calling cho assistant, Trợ lý AI sẽ trở thành text-only chat".
16. Là người vận hành sản phẩm, tôi muốn validation lúc startup catch các config sai (vd `AI_EXERCISE_PROVIDER=openai` mà thiếu `AI_EXERCISE_BASE_URL` hoặc `AI_EXERCISE_API_KEYS`), fail-fast với thông báo rõ ràng.
17. Là developer test, tôi muốn `KeyPool` có thể test isolated với fake keys + fake rate-limit callback, không cần dính Gemini hay OpenAI.
18. Là developer test, tôi muốn `AiProviderRouter` test được với fake config object, verify đúng provider được trả về cho từng feature và default về genai khi không config.
19. Là developer test, tôi muốn `OpenaiProvider` test được với mock OpenAI client, verify tools conversion + streaming accumulation + error mapping đúng.
20. Là developer test, tôi muốn các test hiện có cho `GenaiService` vẫn pass sau refactor (rename thành `GenaiProvider`, depend on extracted KeyPool).
21. Là người dùng cuối học viên, tôi không thấy bất kỳ thay đổi nào — Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh, Sinh bài tập đều hoạt động y nguyên (trừ khi vận hành chuyển provider có vấn đề chất lượng).
22. Là DevOps, tôi muốn deploy production tiếp tục dùng Gemini không cần thay đổi env hiện có, chỉ thay khi nào muốn opt-in OpenAI.

## Implementation Decisions

### Phạm vi routing

- **3 feature routable**: `exercise`, `simulation`, `assistant`. Mỗi feature có block env riêng.
- **1 feature locked**: `image_analysis` hard-coded Gemini trong code. `ImageAnalysisService` inject `GenaiProvider` trực tiếp, không qua router. Lý do: vision OpenAI ngoài scope, không cần entry config "dummy".

### Env schema (inline per-feature, opt-in)

```env
# Global Gemini config — giữ nguyên 100% (mặc định cho mọi feature)
GEMINI_API_KEY=...
GENAI_API_KEYS=k1,k2,k3
GENAI_CHAT_MODEL=gemini-2.5-flash
GENAI_CHAT_FALLBACK_MODEL=gemini-2.0-flash
GENAI_MAX_RETRIES=2
GENAI_TIMEOUT=30000

# Per-feature opt-in (cả khối có thể vắng → fallback về genai global)
AI_EXERCISE_PROVIDER=openai            # genai|openai (default: genai)
AI_EXERCISE_BASE_URL=https://openrouter.ai/api/v1
AI_EXERCISE_API_KEYS=sk-or-k1,sk-or-k2 # comma-separated → KeyPool riêng
AI_EXERCISE_MODEL=anthropic/claude-3-haiku
AI_EXERCISE_FALLBACK_MODEL=...         # optional, cùng provider

AI_SIMULATION_PROVIDER=...
AI_SIMULATION_BASE_URL=...
AI_SIMULATION_API_KEYS=...
AI_SIMULATION_MODEL=...
AI_SIMULATION_FALLBACK_MODEL=...

AI_ASSISTANT_PROVIDER=...
AI_ASSISTANT_BASE_URL=...
AI_ASSISTANT_API_KEYS=...
AI_ASSISTANT_MODEL=...
AI_ASSISTANT_FALLBACK_MODEL=...
```

Khi `AI_<FEATURE>_PROVIDER=genai` (hoặc unset), feature dùng global `GENAI_API_KEYS` KeyPool. `AI_<FEATURE>_MODEL` nếu set thì override `GENAI_CHAT_MODEL`. Mọi env khác (`MAX_RETRIES`, `TIMEOUT`) vẫn dùng global Gemini config.

### Lớp trừu tượng

- `IAiProvider` interface (tách ra file riêng) thêm `chatStructured()` (hiện đang ngoài interface, là code smell phải fix).
- Hai implementation: `GenaiProvider` (rename + refactor từ `GenaiService` hiện tại), `OpenaiProvider` (mới).
- `AiProviderRouter` fluent API: `router.forFeature(name: 'exercise'|'simulation'|'assistant')` → `IAiProvider`.
- Domain services inject `AiProviderRouter`, không inject provider trực tiếp.
- `AiProviderRouter` đọc config 1 lần lúc bootstrap, cache provider instance theo feature. Mỗi feature OpenAI có instance riêng (mỗi cái có KeyPool riêng); mọi feature genai share 1 `GenaiProvider` instance global.

### KeyPool generalized

- Chuyển `infrastructure/genai/key-pool.ts` → `infrastructure/ai/key-pool.ts`, provider-agnostic.
- Interface mới: nhận callback `isRateLimitError(err): boolean` và `getCooldownMs(err): number` để biết khi nào và bao lâu rotate.
- Mỗi provider cung cấp 2 callback này từ error mapper của mình.
- KeyPool không biết về Gemini hay OpenAI — chỉ làm rotate logic.

### Error mapping

- `infrastructure/genai/genai-errors.ts` — tách ra: map Gemini SDK errors → `Ai*Exception` (đã có sẵn ở `ai.exceptions.ts`).
- `infrastructure/openai/openai-errors.ts` — mới: map OpenAI SDK errors (`APIError`, `RateLimitError`, `APITimeoutError`...) → cùng `Ai*Exception`.
- `ai.exceptions.ts` giữ nguyên (không thay đổi interface).

### Fallback

- Within-provider model fallback only. Khi primary model fail (rate limit toàn pool, timeout, 5xx), thử `AI_<FEATURE>_FALLBACK_MODEL` cùng provider, cùng KeyPool, cùng base URL.
- Không cross-provider fallback. Tool calling syntax + structured output format giữa Gemini và OpenAI khác nhau, cross-fallback sẽ phát sinh bug khó debug.

### Tool calling

- `IAiProvider.chat()` tiếp tục nhận `tools: Array<{name, description, parameters}>` (đã provider-neutral).
- `OpenaiProvider` convert sang format OpenAI: `tools: [{type:'function', function:{name, description, parameters}}]`.
- Response normalize về `functionCalls: AiFunctionCall[]` (đã có sẵn).
- Streaming: `OpenaiProvider` accumulate tool call deltas trước khi emit `AiChatChunk` với `functionCalls` hoàn chỉnh.
- Không validate khả năng tool calling lúc startup. Trust user + log warn trong `.env.example`. Nếu model bỏ tools, agent loop kết thúc với text-only response.

### Structured output (chatStructured)

- `OpenaiProvider.chatStructured()` dùng `response_format: { type: 'json_schema', json_schema: { name, schema, strict: false } }`. Strict mode tắt mặc định để tương thích schema đang dùng cho Gemini (chưa chắc compliant với OpenAI strict requirements).
- Nếu cần strict mode về sau, có thể thêm flag riêng — out of v1 scope.

### Scope v1 của OpenaiProvider

- Implement: `chat()`, `chatStream()`, `chatStructured()`.
- Throw `MethodNotSupportedException`: `embed()`, `uploadFile()`, `generateImage()`.
- Các method này hiện chưa có feature nào dùng, nên không ảnh hưởng.

### Image Analysis

- `ImageAnalysisService` tiếp tục inject `GenaiProvider` trực tiếp (không qua router).
- Lý do: feature locked về genai, không có lựa chọn provider, đi qua router chỉ thêm indirection rỗng.
- Khi nào có nhu cầu thêm provider khác cho vision, mới đưa vào router.

### Backwards compatibility

- Toàn bộ env vars cũ (`GEMINI_API_KEY`, `GENAI_API_KEYS`, `GENAI_CHAT_MODEL`, `GENAI_CHAT_FALLBACK_MODEL`, `GENAI_MAX_RETRIES`, `GENAI_TIMEOUT`) giữ nguyên ý nghĩa.
- Khi không set bất kỳ `AI_*_PROVIDER` nào, behavior identical với hiện tại.
- Không có breaking change. Migration là opt-in.

### Module wiring

- Đổi tên `genai.module.ts` → `ai.module.ts`, scope rộng hơn.
- Register: `AiProviderRouter`, `GenaiProvider` (singleton), nhưng `OpenaiProvider` instance được tạo per-feature bởi Router theo nhu cầu (vì mỗi feature có URL/key/KeyPool riêng).
- Bỏ token `AI_PROVIDER` cũ. Domain modules import `AiProviderRouter`.

## Testing Decisions

### Triết lý

Tests chỉ verify external behavior, không verify implementation chi tiết. Cụ thể:
- KeyPool: input keys + simulated errors → output rotation/cooldown. Không assert internal state.
- AiProviderRouter: input config object → output provider type/identity cho từng feature. Không assert ai cache hay không.
- OpenaiProvider: input `IAiProvider` requests + mock SDK responses → output normalized `AiChatResponse`/`AiChatChunk`. Không assert internal OpenAI client calls cụ thể.
- GenaiProvider: same — input + output theo `IAiProvider` contract.

### Module test

1. **`KeyPool` (generic, sau refactor)** — đã có `key-pool.spec.ts`, refactor lại với callback-based rate detection. Test cases:
   - Rotate qua nhiều key tuần tự.
   - Mark key rate-limited theo callback, skip trong cooldown window.
   - Khi tất cả key rate-limited, throw `AiRateLimitException`.
   - Recover khi cooldown hết hạn.

2. **`AiProviderRouter` (mới)** — tests:
   - Feature không có per-feature env → trả về `GenaiProvider` instance global.
   - Feature có `provider=openai` → trả về `OpenaiProvider` instance riêng cho feature đó.
   - Same feature gọi 2 lần → trả cùng instance (caching).
   - Config invalid (`provider=openai` thiếu `BASE_URL` hoặc `API_KEYS`) → throw config error rõ ràng lúc startup.

3. **`OpenaiProvider` (mới)** — tests với mock OpenAI client:
   - `chat()` non-streaming: messages convert đúng, response normalize đúng (text + usage).
   - `chat()` với tools: tools convert sang OpenAI format, function calls normalize ngược về `AiFunctionCall[]`.
   - `chatStream()`: streams `AiChatChunk` đúng, text deltas đúng.
   - `chatStream()` với tools: tool call deltas accumulate đúng, emit `functionCalls` hoàn chỉnh.
   - `chatStructured()`: pass schema vào `response_format`, parse JSON trả về.
   - Error mapping: 429 → `AiRateLimitException`, timeout → `AiTimeoutException`, 4xx → `AiInvalidRequestException`, 5xx → `AiServiceUnavailableException`.
   - `embed()`/`uploadFile()`/`generateImage()` throw `MethodNotSupportedException`.

4. **`GenaiProvider` (sau refactor)** — chạy lại `genai.service.spec.ts` sau khi rename + tách KeyPool/errors:
   - Tất cả test hiện có phải pass.
   - Thêm test cho `chatStructured()` (giờ là phần của interface).

### Prior art

- `key-pool.spec.ts` hiện có — pattern test KeyPool.
- `genai.service.spec.ts` hiện có — pattern test provider với mock SDK.
- `assistant-tutor-prompt.spec.ts` hiện có — pattern test prompt template rendering.
- `agent.service.spec.ts` hiện có — pattern test domain service inject IAiProvider, verify business logic.

### Integration test

- Không add integration test mới ở v1. Existing E2E test cho agent/simulation/exercise/image-analysis vẫn pass vì backwards compat.
- Nếu cần test OpenAI provider end-to-end thực, dùng manual test với LM Studio local — out of CI scope.

## Out of Scope

- **OpenAI embedding API** — `embed()` trên OpenaiProvider throw `MethodNotSupportedException`. Hiện chưa feature nào dùng embeddings.
- **OpenAI file upload API** — `uploadFile()` throw. Khác hẳn Gemini Files API về semantics.
- **OpenAI image generation (DALL-E)** — `generateImage()` throw. Không feature nào dùng image gen.
- **OpenAI vision** — image_analysis tiếp tục Gemini-only. Nếu sau này muốn OpenAI vision (GPT-4o, Claude Sonnet vision qua OpenRouter), sẽ là PRD riêng.
- **Cross-provider fallback** — không có. Gemini fail → throw, không tự thử OpenAI.
- **Capability validation lúc startup** — không validate provider có support tool calling/structured output thật sự không. Trust user + log warn.
- **Admin UI để cấu hình provider** — config chỉ qua env. Đổi provider cần restart backend.
- **Token cost tracking per provider** — vẫn dùng existing token count trên Conversation entity. Cost tracking là concern riêng.
- **Anthropic SDK native** — không add. Anthropic dùng được qua OpenRouter (OpenAI-compatible).
- **Streaming abort cho OpenAI provider** — implement nếu trivial, không thì document gap. Hiện tại assistant abort dựa vào SSE close + Gemini stream cancel; pattern tương tự cho OpenAI client.
- **`GENAI_EMBED_MODEL`/`GENAI_IMAGE_MODEL`/`GENAI_TTS_MODEL`** — vẫn placeholder, không thay đổi.
- **Mobile/Admin client thay đổi** — không. Tất cả AI calls vẫn qua backend.

## Further Notes

### ADR đi kèm

Quyết định này nên có ADR `docs/adr/0001-multi-provider-ai-routing.md` (hiện chưa có `docs/adr/` directory) ghi lại 3 tradeoff chính:

1. **Inline per-feature env** thay vì named providers + mapping — chọn anti-magic, dễ onboard, chấp nhận lặp key/url khi multiple features dùng cùng gateway.
2. **Within-provider fallback only** — chọn predictability hơn resilience cross-provider, tránh bug do format khác biệt.
3. **Image_analysis bypass router** — chọn simplicity, chấp nhận inconsistent inject pattern, tránh dummy entry "locked genai".

### Migration guide cho .env.example

Update `.env.example` với:
- Khối Gemini global hiện tại + comment "default cho mọi feature".
- 3 khối per-feature OpenAI mẫu (commented out), kèm comment giải thích từng env var.
- Caveat về tool calling cho `AI_ASSISTANT_PROVIDER=openai`.

### Triển khai theo tracer-bullet vertical slice

Khi break PRD này xuống issues qua `/to-issues`, gợi ý vertical slice theo độ phức tạp tăng dần:
1. Refactor IAiProvider + KeyPool extraction (no functional change).
2. Implement OpenaiProvider với chat() + chatStructured() (no streaming, no tools).
3. Implement AiProviderRouter + wire ExerciseGenerationService — feature đơn giản nhất (no streaming, no tools).
4. Wire SimulationAiService — non-streaming.
5. Implement OpenaiProvider chatStream() + tool call delta accumulation.
6. Wire AgentService — streaming + tools.
7. Update .env.example + README + write ADR.

### Câu hỏi mở đến lúc implement

- `AiProviderRouter` đọc env qua `ConfigService` hay `process.env` trực tiếp? Theo convention `genai.config.ts` thì dùng `ConfigService` với registerAs — follow pattern đó.
- Cách validate config khi startup: dùng `class-validator` schema (như NestJS recommend) hay tự throw exception trong constructor? — quyết định lúc implement, không ảnh hưởng API.
- `OpenaiProvider` có dùng helper `zodResponseFormat` từ `openai/helpers/zod` không? Nếu có, cần schemas dạng Zod object thay vì raw JSON Schema. Hiện `chatStructured()` nhận `responseSchema: Record<string, any>` (JSON Schema-shaped) → có thể giữ nguyên signature và provider tự wrap → an toàn hơn.
