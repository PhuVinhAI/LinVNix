import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:linvnix/main.dart';
import 'package:linvnix/core/providers/auth_state_provider.dart';
import 'package:linvnix/core/providers/providers.dart';
import 'package:linvnix/core/storage/preferences_service.dart';

void main() {
  setUpAll(() async {
    try {
      await dotenv.load(fileName: '.env');
    } catch (_) {
      // ignore
    }
  });

  group('Unauthenticated', () {
    late PreferencesService prefsService;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      prefsService = PreferencesService(prefs);
    });

    testWidgets('App redirects to login when unauthenticated', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            preferencesProvider.overrideWith(() => PreloadedPreferencesNotifier(prefsService)),
          ],
          child: const LinVNixApp(),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Create Account'), findsOneWidget);
    });
  });

  group('Authenticated', () {
    late PreferencesService prefsService;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      prefsService = PreferencesService(prefs);
    });

    testWidgets('App shows bottom navigation when authenticated', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            preferencesProvider.overrideWith(() => PreloadedPreferencesNotifier(prefsService)),
            authStateProvider.overrideWith(() => _AuthenticatedAuthNotifier()),
          ],
          child: const LinVNixApp(),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(NavigationBar), findsOneWidget);
      expect(find.text('Courses'), findsWidgets);
    });

    testWidgets('Tapping tabs navigates to correct screens', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            preferencesProvider.overrideWith(() => PreloadedPreferencesNotifier(prefsService)),
            authStateProvider.overrideWith(() => _AuthenticatedAuthNotifier()),
          ],
          child: const LinVNixApp(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Continue Learning'), findsOneWidget);

      await tester.tap(find.descendant(
        of: find.byType(NavigationBar),
        matching: find.text('Courses'),
      ));
      await tester.pumpAndSettle();
      expect(find.text('Courses coming soon'), findsOneWidget);
    });
  });
}

class _AuthenticatedAuthNotifier extends AuthNotifier {
  @override
  AuthState build() => const AuthState(isAuthenticated: true, isInitialized: true);
}