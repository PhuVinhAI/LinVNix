import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/core/providers/providers.dart';
import 'package:linvnix/core/storage/preferences_service.dart';
import 'package:linvnix/core/theme/app_theme.dart';
import 'package:linvnix/features/profile/presentation/widgets/assistant_bar_visibility_setting.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('AssistantBarVisibilitySetting', () {
    testWidgets('shows Vietnamese toggle label and saves changes', (
      tester,
    ) async {
      SharedPreferences.setMockInitialValues({});
      final sharedPreferences = await SharedPreferences.getInstance();
      final prefsService = PreferencesService(sharedPreferences);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            preferencesProvider.overrideWith(
              () => PreloadedPreferencesNotifier(prefsService),
            ),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const Scaffold(body: AssistantBarVisibilitySetting()),
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Hiện thanh Trợ lý AI'), findsOneWidget);
      expect(tester.widget<Switch>(find.byType(Switch)).value, isTrue);

      await tester.tap(find.byType(Switch));
      await tester.pump();

      expect(prefsService.assistantBarVisible, isFalse);
      expect(tester.widget<Switch>(find.byType(Switch)).value, isFalse);
    });
  });
}
