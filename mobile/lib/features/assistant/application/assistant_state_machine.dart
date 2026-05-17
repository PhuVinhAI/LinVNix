import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/assistant_event.dart';
import '../domain/assistant_state.dart';

/// Pure-logic Riverpod notifier encoding the PRD's "Mobile UI state
/// machine" — V2 with 9 states and independent Full surface.
///
/// All transitions are explicit; invalid transitions throw [StateError]
/// so a buggy caller fails loudly during development.
///
/// I/O-free: knows nothing about SSE, Dio, or the network. The
/// [AssistantChatNotifier] orchestrates the stream and feeds events here.
///
/// V2 changes vs V1:
/// - `AssistantFull(priorState)` → 4 dedicated Full states
///   (FullCompose, FullLoading, FullReading, FullError)
/// - `exitFull()` / `priorState` removed — closing Full always → Collapsed
/// - `openFullDirect()` added — long-press bar → FullCompose (skip Mid)
/// - `enterFull()` now mirrors Mid→Full state mapping
/// - `reset()` in Full stays in Full (→ FullCompose)
/// - `collapse()` valid from any state except Collapsed (including Full)
class AssistantStateMachine extends Notifier<AssistantState> {
  @override
  AssistantState build() => const AssistantCollapsed();

  // ─────────────────────────────────────────────────────
  // Entry points
  // ─────────────────────────────────────────────────────

  /// Bar tap: Collapsed → MidCompose.
  void openBar() {
    if (state is! AssistantCollapsed) throw _invalid('openBar');
    state = const AssistantMidCompose();
  }

  /// Long-press bar: Collapsed → FullCompose (skip Mid bottom sheet).
  void openFullDirect() {
    if (state is! AssistantCollapsed) throw _invalid('openFullDirect');
    state = const AssistantFullCompose();
  }

  // ─────────────────────────────────────────────────────
  // Mid transitions
  // ─────────────────────────────────────────────────────

  /// Send tapped in Mid: MidCompose | MidError → MidLoading.
  void send(String input) {
    final s = state;
    if (s is! AssistantMidCompose && s is! AssistantMidError) {
      throw _invalid('send');
    }
    state = AssistantMidLoading(lastInput: input);
  }

  /// `tool_start` in Mid: updates status text.
  void onToolStart({required String displayName}) {
    final s = state;
    if (s is AssistantMidLoading) {
      state = AssistantMidLoading(
        lastInput: s.lastInput,
        statusText: displayName,
      );
      return;
    }
    throw _invalid('onToolStart');
  }

  /// `text_chunk` in Mid: MidLoading → MidReading(streaming), or append.
  void onTextChunk(String text) {
    final s = state;
    if (s is AssistantMidLoading) {
      state = AssistantMidReading(partial: text, streaming: true);
      return;
    }
    if (s is AssistantMidReading && s.streaming) {
      state = AssistantMidReading(
        partial: s.partial + text,
        streaming: true,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onTextChunk');
  }

  /// `propose` in Mid: appends proposal to MidReading.
  void onPropose(ProposeEvent event) {
    final s = state;
    if (s is AssistantMidReading && s.streaming) {
      final proposal = ProposalState(
        kind: event.kind,
        title: event.title,
        description: event.description,
        endpoint: event.endpoint,
        payload: event.payload,
        confirmLabel: event.confirmLabel,
        declineLabel: event.declineLabel,
      );
      state = AssistantMidReading(
        partial: s.partial,
        streaming: true,
        proposals: [...s.proposals, proposal],
      );
      return;
    }
    throw _invalid('onPropose');
  }

  /// `error` in Mid: MidLoading → MidError | MidReading(interrupted).
  void onError({required String message}) {
    final s = state;
    if (s is AssistantMidLoading) {
      state = AssistantMidError(message: message, lastInput: s.lastInput);
      return;
    }
    if (s is AssistantMidReading && s.streaming) {
      state = AssistantMidReading(
        partial: s.partial,
        streaming: false,
        interrupted: true,
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onError');
  }

  /// `done` in Mid: → MidReading(done).
  void onDone({required String messageId, required bool interrupted}) {
    final s = state;
    if (s is AssistantMidLoading) {
      state = AssistantMidReading(
        partial: '',
        streaming: false,
        interrupted: interrupted,
        messageId: messageId,
      );
      return;
    }
    if (s is AssistantMidReading && s.streaming) {
      state = AssistantMidReading(
        partial: s.partial,
        streaming: false,
        interrupted: interrupted,
        messageId: messageId,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onDone');
  }

  // ─────────────────────────────────────────────────────
  // Full transitions
  // ─────────────────────────────────────────────────────

  /// Send tapped in Full: FullCompose | FullError → FullLoading.
  void sendFull(String input) {
    final s = state;
    if (s is! AssistantFullCompose && s is! AssistantFullError) {
      throw _invalid('sendFull');
    }
    state = AssistantFullLoading(lastInput: input);
  }

  /// `tool_start` in Full: updates status text on FullLoading.
  void onToolStartFull({required String displayName}) {
    final s = state;
    if (s is AssistantFullLoading) {
      state = AssistantFullLoading(
        lastInput: s.lastInput,
        statusText: displayName,
      );
      return;
    }
    throw _invalid('onToolStartFull');
  }

  /// `text_chunk` in Full: FullLoading → FullReading(streaming), or append.
  void onTextChunkFull(String text) {
    final s = state;
    if (s is AssistantFullLoading) {
      state = AssistantFullReading(partial: text, streaming: true);
      return;
    }
    if (s is AssistantFullReading && s.streaming) {
      state = AssistantFullReading(
        partial: s.partial + text,
        streaming: true,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onTextChunkFull');
  }

  /// `propose` in Full: appends proposal to FullReading.
  void onProposeFull(ProposeEvent event) {
    final s = state;
    if (s is AssistantFullReading && s.streaming) {
      final proposal = ProposalState(
        kind: event.kind,
        title: event.title,
        description: event.description,
        endpoint: event.endpoint,
        payload: event.payload,
        confirmLabel: event.confirmLabel,
        declineLabel: event.declineLabel,
      );
      state = AssistantFullReading(
        partial: s.partial,
        streaming: true,
        proposals: [...s.proposals, proposal],
      );
      return;
    }
    throw _invalid('onProposeFull');
  }

  /// `error` in Full: FullLoading → FullError | FullReading(interrupted).
  void onErrorFull({required String message}) {
    final s = state;
    if (s is AssistantFullLoading) {
      state = AssistantFullError(message: message, lastInput: s.lastInput);
      return;
    }
    if (s is AssistantFullReading && s.streaming) {
      state = AssistantFullReading(
        partial: s.partial,
        streaming: false,
        interrupted: true,
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onErrorFull');
  }

  /// `done` in Full: → FullReading(done).
  void onDoneFull({required String messageId, required bool interrupted}) {
    final s = state;
    if (s is AssistantFullLoading) {
      state = AssistantFullReading(
        partial: '',
        streaming: false,
        interrupted: interrupted,
        messageId: messageId,
      );
      return;
    }
    if (s is AssistantFullReading && s.streaming) {
      state = AssistantFullReading(
        partial: s.partial,
        streaming: false,
        interrupted: interrupted,
        messageId: messageId,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onDoneFull');
  }

  // ─────────────────────────────────────────────────────
  // Shared transitions (Mid & Full)
  // ─────────────────────────────────────────────────────

  /// Stop tapped. Synthesises interrupted terminal state immediately.
  /// Valid from any *Loading or *Reading(streaming) state.
  void stop() {
    final s = state;
    if (s is AssistantMidLoading) {
      state = AssistantMidReading(
        partial: '',
        streaming: false,
        interrupted: true,
      );
      return;
    }
    if (s is AssistantMidReading && s.streaming) {
      state = AssistantMidReading(
        partial: s.partial,
        streaming: false,
        interrupted: true,
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    if (s is AssistantFullLoading) {
      state = AssistantFullReading(
        partial: '',
        streaming: false,
        interrupted: true,
      );
      return;
    }
    if (s is AssistantFullReading && s.streaming) {
      state = AssistantFullReading(
        partial: s.partial,
        streaming: false,
        interrupted: true,
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('stop');
  }

  /// "Soạn tiếp" (Mid only): MidReading(done) → MidCompose.
  void composeAgain() {
    final s = state;
    if (s is! AssistantMidReading || s.streaming) throw _invalid('composeAgain');
    state = const AssistantMidCompose();
  }

  /// Reset button. Mid → MidCompose, Full → FullCompose.
  /// Drops conversationId via [AssistantChatNotifier].
  void reset() {
    final s = state;
    if (s is AssistantCollapsed) throw _invalid('reset');
    if (s is AssistantFullCompose ||
        s is AssistantFullLoading ||
        s is AssistantFullReading ||
        s is AssistantFullError) {
      state = const AssistantFullCompose();
    } else {
      state = const AssistantMidCompose();
    }
  }

  /// Backdrop tap / "−" button / drag-down (Mid) or back/close (Full) →
  /// Collapsed. Drops conversationId via [AssistantChatNotifier].
  void collapse() {
    if (state is AssistantCollapsed) throw _invalid('collapse');
    state = const AssistantCollapsed();
  }

  /// Drag-up / tap "Toàn màn hình" from Mid → Full mirror state:
  ///   MidCompose → FullCompose
  ///   MidLoading → FullLoading
  ///   MidReading → FullReading
  ///   MidError   → FullError
  void enterFull() {
    final s = state;
    switch (s) {
      case AssistantMidCompose():
        state = const AssistantFullCompose();
      case AssistantMidLoading(:final lastInput, :final statusText):
        state = AssistantFullLoading(lastInput: lastInput, statusText: statusText);
      case AssistantMidReading(
          :final partial,
          :final streaming,
          :final interrupted,
          :final messageId,
          :final proposals,
        ):
        state = AssistantFullReading(
          partial: partial,
          streaming: streaming,
          interrupted: interrupted,
          messageId: messageId,
          proposals: proposals,
        );
      case AssistantMidError(:final message, :final lastInput):
        state = AssistantFullError(message: message, lastInput: lastInput);
      default:
        throw _invalid('enterFull');
    }
  }

  // ─────────────────────────────────────────────────────
  // Proposal helpers (work on whichever *Reading is active)
  // ─────────────────────────────────────────────────────

  void updateProposal(int index, ProposalState updated) {
    final s = state;
    if (s is AssistantMidReading) {
      final proposals = List<ProposalState>.from(s.proposals);
      _assertIndex(index, proposals);
      proposals[index] = updated;
      state = AssistantMidReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      );
      return;
    }
    if (s is AssistantFullReading) {
      final proposals = List<ProposalState>.from(s.proposals);
      _assertIndex(index, proposals);
      proposals[index] = updated;
      state = AssistantFullReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      );
      return;
    }
    throw _invalid('updateProposal');
  }

  void dismissProposal(int index) {
    final s = state;
    if (s is AssistantMidReading) {
      final proposals = List<ProposalState>.from(s.proposals);
      _assertIndex(index, proposals);
      proposals.removeAt(index);
      state = AssistantMidReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      );
      return;
    }
    if (s is AssistantFullReading) {
      final proposals = List<ProposalState>.from(s.proposals);
      _assertIndex(index, proposals);
      proposals.removeAt(index);
      state = AssistantFullReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      );
      return;
    }
    throw _invalid('dismissProposal');
  }

  // ─────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────

  void _assertIndex(int index, List<ProposalState> list) {
    if (index < 0 || index >= list.length) {
      throw RangeError.index(index, list, 'proposals');
    }
  }

  StateError _invalid(String op) => StateError(
        'AssistantStateMachine.$op called in invalid state: '
        '${state.runtimeType}',
      );
}

final assistantStateMachineProvider =
    NotifierProvider<AssistantStateMachine, AssistantState>(
  AssistantStateMachine.new,
);
