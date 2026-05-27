# `AiProviderRouter` + per-feature config + wire `ExerciseGenerationService`

Type: AFK
Covers user stories: 1, 4, 5, 6, 7, 10, 16, 18

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Lần đầu OpenAI thực sự routable end-to-end qua 1 feature thật (Exercise — non-streaming, structured output, không tool calling — feature đơn giản nhất). Sau slice này:

- Set `AI_EXERCISE_PROVIDER=openai` + `AI_EXERCISE_BASE_URL` + `AI_EXERCISE_API_KEYS` + `AI_EXERCISE_MODEL` → ExerciseGenerationService dùng OpenAI gateway.
- Không set gì → Exercise vẫn dùng Gemini global config (backwards compat 100%).
- Set sai (vd `provider=openai` thiếu `BASE_URL`) → backend fail-fast lúc bootstrap với error rõ ràng.

Router API: `router.forFeature(name: 'exercise'|'simulation'|'assistant').chat(...)`.

Caching: mỗi feature OpenAI có instance `OpenaiProvider` riêng (mỗi cái có KeyPool riêng); mọi feature route về genai share 1 `GenaiProvider` singleton.

Fallback within-provider: provider gặp `AiRateLimitException` (key pool exhausted), `AiTimeoutException`, hoặc `AiServiceUnavailableException` → 1 lần retry với `AI_<F>_FALLBACK_MODEL` (cùng provider, cùng KeyPool). Logic nằm ở provider layer (cả Genai và Openai), không phải router. Mirror hành vi `GENAI_CHAT_FALLBACK_MODEL` hiện tại.

## Acceptance criteria

- [ ] `backend/src/config/ai-router.config.ts` register namespace `'aiRouter'` với schema 3 feature × 5 env:
  - `AI_EXERCISE_PROVIDER`, `AI_EXERCISE_BASE_URL`, `AI_EXERCISE_API_KEYS`, `AI_EXERCISE_MODEL`, `AI_EXERCISE_FALLBACK_MODEL`
  - `AI_SIMULATION_*` (5 env tương tự)
  - `AI_ASSISTANT_*` (5 env tương tự)
  - `PROVIDER` mặc định `'genai'` khi unset/empty. `API_KEYS` parse comma-separated.
- [ ] `backend/src/infrastructure/ai/ai-provider-router.ts` class `AiProviderRouter`:
  - Constructor inject `GenaiProvider` (singleton) + `ConfigService`.
  - Method `forFeature(name)` return `IAiProvider`. Build provider lazy lần đầu request, cache theo feature key.
  - Khi `provider === 'genai'` (hoặc unset) → return injected `GenaiProvider`. Nếu feature có `AI_<F>_MODEL` set thì wrap với model override (decision: provider hỗ trợ chọn model per-call hay tạo wrapper — implementer chọn).
  - Khi `provider === 'openai'` → tạo `OpenaiProvider` instance mới với config từ `AI_<F>_BASE_URL`, `AI_<F>_API_KEYS`, `AI_<F>_MODEL`, `AI_<F>_FALLBACK_MODEL`.
- [ ] Startup validation: trong constructor hoặc `OnModuleInit`, loop qua 3 feature; nếu `provider=openai` mà thiếu `BASE_URL` hoặc `API_KEYS` (rỗng/null) → throw `Error` với message `AI_<FEATURE>_PROVIDER=openai requires AI_<FEATURE>_BASE_URL and AI_<FEATURE>_API_KEYS`. Backend không boot được.
- [ ] Fallback model logic ở provider layer:
  - `GenaiProvider`: khi primary model fail (RateLimit pool exhausted / Timeout / ServiceUnavailable), retry 1 lần với `fallbackModel` cùng KeyPool. (Có thể đã có sẵn từ logic `GENAI_CHAT_FALLBACK_MODEL` — verify giữ nguyên.)
  - `OpenaiProvider`: cùng logic, retry với `fallbackModel` truyền vào constructor.
- [ ] `ExerciseGenerationService` rewrite:
  - Constructor thay `private genai: GenaiProvider` bằng `private router: AiProviderRouter`.
  - Mọi call `chatStructured(...)` → `router.forFeature('exercise').chatStructured(...)`.
- [ ] `ai-provider-router.spec.ts` cases:
  - Feature không có per-feature env → `forFeature('exercise')` returns injected `GenaiProvider` instance.
  - Feature `provider=openai` + đủ env → returns `OpenaiProvider` instance.
  - 2 lần `forFeature('exercise')` cùng config → cùng instance reference (caching verify).
  - `provider=openai` thiếu `BASE_URL` → constructor / `OnModuleInit` throw với message chứa tên feature.
  - `provider=openai` thiếu `API_KEYS` → throw tương tự.
  - 2 feature khác nhau cùng `provider=openai` → 2 instance khác nhau.
- [ ] `ExerciseGenerationService` existing tests update mock từ `GenaiProvider` → `AiProviderRouter` (mock `forFeature` return fake provider). Tất cả case pass.
- [ ] Token `AI_PROVIDER` xóa khỏi `ai.module.ts`. `AgentService` tạm thời inject `GenaiProvider` trực tiếp (replace `@Inject('AI_PROVIDER')` bằng class injection) — sẽ wire qua router ở slice #6.
- [ ] `ai.module.ts` export `AiProviderRouter`, `GenaiProvider`, `KeyPool`. Domain modules (`ExercisesModule`) import `AiModule`.
- [ ] Build, lint, full test suite pass. Backend bootstrap với env mặc định (chỉ GEMINI) chạy không lỗi. Bootstrap với `AI_EXERCISE_PROVIDER=openai` thiếu env → fail rõ ràng.

## Blocked by

- `01-refactor-iaiprovider-keypool.md`
- `02-openai-provider-non-streaming.md`
