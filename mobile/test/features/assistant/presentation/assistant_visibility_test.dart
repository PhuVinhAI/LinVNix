import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/domain/assistant_state.dart';
import 'package:linvnix/features/assistant/presentation/assistant_visibility.dart';

void main() {
  group('isAssistantBarVisible', () {
    const hiddenLocations = <String>[
      '/splash',
      '/login',
      '/register',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/reset-password-otp',
      '/onboarding',
    ];

    for (final loc in hiddenLocations) {
      test('is hidden on $loc', () {
        expect(isAssistantBarVisible(loc), isFalse);
      });
    }

    const visibleLocations = <String>[
      '/',
      '/courses',
      '/courses/c-1',
      '/courses/c-1/exercises/play/set-1',
      '/modules/m-1',
      '/modules/m-1/exercises/play/set-1',
      '/lessons/l-1',
      '/lessons/l-1/exercises',
      '/lessons/l-1/exercises/play/set-1',
      '/bookmarks',
      '/bookmarks/flashcard',
      '/profile',
    ];

    for (final loc in visibleLocations) {
      test('is visible on $loc', () {
        expect(isAssistantBarVisible(loc), isTrue);
      });
    }

    test('hidden when location is null (e.g. before router has emitted)', () {
      expect(isAssistantBarVisible(null), isFalse);
    });

    test('hidden on auth routes that carry query parameters '
        '(e.g. /verify-email?email=...)', () {
      expect(isAssistantBarVisible('/verify-email?email=foo@bar.com'), isFalse);
      expect(isAssistantBarVisible('/reset-password?token=xyz'), isFalse);
    });
  });

  group('shouldRenderAssistantBar', () {
    test('renders on visible routes when the learner preference is on', () {
      expect(
        shouldRenderAssistantBar(
          routeVisible: true,
          preferenceVisible: true,
          state: const AssistantCollapsed(),
        ),
        isTrue,
      );
    });

    test(
      'hides completely when preference is off and assistant is collapsed',
      () {
        expect(
          shouldRenderAssistantBar(
            routeVisible: true,
            preferenceVisible: false,
            state: const AssistantCollapsed(),
          ),
          isFalse,
        );
      },
    );

    test(
      'keeps rendering while a Full stream is active after preference is off',
      () {
        expect(
          shouldRenderAssistantBar(
            routeVisible: true,
            preferenceVisible: false,
            state: const AssistantFullReading(
              partial: 'Xin chào',
              streaming: true,
            ),
          ),
          isTrue,
        );
      },
    );

    test(
      'keeps rendering while Full screen is open after preference is off',
      () {
        expect(
          shouldRenderAssistantBar(
            routeVisible: true,
            preferenceVisible: false,
            state: const AssistantFullReading(
              partial: 'Xin chào',
              streaming: false,
            ),
          ),
          isTrue,
        );
      },
    );

    test('hidden routes take precedence over an active assistant state', () {
      expect(
        shouldRenderAssistantBar(
          routeVisible: false,
          preferenceVisible: true,
          state: const AssistantFullReading(
            partial: 'Xin chào',
            streaming: true,
          ),
        ),
        isFalse,
      );
    });
  });
}
