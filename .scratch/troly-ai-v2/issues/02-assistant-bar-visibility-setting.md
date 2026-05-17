Status: ready-for-agent

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Add a learner preference to show or hide the Thanh Trợ lý AI. When hidden, the bar is not rendered at all — no visual trace of the assistant, no alternative entry point. The feature is off entirely.

`PreferencesService` adds key `assistant_bar_visible` (bool, default true). A new Riverpod provider `assistantBarVisibleProvider` derives from `preferencesProvider`. `GlobalAssistantShell.build()` checks the provider — when false, returns `widget.child` without the `AssistantBar`. The profile screen gets a toggle row "Hiện thanh Trợ lý AI" in the settings section (below theme selector), bound to the provider.

Stream-safe behavior: the toggle writes the preference immediately; the shell reads it reactively. If the preference is off but a Full screen is open, the shell does NOT force-close it — the learner closes it manually. The bar simply won't appear on the next collapsed state or new screen.

## Acceptance criteria

- [ ] `PreferencesService` has `assistantBarVisible` getter (default true) and `setAssistantBarVisible(bool)` setter
- [ ] `assistantBarVisibleProvider` Riverpod provider exists and reacts to preference changes
- [ ] `GlobalAssistantShell` hides `AssistantBar` entirely when preference is false (no visual trace)
- [ ] Profile screen has toggle "Hiện thanh Trợ lý AI" in settings section, bound to provider
- [ ] Default is visible (bar shows for existing users without the preference set)
- [ ] Toggling off while stream active: preference saves immediately, bar disappears after current stream completes / Full screen closed manually
- [ ] When hidden, no alternative entry point to the assistant exists

## Blocked by

None - can start immediately
