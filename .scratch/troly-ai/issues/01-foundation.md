Status: ready-for-agent

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

- [ ] Existing dev DB auto-syncs to the new shape with `synchronize: true`; no migration file required for V1
- [ ] `Conversation` entity has `screenContext: jsonb` and `title: varchar` columns
- [ ] `Conversation.status` column and `ConversationStatus` enum file are removed; references in services / DTOs / tests are gone
- [ ] `ConversationMessage.interrupted: boolean default false` exists
- [ ] `BaseTool.execute(params, ctx: ToolContext)` shape applied; `ToolContext` exported from shared package
- [ ] `EchoTool` updated to new signature with no behavioral change
- [ ] `AgentService.runTurn` passes a fully-populated `ToolContext` to every `tool.execute` call (covered by an updated `agent.service.spec.ts`)
- [ ] `backend/src/infrastructure/genai/prompts/assistant-tutor.yaml` exists with the placeholders documented in PRD
- [ ] `GenaiService.renderPrompt('assistant-tutor', { user: {...}, screenContext: {...} })` returns substituted prompt; placeholder substitution covered by an existing or new spec test
- [ ] `cd backend && bun run lint && bun run typecheck && bun run test && bun run test:e2e` all pass
- [ ] `cd admin && bun run lint && bun run typecheck` still pass (no admin changes expected, but verify nothing leaked)

## Blocked by

None - can start immediately
