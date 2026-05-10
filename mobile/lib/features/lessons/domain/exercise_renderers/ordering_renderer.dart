import 'package:flutter/material.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';

class OrderingRenderer extends ExerciseRenderer {
  const OrderingRenderer();

  @override
  ExerciseType get type => ExerciseType.ordering;

  @override
  bool validateAnswer(Exercise exercise, dynamic answer) {
    if (answer is! List<String>) return false;
    final options = exercise.options as OrderingOptions;
    return answer.length == options.items.length;
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    return {'orderedItems': answer as List<String>};
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
    final options = exercise.options as OrderingOptions;
    final items = (currentAnswer is List<String> && currentAnswer.isNotEmpty)
        ? currentAnswer
        : List<String>.from(options.items)..shuffle();

    return ReorderableListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      onReorder: (oldIndex, newIndex) {
        final updated = List<String>.from(items);
        if (newIndex > oldIndex) newIndex--;
        final item = updated.removeAt(oldIndex);
        updated.insert(newIndex, item);
        onAnswerChanged(updated);
      },
      itemBuilder: (context, index) {
        return ListTile(
          key: ValueKey(items[index]),
          leading: Icon(
            Icons.drag_handle,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          title: Text(items[index]),
          tileColor: Theme.of(context).colorScheme.surfaceContainerLow,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        );
      },
    );
  }
}
