import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:linvnix/core/providers/providers.dart';
import 'package:linvnix/core/router/app_router.dart';
import 'package:linvnix/core/storage/preferences_service.dart';
import 'package:linvnix/core/theme/app_theme.dart';
import 'package:linvnix/features/assistant/data/route_match.dart' as assistant;
import 'package:linvnix/features/assistant/data/screen_context_provider.dart';
import 'package:linvnix/features/assistant/presentation/global_assistant_shell.dart';
import 'package:linvnix/features/assistant/presentation/widgets/assistant_bar.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('GlobalAssistantShell assistant bar visibility preference', () {
    testWidgets('renders AssistantBar by default on visible routes', (
      tester,
    ) async {
      final prefsService = await _prefsService({});
      final container = _container(prefsService);
      addTearDown(container.dispose);

      await tester.pumpWidget(
        _TestApp(
          container: container,
          child: const GlobalAssistantShell(child: Text('Route content')),
        ),
      );
      await tester.pump();

      expect(find.byType(AssistantBar), findsOneWidget);
      expect(find.text('Route content'), findsOneWidget);
    });

    testWidgets('does not render AssistantBar when preference is false', (
      tester,
    ) async {
      final prefsService = await _prefsService({
        'assistant_bar_visible': false,
      });
      final container = _container(prefsService);
      addTearDown(container.dispose);

      await tester.pumpWidget(
        _TestApp(
          container: container,
          child: const GlobalAssistantShell(child: Text('Route content')),
        ),
      );
      await tester.pump();

      expect(find.byType(AssistantBar), findsNothing);
      expect(find.text('Route content'), findsOneWidget);
    });
  });
}

Future<PreferencesService> _prefsService(Map<String, Object> values) async {
  SharedPreferences.setMockInitialValues(values);
  final prefs = await SharedPreferences.getInstance();
  return PreferencesService(prefs);
}

ProviderContainer _container(PreferencesService prefsService) {
  final router = GoRouter(
    routes: [
      GoRoute(path: '/', builder: (context, state) => const SizedBox.shrink()),
    ],
  );
  final container = ProviderContainer(
    overrides: [
      preferencesProvider.overrideWith(
        () => PreloadedPreferencesNotifier(prefsService),
      ),
      routerProvider.overrideWithValue(router),
    ],
  );
  container
      .read(currentRouteMatchProvider.notifier)
      .update(const assistant.RouteMatch(routePattern: '/', location: '/'));
  return container;
}

class _TestApp extends StatelessWidget {
  const _TestApp({required this.container, required this.child});

  final ProviderContainer container;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return UncontrolledProviderScope(
      container: container,
      child: MaterialApp(
        theme: AppTheme.light(),
        home: Scaffold(body: child),
      ),
    );
  }
}
