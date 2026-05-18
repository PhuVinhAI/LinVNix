import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/assistant_event.dart';
import '../domain/assistant_state.dart';

/// Pure-logic Riverpod notifier encoding the PRD's "Mobile UI state
/// machine" (see PRD §"Mobile UI state machine — Assistant State
/// Machine"). All transitions are explicit; invalid transitions throw
/// [StateError] so a buggy caller (e.g. emitting a `text_chunk` after a
/// `done`) fails loudly during development.
///
/// The notifier is intentionally I/O-free: it knows nothing about the
/// SSE stream, Dio, or the network. The `AssistantChatNotifier` orchestrates
/// the actual stream subscription and feeds events into this machine.
class AssistantStateMachine extends Notifier<AssistantState> {
  @override
  AssistantState build() => const AssistantCollapsed();

  /// Bar tap / drag-up: Collapsed → MidCompose.
  void openBar() {
    if (state is! AssistantCollapsed) {
      throw _invalid('openBar');
    }
    state = const AssistantMidCompose();
  }

  /// Bar long-press: Collapsed → FullCompose.
  void openFull() {
    if (state is! AssistantCollapsed) {
      throw _invalid('openFull');
    }
    state = const AssistantFullCompose();
  }

  /// Send tapped: Compose/Error → Loading on the current surface.
  void send(String input) {
    final s = state;
    if (s is AssistantMidCompose || s is AssistantMidError) {
      state = AssistantMidLoading(lastInput: input);
      return;
    }
    if (s is AssistantFullCompose || s is AssistantFullError) {
      state = AssistantFullLoading(lastInput: input);
      return;
    }
    throw _invalid('send');
  }

  /// `tool_start` event arrived. Updates the loading-phase status text.
  /// The PRD pins the source of [displayName] to the tool's own
  /// declaration (e.g. "Đang tóm tắt thông tin của bạn..."), not a
  /// generic fallback.
  void onToolStart({required String displayName}) {
    final s = state;
    if (s is AssistantMidLoading) {
      state = AssistantMidLoading(
        lastInput: s.lastInput,
        statusText: displayName,
      );
      return;
    }
    if (s is AssistantFullLoading) {
      state = AssistantFullLoading(
        lastInput: s.lastInput,
        statusText: displayName,
      );
      return;
    }
    throw _invalid('onToolStart');
  }

  /// `text_chunk` event arrived. From MidLoading this transitions into
  /// MidReading(streaming); subsequent chunks append to `partial`.
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
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    if (s is AssistantFullLoading) {
      state = AssistantFullReading(partial: text, streaming: true);
      return;
    }
    if (s is AssistantFullReading && s.streaming) {
      state = AssistantFullReading(
        partial: s.partial + text,
        streaming: true,
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    throw _invalid('onTextChunk');
  }

  /// `propose` event arrived. Appends a new [ProposalState] to the
  /// current MidReading state's proposals list. Valid while streaming
  /// (the propose event arrives mid-stream, before `done`).
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
        messageId: s.messageId,
        proposals: [...s.proposals, proposal],
      );
      return;
    }
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
        messageId: s.messageId,
        proposals: [...s.proposals, proposal],
      );
      return;
    }
    throw _invalid('onPropose');
  }

  /// `error` event arrived. From MidLoading (no token yet) transitions
  /// to MidError so the UI can show a "Thử lại" button. From mid-stream
  /// MidReading, the partial text is preserved and the stream is
  /// considered done with `interrupted=true`.
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
    throw _invalid('onError');
  }

  /// `done` event arrived. Terminal for the turn. From MidLoading
  /// (server skipped any text — unusual but possible for tool-only
  /// turns) transitions to MidReading(done) with an empty partial.
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
    throw _invalid('onDone');
  }

  /// Stop tapped — UI-side cancellation. The notifier separately cancels
  /// the Dio `CancelToken`; here we synthesize the terminal
  /// "interrupted done" UI state so the user immediately sees "Đã dừng"
  /// and "Soạn tiếp" instead of staring at a frozen spinner.
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
      state = const AssistantFullReading(
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

  /// "Soạn tiếp" tapped — clears the on-screen answer and returns to
  /// Compose. Server-side conversation is preserved by the chat
  /// notifier (which keeps the cached `conversationId`).
  void composeAgain() {
    final s = state;
    if (s is AssistantMidReading && !s.streaming) {
      state = const AssistantMidCompose();
      return;
    }
    if (s is AssistantFullReading && !s.streaming) {
      state = const AssistantFullCompose();
      return;
    }
    throw _invalid('composeAgain');
  }

  /// "Reset" button — drops the current conversation and returns to
  /// Compose. Valid from any non-Collapsed state. The chat notifier
  /// separately clears its cached `conversationId`.
  void reset() {
    if (state is AssistantCollapsed) {
      throw _invalid('reset');
    }
    state = switch (state) {
      AssistantFullCompose() ||
      AssistantFullLoading() ||
      AssistantFullReading() ||
      AssistantFullError() => const AssistantFullCompose(),
      _ => const AssistantMidCompose(),
    };
  }

  /// Backdrop tap, "−" button, drag-down — back to Collapsed.
  void collapse() {
    if (state is AssistantCollapsed) {
      throw _invalid('collapse');
    }
    state = const AssistantCollapsed();
  }

  /// Drag-up from any Mid state → mirrored Full state.
  void enterFull() {
    final s = state;
    if (s is AssistantMidCompose) {
      state = const AssistantFullCompose();
      return;
    }
    if (s is AssistantMidLoading) {
      state = AssistantFullLoading(
        lastInput: s.lastInput,
        statusText: s.statusText,
      );
      return;
    }
    if (s is AssistantMidReading) {
      state = AssistantFullReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: s.proposals,
      );
      return;
    }
    if (s is AssistantMidError) {
      state = AssistantFullError(message: s.message, lastInput: s.lastInput);
      return;
    }
    throw _invalid('enterFull');
  }

  /// Updates a single proposal's status within the current MidReading
  /// state. Used by the ProposalCard to reflect confirm/decline/error
  /// transitions.
  void updateProposal(int index, ProposalState updated) {
    final s = state;
    final proposals = switch (s) {
      AssistantMidReading(:final proposals) => List<ProposalState>.from(
        proposals,
      ),
      AssistantFullReading(:final proposals) => List<ProposalState>.from(
        proposals,
      ),
      _ => throw _invalid('updateProposal'),
    };
    if (index < 0 || index >= proposals.length) {
      throw RangeError.index(index, proposals, 'proposals');
    }
    proposals[index] = updated;
    state = switch (s) {
      AssistantMidReading() => AssistantMidReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      ),
      AssistantFullReading() => AssistantFullReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      ),
      _ => throw _invalid('updateProposal'),
    };
  }

  /// Removes a proposal (decline). The card is dismissed.
  void dismissProposal(int index) {
    final s = state;
    final proposals = switch (s) {
      AssistantMidReading(:final proposals) => List<ProposalState>.from(
        proposals,
      ),
      AssistantFullReading(:final proposals) => List<ProposalState>.from(
        proposals,
      ),
      _ => throw _invalid('dismissProposal'),
    };
    if (index < 0 || index >= proposals.length) {
      throw RangeError.index(index, proposals, 'proposals');
    }
    proposals.removeAt(index);
    state = switch (s) {
      AssistantMidReading() => AssistantMidReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      ),
      AssistantFullReading() => AssistantFullReading(
        partial: s.partial,
        streaming: s.streaming,
        interrupted: s.interrupted,
        messageId: s.messageId,
        proposals: proposals,
      ),
      _ => throw _invalid('dismissProposal'),
    };
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
