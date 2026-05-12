import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';

class TranslationRenderer extends ExerciseRenderer {
  const TranslationRenderer();

  @override
  ExerciseType get type => ExerciseType.translation;

  @override
  bool validateAnswer(Exercise exercise, dynamic answer) {
    return answer is String && answer.trim().isNotEmpty;
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    return {'translation': (answer as String).trim()};
  }

  @override
  Widget buildQuestion(Exercise exercise, BuildContext context) {
    return Text(
      exercise.question,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
    );
  }

  @override
  Widget buildInput(
    Exercise exercise,
    BuildContext context,
    dynamic currentAnswer,
    ValueChanged<dynamic> onAnswerChanged,
  ) {
    return AppInput(
      label: 'Your translation',
      maxLines: 3,
      onChanged: onAnswerChanged,
    );
  }
}
