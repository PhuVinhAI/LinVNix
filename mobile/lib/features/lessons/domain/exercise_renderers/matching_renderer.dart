import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';

class MatchingRenderer extends ExerciseRenderer {
  const MatchingRenderer();

  @override
  ExerciseType get type => ExerciseType.matching;

  @override
  bool validateAnswer(Exercise exercise, dynamic answer) {
    if (answer is! List<MatchPair>) return false;
    final options = exercise.options as MatchingOptions;
    return answer.length == options.pairs.length;
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    final matches = answer as List<MatchPair>;
    return {
      'matches': matches.map((m) => {'left': m.left, 'right': m.right}).toList(),
    };
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
    final options = exercise.options as MatchingOptions;
    final matches = (currentAnswer is List<MatchPair>) ? currentAnswer : <MatchPair>[];
    final matchedLeft = matches.map((m) => m.left).toSet();
    final matchedRight = matches.map((m) => m.right).toSet();
    final shuffledRight = List<String>.from(
      options.pairs.map((p) => p.right).toList(),
    )..shuffle();

    return _MatchingInput(
      leftItems: options.pairs.map((p) => p.left).toList(),
      rightItems: shuffledRight,
      matches: matches,
      matchedLeft: matchedLeft,
      matchedRight: matchedRight,
      onMatchAdded: (left, right) {
        final updated = List<MatchPair>.from(matches)
          ..add(MatchPair(left: left, right: right));
        onAnswerChanged(updated);
      },
      onMatchRemoved: (pair) {
        final updated = List<MatchPair>.from(matches)
          ..removeWhere((m) => m.left == pair.left && m.right == pair.right);
        onAnswerChanged(updated);
      },
    );
  }
}

class _MatchingInput extends StatefulWidget {
  const _MatchingInput({
    required this.leftItems,
    required this.rightItems,
    required this.matches,
    required this.matchedLeft,
    required this.matchedRight,
    required this.onMatchAdded,
    required this.onMatchRemoved,
  });

  final List<String> leftItems;
  final List<String> rightItems;
  final List<MatchPair> matches;
  final Set<String> matchedLeft;
  final Set<String> matchedRight;
  final void Function(String left, String right) onMatchAdded;
  final ValueChanged<MatchPair> onMatchRemoved;

  @override
  State<_MatchingInput> createState() => _MatchingInputState();
}

class _MatchingInputState extends State<_MatchingInput> {
  String? _selectedLeft;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                children: widget.leftItems.map((item) {
                  final isMatched = widget.matchedLeft.contains(item);
                  final isSelected = _selectedLeft == item;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        variant: isSelected ? AppButtonVariant.primary : AppButtonVariant.outline,
                        label: item,
                        onPressed: isMatched
                            ? null
                            : () {
                                setState(() => _selectedLeft = item);
                              },
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                children: widget.rightItems.map((item) {
                  final isMatched = widget.matchedRight.contains(item);
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        variant: AppButtonVariant.outline,
                        label: item,
                        onPressed: (isMatched || _selectedLeft == null)
                            ? null
                            : () {
                                widget.onMatchAdded(_selectedLeft!, item);
                                setState(() => _selectedLeft = null);
                              },
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
        if (widget.matches.isNotEmpty) ...[
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.matches.map((pair) {
              return AppChip(
                label: '${pair.left} → ${pair.right}',
                isSelected: true,
                onTap: () => widget.onMatchRemoved(pair),
              );
            }).toList(),
          ),
        ],
      ],
    );
  }
}
