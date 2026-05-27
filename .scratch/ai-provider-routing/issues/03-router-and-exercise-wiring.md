# `AiProviderRouter` + per-feature config + wire `ExerciseGenerationService`

Type: AFK
Covers user stories: 1, 4, 5, 6, 7, 10, 16, 18
Status: done

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

- [x] `backend/src/config/ai-router.config.ts` register namespace `'aiRouter'` với schema 3 feature × 5 env:
  - `AI_EXERCISE_PROVIDER`, `AI_EXERCISE_BASE_URL`, `AI_EXERCISE_API_KEYS`, `AI_EXERCISE_MODEL`, `AI_EXERCISE_FALLBACK_MODEL`
  - `AI_SIMULATION_*` (5 env tương tự)
  - `AI_ASSISTANT_*` (5 env tương tự)
  - `PROVIDER` mặc định `'genai'` khi unset/empty. `API_KEYS` parse comma-separated.
- [x] `backend/src/infrastructure/ai/ai-provider-router.ts` class `AiProviderRouter`:
  - Constructor inject `GenaiProvider` (singleton) + `ConfigService`.
  - Method `forFeature(name)` return `IAiProvider`. Build provider lazy lần đầu request, cache theo feature key.
  - Khi `provider === 'genai'` (hoặc unset) → return injected `GenaiProvider`.
  - Khi `provider === 'openai'` → tạo `OpenaiProvider` instance mới với config từ `AI_<F>_BASE_URL`, `AI_<F>_API_KEYS`, `AI_<F>_MODEL`, `AI_<F>_FALLBACK_MODEL`.
- [x] Startup validation: trong `OnModuleInit`, loop qua 3 feature; nếu `provider=openai` mà thiếu `BASE_URL` hoặc `API_KEYS` (rỗng/null) → throw `Error` với message `AI_<FEATURE>_PROVIDER=openai requires AI_<FEATURE>_BASE_URL and AI_<FEATURE>_API_KEYS`. Backend không boot được.
- [x] Fallback model logic ở provider layer:
  - `GenaiProvider`: khi primary model fail (RateLimit pool exhausted / Timeout / ServiceUnavailable), retry 1 lần với `fallbackModel` cùng KeyPool. (Đã có sẵn từ logic `GENAI_CHAT_FALLBACK_MODEL` — verified giữ nguyên.)
  - `OpenaiProvider`: cùng logic, retry với `fallbackModel` truyền vào constructor.
- [x] `ExerciseGenerationService` rewrite:
  - Constructor thay `private genai: GenaiProvider` bằng `private router: AiProviderRouter`.
  - Mọi call `chatStructured(...)` → `router.forFeature('exercise').chatStructured(...)`.
  - `renderPrompt(...)` → `router.renderPrompt(...)` (router delegates to GenaiProvider).
- [x] `ai-provider-router.spec.ts` cases:
  - Feature không có per-feature env → `forFeature('exercise')` returns injected `GenaiProvider` instance.
  - Feature `provider=openai` + đủ env → returns `OpenaiProvider` instance.
  - 2 lần `forFeature('exercise')` cùng config → cùng instance reference (caching verify).
  - `provider=openai` thiếu `BASE_URL` → `OnModuleInit` throw với message chứa tên feature.
  - `provider=openai` thiếu `API_KEYS` → throw tương tự.
  - 2 feature khác nhau cùng `provider=openai` → 2 instance khác nhau.
- [x] `ExerciseGenerationService` existing tests update mock từ `GenaiProvider` → `AiProviderRouter` (mock `forFeature` return fake provider). Tất cả 25 case pass.
- [x] Token `AI_PROVIDER` xóa khỏi `ai.module.ts`. `AgentService` tạm thời inject `GenaiProvider` trực tiếp (replace `@Inject('AI_PROVIDER')` bằng class injection) — sẽ wire qua router ở slice #6.
- [x] `ai.module.ts` export `AiProviderRouter`, `GenaiProvider`, `KeyPool`. `aiRouterConfig` registered trong `app.module.ts`.
- [x] Build, lint, full test suite pass (752 tests, 51 suites). Backend bootstrap với env mặc định (chỉ GEMINI) chạy không lỗi. Bootstrap với `AI_EXERCISE_PROVIDER=openai` thiếu env → fail rõ ràng.

## Blocked by

- `01-refactor-iaiprovider-keypool.md`
- `02-openai-provider-non-streaming.md`

## Implementation notes

### Files created

- `backend/src/config/ai-router.config.ts` — NestJS config namespace `'aiRouter'` với 3 feature blocks (exercise/simulation/assistant), mỗi block có 5 env vars (PROVIDER, BASE_URL, API_KEYS, MODEL, FALLBACK_MODEL). API_KEYS tự parse comma-separated.
- `backend/src/infrastructure/ai/ai-provider-router.ts` — `AiProviderRouter` injectable service: inject `GenaiProvider` + `ConfigService`, `forFeature(name)` lazy-build + cache per feature, startup validation via `OnModuleInit`, `renderPrompt()` delegates to `GenaiProvider`.
- `backend/src/infrastructure/ai/ai-provider-router.spec.ts` — 9 test cases: genai default, openai routing, caching, validation errors (missing BASE_URL/API_KEYS for exercise + simulation), renderPrompt delegation.

### Files modified

- `backend/src/infrastructure/genai/ai.module.ts` — Remove `AI_PROVIDER` token + export, add `AiProviderRouter` as provider + export. `KeyPool`, `GenaiProvider`, `AiProviderRouter` exported.
- `backend/src/app.module.ts` — Add `aiRouterConfig` import + register in `ConfigModule.forRoot({ load: [...] })`.
- `backend/src/modules/exercises/application/exercise-generation.service.ts` — Replace `GenaiProvider` injection with `AiProviderRouter`, all `chatStructured()` calls route via `router.forFeature('exercise')`, all `renderPrompt()` calls via `router.renderPrompt()`. Added dual-format response handling (`{ text }` shape vs direct object).
- `backend/src/modules/exercises/application/exercise-generation.service.spec.ts` — Replace `GenaiProvider` mock with `AiProviderRouter` mock (`forFeature` returns `fakeProvider`, `renderPrompt` mocked). All 25 tests pass.
- `backend/src/modules/agent/application/agent.service.ts` — Remove `@Inject('AI_PROVIDER')` + `IAiProvider` dep, use `genaiService: GenaiProvider` directly for `chat()` + `chatStream()` calls.
- `backend/src/modules/agent/application/agent.service.spec.ts` — Remove `AI_PROVIDER` token mock, add `chat` + `chatStream` to `genaiService` mock. All 32 tests pass.

### Files deleted

None.
