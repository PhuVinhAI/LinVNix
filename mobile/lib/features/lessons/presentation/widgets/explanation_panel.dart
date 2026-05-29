import 'package:flutter/material.dart';
import 'package:linvnix/l10n/app_localizations.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';

class ExplanationPanel extends StatelessWidget {
  const ExplanationPanel({
    super.key,
    required this.isCorrect,
    required this.correctAnswer,
    this.explanation,
    this.score,
  });

  final bool isCorrect;
  final String correctAnswer;
  final String? explanation;
  final int? score;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final bgColor = isCorrect ? c.success : c.error;
    final fgColor = isCorrect ? c.successForeground : c.errorForeground;

    return AppCard(
      variant: AppCardVariant.filled,
      color: bgColor,
      borderRadius: AppRadius.lg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCorrect ? Icons.check_circle : Icons.cancel,
                color: fgColor,
              ),
              const SizedBox(width: 8),
              Text(
                isCorrect ? S.of(context).correctLabel : S.of(context).incorrectLabel,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: fgColor,
                    ),
              ),
              if (score != null) ...[
                const Spacer(),
                Text(
                  S.of(context).pointsParam(score!),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: fgColor,
                      ),
                ),
              ],
            ],
          ),
          if (!isCorrect) ...[
            const SizedBox(height: 12),
            Text(
              S.of(context).correctAnswerParam(correctAnswer),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: fgColor,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ],
          if (explanation != null && explanation!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              explanation!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: fgColor,
                  ),
            ),
          ],
        ],
      ),
    );
  }
}
