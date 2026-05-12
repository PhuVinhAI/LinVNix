import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
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
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: options.choices.map((choice) {
        final isSelected = selected == choice;
        final borderColor = isSelected ? c.primary : c.border;
        final bgColor = isSelected
            ? c.primary.withValues(alpha: 0.08)
            : c.card;

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Material(
            color: bgColor,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: InkWell(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              onTap: () => onAnswerChanged(choice),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md + 2,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(
                    color: borderColor,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isSelected ? c.primary : Colors.transparent,
                        border: Border.all(
                          color: isSelected ? c.primary : c.mutedForeground,
                          width: 2,
                        ),
                      ),
                      child: isSelected
                          ? Icon(Icons.check, size: 16, color: c.primaryForeground)
                          : null,
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Text(
                        choice,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
                          color: isSelected ? c.primary : c.foreground,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
