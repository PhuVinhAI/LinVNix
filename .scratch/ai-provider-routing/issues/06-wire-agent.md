# Wire `AgentService` qua router (streaming + tools); confirm `ImageAnalysisService` bypass

Type: AFK
Covers user stories: 3, 15, 21, 22

Status: done

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Wire feature phức tạp nhất — Trợ lý AI dùng streaming + tools — qua router. Sau slice này, set `AI_ASSISTANT_PROVIDER=openai` + endpoint OpenAI-compatible hỗ trợ tool calling (vd OpenRouter với Claude/GPT, LM Studio với tool-capable model) → Trợ lý AI chạy qua đó. `ImageAnalysisService` xác nhận giữ pattern inject `GenaiProvider` trực tiếp — không qua router.

Caveat behavior khi model không support tool calling: stream vẫn chạy, `finish_reason` không phải `tool_calls`, agent loop kết thúc với text-only response — không crash. PRD đã quyết định không validate capability lúc startup, chỉ document warning trong `.env.example` (xử lý ở slice #7). Có thể log 1 dòng warn ở bootstrap nếu `AI_ASSISTANT_PROVIDER=openai` nhưng đây không phải bắt buộc.

## Acceptance criteria

- [x] `AgentService` (`backend/src/modules/agent/application/agent.service.ts`):
  - Bỏ `@Inject('AI_PROVIDER')`.
  - Inject `private router: AiProviderRouter`.
  - Mọi call `chatStream(...)` → `router.forFeature('assistant').chatStream(...)`.
  - Tools array vẫn truyền nguyên — không cần convert (provider layer lo).
- [x] `ImageAnalysisService` (`backend/src/modules/image-analysis/application/image-analysis.service.ts`) **không thay đổi** — vẫn inject `GenaiProvider` trực tiếp. Comment ngắn ở constructor giải thích lý do (locked về Gemini, vision OpenAI ngoài scope v1).
- [x] Nếu `agent.service.spec.ts` tồn tại: update mock từ token `AI_PROVIDER` → mock `AiProviderRouter`. Nếu chưa có spec, không bắt buộc thêm mới ở slice này.
- [x] `AgentModule` import `AiModule` (nếu chưa).
- [ ] Smoke verify default env (no `AI_ASSISTANT_*`): agent endpoint streaming hoạt động qua Gemini như trước (existing E2E pass).
- [ ] Manual verify: set `AI_ASSISTANT_PROVIDER=openai` trỏ tới LM Studio / OpenRouter với model tool-capable, gửi 1 message tới agent endpoint, nhận stream chunks → tool call emit đúng → final response đúng.
- [ ] Manual verify: Khám phá ảnh feature vẫn work (Gemini hard-coded), không bị ảnh hưởng bởi config `AI_*_PROVIDER`.
- [x] Build, lint, tests pass.

## Blocked by

- `03-router-and-exercise-wiring.md`
- `05-openai-stream-tools.md`

## Implementation notes

### Files modified

- **`backend/src/modules/agent/application/agent.service.ts`** — Replaced `GenaiProvider` import and constructor injection with `AiProviderRouter`. Updated `runTurn` to call `router.forFeature('assistant').chat(...)`, `runTurnStream` to call `router.forFeature('assistant').chatStream(...)`, and `buildSystemInstruction` to call `router.renderPrompt(...)`.

- **`backend/src/modules/agent/application/agent.service.spec.ts`** — Replaced `GenaiProvider` mock with `AiProviderRouter` mock. Added `router` variable with `forFeature` returning the inner provider mock and `renderPrompt` as separate jest.fn. Updated 4 tests that previously called `genaiService.renderPrompt` to call `router.renderPrompt` instead. All 32 tests pass.

- **`backend/src/modules/agent/agent.module.ts`** — Added `AiModule` import so `AiProviderRouter` is explicitly available to the module.

- **`backend/src/modules/image-analysis/application/image-analysis.service.ts`** — Added constructor comment explaining why `GenaiProvider` is injected directly (vision locked to Gemini, OpenAI vision out of scope v1). No functional changes.

### Files created

_(none)_

### Files deleted

_(none)_
