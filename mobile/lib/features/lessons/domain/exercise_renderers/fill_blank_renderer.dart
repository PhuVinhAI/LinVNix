import 'package:flutter/material.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';

class FillBlankRenderer extends ExerciseRenderer {
  const FillBlankRenderer();

  @override
  ExerciseType get type => ExerciseType.fillBlank;

  @override
  bool validateAnswer(Exercise exercise, dynamic answer) {
    if (answer is! List<String>) return false;
    final options = exercise.options as FillBlankOptions;
    if (answer.length != options.blanks) return false;
    return answer.every((a) => a.trim().isNotEmpty);
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    return {'answers': answer as List<String>};
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
    final options = exercise.options as FillBlankOptions;
    final answers = (currentAnswer is List<String>)
        ? currentAnswer
        : List<String>.filled(options.blanks, '');

    return Column(
      children: List.generate(options.blanks, (index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: TextField(
            decoration: InputDecoration(
              labelText: 'Blank ${index + 1}',
              border: const OutlineInputBorder(),
            ),
            onChanged: (value) {
              final updated = List<String>.from(answers);
              updated[index] = value;
              onAnswerChanged(updated);
            },
          ),
        );
      }),
    );
  }
}
