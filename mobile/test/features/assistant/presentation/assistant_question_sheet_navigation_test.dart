import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/core/theme/app_theme.dart';
import 'package:linvnix/features/assistant/application/assistant_state_machine.dart';
import 'package:linvnix/features/assistant/presentation/widgets/assistant_full_screen.dart';
import 'package:linvnix/features/assistant/presentation/widgets/assistant_question_sheet.dart';

void main() {
  testWidgets('sheet pushes FullScreen only on the transition into Full', (
    tester,
  ) async {
    final container = ProviderContainer();
    final observer = _CountingNavigatorObserver();
    final stateMachine = container.read(assistantStateMachineProvider.notifier);

    stateMachine.openBar();

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp(
          theme: AppTheme.light(),
          navigatorObservers: [observer],
          home: const Scaffold(body: AssistantQuestionSheet()),
        ),
      ),
    );

    stateMachine.enterFull();
    await tester.pump();
    await tester.pumpAndSettle();

    expect(find.byType(AssistantFullScreen), findsOneWidget);
    final pushesAfterEnteringFull = observer.pushCount;

    stateMachine.send('hello from full');
    await tester.pump();
    stateMachine.onTextChunk('answer');
    await tester.pump();
    stateMachine.onDone(messageId: 'msg-1', interrupted: false);
    await tester.pump();

    expect(observer.pushCount, pushesAfterEnteringFull);
    expect(
      find.byType(AssistantFullScreen, skipOffstage: false),
      findsOneWidget,
    );

    container.dispose();
  });
}

class _CountingNavigatorObserver extends NavigatorObserver {
  int pushCount = 0;

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    pushCount++;
    super.didPush(route, previousRoute);
  }
}
