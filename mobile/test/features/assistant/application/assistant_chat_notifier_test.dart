import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/application/assistant_chat_notifier.dart';
import 'package:linvnix/features/assistant/application/assistant_state_machine.dart';
import 'package:linvnix/features/assistant/data/ai_api.dart';
import 'package:linvnix/features/assistant/data/ai_api_provider.dart';
import 'package:linvnix/features/assistant/data/route_match.dart';
import 'package:linvnix/features/assistant/data/screen_context_provider.dart';
import 'package:linvnix/features/assistant/domain/assistant_state.dart';

/// Fake Dio adapter wired to a `StreamController<List<int>>` that the
/// test scripts at will. Lets us drive [AiApi.chatStream] through the
/// real decoder without a live HTTP server.
class _FakeStreamingAdapter implements HttpClientAdapter {
  _FakeStreamingAdapter();

  final int statusCode = 200;
  late StreamController<List<int>> controller;
  final List<RequestOptions> capturedRequests = [];
  Completer<void>? _completer;

  /// Resets to a fresh in-progress stream. Call this before each request
  /// the test expects to issue.
  void prepareNext() {
    controller = StreamController<List<int>>();
    _completer = Completer<void>();
  }

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    capturedRequests.add(options);
    // Capture the per-request controller so rapid-send tests can swap
    // `adapter.controller` to a fresh instance for the next request
    // without cancellation of THIS request accidentally closing it.
    final c = controller;
    final completer = _completer;
    cancelFuture?.then((_) {
      if (!c.isClosed) c.close();
      if (completer != null && !completer.isCompleted) completer.complete();
    });
    return ResponseBody(
      c.stream.map((bytes) => Uint8List.fromList(bytes)),
      statusCode,
      headers: {
        'content-type': ['text/event-stream'],
      },
    );
  }

  @override
  void close({bool force = false}) {
    if (!controller.isClosed) controller.close();
  }
}

List<int> _frame(String type, Map<String, dynamic> data) =>
    utf8.encode('event: $type\ndata: ${jsonEncode(data)}\n\n');

void main() {
  late _FakeStreamingAdapter adapter;
  late Dio dio;
  late AiApi api;
  late ProviderContainer container;
  late AssistantChatNotifier notifier;

  setUp(() {
    adapter = _FakeStreamingAdapter()..prepareNext();
    dio = Dio(BaseOptions(baseUrl: 'https://test.local'));
    dio.httpClientAdapter = adapter;
    api = AiApi(dio);

    container = ProviderContainer(
      overrides: [aiApiProvider.overrideWithValue(api)],
    );
    notifier = container.read(assistantChatNotifierProvider);
  });

  tearDown(() async {
    await notifier.dispose();
    dio.close(force: true);
    container.dispose();
  });

  /// Helper that scripts the typical 4-event happy-path stream then
  /// closes the connection.
  void scriptHappyPath({
    String conversationId = 'conv-1',
    String messageId = 'msg-1',
    String text = 'Bạn đang học rất tốt!',
  }) {
    scheduleMicrotask(() async {
      // Give the request a tick to land on the adapter.
      await Future<void>.delayed(const Duration(milliseconds: 10));
      adapter.controller
        ..add(
          _frame('conversation_started', {'conversationId': conversationId}),
        )
        ..add(_frame('text_chunk', {'text': text}))
        ..add(_frame('done', {'messageId': messageId, 'interrupted': false}));
      await adapter.controller.close();
    });
  }

  test(
    'first send creates a new Conversation (conversationId not sent in body) '
    'and persists the server-assigned id',
    () async {
      scriptHappyPath(conversationId: 'conv-new-1');
      notifier.openBar();
      await notifier.sendMessage('How am I doing?');
      // Allow the stream to drain.
      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(adapter.capturedRequests, hasLength(1));
      final body = adapter.capturedRequests.single.data as Map<String, dynamic>;
      expect(body.containsKey('conversationId'), isFalse);
      expect(body['message'], 'How am I doing?');
      expect(notifier.conversationIdForTesting, 'conv-new-1');
    },
  );

  test(
    'Soạn tiếp keeps the conversationId; the follow-up send reuses it',
    () async {
      scriptHappyPath(conversationId: 'conv-keep');
      notifier.openBar();
      await notifier.sendMessage('first');
      await Future<void>.delayed(const Duration(milliseconds: 50));

      notifier.composeAgain();

      adapter.prepareNext();
      scriptHappyPath(conversationId: 'conv-keep', messageId: 'msg-2');
      await notifier.sendMessage('second');
      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(adapter.capturedRequests, hasLength(2));
      final secondBody =
          adapter.capturedRequests[1].data as Map<String, dynamic>;
      expect(secondBody['conversationId'], 'conv-keep');
      expect(notifier.conversationIdForTesting, 'conv-keep');
    },
  );

  test(
    'Full send dispatches SSE events into FullLoading and FullReading states',
    () async {
      scheduleMicrotask(() async {
        await Future<void>.delayed(const Duration(milliseconds: 10));
        adapter.controller
          ..add(_frame('conversation_started', {'conversationId': 'conv-full'}))
          ..add(
            _frame('tool_start', {
              'name': 'lookup_vocab',
              'displayName': 'Đang tra cứu từ vựng...',
            }),
          )
          ..add(_frame('text_chunk', {'text': 'Xin '}))
          ..add(
            _frame('propose', {
              'kind': 'create_exercise_set',
              'title': 'Luyện tập',
              'description': 'Tạo bài tập luyện thêm?',
              'endpoint': 'POST /exercise-sets',
            }),
          )
          ..add(_frame('text_chunk', {'text': 'chào'}))
          ..add(
            _frame('done', {'messageId': 'full-msg-1', 'interrupted': false}),
          );
        await adapter.controller.close();
      });

      notifier.openFull();
      await notifier.sendMessage('teach me greeting');
      await Future<void>.delayed(const Duration(milliseconds: 60));

      final state =
          container.read(assistantStateMachineProvider) as AssistantFullReading;
      expect(state.partial, 'Xin chào');
      expect(state.streaming, isFalse);
      expect(state.messageId, 'full-msg-1');
      expect(state.proposals, hasLength(1));
      expect(notifier.conversationIdForTesting, 'conv-full');
    },
  );

  test('Full rapid send cancels streaming turn, stays in Full, and reuses '
      'conversationId', () async {
    scheduleMicrotask(() async {
      await Future<void>.delayed(const Duration(milliseconds: 10));
      adapter.controller
        ..add(_frame('conversation_started', {'conversationId': 'full-c1'}))
        ..add(_frame('text_chunk', {'text': 'in flight'}));
    });

    notifier.openFull();
    final firstSend = notifier.sendMessage('first');
    await Future<void>.delayed(const Duration(milliseconds: 60));

    final streaming =
        container.read(assistantStateMachineProvider) as AssistantFullReading;
    expect(streaming.streaming, isTrue);

    adapter.prepareNext();
    scriptHappyPath(conversationId: 'full-c1', messageId: 'full-msg-2');
    await notifier.sendMessage('second');
    await Future<void>.delayed(const Duration(milliseconds: 60));
    await firstSend;

    expect(adapter.capturedRequests, hasLength(2));
    final secondBody = adapter.capturedRequests[1].data as Map<String, dynamic>;
    expect(secondBody['conversationId'], 'full-c1');
    final state =
        container.read(assistantStateMachineProvider) as AssistantFullReading;
    expect(state.streaming, isFalse);
    expect(state.interrupted, isFalse);
    expect(state.messageId, 'full-msg-2');
  });

  test('closing Full collapses and drops conversationId', () async {
    scriptHappyPath(conversationId: 'conv-full-close');
    notifier.openFull();
    await notifier.sendMessage('hello');
    await Future<void>.delayed(const Duration(milliseconds: 50));

    expect(notifier.conversationIdForTesting, 'conv-full-close');

    await notifier.closeFull();

    expect(notifier.conversationIdForTesting, isNull);
    expect(
      container.read(assistantStateMachineProvider),
      isA<AssistantCollapsed>(),
    );
  });

  test('Reset drops the conversationId so the next send creates a new '
      'Conversation with the now-current screenContext', () async {
    scriptHappyPath(conversationId: 'conv-A');
    notifier.openBar();
    await notifier.sendMessage('first on screen A');
    await Future<void>.delayed(const Duration(milliseconds: 50));

    // Simulate route change → currentScreenContextProvider re-resolves.
    // Because we don't register any builders, the fallback uses
    // location for displayName, which is fine for assertion.
    container
        .read(currentRouteMatchProvider.notifier)
        .update(
          const RouteMatch(
            routePattern: '/lessons/:id',
            location: '/lessons/xyz',
            pathParameters: {'id': 'xyz'},
          ),
        );

    await notifier.reset();
    expect(notifier.conversationIdForTesting, isNull);

    adapter.prepareNext();
    scriptHappyPath(conversationId: 'conv-B');
    await notifier.sendMessage('second on screen B');
    await Future<void>.delayed(const Duration(milliseconds: 50));

    expect(adapter.capturedRequests, hasLength(2));
    final secondBody = adapter.capturedRequests[1].data as Map<String, dynamic>;
    expect(
      secondBody.containsKey('conversationId'),
      isFalse,
      reason:
          'Reset must drop conversationId so the server creates a '
          'fresh Conversation with the current screenContext',
    );
    final screenContext = secondBody['screenContext'] as Map<String, dynamic>;
    expect(screenContext['route'], '/lessons/xyz');
    expect(notifier.conversationIdForTesting, 'conv-B');
  });

  test('rapid send: a second sendMessage cancels the in-flight stream without '
      'emitting an error to the state machine', () async {
    // First send — emit conversation_started + first text_chunk, then
    // stall (don't close).
    scheduleMicrotask(() async {
      await Future<void>.delayed(const Duration(milliseconds: 10));
      adapter.controller
        ..add(_frame('conversation_started', {'conversationId': 'c1'}))
        ..add(_frame('text_chunk', {'text': 'in flight'}));
    });

    notifier.openBar();
    final firstSend = notifier.sendMessage('first');
    await Future<void>.delayed(const Duration(milliseconds: 60));

    // We should be in MidReading(streaming) at this point.
    final midStream = container.read(assistantStateMachineProvider);
    expect(midStream, isA<AssistantMidReading>());
    expect((midStream as AssistantMidReading).streaming, isTrue);

    // Now issue a rapid second send.
    adapter.prepareNext();
    scriptHappyPath(conversationId: 'c1', messageId: 'msg-2');
    await notifier.sendMessage('second');
    await Future<void>.delayed(const Duration(milliseconds: 60));

    // Done with the original send future too.
    await firstSend;

    expect(adapter.capturedRequests, hasLength(2));
    final finalState =
        container.read(assistantStateMachineProvider) as AssistantMidReading;
    expect(
      finalState.streaming,
      isFalse,
      reason: 'second stream must reach done',
    );
    expect(finalState.interrupted, isFalse);
  });

  test('pre-token error transitions to MidError; retry re-issues the same '
      'message', () async {
    // Don't send any events — close the stream after emitting an
    // `error` frame, which decodes to AssistantErrorEvent.
    scheduleMicrotask(() async {
      await Future<void>.delayed(const Duration(milliseconds: 10));
      adapter.controller.add(
        _frame('error', {'code': 'AI_X', 'message': 'Server fell over'}),
      );
      await adapter.controller.close();
    });

    notifier.openBar();
    await notifier.sendMessage('please answer');
    await Future<void>.delayed(const Duration(milliseconds: 60));

    final errState =
        container.read(assistantStateMachineProvider) as AssistantMidError;
    expect(errState.message, 'Server fell over');
    expect(errState.lastInput, 'please answer');

    adapter.prepareNext();
    scriptHappyPath(conversationId: 'c-retry');
    await notifier.retry();
    await Future<void>.delayed(const Duration(milliseconds: 60));

    expect(adapter.capturedRequests, hasLength(2));
    final retryBody = adapter.capturedRequests[1].data as Map<String, dynamic>;
    expect(retryBody['message'], 'please answer');
    final final_ =
        container.read(assistantStateMachineProvider) as AssistantMidReading;
    expect(final_.isDone, isTrue);
  });

  test(
    'Stop tapped mid-stream cancels Dio and transitions to interrupted done',
    () async {
      scheduleMicrotask(() async {
        await Future<void>.delayed(const Duration(milliseconds: 10));
        adapter.controller
          ..add(_frame('conversation_started', {'conversationId': 'c1'}))
          ..add(_frame('text_chunk', {'text': 'partial'}));
        // Stall — don't close. The Stop call below should propagate to
        // adapter.controller via cancelFuture.
      });

      notifier.openBar();
      final pending = notifier.sendMessage('q');
      await Future<void>.delayed(const Duration(milliseconds: 50));

      notifier.stop();
      await Future<void>.delayed(const Duration(milliseconds: 30));

      final s =
          container.read(assistantStateMachineProvider) as AssistantMidReading;
      expect(s.isDone, isTrue);
      expect(s.interrupted, isTrue);
      expect(s.partial, 'partial');

      await pending;
    },
  );
}
