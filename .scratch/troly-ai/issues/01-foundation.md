Status: done

# Backend foundation: schema + ToolContext + assistant-tutor prompt

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

Lay the schema and abstraction groundwork that every later Trợ lý AI slice depends on. No user-visible behavior change yet — but after this slice, the entity shape, tool interface, and prompt template are ready to be lit up by the streaming tracer in slice #02.

Three independent changes:

1. **Conversation schema changes**
   - `Conversation`: ADD `screenContext: jsonb` (default `'{}'::jsonb`), ADD `title: varchar` (default `''`).
   - `Conversation`: DROP `status` column AND remove the `ConversationStatus` enum file. Strip any service code that filters/sets status (e.g. archive flow on `ConversationService`).
   - `Conversation`: KEEP `lessonId` and `courseId` — reinterpret as derived hints. Stop relying on them as semantic identity in any service code; they exist only as denormalized filter columns.
   - `ConversationMessage`: ADD `interrupted: boolean default false`.

2. **ToolContext refactor**
   - In `packages/shared/src/tools/base-tool.ts`, change `execute(params)` to `execute(params, ctx: ToolContext)` where `ToolContext = { userId, conversationId, screenContext, user }`. Export `ToolContext` from the shared package.
   - Update `EchoTool` (and any other concrete tools that exist today) to the new signature — no behavior change.
   - Update `AgentService.runTurn` to construct a `ToolContext` for every turn: load the Conversation owner's `User` entity (`UsersService.findById`) once per turn and pass `{ userId, conversationId, screenContext, user }` to every `tool.execute(params, ctx)` call.

3. **Persona prompt template**
   - Add `backend/src/infrastructure/genai/prompts/assistant-tutor.yaml` matching the PRD persona spec: hard-rule respond in `{{user.nativeLanguage}}`, keep Vietnamese for target vocabulary / examples / quoted lesson content, hint mode (no direct answers) when `{{screenContext.route}}` matches `*/exercises/play/*`, dialect awareness via `{{user.preferredDialect}}`, markdown enabled.
   - Reuse the existing `GenaiService.renderPrompt(templateName, variables)` for substitution. Do **not** introduce a new `SystemPromptRenderer` class — the existing one is sufficient.
   - This slice does NOT yet wire the template into any controller; that happens in #02.

## Acceptance criteria

- [x] Existing dev DB auto-syncs to the new shape with `synchronize: true`; no migration file required for V1
- [x] `Conversation` entity has `screenContext: jsonb` and `title: varchar` columns
- [x] `Conversation.status` column and `ConversationStatus` enum file are removed; references in services / DTOs / tests are gone
- [x] `ConversationMessage.interrupted: boolean default false` exists
- [x] `BaseTool.execute(params, ctx: ToolContext)` shape applied; `ToolContext` exported from shared package
- [x] `EchoTool` updated to new signature with no behavioral change
- [x] `AgentService.runTurn` passes a fully-populated `ToolContext` to every `tool.execute` call (covered by an updated `agent.service.spec.ts`)
- [x] `backend/src/infrastructure/genai/prompts/assistant-tutor.yaml` exists with the placeholders documented in PRD
- [x] `GenaiService.renderPrompt('assistant-tutor', { user: {...}, screenContext: {...} })` returns substituted prompt; placeholder substitution covered by an existing or new spec test
- [~] `cd backend && bun run lint && bun run typecheck && bun run test && bun run test:e2e` all pass — lint/typecheck/unit (420/420) pass; e2e blocked by pre-existing issues unrelated to this slice (see Implementation notes)
- [ ] `cd admin && bun run lint && bun run typecheck` still pass (no admin changes expected, but verify nothing leaked) — skipped per request; no admin files were touched in this slice

## Blocked by

None - can start immediately

## Implementation notes

### Approach

TDD vertical-slice across four blocks: each block paired a failing spec (RED) with the minimal entity / service / module change to turn it green (GREEN). All unit tests run together at the end of each block to catch cross-block regressions early.

- **Block A — schema removal.** Rewrote `conversation.service.spec.ts` first to drop `ConversationStatus` usage and the `archive` test, then stripped status/archive from the service, entity, DTO, and `enums/index.ts`. Deleted `conversation-status.enum.ts` outright.
- **Block B — schema additions.** Added new spec cases asserting `title` / `screenContext` flow through `create()` and that `interrupted` defaults to `false` in `addMessage()`. Added the columns + DTO fields + service wiring to match.
- **Block C — `ToolContext`.** New `tool-context.ts` in the shared package, mutated `BaseTool.execute` to take `(params, ctx)`, exported `ToolContext`, rebuilt the shared dist. Updated shared spec to cover both signature and ctx forwarding. Rewrote `agent.service.spec.ts` to mock `UsersService` and assert the same `ctx` object is reused across every `tool.execute` call in a single turn. Wired `UsersModule` into `AgentModule` so `UsersService` is injectable.
- **Block D — prompt template.** Taught `GenaiService.renderPrompt` to flatten nested variable objects into dot-notation keys (so `{ user: { nativeLanguage } }` resolves `{{user.nativeLanguage}}`) — backward-compatible with existing flat callers. Added a separate spec (`assistant-tutor-prompt.spec.ts`) that loads the real YAML from disk and asserts the persona, hint-mode rule, hard language rule, and all placeholders render correctly.

### Verification

- `cd packages/shared && bun run build && bun run test` → 34/34 green (added ToolContext + signature tests).
- `cd backend && bun run lint` → 0 errors, 1103 warnings (all pre-existing).
- `cd backend && bun run typecheck` → green.
- `cd backend && bun run test` → 420/420 green across 28 suites (includes the rewritten `conversation.service`, `ai.controller`, `agent.service`, `genai.service`, and the new `assistant-tutor-prompt` specs).
- `cd backend && bun run test:e2e` → blocked by pre-existing issues:
  1. `uuid@13` is ESM-only and choked `ts-jest` at parse time, blocking every e2e suite from even loading. Fixed in this slice with a minimal CJS shim wired via `moduleNameMapper`; this is the only e2e infrastructure change.
  2. After the parse-time fix, four suites still fail for reasons that exist on `main` and are unrelated to this slice: (a) `daily-streak.e2e-spec.ts` imports from `../../src/...` which escapes the `backend/` workspace root; (b) `module-custom-practice`, `course-custom-practice`, `bypass-completion` insert `lessonType: 'VOCABULARY'` literal which doesn't match the lowercase `LessonType` enum values; (c) `app.e2e-spec.ts` hangs on tear-down (Bull/Redis workers don't unref). None of these touch `conversations`, `agent`, `genai`, or the shared package, so the slice's behavior is verified through the comprehensive unit-test suite. The e2e fixes belong in a separate follow-up (recommended for the issue tracker).

### Files created

- `packages/shared/src/tools/tool-context.ts` — new `ToolContext<TUser>` interface with `userId`, `conversationId`, `screenContext`, `user`; carries the per-turn execution scope so tools never receive `userId` as an LLM-controlled parameter.
- `backend/src/infrastructure/genai/prompts/assistant-tutor.yaml` — the persona prompt template described in the PRD. Hard rule "respond in `{{user.nativeLanguage}}`", Vietnamese reserved for target vocab / examples / quoted lesson content, dialect awareness, hint mode keyed off `*/exercises/play/*`, markdown enabled.
- `backend/src/infrastructure/genai/assistant-tutor-prompt.spec.ts` — load-from-disk integration spec covering persona presence, nested placeholder substitution, hint-mode rule, hard language rule, markdown enablement, and the file location itself.
- `backend/test/mocks/uuid.cjs` — CJS shim around Node's `randomUUID` so `ts-jest` can resolve the ESM-only `uuid@13` package from e2e suites.

### Files modified

- `packages/shared/src/tools/base-tool.ts` — `execute(params)` → `execute(params, ctx: ToolContext)`.
- `packages/shared/src/index.ts` — re-export `ToolContext` type.
- `packages/shared/src/__tests/shared.spec.ts` — updated `TestTool`/`NestedTool` to the new signature; added `CtxAwareTool` covering ctx forwarding and a `Type contracts` case for `ToolContext`.
- `backend/src/modules/conversations/domain/conversation.entity.ts` — dropped `status`; added `title: varchar default ''` and `screenContext: jsonb default '{}'::jsonb`; removed `ConversationStatus` import.
- `backend/src/modules/conversations/domain/conversation-message.entity.ts` — added `interrupted: boolean default false`.
- `backend/src/modules/conversations/dto/create-conversation.dto.ts` — added optional `title?` and `screenContext?`.
- `backend/src/modules/conversations/dto/add-message.dto.ts` — added optional `interrupted?`.
- `backend/src/modules/conversations/application/conversation.service.ts` — stopped setting/filtering `status`; forwards `title` / `screenContext` on create; persists `interrupted` on `addMessage`; removed `archive()`; `softDelete()` now just soft-deletes without the status hop.
- `backend/src/modules/conversations/application/conversation.service.spec.ts` — rewritten: dropped `ConversationStatus`/`archive` tests, added cases for `title`, `screenContext`, and `interrupted` round-tripping through `create` / `addMessage`.
- `backend/src/common/enums/index.ts` — removed the `conversation-status.enum` re-export.
- `backend/src/modules/agent/tools/echo.tool.ts` — implemented the new `(params, ctx)` signature; behavior unchanged.
- `backend/src/modules/agent/application/agent.service.ts` — injected `UsersService`; loads the conversation owner once per turn; constructs the `ToolContext` once and forwards it to every `tool.execute(params, ctx)` call; falls back to `{}` for `screenContext` when the conversation has none yet.
- `backend/src/modules/agent/agent.module.ts` — imports `UsersModule` so `UsersService` is injectable into `AgentService`.
- `backend/src/modules/agent/application/agent.service.spec.ts` — rewritten: mocks `UsersService`, fixture conversations carry `screenContext`, new cases assert ctx shape, ctx reuse across multi-tool turns, and the `screenContext ?? {}` fallback. Dropped all `ConversationStatus` usage.
- `backend/src/modules/ai/presentation/ai.controller.spec.ts` — dropped `ConversationStatus` import, `status: ACTIVE` from the mock fixture, and `archive` from the `jest.Mocked` shape.
- `backend/src/infrastructure/genai/genai.service.ts` — `renderPrompt` now accepts `Record<string, any>` and flattens nested objects with a private `flattenVariables` helper (dot-notation, regex-escaped). Backward compatible with existing flat-key callers.
- `backend/src/infrastructure/genai/genai.service.spec.ts` — added a `with a loaded template` describe block covering flat keys, nested dot-notation keys, null/undefined coercion, and unsubstituted placeholders. Switched from `require('fs')` to a top-level `import * as fs`.
- `backend/test/jest-e2e.json` — added `moduleNameMapper` pointing `uuid` at the new CJS shim.

### Files deleted

- `backend/src/common/enums/conversation-status.enum.ts` — enum and column removed; CONTEXT.md already documented this as deprecated.
