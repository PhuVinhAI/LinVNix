import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/home_providers.dart';

class ContinueCard extends ConsumerWidget {
  const ContinueCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final continueAsync = ref.watch(continueLearningProvider);

    return AppCard(
      variant: AppCardVariant.outlined,
      clipBehavior: Clip.antiAlias,
      padding: EdgeInsets.zero,
      child: continueAsync.when(
        loading: () => const _ShimmerCard(),
        error: (error, _) => _ErrorCard(
          onRetry: () => ref.invalidate(continueLearningProvider),
        ),
        data: (continueLearning) {
          if (continueLearning == null) {
            return const _EmptyCard();
          }
          return _DataCard(
            continueLearning: continueLearning,
          );
        },
      ),
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  const _ShimmerCard();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Shimmer.fromColors(
      baseColor: c.muted,
      highlightColor: c.card,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 140,
              height: 14,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Container(
              width: 200,
              height: 20,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Container(
              width: 160,
              height: 14,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Container(
              width: 100,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Continue Learning',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Unable to load progress',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: c.error,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppButton(
            variant: AppButtonVariant.outline,
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: 'Retry',
          ),
        ],
      ),
    );
  }
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Continue Learning',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Start a course to begin learning',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: c.mutedForeground,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Semantics(
            label: 'Browse available courses',
            button: true,
            child: AppButton(
              variant: AppButtonVariant.primary,
              onPressed: () => context.go('/courses'),
              icon: const Icon(Icons.school),
              label: 'Browse Courses',
            ),
          ),
        ],
      ),
    );
  }
}

class _DataCard extends StatelessWidget {
  const _DataCard({
    required this.continueLearning,
  });

  final ContinueLearning continueLearning;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final isInProgress =
        continueLearning.status == ContinueLearningStatus.inProgress;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isInProgress ? Icons.play_circle : Icons.check_circle,
                size: 16,
                color: isInProgress ? c.primary : c.border,
              ),
              const SizedBox(width: AppSpacing.xs),
              Text(
                isInProgress ? 'In Progress' : 'Completed',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: isInProgress ? c.primary : c.border,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            continueLearning.lessonTitle,
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.md),
          Semantics(
            label: isInProgress
                ? 'Resume lesson: ${continueLearning.lessonTitle}'
                : 'Review lesson: ${continueLearning.lessonTitle}',
            button: true,
            child: AppButton(
              variant: AppButtonVariant.primary,
              onPressed: () =>
                  context.push('/lessons/${continueLearning.lessonId}'),
              icon: Icon(isInProgress ? Icons.play_arrow : Icons.replay),
              label: isInProgress ? 'Resume' : 'Review',
            ),
          ),
        ],
      ),
    );
  }
}
