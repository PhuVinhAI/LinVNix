# Wire `SimulationAiService` qua `AiProviderRouter`

Type: AFK
Covers user stories: 2

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Wire feature thứ 2 (Hội thoại mô phỏng — non-streaming structured) qua router. Mục đích confirm pattern Router hoạt động cho thêm 1 service mà không cần thay đổi gì ở layer router/provider — pure consumer change. Sau slice này, `AI_SIMULATION_PROVIDER=openai` cũng work end-to-end.

## Acceptance criteria

- [ ] `SimulationAiService` (`backend/src/modules/simulations/application/simulation-ai.service.ts`) constructor thay `private genai: GenaiProvider` (hoặc `GenaiService`) bằng `private router: AiProviderRouter`.
- [ ] Mọi call `chatStructured(...)` → `router.forFeature('simulation').chatStructured(...)`.
- [ ] Existing tests cho `SimulationAiService` (nếu có) update mock từ `GenaiProvider` → mock `AiProviderRouter.forFeature` return fake provider. Tất cả case pass.
- [ ] `SimulationsModule` import `AiModule` (nếu chưa).
- [ ] Smoke verify: default env (no `AI_SIMULATION_*`) → simulation feature dùng Gemini như trước.
- [ ] Manual / dev verify: set `AI_SIMULATION_PROVIDER=openai` + LM Studio local (hoặc OpenRouter gateway) → tạo simulation, response trả về normal.
- [ ] Build, lint, tests pass.

## Blocked by

- `03-router-and-exercise-wiring.md`
