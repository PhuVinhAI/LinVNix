# Refactor: nâng `chatStructured()` vào `IAiProvider`, generalize KeyPool, tách Genai errors

Type: AFK
Covers user stories: 8, 9, 17, 20

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Chuẩn bị nền tảng cho multi-provider routing. **Không thay đổi behavior runtime** — purely structural refactor. Sau slice này:

- `IAiProvider` (đang ở `packages/shared/src/types/provider.ts`) có method `chatStructured()` trong contract. Hiện `chatStructured()` chỉ tồn tại như private method trên `GenaiService` (`backend/src/infrastructure/genai/genai.service.ts`) và được gọi qua casting — code smell PRD đã chỉ ra.
- `KeyPool` provider-agnostic, di chuyển sang `backend/src/infrastructure/ai/key-pool.ts`. Constructor nhận 2 callback `isRateLimitError(err): boolean` và `getCooldownMs(err): number` thay vì hardcode `statusCode === 429` + `BASE_COOLDOWN_MS = 30s`.
- Error mapping Gemini tách ra `backend/src/infrastructure/genai/genai-errors.ts` (hiện inline ở `mapSdkError()` lines 576-594).
- `MethodNotSupportedException` thêm vào `backend/src/infrastructure/genai/ai.exceptions.ts` (chưa tồn tại).
- `GenaiService` rename → `GenaiProvider`, depend on extracted KeyPool + errors, vẫn implement `IAiProvider`.
- `genai.module.ts` rename → `ai.module.ts`, scope rộng hơn cho slice sau.

Token `AI_PROVIDER` tạm thời giữ lại làm alias `useExisting: GenaiProvider` để `AgentService` không break — sẽ xóa ở slice #3.

## Acceptance criteria

- [ ] `IAiProvider` thêm `chatStructured<T>(messages, schema, options): Promise<T>` đúng signature hiện đang dùng ở `ExerciseGenerationService`, `SimulationAiService`, `ImageAnalysisService`.
- [ ] `MethodNotSupportedException extends AiException` xuất từ `ai.exceptions.ts`.
- [ ] `backend/src/infrastructure/ai/key-pool.ts` tồn tại; constructor signature `(options: { keys: string[], isRateLimitError: (err) => boolean, getCooldownMs: (err) => number })`. Không reference Gemini/Google.
- [ ] `infrastructure/genai/genai-errors.ts` export: `mapGenaiError(err): AiException`, `isGenaiRateLimitError(err): boolean`, `getGenaiCooldownMs(err): number`.
- [ ] `GenaiProvider` (rename từ `GenaiService`):
  - implements `IAiProvider` đầy đủ (kể cả `chatStructured()` giờ là public).
  - inject `KeyPool` instance được build với callbacks từ `genai-errors.ts`.
  - sử dụng `mapGenaiError()` thay vì inline `mapSdkError()`.
- [ ] `key-pool.spec.ts` di chuyển sang folder mới, viết lại với fake keys + fake callbacks, không mock Gemini SDK. Cases:
  - Rotate qua nhiều key tuần tự.
  - Mark key cooldown khi `isRateLimitError(err) === true`, skip key đó trong cooldown window.
  - Tất cả key rate-limited → throw `AiRateLimitException`.
  - Recover khi cooldown hết hạn.
- [ ] `genai.service.spec.ts` rename → `genai-provider.spec.ts`. Tất cả case cũ pass + thêm case verify `chatStructured()` qua interface.
- [ ] `ai.module.ts` (rename) export `GenaiProvider`, `KeyPool`. Token `AI_PROVIDER` alias `useExisting: GenaiProvider` (giữ tạm).
- [ ] Domain service `ExerciseGenerationService`, `SimulationAiService`, `AgentService`, `ImageAnalysisService` không cần đổi — NestJS DI vẫn resolve qua class rename (kiểm tra: rename xong các service đang inject `GenaiService` sẽ break, cần update import + tên class).
- [ ] `backend` build pass, lint pass, full test suite pass.

## Blocked by

None - can start immediately
