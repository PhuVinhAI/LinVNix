Status: ready-for-agent

# Mobile shell: GlobalAssistantShell + AssistantBar + ScreenContext system

## Parent

[`.scratch/troly-ai/PRD.md`](../PRD.md)

## What to build

A persistent thin assistant bar pinned to the very bottom of every authenticated screen, with a screen-aware placeholder ("Hỏi về bài học?", "Cần gợi ý?", etc.). Tapping it opens an empty `AssistantQuestionSheet` showing the Compose phase only. Send is a no-op for now — full chat lights up in slice #04.

This slice can run **in parallel with backend slices #01 and #02** because nothing here calls the streaming endpoint yet.

- **`ScreenContext`** data class with fields `{ String route, String displayName, String barPlaceholder, Map<String, dynamic> data }` (`freezed` recommended for value semantics).
- **`currentScreenContextProvider`** — global Riverpod provider that auto-computes the current `ScreenContext` from the current `GoRouter` state plus watched domain providers. Pattern: a `ScreenContextBuilder` registry keyed on route family; the provider matches the current route and delegates to the registered builder. Falls back to a generic builder for unregistered routes (returns `{ route, displayName: <route>, barPlaceholder: "Hỏi gì đi nào?", data: {} }`).
- **3 critical builders** (per PRD; others fall back to generic):
  - `homeScreenContextBuilder` for `/` — pulls today's daily-goals snapshot + streak from existing daily-goals providers.
  - `lessonScreenContextBuilder` for `/lessons/:id` — pulls lesson title, content summary, vocab/grammar IDs from existing lesson providers.
  - `exercisePlayScreenContextBuilder` for `/courses/:id/exercises/play/:setId`, `/modules/:id/exercises/play/:setId`, AND `/lessons/:id/exercises/play/:setId` (note: there is no top-level `/exercises/play` in this app — play is always nested) — pulls current exercise question + user's tentative answer (`userAnswer`) from existing exercise providers.
- **`GlobalAssistantShell`** widget — a `Stack` over the route child. Wired into `MaterialApp.router` via the `builder:` parameter (currently unset in `mobile/lib/main.dart`).
- **`AssistantBar`** widget — pinned to the bottom of the screen below `AppNavBar` where it exists (on `/`, `/courses`, `/profile`). Watches `currentScreenContextProvider` for the placeholder text.
- **Visibility logic** — bar is hidden on these route paths: `/splash`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/reset-password-otp`, `/onboarding`. Visible on every other authenticated route, including exercise play screens.
- **Empty `AssistantQuestionSheet`** — opens when bar is tapped or swiped up. Shows Compose phase: a textarea (≤ 5 lines) + a Send button. Tapping Send is a no-op for now (logs a TODO). The state machine and SSE wiring come in #04. The sheet may be dismissed by tap-outside, drag-down, or a small "−" button.
- **Add `flutter_markdown` to `pubspec.yaml`** — used in #04 for rendering AI markdown; declaring early avoids a separate dependency-bump PR.

## Acceptance criteria

- [ ] `ScreenContext` class exists with the 4 fields (PRD shape)
- [ ] `currentScreenContextProvider` exists and recomputes when underlying domain providers change (verifiable by overriding a domain provider in tests and observing the new ScreenContext)
- [ ] 3 critical `ScreenContextBuilder` unit tests pass using `flutter_test` + `ProviderContainer.overrides` for the watched providers (asserts `route`, `displayName`, `barPlaceholder`, and the keys of `data`)
- [ ] `GlobalAssistantShell` is wired via `MaterialApp.router(builder: ...)` in `mobile/lib/main.dart`
- [ ] `AssistantBar` appears on `/`, `/courses`, `/courses/:id`, `/courses/:id/exercises/play/:setId`, `/modules/:id`, `/modules/:id/exercises/play/:setId`, `/lessons/:id`, `/lessons/:id/exercises`, `/lessons/:id/exercises/play/:setId`, `/bookmarks`, `/bookmarks/flashcard`, `/profile` (manual smoke test sufficient)
- [ ] `AssistantBar` is hidden on `/splash`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/reset-password-otp`, `/onboarding`
- [ ] Placeholder text differs at minimum on home / lesson / exercise-play (manual smoke test sufficient)
- [ ] Tapping the bar opens an empty Compose sheet; Send is a no-op
- [ ] `flutter_markdown` is in `mobile/pubspec.yaml`
- [ ] `cd mobile && flutter analyze && flutter test` pass
- [ ] No regression in existing widget tests (`mobile/test/`)

## Blocked by

None - can start immediately (parallel to #01 and #02)
