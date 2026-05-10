import 'package:flutter/material.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';

class MultipleChoiceRenderer extends ExerciseRenderer {
  const MultipleChoiceRenderer();

  @override
  ExerciseType get type => ExerciseType.multipleChoice;

  @override
  bool validateAnswer(Exercise exercise, dynamic answer) {
    return answer is String && answer.isNotEmpty;
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    return {'selectedChoice': answer as String};
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
    final options = exercise.options as MultipleChoiceOptions;
    final selected = currentAnswer as String?;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.choices.map((choice) {
        final isSelected = selected == choice;
        return ChoiceChip(
          label: Text(choice),
          selected: isSelected,
          onSelected: (_) => onAnswerChanged(choice),
        );
      }).toList(),
    );
  }
}
