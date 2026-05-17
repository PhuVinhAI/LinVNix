import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/ai_api.dart';
import '../data/ai_api_provider.dart';
import '../data/screen_context_provider.dart';
import '../domain/assistant_event.dart';
import '../domain/assistant_state.dart';
import 'assistant_state_machine.dart';

/// Orchestrator that wires [AiApi.chatStream] into [AssistantStateMachine].
/// Owns the in-flight Dio `CancelToken` and stream subscription so the
/// widget tree never touches them directly.
///
/// V2 changes:
/// - [openFullDirect] — long-press bar → FullCompose (skip Mid sheet).
/// - [sendMessage] handles Full source states in addition to Mid.
/// - [_handleEvent] dispatches SSE events for Full states.
/// - [enterFull] mirrors Mid→Full (stream continues uninterrupted).
/// - [closeFull] collapses (→ Collapsed) and drops conversationId.
/// - [retry] works for both MidError and FullError.
class AssistantChatNotifier {
  AssistantChatNotifier(this._ref);

  final Ref _ref;

  CancelToken? _cancelToken;
  StreamSubscription<AssistantEvent>? _subscription;
  String? _conversationId;
  bool _userCancelled = false;

  @visibleForTesting
  String? get conversationIdForTesting => _conversationId;

  /// The current conversation ID. Used by the full-screen widget to
  /// load conversation messages.
  String? get conversationId => _conversationId;

  // ─────────────────────────────────────────────────────
  // Entry points
  // ─────────────────────────────────────────────────────

  /// Bar tap: Collapsed → MidCompose. Idempotent (no-op if not Collapsed).
  void openBar() {
    if (_ref.read(assistantStateMachineProvider) is! AssistantCollapsed) return;
    _ref.read(assistantStateMachineProvider.notifier).openBar();
  }

  /// Long-press bar: Collapsed → FullCompose. Navigate to AssistantFullScreen
  /// is handled by the caller (AssistantBar widget).
  void openFullDirect() {
    if (_ref.read(assistantStateMachineProvider) is! AssistantCollapsed) return;
    _ref.read(assistantStateMachineProvider.notifier).openFullDirect();
  }

  // ─────────────────────────────────────────────────────
  // Send
  // ─────────────────────────────────────────────────────

  /// User tapped Send. Works from Mid or Full surface.
  ///
  /// Handles all source-state scenarios:
  /// - MidCompose / MidError / FullCompose / FullError → loading (normal)
  /// - MidReading(done) → implicit Soạn tiếp → loading
  /// - FullReading(done) → implicit compose → loading (rapid-send)
  /// - *Loading / *Reading(streaming) → stop + composeAgain + send (rapid-send)
  /// - Collapsed → open bar defensively, then send
  Future<void> sendMessage(String message) async {
    final trimmed = message.trim();
    if (trimmed.isEmpty) return;

    await _cancelInFlight();

    final sm = _ref.read(assistantStateMachineProvider.notifier);
    final current = _ref.read(assistantStateMachineProvider);
    final isFullContext = _isFullState(current);

    // ── Bring SM to a send()-accepting state ──────────────────────────
    if (current is AssistantMidLoading ||
        (current is AssistantMidReading && current.streaming)) {
      sm.stop();
      sm.composeAgain();
    } else if (current is AssistantMidReading) {
      // done — implicit Soạn tiếp
      sm.composeAgain();
    } else if (current is AssistantFullLoading ||
        (current is AssistantFullReading && current.streaming)) {
      sm.stop();
      // After stop from Full, state becomes FullReading(done) — just
      // proceed; sendFull() below accepts FullReading(done)? Actually
      // sendFull only accepts FullCompose/FullError, so we need to clear
      // to FullCompose first.
      state = const AssistantFullCompose();
    } else if (current is AssistantFullReading) {
      // FullReading(done) — rapid-send: reset to FullCompose
      state = const AssistantFullCompose();
    } else if (current is AssistantCollapsed) {
      sm.openBar();
    }

    // ── Drive state machine to Loading ────────────────────────────────
    final fresh = _ref.read(assistantStateMachineProvider);
    if (_isFullState(fresh) || isFullContext) {
      sm.sendFull(trimmed);
    } else {
      sm.send(trimmed);
    }

    // ── Open SSE stream ───────────────────────────────────────────────
    final cancelToken = CancelToken();
    _cancelToken = cancelToken;
    _userCancelled = false;

    final screenContext = _ref.read(currentScreenContextProvider);
    final api = _ref.read(aiApiProvider);

    try {
      _subscription = api
          .chatStream(
            message: trimmed,
            conversationId: _conversationId,
            screenContext: screenContext,
            cancelToken: cancelToken,
          )
          .listen(
            _handleEvent,
            onError: _handleStreamError,
            onDone: _handleStreamDone,
            cancelOnError: true,
          );
    } catch (e) {
      _handleStreamError(e);
    }
  }

  // ─────────────────────────────────────────────────────
  // Controls
  // ─────────────────────────────────────────────────────

  /// Stop button tapped. Valid during *Loading or *Reading(streaming).
  void stop() {
    if (_cancelToken == null && _subscription == null) return;
    _userCancelled = true;
    _cancelToken?.cancel('user pressed Stop');
    _ref.read(assistantStateMachineProvider.notifier).stop();
  }

  /// "Soạn tiếp" (Mid only): MidReading(done) → MidCompose.
  void composeAgain() {
    _ref.read(assistantStateMachineProvider.notifier).composeAgain();
  }

  /// Reset. Mid → MidCompose, Full → FullCompose. Drops conversationId.
  Future<void> reset() async {
    await _cancelInFlight();
    _conversationId = null;
    _ref.read(assistantStateMachineProvider.notifier).reset();
  }

  /// Backdrop tap / "−" button / drag-down (Mid). Drops conversationId.
  Future<void> collapse() async {
    await _cancelInFlight();
    _conversationId = null;
    _ref.read(assistantStateMachineProvider.notifier).collapse();
  }

  /// "Toàn màn hình" tap in Mid sheet. Mirrors Mid→Full state mapping.
  /// Stream continues uninterrupted (no cancel). Navigate to
  /// AssistantFullScreen is handled by the caller.
  void enterFull() {
    _ref.read(assistantStateMachineProvider.notifier).enterFull();
  }

  /// Back gesture or close button on AssistantFullScreen → Collapsed.
  /// Drops conversationId per PRD.
  Future<void> closeFull() async {
    await _cancelInFlight();
    _conversationId = null;
    _ref.read(assistantStateMachineProvider.notifier).collapse();
  }

  /// Open existing conversation from drawer. Sets conversationId and
  /// navigates to compose in the current surface.
  void openExistingConversation(String conversationId) {
    _conversationId = conversationId;
    final sm = _ref.read(assistantStateMachineProvider.notifier);
    final current = _ref.read(assistantStateMachineProvider);
    if (current is AssistantCollapsed) {
      sm.openBar();
    }
    // If already in Full or Mid, just loading the conversation is
    // enough — the screen will reload messages via conversationId.
  }

  /// Retry from error state. Works for both MidError and FullError.
  Future<void> retry() async {
    final s = _ref.read(assistantStateMachineProvider);
    if (s is AssistantMidError) {
      await sendMessage(s.lastInput);
    } else if (s is AssistantFullError) {
      await sendMessage(s.lastInput);
    }
  }

  // ─────────────────────────────────────────────────────
  // Proposal helpers
  // ─────────────────────────────────────────────────────

  void updateProposal(int index, ProposalState updated) {
    _ref.read(assistantStateMachineProvider.notifier).updateProposal(index, updated);
  }

  void dismissProposal(int index) {
    _ref.read(assistantStateMachineProvider.notifier).dismissProposal(index);
  }

  // ─────────────────────────────────────────────────────
  // SSE event dispatcher
  // ─────────────────────────────────────────────────────

  void _handleEvent(AssistantEvent event) {
    final sm = _ref.read(assistantStateMachineProvider.notifier);
    final current = _ref.read(assistantStateMachineProvider);

    switch (event) {
      case ConversationStartedEvent(:final conversationId):
        _conversationId = conversationId;

      case ToolStartEvent(:final displayName):
        if (current is AssistantMidLoading) {
          sm.onToolStart(displayName: displayName);
        } else if (current is AssistantFullLoading) {
          sm.onToolStartFull(displayName: displayName);
        }

      case ToolResultEvent():
        // No state change — tool_result is logged server-side.
        break;

      case TextChunkEvent(:final text):
        if (current is AssistantMidLoading ||
            (current is AssistantMidReading && current.streaming)) {
          sm.onTextChunk(text);
        } else if (current is AssistantFullLoading ||
            (current is AssistantFullReading && current.streaming)) {
          sm.onTextChunkFull(text);
        }

      case ProposeEvent():
        if (current is AssistantMidReading && current.streaming) {
          sm.onPropose(event);
        } else if (current is AssistantFullReading && current.streaming) {
          sm.onProposeFull(event);
        }

      case AssistantErrorEvent(:final message):
        if (current is AssistantMidLoading ||
            (current is AssistantMidReading && current.streaming)) {
          sm.onError(message: message);
        } else if (current is AssistantFullLoading ||
            (current is AssistantFullReading && current.streaming)) {
          sm.onErrorFull(message: message);
        }

      case DoneEvent(:final messageId, :final interrupted):
        if (current is AssistantMidLoading ||
            (current is AssistantMidReading && current.streaming)) {
          sm.onDone(messageId: messageId, interrupted: interrupted);
        } else if (current is AssistantFullLoading ||
            (current is AssistantFullReading && current.streaming)) {
          sm.onDoneFull(messageId: messageId, interrupted: interrupted);
        }
    }
  }

  void _handleStreamError(Object error, [StackTrace? _]) {
    if (_userCancelled) {
      _cleanup();
      return;
    }
    if (error is DioException && error.type == DioExceptionType.cancel) {
      _cleanup();
      return;
    }

    final message = _humanReadableError(error);
    final sm = _ref.read(assistantStateMachineProvider.notifier);
    final current = _ref.read(assistantStateMachineProvider);
    if (current is AssistantMidLoading ||
        (current is AssistantMidReading && current.streaming)) {
      sm.onError(message: message);
    } else if (current is AssistantFullLoading ||
        (current is AssistantFullReading && current.streaming)) {
      sm.onErrorFull(message: message);
    }
    _cleanup();
  }

  void _handleStreamDone() {
    // Stream closed without a `done` event — treat as a network drop.
    final current = _ref.read(assistantStateMachineProvider);
    final sm = _ref.read(assistantStateMachineProvider.notifier);
    if (current is AssistantMidLoading ||
        (current is AssistantMidReading && current.streaming)) {
      sm.onError(message: 'Kết nối bị ngắt, vui lòng thử lại.');
    } else if (current is AssistantFullLoading ||
        (current is AssistantFullReading && current.streaming)) {
      sm.onErrorFull(message: 'Kết nối bị ngắt, vui lòng thử lại.');
    }
    _cleanup();
  }

  // ─────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────

  /// Whether [s] is a Full surface state.
  bool _isFullState(AssistantState s) =>
      s is AssistantFullCompose ||
      s is AssistantFullLoading ||
      s is AssistantFullReading ||
      s is AssistantFullError;

  Future<void> _cancelInFlight() async {
    _cancelToken?.cancel('cancelled before new send');
    await _subscription?.cancel();
    _subscription = null;
    _cancelToken = null;
  }

  void _cleanup() {
    _subscription = null;
    _cancelToken = null;
  }

  String _humanReadableError(Object error) {
    if (error is DioException) {
      final code = error.response?.statusCode;
      if (code == 429) return 'Bạn đang hỏi quá nhiều, vui lòng thử lại sau.';
      if (code == 503) return 'Dịch vụ AI đang bảo trì, thử lại sau nhé.';
      return 'Không thể kết nối tới máy chủ, vui lòng kiểm tra mạng.';
    }
    return 'Có lỗi xảy ra, vui lòng thử lại.';
  }

  // Workaround: allow internal collapse to FullCompose without going
  // through public API when doing rapid-send cleanup.
  set state(AssistantState s) =>
      _ref.read(assistantStateMachineProvider.notifier).state = s;
}

final assistantChatNotifierProvider = Provider<AssistantChatNotifier>((ref) {
  return AssistantChatNotifier(ref);
});
