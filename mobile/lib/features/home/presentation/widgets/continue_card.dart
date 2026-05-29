import 'package:linvnix/l10n/app_localizations.dart';
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
      borderRadius: AppRadius.lg,
      clipBehavior: Clip.antiAlias,
      padding: EdgeInsets.zero,
      child: continueAsync.when(
        loading: () => const _ShimmerCard(),
        error: (error, _) => _ErrorCard(
          onRetry: () => ref.read(continueLearningProvider.notifier).refresh(),
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
              width: 80,
              height: 22,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.full),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Container(
              width: 220,
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
              width: 110,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.xl),
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
            S.of(context).continueSection,
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            S.of(context).unableToLoadDataMessage,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: c.error,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppButton(
            variant: AppButtonVariant.outline,
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: S.of(context).retryButton,
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
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.xxl,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            Icons.menu_book_outlined,
            size: 48,
            color: c.mutedForeground,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            S.of(context).startCourseLabel,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            S.of(context).beginLearningVietnameseToday,
            style: theme.textTheme.bodySmall?.copyWith(
              color: c.mutedForeground,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Semantics(
            label: S.of(context).browseAvailableCourses,
            button: true,
            child: AppButton(
              variant: AppButtonVariant.primary,
              onPressed: () => context.go('/courses'),
              icon: const Icon(Icons.school),
              label: S.of(context).browseCourses,
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
          AppBadge(
            label: isInProgress ? S.of(context).inProgressLabel : S.of(context).completedLabel,
            color: isInProgress ? c.primary : c.success,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            continueLearning.lessonTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Semantics(
            label: isInProgress
                ? S.of(context).continueLessonTitleParam(continueLearning.lessonTitle)
                : S.of(context).reviewLessonTitleParam(continueLearning.lessonTitle),
            button: true,
            child: AppButton(
              variant: AppButtonVariant.primary,
              onPressed: () =>
                  context.push('/lessons/${continueLearning.lessonId}'),
              icon: Icon(isInProgress ? Icons.play_arrow : Icons.replay),
              label: isInProgress ? S.of(context).continueLabel : S.of(context).reviewLabel,
            ),
          ),
        ],
      ),
    );
  }
}
