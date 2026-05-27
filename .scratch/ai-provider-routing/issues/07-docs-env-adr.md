# Docs: `.env.example` đầy đủ + README section + ADR 0001

Type: AFK
Status: Done
Covers user stories: 15, 22

## Parent

`.scratch/ai-provider-routing/PRD.md`

## What to build

Văn bản hoá quyết định và migration. Không thay đổi code runtime. Sau slice này, một developer hoặc DevOps mới đọc `.env.example` + README + ADR là đủ hiểu cách config multi-provider AI.

3 file deliverable:

1. **`.env.example`**: viết đầy đủ block Gemini global (default cho mọi feature) + 3 block per-feature OpenAI commented-out với inline comment giải thích từng env var.
2. **`README.md`**: thêm section "AI Provider Configuration" mô tả 3 chế độ (default Gemini, opt-in per-feature OpenAI, mix), link tới ADR.
3. **`docs/adr/0001-multi-provider-ai-routing.md`**: directory `docs/adr/` chưa tồn tại — tạo mới. ADR record 3 tradeoff chính.

## Acceptance criteria

- [x] `.env.example` chứa block Gemini global với comment header `# Default AI provider — used by any feature when AI_<FEATURE>_PROVIDER is not set`:
  - `GEMINI_API_KEY=`
  - `GENAI_API_KEYS=`
  - `GENAI_CHAT_MODEL=gemini-2.5-flash`
  - `GENAI_CHAT_FALLBACK_MODEL=gemini-2.0-flash`
  - `GENAI_MAX_RETRIES=2`
  - `GENAI_TIMEOUT=30000`
- [x] `.env.example` chứa 3 block per-feature OpenAI (Exercise, Simulation, Assistant), mỗi block commented bằng `#`, mỗi env có 1 dòng comment giải thích. Ví dụ format:
  ```
  # --- Exercise generation (optional OpenAI override) ---
  # AI_EXERCISE_PROVIDER=openai           # genai | openai (default: genai)
  # AI_EXERCISE_BASE_URL=https://openrouter.ai/api/v1
  # AI_EXERCISE_API_KEYS=sk-or-k1,sk-or-k2
  # AI_EXERCISE_MODEL=anthropic/claude-3-haiku
  # AI_EXERCISE_FALLBACK_MODEL=
  ```
- [x] `.env.example` có warning rõ ràng cho assistant: `# WARNING: Set AI_ASSISTANT_PROVIDER=openai chỉ khi model gateway hỗ trợ tool calling. Nếu không, Trợ lý AI sẽ thành text-only chat (agent loop kết thúc sớm).`
- [x] `README.md` thêm section `## AI Provider Configuration`:
  - Mô tả 3 chế độ vận hành (default Gemini, per-feature OpenAI, mix).
  - Bảng 3 feature `exercise | simulation | assistant` × hỗ trợ provider.
  - Lưu ý `image_analysis` locked Gemini.
  - Link tới `docs/adr/0001-multi-provider-ai-routing.md`.
- [x] `docs/adr/` directory mới (tạo `docs/adr/README.md` ngắn nói về ADR convention là plus, không bắt buộc).
- [x] `docs/adr/0001-multi-provider-ai-routing.md` theo format ADR chuẩn (Title, Status: Accepted, Date: 2026-05-27, Context, Decision, Consequences) record 3 tradeoff PRD chỉ ra:
  1. **Inline per-feature env** vs named providers + mapping — chọn anti-magic, dễ onboard, chấp nhận lặp key/url khi multiple feature dùng cùng gateway.
  2. **Within-provider fallback only** — chọn predictability hơn resilience cross-provider, tránh bug do format khác biệt.
  3. **`ImageAnalysisService` bypass router** — chọn simplicity, chấp nhận inconsistent inject pattern, tránh dummy entry "locked genai".
- [x] Không thay đổi code runtime. Không thay đổi test.
- [x] `bun run build` (hoặc tương đương) vẫn pass — đảm bảo không gãy gì.

## Blocked by

- `06-wire-agent.md`

## Implementation notes

### Files created

- `docs/adr/README.md` — ADR index với format convention (MADR) và table of contents.
- `docs/adr/0001-multi-provider-ai-routing.md` — ADR ghi lại 3 tradeoff: inline per-feature env, within-provider fallback only, ImageAnalysisService bypass router.

### Files modified

- `backend/.env.example` — Đổi header Gemini global thành `# Default AI provider — used by any feature when AI_<FEATURE>_PROVIDER is not set`; thêm 3 block per-feature OpenAI (exercise, simulation, assistant) hoàn toàn commented-out với inline comment cho mỗi env var; thêm WARNING cho assistant về tool calling.
- `README.md` — Thêm section `## AI Provider Configuration` trước `## Tài liệu` mô tả 3 chế độ vận hành, bảng feature × provider, caveat assistant, link ADR. Thêm link ADR vào list `## Tài liệu`.
- `.scratch/ai-provider-routing/issues/07-docs-env-adr.md` — Cập nhật Status: Done, tick tất cả acceptance criteria, thêm Implementation notes này.

### Files deleted

_(none)_

### Verification

- `bun run lint`: 0 errors (1772 pre-existing warnings, không liên quan).
- `bun run typecheck`: clean (0 errors).
- `bun run test`: 757/757 passed, 51 suites.
