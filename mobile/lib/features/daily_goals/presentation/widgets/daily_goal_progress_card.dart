import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../domain/daily_goal_progress_models.dart';
import '../../data/daily_goal_progress_providers.dart';

class DailyGoalProgressCard extends ConsumerWidget {
  const DailyGoalProgressCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(dailyGoalProgressProvider);

    return AppCard(
      variant: AppCardVariant.outlined,
      borderRadius: AppRadius.lg,
      clipBehavior: Clip.antiAlias,
      padding: EdgeInsets.zero,
      child: progressAsync.when(
        loading: () => const _ProgressShimmer(),
        error: (_, __) => const SizedBox.shrink(),
        data: (progress) {
          if (progress.goals.isEmpty) return const SizedBox.shrink();
          return _ProgressData(progress: progress);
        },
      ),
    );
  }
}

class _ProgressShimmer extends StatelessWidget {
  const _ProgressShimmer();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 120,
            height: 18,
            decoration: BoxDecoration(
              color: c.muted,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            width: double.infinity,
            height: 8,
            decoration: BoxDecoration(
              color: c.muted,
              borderRadius: BorderRadius.circular(AppRadius.xs),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Container(
            width: double.infinity,
            height: 8,
            decoration: BoxDecoration(
              color: c.muted,
              borderRadius: BorderRadius.circular(AppRadius.xs),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProgressData extends StatelessWidget {
  const _ProgressData({required this.progress});
  final DailyGoalProgress progress;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Tiến trình hôm nay',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              if (progress.allGoalsMet)
                AppBadge(
                  label: 'Hoàn thành!',
                  color: c.success,
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...progress.goals.map((goal) => _GoalProgressRow(goal: goal)),
        ],
      ),
    );
  }
}

class _GoalProgressRow extends StatelessWidget {
  const _GoalProgressRow({required this.goal});
  final GoalProgress goal;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(goal.goalType.icon, size: 18, color: c.primary),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  goal.goalType.viLabel,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Text(
                goal.label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: goal.met ? c.success : c.mutedForeground,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          AppProgress(
            value: goal.progress,
            height: 6,
            color: goal.met ? c.success : c.primary,
          ),
        ],
      ),
    );
  }
}
