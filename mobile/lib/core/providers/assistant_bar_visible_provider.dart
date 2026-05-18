import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';

final assistantBarVisibleProvider =
    NotifierProvider<AssistantBarVisibleNotifier, bool>(
      AssistantBarVisibleNotifier.new,
    );

class AssistantBarVisibleNotifier extends Notifier<bool> {
  @override
  bool build() {
    final prefsAsync = ref.watch(preferencesProvider);
    return prefsAsync.whenOrNull(data: (prefs) => prefs.assistantBarVisible) ??
        true;
  }

  Future<void> setVisible(bool visible) async {
    state = visible;
    final prefs = await ref.read(preferencesProvider.future);
    await prefs.setAssistantBarVisible(visible);
  }
}
