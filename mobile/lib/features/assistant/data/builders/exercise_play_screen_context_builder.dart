import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/screen_context.dart';
import '../assistant_localizations_provider.dart';
import '../current_exercise_attempt_provider.dart';
import '../route_match.dart';

/// `ScreenContext` builder for the three nested exercise-play routes:
/// - `/courses/:id/exercises/play/:setId`
/// - `/modules/:id/exercises/play/:setId`
/// - `/lessons/:id/exercises/play/:setId`
///
/// Pulls the current exercise question + the learner's tentative
/// `userAnswer` from `currentExerciseAttemptProvider`, which the
/// `ExercisePlayScreen` keeps in sync from its own `setState` callbacks.
///
/// Type-specific payload (listening `audioUrl`, speaking `promptText`,
/// multiple-choice `choices`, ...) is forwarded verbatim under `options`
/// so the AI can ground hints like "you only heard the audio once, try
/// again" or "the prompt asks you to say X".
ScreenContext exercisePlayScreenContextBuilder(Ref ref, RouteMatch match) {
  final s = ref.watch(assistantLocalizationsProvider);
  final attempt = ref.watch(currentExerciseAttemptProvider);
  final setId = match.pathParameters['setId'] ?? '';
  final routePattern = match.routePattern;

  String? lessonId;
  String? moduleId;
  String? courseId;
  if (routePattern.startsWith('/lessons/')) {
    lessonId = match.pathParameters['id'];
  } else if (routePattern.startsWith('/modules/')) {
    moduleId = match.pathParameters['id'];
  } else if (routePattern.startsWith('/courses/')) {
    courseId = match.pathParameters['id'];
  }

  return ScreenContext(
    route: match.location,
    displayName: s.assistantExerciseTitle,
    barPlaceholder: s.assistantExercisePlaceholder,
    data: <String, dynamic>{
      'screenType': 'exercisePlay',
      'setId': setId,
      'lessonId': ?lessonId,
      'moduleId': ?moduleId,
      'courseId': ?courseId,
      'exerciseId': attempt?.exerciseId,
      'exerciseType': attempt?.exerciseType,
      'question': attempt?.question,
      'questionAudioUrl': ?attempt?.questionAudioUrl,
      'acceptsWithoutDiacritics': attempt?.acceptsWithoutDiacritics ?? false,
      'userAnswer': attempt?.userAnswer,
      'exerciseIndex': attempt?.exerciseIndex,
      'totalExercises': attempt?.totalExercises,
      'correctCount': ?attempt?.correctCount,
      'options': ?attempt?.options,
      'submitted': attempt?.submitted ?? false,
      'submitting': attempt?.submitting ?? false,
      'submitError': ?attempt?.submitError,
      'isCorrect': ?attempt?.isCorrect,
      'score': ?attempt?.score,
      'correctAnswer': ?attempt?.correctAnswer,
      'explanation': ?attempt?.explanation,
    },
  );
}
