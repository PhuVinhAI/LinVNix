import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../domain/exercise_models.dart';

class QuestionHeader extends StatelessWidget {
  const QuestionHeader({
    super.key,
    required this.exercise,
    required this.renderer,
  });

  final Exercise exercise;
  final Widget renderer;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppCard(
          variant: AppCardVariant.muted,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          borderRadius: AppRadius.lg,
          child: Text(
            exercise.exerciseType.value.replaceAll('_', ' ').toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: c.foreground,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
        const SizedBox(height: 16),
        renderer,
      ],
    );
  }
}
