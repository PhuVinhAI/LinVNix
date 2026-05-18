import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/application/assistant_state_machine.dart';
import 'package:linvnix/features/assistant/domain/assistant_event.dart';
import 'package:linvnix/features/assistant/domain/assistant_state.dart';

void main() {
  late ProviderContainer container;
  late AssistantStateMachine sm;

  setUp(() {
    container = ProviderContainer();
    sm = container.read(assistantStateMachineProvider.notifier);
  });

  tearDown(() {
    container.dispose();
  });

  group('initial state', () {
    test('starts collapsed', () {
      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantCollapsed>(),
      );
    });

    test('defines 9 concrete states with independent Full phases', () {
      final states = <AssistantState>[
        const AssistantCollapsed(),
        const AssistantMidCompose(),
        const AssistantMidLoading(lastInput: 'mid'),
        const AssistantMidReading(partial: 'mid', streaming: true),
        const AssistantMidError(message: 'err', lastInput: 'mid'),
        const AssistantFullCompose(),
        const AssistantFullLoading(lastInput: 'full'),
        const AssistantFullReading(partial: 'full', streaming: true),
        const AssistantFullError(message: 'err', lastInput: 'full'),
      ];

      expect(states.map((s) => s.runtimeType).toSet(), hasLength(9));
    });
  });

  group('happy-path trigger sequence (PRD §"Mobile UI state machine")', () {
    test('open → compose → send → loading → tool_start → text_chunk → '
        'done → soạn-tiếp → compose', () {
      sm.openBar();
      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantMidCompose>(),
      );

      sm.send('How am I doing?');
      final loading1 =
          container.read(assistantStateMachineProvider) as AssistantMidLoading;
      expect(loading1.lastInput, 'How am I doing?');
      expect(loading1.statusText, AssistantMidLoading.defaultStatusText);

      sm.onToolStart(displayName: 'Đang tóm tắt thông tin của bạn...');
      final loading2 =
          container.read(assistantStateMachineProvider) as AssistantMidLoading;
      expect(loading2.statusText, 'Đang tóm tắt thông tin của bạn...');

      sm.onTextChunk('Bạn đang ');
      final reading1 =
          container.read(assistantStateMachineProvider) as AssistantMidReading;
      expect(reading1.partial, 'Bạn đang ');
      expect(reading1.streaming, isTrue);
      expect(reading1.interrupted, isFalse);
      expect(reading1.isDone, isFalse);

      sm.onTextChunk('học rất tốt!');
      final reading2 =
          container.read(assistantStateMachineProvider) as AssistantMidReading;
      expect(reading2.partial, 'Bạn đang học rất tốt!');
      expect(reading2.streaming, isTrue);

      sm.onDone(messageId: 'msg-42', interrupted: false);
      final reading3 =
          container.read(assistantStateMachineProvider) as AssistantMidReading;
      expect(reading3.streaming, isFalse);
      expect(reading3.isDone, isTrue);
      expect(reading3.interrupted, isFalse);
      expect(reading3.messageId, 'msg-42');
      expect(reading3.partial, 'Bạn đang học rất tốt!');

      sm.composeAgain();
      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantMidCompose>(),
      );
    });

    test('stop tapped during MidLoading transitions to interrupted done', () {
      sm.openBar();
      sm.send('hi');
      sm.stop();

      final s =
          container.read(assistantStateMachineProvider) as AssistantMidReading;
      expect(s.isDone, isTrue);
      expect(s.interrupted, isTrue);
      expect(s.partial, isEmpty);
    });

    test(
      'stop tapped mid-stream preserves partial text and marks interrupted',
      () {
        sm.openBar();
        sm.send('hi');
        sm.onTextChunk('partial answ');
        sm.stop();

        final s =
            container.read(assistantStateMachineProvider)
                as AssistantMidReading;
        expect(s.isDone, isTrue);
        expect(s.interrupted, isTrue);
        expect(s.partial, 'partial answ');
      },
    );

    test(
      'pre-token error transitions to MidError with lastInput preserved',
      () {
        sm.openBar();
        sm.send('what is xin chào');
        sm.onError(message: 'AI_SERVICE_UNAVAILABLE');

        final s =
            container.read(assistantStateMachineProvider) as AssistantMidError;
        expect(s.message, 'AI_SERVICE_UNAVAILABLE');
        expect(s.lastInput, 'what is xin chào');
      },
    );

    test('mid-stream error preserves partial text and ends the stream as '
        'interrupted', () {
      sm.openBar();
      sm.send('hi');
      sm.onTextChunk('got some answer ');
      sm.onError(message: 'AI_RATE_LIMIT_EXCEEDED');

      final s =
          container.read(assistantStateMachineProvider) as AssistantMidReading;
      expect(s.partial, 'got some answer ');
      expect(s.isDone, isTrue);
      expect(s.interrupted, isTrue);
    });

    test('send() is a valid transition from MidError for retry semantics', () {
      sm.openBar();
      sm.send('retry me');
      sm.onError(message: 'AI_SERVICE_UNAVAILABLE');
      sm.send('retry me');

      final s =
          container.read(assistantStateMachineProvider) as AssistantMidLoading;
      expect(s.lastInput, 'retry me');
    });

    test('reset() returns to MidCompose from any non-Collapsed state', () {
      sm.openBar();
      sm.send('hi');
      sm.onTextChunk('partial');
      sm.reset();

      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantMidCompose>(),
      );
    });

    test('collapse() from MidReading returns to Collapsed', () {
      sm.openBar();
      sm.send('hi');
      sm.onTextChunk('partial');
      sm.onDone(messageId: 'm', interrupted: false);
      sm.collapse();

      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantCollapsed>(),
      );
    });

    test(
      'done received from MidLoading (no text emitted) still transitions',
      () {
        sm.openBar();
        sm.send('hi');
        sm.onDone(messageId: 'm-empty', interrupted: false);

        final s =
            container.read(assistantStateMachineProvider)
                as AssistantMidReading;
        expect(s.isDone, isTrue);
        expect(s.partial, isEmpty);
        expect(s.messageId, 'm-empty');
      },
    );

    test('long-press entry opens FullCompose directly from Collapsed', () {
      sm.openFull();

      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantFullCompose>(),
      );
    });

    test('Full flow sends, streams, proposes, completes, and composes again '
        'without returning to Mid', () {
      sm.openFull();
      sm.send('Explain classifiers');
      final loading1 =
          container.read(assistantStateMachineProvider) as AssistantFullLoading;
      expect(loading1.lastInput, 'Explain classifiers');
      expect(loading1.statusText, AssistantFullLoading.defaultStatusText);

      sm.onToolStart(displayName: 'Đang tra cứu từ vựng...');
      final loading2 =
          container.read(assistantStateMachineProvider) as AssistantFullLoading;
      expect(loading2.statusText, 'Đang tra cứu từ vựng...');

      sm.onTextChunk('Dùng con cho ');
      final reading1 =
          container.read(assistantStateMachineProvider) as AssistantFullReading;
      expect(reading1.partial, 'Dùng con cho ');
      expect(reading1.streaming, isTrue);

      sm.onPropose(
        const ProposeEvent(
          kind: 'create_exercise_set',
          title: 'Luyện danh từ phân loại',
          description: 'Tạo bài tập luyện thêm?',
          endpoint: 'POST /exercise-sets',
        ),
      );
      final reading2 =
          container.read(assistantStateMachineProvider) as AssistantFullReading;
      expect(reading2.proposals, hasLength(1));

      sm.onTextChunk('động vật.');
      sm.onDone(messageId: 'full-msg-1', interrupted: false);
      final reading3 =
          container.read(assistantStateMachineProvider) as AssistantFullReading;
      expect(reading3.partial, 'Dùng con cho động vật.');
      expect(reading3.streaming, isFalse);
      expect(reading3.messageId, 'full-msg-1');
      expect(reading3.proposals, hasLength(1));

      sm.composeAgain();
      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantFullCompose>(),
      );
    });

    test('reset() from any Full state stays in FullCompose', () {
      sm.openFull();
      sm.send('hi');
      sm.onTextChunk('partial');
      sm.reset();

      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantFullCompose>(),
      );
    });

    test('collapse() from Full returns to Collapsed', () {
      sm.openFull();
      sm.send('hi');
      sm.onTextChunk('partial');
      sm.collapse();

      expect(
        container.read(assistantStateMachineProvider),
        isA<AssistantCollapsed>(),
      );
    });

    test('enterFull mirrors Mid states into equivalent Full states', () {
      AssistantState mirrorFrom(void Function(AssistantStateMachine sm) setup) {
        final local = ProviderContainer();
        addTearDown(local.dispose);
        final localSm = local.read(assistantStateMachineProvider.notifier);
        setup(localSm);
        localSm.enterFull();
        return local.read(assistantStateMachineProvider);
      }

      expect(mirrorFrom((sm) => sm.openBar()), isA<AssistantFullCompose>());

      final loading =
          mirrorFrom((sm) {
                sm.openBar();
                sm.send('mid loading');
                sm.onToolStart(displayName: 'Đang tìm bài học...');
              })
              as AssistantFullLoading;
      expect(loading.lastInput, 'mid loading');
      expect(loading.statusText, 'Đang tìm bài học...');

      final reading =
          mirrorFrom((sm) {
                sm.openBar();
                sm.send('mid reading');
                sm.onTextChunk('partial');
                sm.onPropose(
                  const ProposeEvent(
                    kind: 'create_goal',
                    title: 'Tạo mục tiêu',
                    description: 'Tạo mục tiêu mới?',
                    endpoint: 'POST /daily-goals',
                  ),
                );
              })
              as AssistantFullReading;
      expect(reading.partial, 'partial');
      expect(reading.streaming, isTrue);
      expect(reading.proposals, hasLength(1));

      final error =
          mirrorFrom((sm) {
                sm.openBar();
                sm.send('mid error');
                sm.onError(message: 'AI unavailable');
              })
              as AssistantFullError;
      expect(error.message, 'AI unavailable');
      expect(error.lastInput, 'mid error');
    });
  });

  group('invalid transitions throw StateError', () {
    test('openBar from non-Collapsed throws', () {
      sm.openBar();
      expect(() => sm.openBar(), throwsStateError);
    });

    test('send from Collapsed throws', () {
      expect(() => sm.send('hi'), throwsStateError);
    });

    test('send from MidLoading throws', () {
      sm.openBar();
      sm.send('hi');
      expect(() => sm.send('again'), throwsStateError);
    });

    test('send from MidReading (streaming) throws', () {
      sm.openBar();
      sm.send('hi');
      sm.onTextChunk('partial');
      expect(() => sm.send('again'), throwsStateError);
    });

    test('onToolStart from MidCompose throws', () {
      sm.openBar();
      expect(() => sm.onToolStart(displayName: 'x'), throwsStateError);
    });

    test('onTextChunk from MidCompose throws', () {
      sm.openBar();
      expect(() => sm.onTextChunk('x'), throwsStateError);
    });

    test('onTextChunk after done throws', () {
      sm.openBar();
      sm.send('hi');
      sm.onDone(messageId: 'm', interrupted: false);
      expect(() => sm.onTextChunk('late'), throwsStateError);
    });

    test('onDone from Collapsed throws', () {
      expect(
        () => sm.onDone(messageId: 'm', interrupted: false),
        throwsStateError,
      );
    });

    test('onDone from MidCompose throws', () {
      sm.openBar();
      expect(
        () => sm.onDone(messageId: 'm', interrupted: false),
        throwsStateError,
      );
    });

    test('stop from MidCompose throws', () {
      sm.openBar();
      expect(() => sm.stop(), throwsStateError);
    });

    test('stop from MidReading(done) throws', () {
      sm.openBar();
      sm.send('hi');
      sm.onDone(messageId: 'm', interrupted: false);
      expect(() => sm.stop(), throwsStateError);
    });

    test('composeAgain from MidLoading throws', () {
      sm.openBar();
      sm.send('hi');
      expect(() => sm.composeAgain(), throwsStateError);
    });

    test('composeAgain from MidReading(streaming) throws', () {
      sm.openBar();
      sm.send('hi');
      sm.onTextChunk('partial');
      expect(() => sm.composeAgain(), throwsStateError);
    });

    test('reset from Collapsed throws', () {
      expect(() => sm.reset(), throwsStateError);
    });

    test('collapse from Collapsed throws', () {
      expect(() => sm.collapse(), throwsStateError);
    });

    test('openFull from non-Collapsed throws', () {
      sm.openBar();
      expect(() => sm.openFull(), throwsStateError);
    });

    test('enterFull from Collapsed throws', () {
      expect(() => sm.enterFull(), throwsStateError);
    });

    test('enterFull from an existing Full state throws', () {
      sm.openFull();
      expect(() => sm.enterFull(), throwsStateError);
    });

    test('send from FullLoading throws', () {
      sm.openFull();
      sm.send('hi');
      expect(() => sm.send('again'), throwsStateError);
    });
  });
}
