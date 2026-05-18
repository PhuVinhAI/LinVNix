Status: ready-for-human

## Parent

.scratch/troly-ai-v2/PRD.md

## What to build

Add a learner preference to show or hide the Thanh Trợ lý AI. When hidden, the bar is not rendered at all — no visual trace of the assistant, no alternative entry point. The feature is off entirely.

`PreferencesService` adds key `assistant_bar_visible` (bool, default true). A new Riverpod provider `assistantBarVisibleProvider` derives from `preferencesProvider`. `GlobalAssistantShell.build()` checks the provider — when false, returns `widget.child` without the `AssistantBar`. The profile screen gets a toggle row "Hiện thanh Trợ lý AI" in the settings section (below theme selector), bound to the provider.

Stream-safe behavior: the toggle writes the preference immediately; the shell reads it reactively. If the preference is off but a Full screen is open, the shell does NOT force-close it — the learner closes it manually. The bar simply won't appear on the next collapsed state or new screen.

## Acceptance criteria

- [x] `PreferencesService` has `assistantBarVisible` getter (default true) and `setAssistantBarVisible(bool)` setter
- [x] `assistantBarVisibleProvider` Riverpod provider exists and reacts to preference changes
- [x] `GlobalAssistantShell` hides `AssistantBar` entirely when preference is false (no visual trace)
- [x] Profile screen has toggle "Hiện thanh Trợ lý AI" in settings section, bound to provider
- [x] Default is visible (bar shows for existing users without the preference set)
- [x] Toggling off while stream active: preference saves immediately, bar disappears after current stream completes / Full screen closed manually
- [x] When hidden, no alternative entry point to the assistant exists

## Blocked by

None - can start immediately

## Implementation notes

Implemented the mobile learner preference for `assistant_bar_visible` with reactive Riverpod state, shell-level rendering gates, and a profile settings toggle. The default remains visible for existing users without the preference key. When the preference is turned off while the assistant is active, the preference is saved immediately; the shell keeps the current Mid stream or Full screen mounted until it finishes/closes, then the collapsed bar no longer appears.

Validation:

- `flutter test test/core/storage/preferences_service_test.dart test/features/assistant/data/assistant_bar_visible_provider_test.dart test/features/assistant/presentation/assistant_visibility_test.dart test/features/assistant/presentation/global_assistant_shell_test.dart test/features/profile/presentation/widgets/assistant_bar_visibility_setting_test.dart` passed.
- `dart analyze` on changed Dart files passed.
- `flutter analyze` still fails on pre-existing unrelated warnings/info outside this slice.
- `flutter test` still fails in pre-existing stale `test/widget_test.dart` app-shell expectations/timeouts; focused tests for this slice pass.

Files created:

- `mobile/lib/core/providers/assistant_bar_visible_provider.dart` — adds `assistantBarVisibleProvider` and setter-backed notifier.
- `mobile/lib/features/profile/presentation/widgets/assistant_bar_visibility_setting.dart` — adds reusable profile toggle row bound to the provider.
- `mobile/test/core/storage/preferences_service_test.dart` — verifies default true and persisted visibility values.
- `mobile/test/features/assistant/data/assistant_bar_visible_provider_test.dart` — verifies provider default and reactive updates.
- `mobile/test/features/assistant/presentation/global_assistant_shell_test.dart` — verifies shell renders or omits `AssistantBar` by preference.
- `mobile/test/features/profile/presentation/widgets/assistant_bar_visibility_setting_test.dart` — verifies profile toggle label and persistence.

Files modified:

- `mobile/lib/core/storage/preferences_service.dart` — adds `assistant_bar_visible` SharedPreferences key, getter, and setter.
- `mobile/lib/features/assistant/presentation/assistant_visibility.dart` — adds combined route/preference/active-state render predicate.
- `mobile/lib/features/assistant/presentation/global_assistant_shell.dart` — reads the preference and active assistant state before rendering the bar shell.
- `mobile/lib/features/assistant/presentation/widgets/assistant_bar.dart` — guards direct bar rendering with the same preference/active-state predicate.
- `mobile/lib/features/profile/presentation/screens/profile_screen.dart` — inserts the assistant visibility toggle below the theme selector.
- `mobile/test/features/assistant/presentation/assistant_visibility_test.dart` — adds tests for preference and active stream/Full-screen behavior.
- `.scratch/troly-ai-v2/issues/02-assistant-bar-visibility-setting.md` — updates status, acceptance criteria, and implementation notes.

Files deleted:

- None.