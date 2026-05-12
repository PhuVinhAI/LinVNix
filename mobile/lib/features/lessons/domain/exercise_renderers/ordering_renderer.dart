import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
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
    return _OrderingInput(
      options: options,
      currentAnswer: currentAnswer,
      onAnswerChanged: onAnswerChanged,
    );
  }
}

class _OrderingInput extends StatefulWidget {
  const _OrderingInput({
    required this.options,
    required this.currentAnswer,
    required this.onAnswerChanged,
  });

  final OrderingOptions options;
  final dynamic currentAnswer;
  final ValueChanged<dynamic> onAnswerChanged;

  @override
  State<_OrderingInput> createState() => _OrderingInputState();
}

class _OrderingInputState extends State<_OrderingInput> {
  late List<String> _items;

  @override
  void initState() {
    super.initState();
    _initItems();
  }

  @override
  void didUpdateWidget(covariant _OrderingInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.currentAnswer is List<String> &&
        (widget.currentAnswer as List<String>).isNotEmpty &&
        widget.currentAnswer != oldWidget.currentAnswer) {
      _items = List<String>.from(widget.currentAnswer as List<String>);
    }
  }

  void _initItems() {
    if (widget.currentAnswer is List<String> &&
        (widget.currentAnswer as List<String>).isNotEmpty) {
      _items = List<String>.from(widget.currentAnswer as List<String>);
    } else {
      _items = List<String>.from(widget.options.items)..shuffle();
    }
  }

  void _onReorder(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) newIndex--;
      final item = _items.removeAt(oldIndex);
      _items.insert(newIndex, item);
    });
    widget.onAnswerChanged(List<String>.from(_items));
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return ReorderableListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _items.length,
      onReorder: _onReorder,
      itemBuilder: (context, index) {
        return Padding(
          key: ValueKey(_items[index]),
          padding: const EdgeInsets.only(bottom: 8),
          child: AppCard(
            variant: AppCardVariant.muted,
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            child: Row(
              children: [
                Icon(Icons.drag_handle, color: c.mutedForeground),
                const SizedBox(width: 12),
                Expanded(child: Text(_items[index])),
              ],
            ),
          ),
        );
      },
    );
  }
}
