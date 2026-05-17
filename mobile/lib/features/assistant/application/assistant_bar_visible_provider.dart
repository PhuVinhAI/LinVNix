import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/providers.dart';

/// Reactive provider for the learner's assistant-bar visibility preference.
///
/// - Reads the persisted value from [PreferencesService] on first watch.
/// - Defaults to `true` (bar visible) when the key has never been set,
///   so existing users are unaffected by the feature launch.
/// - Exposes [AssistantBarVisibleNotifier.setVisible] to toggle and
///   persist in a single call — widgets only call that, never touch
///   SharedPreferences directly.
final assistantBarVisibleProvider =
    NotifierProvider<AssistantBarVisibleNotifier, bool>(
  AssistantBarVisibleNotifier.new,
);

class AssistantBarVisibleNotifier extends Notifier<bool> {
  @override
  bool build() {
    final prefsAsync = ref.watch(preferencesProvider);
    return prefsAsync.whenOrNull(
          data: (prefs) => prefs.assistantBarVisible,
        ) ??
        true; // default: visible
  }

  /// Persists the preference and updates state immediately so the UI
  /// reacts without waiting for a SharedPreferences round-trip.
  Future<void> setVisible(bool visible) async {
    state = visible;
    final prefs = await ref.read(preferencesProvider.future);
    await prefs.setAssistantBarVisible(visible);
  }
}
