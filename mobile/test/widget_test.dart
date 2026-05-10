import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:linvnix/main.dart';
import 'package:linvnix/core/providers/auth_state_provider.dart';

void main() {
  testWidgets('App redirects to login when unauthenticated', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: LinVNixApp()));
    await tester.pumpAndSettle();
    expect(find.text('Sign In'), findsOneWidget);
    expect(find.text('Create Account'), findsOneWidget);
  });

  testWidgets('App shows bottom navigation when authenticated', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateProvider.overrideWith(() => _AuthenticatedAuthNotifier()),
        ],
        child: const LinVNixApp(),
      ),
    );
    await tester.pumpAndSettle();
    // Navigation labels appear in NavigationBar
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.text('Courses'), findsWidgets);
    expect(find.text('Review'), findsWidgets);
    expect(find.text('Profile'), findsWidgets);
  });

  testWidgets('Tapping tabs navigates to correct screens', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateProvider.overrideWith(() => _AuthenticatedAuthNotifier()),
        ],
        child: const LinVNixApp(),
      ),
    );
    await tester.pumpAndSettle();

    // Home tab is selected by default
    expect(find.text('Continue Learning'), findsOneWidget);

    // Tap Courses tab
    await tester.tap(find.descendant(
      of: find.byType(NavigationBar),
      matching: find.text('Courses'),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Courses coming soon'), findsOneWidget);

    // Tap Review tab
    await tester.tap(find.descendant(
      of: find.byType(NavigationBar),
      matching: find.text('Review'),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Vocabulary review coming soon'), findsOneWidget);

    // Tap Profile tab
    await tester.tap(find.descendant(
      of: find.byType(NavigationBar),
      matching: find.text('Profile'),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Profile settings coming soon'), findsOneWidget);
  });
}

class _AuthenticatedAuthNotifier extends AuthNotifier {
  @override
  bool build() => true;
}
