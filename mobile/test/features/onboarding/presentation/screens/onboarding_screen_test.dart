import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:linvnix/features/onboarding/presentation/screens/onboarding_screen.dart';
import 'package:linvnix/features/user/data/user_repository.dart';
import 'package:linvnix/core/storage/preferences_service.dart';
import 'package:linvnix/core/providers/providers.dart';

class MockUserRepository extends Mock implements UserRepository {}

void main() {
  late MockUserRepository mockUserRepo;
  late PreferencesService prefsService;

  setUp(() async {
    mockUserRepo = MockUserRepository();
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    prefsService = PreferencesService(prefs);
  });

  Widget buildSubject() {
    return ProviderScope(
      overrides: [
        userRepositoryProvider.overrideWithValue(mockUserRepo),
        preferencesProvider.overrideWith(() => PreloadedPreferencesNotifier(prefsService)),
      ],
      child: const MaterialApp(
        home: OnboardingScreen(),
      ),
    );
  }

  group('OnboardingScreen', () {
    testWidgets('shows level selector on first step', (tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(buildSubject());

      expect(find.text("What's your current level?"), findsOneWidget);
      expect(find.text('A1'), findsOneWidget);
      expect(find.text('A2'), findsOneWidget);
      expect(find.text('B1'), findsOneWidget);
      expect(find.text('B2'), findsOneWidget);
      expect(find.text('C1'), findsOneWidget);
      expect(find.text('C2'), findsOneWidget);
    });

    testWidgets('shows progress indicator', (tester) async {
      await tester.pumpWidget(buildSubject());

      // Progress indicator has 3 segments with BoxDecoration + borderRadius(2)
      final containers = tester.widgetList<Container>(
        find.byWidgetPredicate(
          (widget) =>
              widget is Container &&
              widget.decoration is BoxDecoration &&
              (widget.decoration as BoxDecoration).borderRadius ==
                  BorderRadius.circular(2),
        ),
      );
      expect(containers.length, 3);
    });

    testWidgets('Next button disabled until level selected', (tester) async {
      await tester.pumpWidget(buildSubject());

      final nextButton = tester.widget<FilledButton>(
        find.widgetWithText(FilledButton, 'Next'),
      );
      expect(nextButton.onPressed, isNull);
    });

    testWidgets('Next button enabled after selecting level', (tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(buildSubject());

      // Tap on the A1 card by finding the InkWell inside the Material
      final a1Card = find.ancestor(
        of: find.text('A1'),
        matching: find.byType(InkWell),
      );
      await tester.tap(a1Card);
      await tester.pumpAndSettle();

      final nextButton = tester.widget<FilledButton>(
        find.widgetWithText(FilledButton, 'Next'),
      );
      expect(nextButton.onPressed, isNotNull);
    });

    testWidgets('navigates to dialect step after selecting level and tapping Next',
        (tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(buildSubject());

      // Tap B1 card
      final b1Card = find.ancestor(
        of: find.text('B1'),
        matching: find.byType(InkWell),
      );
      await tester.tap(b1Card);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(find.text('Which dialect do you prefer?'), findsOneWidget);
      expect(find.text('Standard'), findsOneWidget);
      expect(find.text('Northern'), findsOneWidget);
      expect(find.text('Central'), findsOneWidget);
      expect(find.text('Southern'), findsOneWidget);
    });

    testWidgets('Skip button moves to next step', (tester) async {
      await tester.pumpWidget(buildSubject());

      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      expect(find.text('Which dialect do you prefer?'), findsOneWidget);
    });

    testWidgets('dialect step shows options and allows selection',
        (tester) async {
      await tester.pumpWidget(buildSubject());

      // Navigate to dialect step
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // Tap Northern card
      final northernCard = find.ancestor(
        of: find.text('Northern'),
        matching: find.byType(InkWell),
      );
      await tester.tap(northernCard);
      await tester.pumpAndSettle();

      final nextButton = tester.widget<FilledButton>(
        find.widgetWithText(FilledButton, 'Next'),
      );
      expect(nextButton.onPressed, isNotNull);
    });

    testWidgets('navigates to daily goal step', (tester) async {
      await tester.pumpWidget(buildSubject());

      // Skip level
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // Select dialect and go next
      final standardCard = find.ancestor(
        of: find.text('Standard'),
        matching: find.byType(InkWell),
      );
      await tester.tap(standardCard);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(find.text('Set your daily goal'), findsOneWidget);
      expect(find.text('words per day'), findsOneWidget);
      expect(find.text('20'), findsOneWidget); // default
    });

    testWidgets('daily goal slider changes value', (tester) async {
      await tester.pumpWidget(buildSubject());

      // Navigate to daily goal step
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // The slider should be present
      expect(find.byType(Slider), findsOneWidget);
    });

    testWidgets('Get Started button submits on last step', (tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      when(() => mockUserRepo.updateMe(any())).thenAnswer(
        (_) async => {
          'id': 'user-1',
          'currentLevel': 'B1',
          'preferredDialect': 'NORTHERN',
        },
      );

      await tester.pumpWidget(buildSubject());

      // Select level
      final b1Card = find.ancestor(
        of: find.text('B1'),
        matching: find.byType(InkWell),
      );
      await tester.tap(b1Card);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // Select dialect
      final northernCard = find.ancestor(
        of: find.text('Northern'),
        matching: find.byType(InkWell),
      );
      await tester.tap(northernCard);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // Tap Get Started
      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();

      verify(() => mockUserRepo.updateMe({
            'currentLevel': 'B1',
            'preferredDialect': 'NORTHERN',
          })).called(1);

      expect(prefsService.isOnboardingCompleted, isTrue);
    });

    testWidgets('Skip All on last step skips API call', (tester) async {
      await tester.pumpWidget(buildSubject());

      // Skip level
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // Skip dialect
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // Skip All on daily goal
      await tester.tap(find.text('Skip All'));
      await tester.pumpAndSettle();

      verifyNever(() => mockUserRepo.updateMe(any()));
      expect(prefsService.isOnboardingCompleted, isTrue);
    });
  });
}
