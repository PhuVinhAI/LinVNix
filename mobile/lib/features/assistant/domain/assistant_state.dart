import 'package:flutter/foundation.dart';

/// UI states for the Trợ lý AI surface. Drives both the `AssistantBar`,
/// `AssistantQuestionSheet`, and `AssistantFullScreen` widgets through a
/// single Riverpod notifier.
///
/// V2: 9 states — 5 Mid/Collapsed (unchanged) + 4 dedicated Full states
/// replacing the single `AssistantFull(priorState)`. Closing Full always
/// goes to Collapsed; `priorState` is removed entirely.
@immutable
sealed class AssistantState {
  const AssistantState();
}

// ─────────────────────────────────────────────────────────
// Shared / Collapsed
// ─────────────────────────────────────────────────────────

/// Default state. Sheet is hidden; only the bar is visible.
class AssistantCollapsed extends AssistantState {
  const AssistantCollapsed();

  @override
  bool operator ==(Object other) => other is AssistantCollapsed;

  @override
  int get hashCode => 0;

  @override
  String toString() => 'AssistantCollapsed';
}

// ─────────────────────────────────────────────────────────
// Mid states (bottom-sheet / "Hỏi" surface)
// ─────────────────────────────────────────────────────────

/// Compose phase of the Mid (Hỏi) state — textarea visible, Send tappable.
class AssistantMidCompose extends AssistantState {
  const AssistantMidCompose();

  @override
  bool operator ==(Object other) => other is AssistantMidCompose;

  @override
  int get hashCode => 0;

  @override
  String toString() => 'AssistantMidCompose';
}

/// Loading phase — spinner + per-tool status text + Stop. Entered when
/// the user taps Send; exits to MidReading on the first `text_chunk` or
/// to MidError on a pre-token error.
class AssistantMidLoading extends AssistantState {
  const AssistantMidLoading({
    required this.lastInput,
    this.statusText = defaultStatusText,
  });

  static const String defaultStatusText = 'Đang suy nghĩ...';

  final String lastInput;
  final String statusText;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssistantMidLoading &&
          lastInput == other.lastInput &&
          statusText == other.statusText;

  @override
  int get hashCode => Object.hash(lastInput, statusText);

  @override
  String toString() =>
      'AssistantMidLoading(statusText: $statusText, lastInput: $lastInput)';
}

/// Lifecycle state of a single proposal card.
enum ProposalCardStatus {
  pending,
  loading,
  success,
  error,
}

/// Tracks the state of a single inline proposal card.
@immutable
class ProposalState {
  const ProposalState({
    required this.kind,
    required this.title,
    required this.description,
    required this.endpoint,
    required this.payload,
    this.confirmLabel = 'Có',
    this.declineLabel = 'Không',
    this.status = ProposalCardStatus.pending,
    this.errorMessage,
  });

  final String kind;
  final String title;
  final String description;
  final String endpoint;
  final Map<String, dynamic> payload;
  final String confirmLabel;
  final String declineLabel;
  final ProposalCardStatus status;
  final String? errorMessage;

  ProposalState copyWith({
    ProposalCardStatus? status,
    String? errorMessage,
  }) {
    return ProposalState(
      kind: kind,
      title: title,
      description: description,
      endpoint: endpoint,
      payload: payload,
      confirmLabel: confirmLabel,
      declineLabel: declineLabel,
      status: status ?? this.status,
      errorMessage: errorMessage,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProposalState &&
          kind == other.kind &&
          title == other.title &&
          description == other.description &&
          endpoint == other.endpoint &&
          confirmLabel == other.confirmLabel &&
          declineLabel == other.declineLabel &&
          status == other.status &&
          errorMessage == other.errorMessage &&
          mapEquals(payload, other.payload);

  @override
  int get hashCode => Object.hash(
        kind,
        title,
        description,
        endpoint,
        confirmLabel,
        declineLabel,
        status,
        errorMessage,
      );

  @override
  String toString() =>
      'ProposalState(kind: $kind, status: $status, endpoint: $endpoint)';
}

/// Reading phase (Mid) — partial markdown response shown.
class AssistantMidReading extends AssistantState {
  const AssistantMidReading({
    required this.partial,
    required this.streaming,
    this.interrupted = false,
    this.messageId,
    this.proposals = const [],
  });

  final String partial;
  final bool streaming;
  final bool interrupted;
  final String? messageId;
  final List<ProposalState> proposals;

  bool get isDone => !streaming;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssistantMidReading &&
          partial == other.partial &&
          streaming == other.streaming &&
          interrupted == other.interrupted &&
          messageId == other.messageId &&
          listEquals(proposals, other.proposals);

  @override
  int get hashCode =>
      Object.hash(partial, streaming, interrupted, messageId, Object.hashAll(proposals));

  @override
  String toString() =>
      'AssistantMidReading(streaming: $streaming, interrupted: $interrupted, '
      'messageId: $messageId, partialLength: ${partial.length}, '
      'proposals: ${proposals.length})';
}

/// Pre-token error state (Mid).
class AssistantMidError extends AssistantState {
  const AssistantMidError({
    required this.message,
    required this.lastInput,
  });

  final String message;
  final String lastInput;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssistantMidError &&
          message == other.message &&
          lastInput == other.lastInput;

  @override
  int get hashCode => Object.hash(message, lastInput);

  @override
  String toString() =>
      'AssistantMidError(message: $message, lastInput: $lastInput)';
}

// ─────────────────────────────────────────────────────────
// Full states (full-screen chat surface) — V2
// ─────────────────────────────────────────────────────────

/// Compose phase of the Full screen — text input ready, Send tappable.
/// Reachable via long-press on AssistantBar (Collapsed → FullCompose)
/// or via enterFull() from MidCompose.
class AssistantFullCompose extends AssistantState {
  const AssistantFullCompose();

  @override
  bool operator ==(Object other) => other is AssistantFullCompose;

  @override
  int get hashCode => 0;

  @override
  String toString() => 'AssistantFullCompose';
}

/// Loading phase (Full) — typing indicator (AI avatar + statusText +
/// animated dots) shown inline in the message list. Stop icon replaces
/// Send icon in compose bar.
class AssistantFullLoading extends AssistantState {
  const AssistantFullLoading({
    required this.lastInput,
    this.statusText = defaultStatusText,
  });

  static const String defaultStatusText = 'Đang suy nghĩ...';

  final String lastInput;
  final String statusText;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssistantFullLoading &&
          lastInput == other.lastInput &&
          statusText == other.statusText;

  @override
  int get hashCode => Object.hash(lastInput, statusText);

  @override
  String toString() =>
      'AssistantFullLoading(statusText: $statusText, lastInput: $lastInput)';
}

/// Reading phase (Full) — AI response streams inline in message list.
/// `streaming=true` while chunks arrive; `false` after done/stop/error.
/// `interrupted=true` + `streaming=false` shows "Đã dừng" indicator.
class AssistantFullReading extends AssistantState {
  const AssistantFullReading({
    required this.partial,
    required this.streaming,
    this.interrupted = false,
    this.messageId,
    this.proposals = const [],
  });

  final String partial;
  final bool streaming;
  final bool interrupted;
  final String? messageId;
  final List<ProposalState> proposals;

  bool get isDone => !streaming;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssistantFullReading &&
          partial == other.partial &&
          streaming == other.streaming &&
          interrupted == other.interrupted &&
          messageId == other.messageId &&
          listEquals(proposals, other.proposals);

  @override
  int get hashCode =>
      Object.hash(partial, streaming, interrupted, messageId, Object.hashAll(proposals));

  @override
  String toString() =>
      'AssistantFullReading(streaming: $streaming, interrupted: $interrupted, '
      'messageId: $messageId, partialLength: ${partial.length}, '
      'proposals: ${proposals.length})';
}

/// Pre-token error state (Full). Error bubble shown inline in message
/// list with "Thử lại" button. Compose bar remains visible.
class AssistantFullError extends AssistantState {
  const AssistantFullError({
    required this.message,
    required this.lastInput,
  });

  final String message;
  final String lastInput;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssistantFullError &&
          message == other.message &&
          lastInput == other.lastInput;

  @override
  int get hashCode => Object.hash(message, lastInput);

  @override
  String toString() =>
      'AssistantFullError(message: $message, lastInput: $lastInput)';
}
