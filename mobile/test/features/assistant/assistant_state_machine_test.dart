import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/application/assistant_state_machine.dart';
import 'package:linvnix/features/assistant/domain/assistant_event.dart';
import 'package:linvnix/features/assistant/domain/assistant_state.dart';

/// Unit tests for V2 AssistantStateMachine.
/// Covers: 9 states, all transitions, invalid transitions, mirror mapping.
void main() {
  late ProviderContainer container;
  late AssistantStateMachine machine;

  setUp(() {
    container = ProviderContainer();
    machine = container.read(assistantStateMachineProvider.notifier);
  });

  tearDown(() => container.dispose());

  AssistantState get state =>
      container.read(assistantStateMachineProvider);

  // ─────────────────────────────────────────────────────
  // Initial state
  // ─────────────────────────────────────────────────────

  test('initial state is AssistantCollapsed', () {
    expect(state, isA<AssistantCollapsed>());
  });

  // ─────────────────────────────────────────────────────
  // Mid flow
  // ─────────────────────────────────────────────────────

  group('Mid flow', () {
    test('Collapsed → openBar → MidCompose', () {
      machine.openBar();
      expect(state, isA<AssistantMidCompose>());
    });

    test('MidCompose → send → MidLoading', () {
      machine.openBar();
      machine.send('hello');
      expect(state, isA<AssistantMidLoading>());
      expect((state as AssistantMidLoading).lastInput, 'hello');
    });

    test('MidLoading → onToolStart → updates statusText', () {
      machine.openBar();
      machine.send('hello');
      machine.onToolStart(displayName: 'Đang tra cứu...');
      final s = state as AssistantMidLoading;
      expect(s.statusText, 'Đang tra cứu...');
      expect(s.lastInput, 'hello');
    });

    test('MidLoading → onTextChunk → MidReading(streaming)', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('Chào');
      final s = state as AssistantMidReading;
      expect(s.streaming, true);
      expect(s.partial, 'Chào');
    });

    test('MidReading(streaming) → onTextChunk → appends partial', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('Chào');
      machine.onTextChunk(' bạn');
      final s = state as AssistantMidReading;
      expect(s.partial, 'Chào bạn');
    });

    test('MidReading(streaming) → onDone → MidReading(done)', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('ok');
      machine.onDone(messageId: 'msg-1', interrupted: false);
      final s = state as AssistantMidReading;
      expect(s.streaming, false);
      expect(s.messageId, 'msg-1');
      expect(s.interrupted, false);
    });

    test('MidLoading → onDone (no text chunk) → MidReading(done, empty)', () {
      machine.openBar();
      machine.send('hi');
      machine.onDone(messageId: 'msg-0', interrupted: false);
      final s = state as AssistantMidReading;
      expect(s.partial, '');
      expect(s.streaming, false);
    });

    test('MidReading(done) → composeAgain → MidCompose', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('ok');
      machine.onDone(messageId: 'msg-1', interrupted: false);
      machine.composeAgain();
      expect(state, isA<AssistantMidCompose>());
    });

    test('MidLoading → onError → MidError', () {
      machine.openBar();
      machine.send('hi');
      machine.onError(message: 'Server error');
      final s = state as AssistantMidError;
      expect(s.message, 'Server error');
      expect(s.lastInput, 'hi');
    });

    test('MidError → send → MidLoading (retry)', () {
      machine.openBar();
      machine.send('hi');
      machine.onError(message: 'oops');
      machine.send('hi');
      expect(state, isA<AssistantMidLoading>());
    });

    test('MidReading(streaming) → onError → MidReading(interrupted)', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('partial');
      machine.onError(message: 'mid-stream error');
      final s = state as AssistantMidReading;
      expect(s.streaming, false);
      expect(s.interrupted, true);
      expect(s.partial, 'partial');
    });

    test('MidLoading → stop → MidReading(interrupted, empty)', () {
      machine.openBar();
      machine.send('hi');
      machine.stop();
      final s = state as AssistantMidReading;
      expect(s.streaming, false);
      expect(s.interrupted, true);
      expect(s.partial, '');
    });

    test('MidReading(streaming) → stop → MidReading(interrupted)', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('part');
      machine.stop();
      final s = state as AssistantMidReading;
      expect(s.streaming, false);
      expect(s.interrupted, true);
    });

    test('reset from MidLoading → MidCompose', () {
      machine.openBar();
      machine.send('hi');
      machine.reset();
      expect(state, isA<AssistantMidCompose>());
    });

    test('collapse from MidCompose → Collapsed', () {
      machine.openBar();
      machine.collapse();
      expect(state, isA<AssistantCollapsed>());
    });
  });

  // ─────────────────────────────────────────────────────
  // Full direct entry (long-press)
  // ─────────────────────────────────────────────────────

  group('Full direct entry', () {
    test('Collapsed → openFullDirect → FullCompose', () {
      machine.openFullDirect();
      expect(state, isA<AssistantFullCompose>());
    });

    test('FullCompose → sendFull → FullLoading', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      expect(state, isA<AssistantFullLoading>());
      expect((state as AssistantFullLoading).lastInput, 'hello');
    });

    test('FullLoading → onToolStartFull → updates statusText', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onToolStartFull(displayName: 'Đang tra từ...');
      final s = state as AssistantFullLoading;
      expect(s.statusText, 'Đang tra từ...');
    });

    test('FullLoading → onTextChunkFull → FullReading(streaming)', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onTextChunkFull('Hi');
      final s = state as AssistantFullReading;
      expect(s.streaming, true);
      expect(s.partial, 'Hi');
    });

    test('FullReading(streaming) → onTextChunkFull → appends', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onTextChunkFull('Hi');
      machine.onTextChunkFull(' there');
      expect((state as AssistantFullReading).partial, 'Hi there');
    });

    test('FullReading(streaming) → onDoneFull → FullReading(done)', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onTextChunkFull('ok');
      machine.onDoneFull(messageId: 'fmsg-1', interrupted: false);
      final s = state as AssistantFullReading;
      expect(s.streaming, false);
      expect(s.messageId, 'fmsg-1');
    });

    test('FullLoading → onErrorFull → FullError', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onErrorFull(message: 'fail');
      final s = state as AssistantFullError;
      expect(s.message, 'fail');
      expect(s.lastInput, 'hello');
    });

    test('FullError → sendFull → FullLoading (retry)', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onErrorFull(message: 'fail');
      machine.sendFull('hello');
      expect(state, isA<AssistantFullLoading>());
    });

    test('FullLoading → stop → FullReading(interrupted, empty)', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.stop();
      final s = state as AssistantFullReading;
      expect(s.streaming, false);
      expect(s.interrupted, true);
      expect(s.partial, '');
    });

    test('FullReading(streaming) → stop → FullReading(interrupted)', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.onTextChunkFull('part');
      machine.stop();
      final s = state as AssistantFullReading;
      expect(s.interrupted, true);
      expect(s.streaming, false);
    });

    test('reset from FullLoading → FullCompose (stays in Full)', () {
      machine.openFullDirect();
      machine.sendFull('hello');
      machine.reset();
      expect(state, isA<AssistantFullCompose>());
    });

    test('reset from FullReading → FullCompose', () {
      machine.openFullDirect();
      machine.sendFull('hi');
      machine.onTextChunkFull('ok');
      machine.onDoneFull(messageId: 'x', interrupted: false);
      machine.reset();
      expect(state, isA<AssistantFullCompose>());
    });

    test('collapse from FullCompose → Collapsed (not Mid)', () {
      machine.openFullDirect();
      machine.collapse();
      expect(state, isA<AssistantCollapsed>());
    });

    test('collapse from FullLoading → Collapsed', () {
      machine.openFullDirect();
      machine.sendFull('hi');
      machine.collapse();
      expect(state, isA<AssistantCollapsed>());
    });
  });

  // ─────────────────────────────────────────────────────
  // enterFull mirror (Mid → Full)
  // ─────────────────────────────────────────────────────

  group('enterFull mirror', () {
    test('MidCompose → enterFull → FullCompose', () {
      machine.openBar();
      machine.enterFull();
      expect(state, isA<AssistantFullCompose>());
    });

    test('MidLoading → enterFull → FullLoading (preserves lastInput + statusText)', () {
      machine.openBar();
      machine.send('question');
      machine.onToolStart(displayName: 'Searching...');
      machine.enterFull();
      final s = state as AssistantFullLoading;
      expect(s.lastInput, 'question');
      expect(s.statusText, 'Searching...');
    });

    test('MidReading(streaming) → enterFull → FullReading(streaming, same partial)', () {
      machine.openBar();
      machine.send('q');
      machine.onTextChunk('partial answer');
      machine.enterFull();
      final s = state as AssistantFullReading;
      expect(s.streaming, true);
      expect(s.partial, 'partial answer');
    });

    test('MidReading(done) → enterFull → FullReading(done)', () {
      machine.openBar();
      machine.send('q');
      machine.onTextChunk('answer');
      machine.onDone(messageId: 'm1', interrupted: false);
      machine.enterFull();
      final s = state as AssistantFullReading;
      expect(s.streaming, false);
      expect(s.messageId, 'm1');
    });

    test('MidError → enterFull → FullError (preserves message + lastInput)', () {
      machine.openBar();
      machine.send('q');
      machine.onError(message: 'err msg');
      machine.enterFull();
      final s = state as AssistantFullError;
      expect(s.message, 'err msg');
      expect(s.lastInput, 'q');
    });
  });

  // ─────────────────────────────────────────────────────
  // Invalid transitions
  // ─────────────────────────────────────────────────────

  group('invalid transitions throw StateError', () {
    test('openBar from non-Collapsed throws', () {
      machine.openBar();
      expect(() => machine.openBar(), throwsA(isA<StateError>()));
    });

    test('openFullDirect from non-Collapsed throws', () {
      machine.openBar();
      expect(() => machine.openFullDirect(), throwsA(isA<StateError>()));
    });

    test('send from Collapsed throws', () {
      expect(() => machine.send('hi'), throwsA(isA<StateError>()));
    });

    test('sendFull from MidCompose throws', () {
      machine.openBar();
      expect(() => machine.sendFull('hi'), throwsA(isA<StateError>()));
    });

    test('onToolStart from MidCompose throws', () {
      machine.openBar();
      expect(
        () => machine.onToolStart(displayName: 'x'),
        throwsA(isA<StateError>()),
      );
    });

    test('onTextChunk from MidCompose throws', () {
      machine.openBar();
      expect(() => machine.onTextChunk('x'), throwsA(isA<StateError>()));
    });

    test('onTextChunk from MidReading(done) throws', () {
      machine.openBar();
      machine.send('q');
      machine.onTextChunk('a');
      machine.onDone(messageId: 'x', interrupted: false);
      expect(() => machine.onTextChunk('more'), throwsA(isA<StateError>()));
    });

    test('onDone from MidCompose throws', () {
      machine.openBar();
      expect(
        () => machine.onDone(messageId: 'x', interrupted: false),
        throwsA(isA<StateError>()),
      );
    });

    test('composeAgain from MidLoading throws', () {
      machine.openBar();
      machine.send('hi');
      expect(() => machine.composeAgain(), throwsA(isA<StateError>()));
    });

    test('composeAgain from MidReading(streaming) throws', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('part');
      expect(() => machine.composeAgain(), throwsA(isA<StateError>()));
    });

    test('stop from MidCompose throws', () {
      machine.openBar();
      expect(() => machine.stop(), throwsA(isA<StateError>()));
    });

    test('stop from FullCompose throws', () {
      machine.openFullDirect();
      expect(() => machine.stop(), throwsA(isA<StateError>()));
    });

    test('reset from Collapsed throws', () {
      expect(() => machine.reset(), throwsA(isA<StateError>()));
    });

    test('collapse from Collapsed throws', () {
      expect(() => machine.collapse(), throwsA(isA<StateError>()));
    });

    test('enterFull from Collapsed throws', () {
      expect(() => machine.enterFull(), throwsA(isA<StateError>()));
    });

    test('enterFull from FullCompose throws', () {
      machine.openFullDirect();
      expect(() => machine.enterFull(), throwsA(isA<StateError>()));
    });

    test('onToolStartFull from FullCompose throws', () {
      machine.openFullDirect();
      expect(
        () => machine.onToolStartFull(displayName: 'x'),
        throwsA(isA<StateError>()),
      );
    });

    test('onTextChunkFull from MidLoading throws', () {
      machine.openBar();
      machine.send('hi');
      expect(() => machine.onTextChunkFull('x'), throwsA(isA<StateError>()));
    });

    test('onDoneFull from FullCompose throws', () {
      machine.openFullDirect();
      expect(
        () => machine.onDoneFull(messageId: 'x', interrupted: false),
        throwsA(isA<StateError>()),
      );
    });
  });

  // ─────────────────────────────────────────────────────
  // Proposals (Mid & Full)
  // ─────────────────────────────────────────────────────

  group('proposals', () {
    const proposeEvent = ProposeEvent(
      kind: 'schedule',
      title: 'Đặt lịch',
      description: 'Đặt lịch học?',
      endpoint: '/schedule',
    );

    test('onPropose appends to MidReading proposals', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('ok');
      machine.onPropose(proposeEvent);
      final s = state as AssistantMidReading;
      expect(s.proposals.length, 1);
      expect(s.proposals[0].kind, 'schedule');
    });

    test('onProposeFull appends to FullReading proposals', () {
      machine.openFullDirect();
      machine.sendFull('hi');
      machine.onTextChunkFull('ok');
      machine.onProposeFull(proposeEvent);
      final s = state as AssistantFullReading;
      expect(s.proposals.length, 1);
    });

    test('dismissProposal removes entry from MidReading', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('ok');
      machine.onPropose(proposeEvent);
      machine.dismissProposal(0);
      expect((state as AssistantMidReading).proposals, isEmpty);
    });

    test('dismissProposal removes entry from FullReading', () {
      machine.openFullDirect();
      machine.sendFull('hi');
      machine.onTextChunkFull('ok');
      machine.onProposeFull(proposeEvent);
      machine.dismissProposal(0);
      expect((state as AssistantFullReading).proposals, isEmpty);
    });

    test('updateProposal mutates status in MidReading', () {
      machine.openBar();
      machine.send('hi');
      machine.onTextChunk('ok');
      machine.onPropose(proposeEvent);
      final updated = (state as AssistantMidReading)
          .proposals[0]
          .copyWith(status: ProposalCardStatus.success);
      machine.updateProposal(0, updated);
      expect(
        (state as AssistantMidReading).proposals[0].status,
        ProposalCardStatus.success,
      );
    });
  });
}
