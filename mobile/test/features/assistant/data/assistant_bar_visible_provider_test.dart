import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/core/providers/assistant_bar_visible_provider.dart';
import 'package:linvnix/core/providers/providers.dart';
import 'package:linvnix/core/storage/preferences_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('assistantBarVisibleProvider', () {
    late PreferencesService prefsService;
    late ProviderContainer container;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      prefsService = PreferencesService(prefs);
      container = ProviderContainer(
        overrides: [
          preferencesProvider.overrideWith(
            () => PreloadedPreferencesNotifier(prefsService),
          ),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('defaults to visible from preferences', () {
      expect(container.read(assistantBarVisibleProvider), isTrue);
    });

    test('saves preference and updates consumers reactively', () async {
      final values = <bool>[];
      final subscription = container.listen(
        assistantBarVisibleProvider,
        (_, next) => values.add(next),
        fireImmediately: true,
      );
      addTearDown(subscription.close);

      await container
          .read(assistantBarVisibleProvider.notifier)
          .setVisible(false);

      expect(prefsService.assistantBarVisible, isFalse);
      expect(container.read(assistantBarVisibleProvider), isFalse);
      expect(values, [true, false]);
    });
  });
}
