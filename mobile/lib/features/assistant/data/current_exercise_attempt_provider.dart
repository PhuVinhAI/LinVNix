import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Snapshot of the learner's in-flight exercise attempt — i.e. the
/// transient state that lives inside `ExercisePlayScreen` (current
/// question, currently-typed/selected `userAnswer`, position within the
/// set). The screen pushes updates here from its `setState` callbacks; the
/// `exercisePlayScreenContextBuilder` reads them so the AI can give
/// contextual hints without round-tripping through the backend.
@immutable
class CurrentExerciseAttempt {
  const CurrentExerciseAttempt({
    required this.setId,
    this.lessonId,
    this.moduleId,
    this.courseId,
    this.exerciseId,
    this.exerciseType,
    this.question,
    this.questionAudioUrl,
    this.acceptsWithoutDiacritics = false,
    this.userAnswer,
    this.exerciseIndex,
    this.totalExercises,
    this.correctCount,
    this.options,
    this.correctAnswer,
    this.explanation,
    this.submitted = false,
    this.submitting = false,
    this.submitError,
    this.isCorrect,
    this.score,
  });

  final String setId;
  final String? lessonId;
  final String? moduleId;
  final String? courseId;
  final String? exerciseId;
  final String? exerciseType;
  final String? question;

  /// Audio attached to the question prompt itself (distinct from a
  /// listening-exercise `audioUrl` which is the listening clip). Rendered
  /// in `QuestionHeader`.
  final String? questionAudioUrl;

  /// True when the question's answer is graded loosely against diacritics —
  /// the screen renders an info-icon explaining this to the learner.
  final bool acceptsWithoutDiacritics;

  /// May be a String, num, bool, List, or Map — whatever the renderer
  /// stores. Must remain JSON-serialisable: tools forward this verbatim
  /// to the LLM-side prompt.
  final Object? userAnswer;

  final int? exerciseIndex;
  final int? totalExercises;

  /// Number of questions the learner has already answered correctly in
  /// this set (drives the post-set summary "X / Y correct" line).
  final int? correctCount;

  /// JSON-serialisable type-specific options (e.g. listening `audioUrl`,
  /// speaking `promptText` + `promptAudioUrl`, multiple-choice `choices`).
  /// Sourced from `Exercise.options.toJson()`; null until the question is
  /// loaded.
  final Map<String, dynamic>? options;

  /// JSON-serialisable correct-answer payload (from
  /// `Exercise.correctAnswer.toJson()`). Only meaningful after the learner
  /// has submitted — the AI uses it to explain mistakes.
  final Map<String, dynamic>? correctAnswer;

  final String? explanation;

  /// Whether the learner has tapped Submit on this question.
  final bool submitted;

  /// True while the answer is round-tripping to the backend.
  final bool submitting;

  /// Most recent submit failure (network/backend). Drives the visible
  /// error banner on the screen.
  final String? submitError;

  /// Server-side grading result, only set when [submitted] is true.
  final bool? isCorrect;
  final int? score;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'setId': setId,
        'lessonId': ?lessonId,
        'moduleId': ?moduleId,
        'courseId': ?courseId,
        'exerciseId': ?exerciseId,
        'exerciseType': ?exerciseType,
        'question': ?question,
        'questionAudioUrl': ?questionAudioUrl,
        'acceptsWithoutDiacritics': acceptsWithoutDiacritics,
        'userAnswer': ?userAnswer,
        'exerciseIndex': ?exerciseIndex,
        'totalExercises': ?totalExercises,
        'correctCount': ?correctCount,
        'options': ?options,
        'correctAnswer': ?correctAnswer,
        'explanation': ?explanation,
        'submitted': submitted,
        'submitting': submitting,
        'submitError': ?submitError,
        'isCorrect': ?isCorrect,
        'score': ?score,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CurrentExerciseAttempt &&
          setId == other.setId &&
          lessonId == other.lessonId &&
          moduleId == other.moduleId &&
          courseId == other.courseId &&
          exerciseId == other.exerciseId &&
          exerciseType == other.exerciseType &&
          question == other.question &&
          questionAudioUrl == other.questionAudioUrl &&
          acceptsWithoutDiacritics == other.acceptsWithoutDiacritics &&
          _userAnswerEquals(userAnswer, other.userAnswer) &&
          exerciseIndex == other.exerciseIndex &&
          totalExercises == other.totalExercises &&
          correctCount == other.correctCount &&
          mapEquals(options, other.options) &&
          mapEquals(correctAnswer, other.correctAnswer) &&
          explanation == other.explanation &&
          submitted == other.submitted &&
          submitting == other.submitting &&
          submitError == other.submitError &&
          isCorrect == other.isCorrect &&
          score == other.score;

  @override
  int get hashCode => Object.hash(
        setId,
        lessonId,
        moduleId,
        courseId,
        exerciseId,
        exerciseType,
        question,
        questionAudioUrl,
        acceptsWithoutDiacritics,
        userAnswer is List
            ? Object.hashAll(userAnswer as List)
            : userAnswer is Map
                ? Object.hashAllUnordered((userAnswer as Map).entries)
                : userAnswer,
        Object.hash(exerciseIndex, totalExercises, correctCount),
        options == null ? null : Object.hashAllUnordered(options!.entries),
        correctAnswer == null
            ? null
            : Object.hashAllUnordered(correctAnswer!.entries),
        explanation,
        Object.hash(submitted, submitting, submitError, isCorrect, score),
      );
}

bool _userAnswerEquals(Object? a, Object? b) {
  if (identical(a, b)) return true;
  if (a is List && b is List) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!_userAnswerEquals(a[i], b[i])) return false;
    }
    return true;
  }
  if (a is Map && b is Map) {
    if (a.length != b.length) return false;
    for (final k in a.keys) {
      if (!b.containsKey(k)) return false;
      if (!_userAnswerEquals(a[k], b[k])) return false;
    }
    return true;
  }
  return a == b;
}

class CurrentExerciseAttemptNotifier
    extends Notifier<CurrentExerciseAttempt?> {
  @override
  CurrentExerciseAttempt? build() => null;

  void update(CurrentExerciseAttempt? attempt) {
    state = attempt;
  }

  void clear() {
    state = null;
  }
}

final currentExerciseAttemptProvider = NotifierProvider<
    CurrentExerciseAttemptNotifier, CurrentExerciseAttempt?>(
  CurrentExerciseAttemptNotifier.new,
);
