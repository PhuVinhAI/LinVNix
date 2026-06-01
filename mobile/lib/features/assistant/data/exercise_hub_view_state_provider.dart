import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Transient UI state owned by `ExerciseHubScreen`: in-flight set generation,
/// per-set busy spinners, and the last failed-action error banner. Lifted to
/// Riverpod so `exerciseHubScreenContextBuilder` can expose what the learner
/// actually sees (a spinning button, a red error toast) to the assistant.
@immutable
class ExerciseHubViewState {
  const ExerciseHubViewState({
    this.isCreatingCustom = false,
    this.busySetId,
    this.busyAction,
    this.actionError,
  });

  final bool isCreatingCustom;
  final String? busySetId;

  /// One of `regenerate`, `delete`, `reset`, `create`.
  final String? busyAction;

  /// The current inline error banner text, if any.
  final String? actionError;

  ExerciseHubViewState copyWith({
    bool? isCreatingCustom,
    String? busySetId,
    String? busyAction,
    String? actionError,
  }) {
    return ExerciseHubViewState(
      isCreatingCustom: isCreatingCustom ?? this.isCreatingCustom,
      busySetId: busySetId ?? this.busySetId,
      busyAction: busyAction ?? this.busyAction,
      actionError: actionError ?? this.actionError,
    );
  }

  ExerciseHubViewState clearBusy() {
    return ExerciseHubViewState(
      isCreatingCustom: false,
      busySetId: null,
      busyAction: null,
      actionError: actionError,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ExerciseHubViewState &&
          isCreatingCustom == other.isCreatingCustom &&
          busySetId == other.busySetId &&
          busyAction == other.busyAction &&
          actionError == other.actionError;

  @override
  int get hashCode =>
      Object.hash(isCreatingCustom, busySetId, busyAction, actionError);
}

class ExerciseHubViewStateNotifier extends Notifier<ExerciseHubViewState> {
  @override
  ExerciseHubViewState build() => const ExerciseHubViewState();

  void set(ExerciseHubViewState next) {
    if (state == next) return;
    state = next;
  }

  void clear() {
    if (state == const ExerciseHubViewState()) return;
    state = const ExerciseHubViewState();
  }
}

final exerciseHubViewStateProvider = NotifierProvider<
    ExerciseHubViewStateNotifier, ExerciseHubViewState>(
  ExerciseHubViewStateNotifier.new,
);
