import '../../../lessons/domain/exercise_set_models.dart';

/// Compact exercise-set progress for assistant screen context.
Map<String, dynamic> setProgressContextSummary(SetProgress set) {
  return {
    'setId': set.setId,
    'title': set.title,
    if (set.description != null && set.description!.isNotEmpty)
      'description': set.description,
    'isCustom': set.isCustom,
    'isAIGenerated': set.isAIGenerated,
    'totalExercises': set.totalExercises,
    'attempted': set.attempted,
    'percentComplete': set.percentComplete,
    'percentCorrect': set.percentCorrect,
    'progressState': set.isCompleted
        ? 'completed'
        : set.isInProgress
            ? 'inProgress'
            : 'notStarted',
  };
}
