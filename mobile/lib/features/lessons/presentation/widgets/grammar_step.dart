import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../domain/lesson_models.dart';

class GrammarStepWidget extends StatelessWidget {
  const GrammarStepWidget({super.key, required this.grammarRules});
  final List<GrammarRule> grammarRules;

  @override
  Widget build(BuildContext context) {
    if (grammarRules.isEmpty) {
      return const Center(child: Text('No grammar rules for this lesson'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: grammarRules.length,
      itemBuilder: (context, index) {
        return _GrammarRuleCard(rule: grammarRules[index]);
      },
    );
  }
}

class _GrammarRuleCard extends StatelessWidget {
  const _GrammarRuleCard({required this.rule});
  final GrammarRule rule;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return AppCard(
      variant: AppCardVariant.outlined,
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            rule.title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          if (rule.structure != null) ...[
            const SizedBox(height: 8),
            AppCard(
              variant: AppCardVariant.muted,
              padding: const EdgeInsets.all(AppSpacing.md),
              borderRadius: AppRadius.md,
              child: SizedBox(
                width: double.infinity,
                child: Text(
                  rule.structure!,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: c.foreground,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
          const SizedBox(height: 12),
          Text(
            rule.explanation,
            style: theme.textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
          if (rule.examples.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Examples',
              style: theme.textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            ...rule.examples.map((ex) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AppCard(
                    variant: AppCardVariant.muted,
                    padding: const EdgeInsets.all(AppSpacing.md),
                    borderRadius: AppRadius.md,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ex.vi,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          ex.en,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: c.mutedForeground,
                          ),
                        ),
                        if (ex.note != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            ex.note!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontStyle: FontStyle.italic,
                              color: c.mutedForeground,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                )),
          ],
          if (rule.notes != null) ...[
            const SizedBox(height: 8),
            Text(
              rule.notes!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
