import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/core/storage/preferences_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('PreferencesService assistant bar visibility', () {
    test('defaults to visible when preference is missing', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      final service = PreferencesService(prefs);

      expect(service.assistantBarVisible, isTrue);
    });

    test('persists hidden and visible states', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final service = PreferencesService(prefs);

      await service.setAssistantBarVisible(false);

      expect(service.assistantBarVisible, isFalse);

      await service.setAssistantBarVisible(true);

      expect(service.assistantBarVisible, isTrue);
    });
  });
}
