import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/simulation_providers.dart';
import '../../domain/scenario_detail.dart';
import '../../domain/simulation_result_summary.dart';

Color _getLevelColor(String level, AppColors c) {
  return switch (level) {
    'A1' => const Color(0xFF22C55E),
    'A2' => const Color(0xFF84CC16),
    'B1' => const Color(0xFFF59E0B),
    'B2' => const Color(0xFFf97316),
    'C1' => const Color(0xFFEF4444),
    'C2' => const Color(0xFFDC2626),
    _ => c.mutedForeground,
  };
}

Color _getDifficultyColor(String difficulty, AppColors c) {
  return switch (difficulty) {
    'EASY' => c.success,
    'MEDIUM' => c.warning,
    'HARD' => c.error,
    _ => c.mutedForeground,
  };
}

String _getDifficultyLabel(String difficulty) {
  return switch (difficulty) {
    'EASY' => 'Easy',
    'MEDIUM' => 'Medium',
    'HARD' => 'Hard',
    _ => difficulty,
  };
}

class ScenarioDetailScreen extends ConsumerWidget {
  const ScenarioDetailScreen({
    super.key,
    required this.scenarioId,
    this.fromConversation = false,
  });
  final String scenarioId;
  final bool fromConversation;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(scenarioDetailProvider(scenarioId));

    return detailAsync.when(
      loading: () => const _ScenarioDetailLoading(),
      error: (error, stack) => _ScenarioDetailError(
        onRetry: () => ref.invalidate(scenarioDetailProvider(scenarioId)),
      ),
      data: (detail) => _ScenarioDetailContent(
        detail: detail,
        fromConversation: fromConversation,
      ),
    );
  }
}

class _ScenarioDetailContent extends ConsumerWidget {
  const _ScenarioDetailContent({
    required this.detail,
    this.fromConversation = false,
  });
  final ScenarioDetail detail;
  final bool fromConversation;

  Future<void> _handleStartTap(BuildContext context, WidgetRef ref) async {
    final activeSession =
        ref.read(pausedSessionProvider).whenOrNull(data: (s) => s);

    if (activeSession != null) {
      final confirmed = await AppDialog.show<bool>(
        context,
        builder: (ctx) => AppDialog(
          title: 'End conversation?',
          content:
              'You have an active session for "${activeSession.scenarioTitle}". '
              'End it to start this scenario? Progress cannot be recovered.',
          actions: [
            AppDialogAction(
              label: 'No',
              onPressed: () => Navigator.of(ctx).pop(false),
            ),
            AppDialogAction(
              label: 'End session',
              isPrimary: true,
              onPressed: () => Navigator.of(ctx).pop(true),
            ),
          ],
        ),
      );
      if (confirmed != true || !context.mounted) return;

      try {
        final repo = ref.read(simulationRepositoryProvider);
        await repo.cancelSession(activeSession.id);
        await ref.read(pausedSessionProvider.notifier).refresh();
      } catch (_) {
        if (!context.mounted) return;
        AppToast.show(
          context,
          message: 'Unable to end the current session',
          type: AppToastType.error,
        );
        return;
      }
    }

    if (!context.mounted) return;
    context.push('/practice/scenarios/${detail.id}/select-character');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = AppTheme.colors(context);
    final miniHistoryAsync =
        ref.watch(simulationResultsProvider(detail.id));

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: Text(
              detail.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _ScenarioInfoRow(detail: detail),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    detail.description,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: c.foreground,
                        ),
                  ),
                  if (detail.scoringCriteria.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _SectionHeader(title: 'Grading criteria'),
                    const SizedBox(height: AppSpacing.md),
                    ...detail.scoringCriteria.map(
                      (criterion) => _ScoringCriterionItem(criterion: criterion),
                    ),
                  ],
                  if (detail.characters.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _SectionHeader(title: 'Characters'),
                    const SizedBox(height: AppSpacing.md),
                    ...detail.characters.map(
                      (character) => _CharacterItem(character: character),
                    ),
                  ],
                  miniHistoryAsync.when(
                    loading: () => const _MiniHistoryLoading(),
                    error: (_, _) => const SizedBox.shrink(),
                    data: (results) {
                      if (results.isEmpty) return const SizedBox.shrink();
                      return _MiniHistorySection(results: results);
                    },
                  ),
                  const SizedBox(height: AppSpacing.xxl + AppSpacing.lg),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: fromConversation
          ? null
          : SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.sm,
                      AppSpacing.lg,
                      AppSpacing.lg,
                    ),
                    child: AppButton(
                      variant: AppButtonVariant.primary,
                      onPressed: () => _handleStartTap(context, ref),
                      label: 'Start',
                      isFullWidth: true,
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _ScenarioInfoRow extends StatelessWidget {
  const _ScenarioInfoRow({required this.detail});
  final ScenarioDetail detail;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final metaStyle = theme.textTheme.bodySmall?.copyWith(
      color: c.mutedForeground,
      height: 1.2,
    );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        AppBadge(
          label: detail.requiredLevel,
          color: _getLevelColor(detail.requiredLevel, c),
        ),
        const SizedBox(width: AppSpacing.xs),
        AppBadge(
          label: _getDifficultyLabel(detail.difficulty),
          color: _getDifficultyColor(detail.difficulty, c),
        ),
        const Spacer(),
        Icon(Icons.access_time_rounded, size: 14, color: c.mutedForeground),
        const SizedBox(width: AppSpacing.xs),
        Text('${detail.estimatedMinutes}m', style: metaStyle),
        const SizedBox(width: AppSpacing.md),
        Icon(Icons.people_outline, size: 14, color: c.mutedForeground),
        const SizedBox(width: AppSpacing.xs),
        Text('${detail.characterCount}', style: metaStyle),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
    );
  }
}

class _ScoringCriterionItem extends StatelessWidget {
  const _ScoringCriterionItem({required this.criterion});
  final dynamic criterion;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: AppCard(
        variant: AppCardVariant.outlined,
        borderRadius: AppRadius.lg,
        padding: const EdgeInsets.all(AppSpacing.md),
        child: AppListItem(
          titleWidget: Text(
            criterion.name,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          subtitleWidget: Text(
            criterion.description,
            style: theme.textTheme.bodySmall?.copyWith(
                  color: c.mutedForeground,
                ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: AppBadge(
            label: '${criterion.weight}%',
            color: c.primary,
          ),
        ),
      ),
    );
  }
}

class _CharacterItem extends StatelessWidget {
  const _CharacterItem({required this.character});
  final dynamic character;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final isNpc = !character.isPlayable;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Opacity(
        opacity: isNpc ? 0.6 : 1.0,
        child: AppCard(
          variant: AppCardVariant.outlined,
          borderRadius: AppRadius.lg,
          padding: const EdgeInsets.all(AppSpacing.md),
          child: AppListItem(
            leading: AppAvatar(
              radius: 20,
              backgroundColor: c.muted,
              child: Text(
                character.name.isNotEmpty
                    ? character.name[0].toUpperCase()
                    : '?',
                style: TextStyle(
                  color: c.foreground,
                  fontWeight: FontWeight.w600,
                  fontSize: AppTypography.bodyMedium,
                ),
              ),
            ),
            titleWidget: Text(
              character.name,
              style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            subtitleWidget: Text(
              character.role,
              style: theme.textTheme.bodySmall?.copyWith(
                    color: c.mutedForeground,
                  ),
            ),
            trailing: isNpc
                ? AppBadge(label: 'NPC', color: c.mutedForeground)
                : null,
          ),
        ),
      ),
    );
  }
}

class _ScenarioDetailLoading extends StatelessWidget {
  const _ScenarioDetailLoading();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: Shimmer.fromColors(
              baseColor: c.muted,
              highlightColor: c.card,
              child: Container(
                height: 20,
                width: 160,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      height: 16,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      height: 16,
                      width: 250,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      height: 24,
                      width: 140,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ...List.generate(
                    3,
                    (_) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: AppCard(
                        variant: AppCardVariant.outlined,
                        borderRadius: AppRadius.lg,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: AppListItem(
                          titleWidget: Shimmer.fromColors(
                            baseColor: c.muted,
                            highlightColor: c.card,
                            child: Container(
                              height: 16,
                              width: 120,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.sm),
                              ),
                            ),
                          ),
                          subtitleWidget: Shimmer.fromColors(
                            baseColor: c.muted,
                            highlightColor: c.card,
                            child: Container(
                              height: 12,
                              width: 180,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.sm),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      height: 24,
                      width: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ...List.generate(
                    2,
                    (_) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: AppCard(
                        variant: AppCardVariant.outlined,
                        borderRadius: AppRadius.lg,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: AppListItem(
                          leading: Shimmer.fromColors(
                            baseColor: c.muted,
                            highlightColor: c.card,
                            child: AppAvatar(
                              radius: 20,
                              backgroundColor: Colors.white,
                            ),
                          ),
                          titleWidget: Shimmer.fromColors(
                            baseColor: c.muted,
                            highlightColor: c.card,
                            child: Container(
                              height: 16,
                              width: 100,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.sm),
                              ),
                            ),
                          ),
                          subtitleWidget: Shimmer.fromColors(
                            baseColor: c.muted,
                            highlightColor: c.card,
                            child: Container(
                              height: 12,
                              width: 80,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.sm),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScenarioDetailError extends StatelessWidget {
  const _ScenarioDetailError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: AppAppBar(title: const Text('Scenario')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: c.mutedForeground),
              const SizedBox(height: AppSpacing.lg),
              const Text(
                'Unable to load scenario',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppButton(
                variant: AppButtonVariant.primary,
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: 'Retry',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniHistorySection extends StatelessWidget {
  const _MiniHistorySection({required this.results});
  final List<SimulationResultSummary> results;

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  Color _scoreColor(double score, AppColors c) {
    if (score >= 71) return c.success;
    if (score >= 41) return c.warning;
    return c.error;
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: AppSpacing.xl),
        Row(
          children: [
            const _SectionHeader(title: 'Result history'),
            const Spacer(),
            GestureDetector(
              onTap: () => context.push(
                '/practice/history?scenarioId=${results.first.scenarioId}',
              ),
              child: Text(
                'See all',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: c.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        ...results.take(3).map(
          (r) => _MiniHistoryItem(
            result: r,
            scoreColor: _scoreColor(r.totalScore, c),
            formattedDate: _formatDate(r.createdAt),
          ),
        ),
      ],
    );
  }
}

class _MiniHistoryItem extends StatelessWidget {
  const _MiniHistoryItem({
    required this.result,
    required this.scoreColor,
    required this.formattedDate,
  });

  final SimulationResultSummary result;
  final Color scoreColor;
  final String formattedDate;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: AppCard(
        variant: AppCardVariant.outlined,
        borderRadius: AppRadius.lg,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        onTap: () => context.push('/practice/results/${result.id}'),
        child: Row(
          children: [
            Text(
              result.totalScore.round().toString(),
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: scoreColor,
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
            Text(
              '/100',
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
            ),
            const Spacer(),
            if (result.characterName != null)
              Flexible(
                child: Text(
                  result.characterName!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: c.mutedForeground,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            if (result.characterName != null)
              const SizedBox(width: AppSpacing.md),
            Text(
              formattedDate,
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniHistoryLoading extends StatelessWidget {
  const _MiniHistoryLoading();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: AppSpacing.xl),
        Shimmer.fromColors(
          baseColor: c.muted,
          highlightColor: c.card,
          child: Container(
            height: 20,
            width: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        ...List.generate(
          2,
          (_) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: AppCard(
              variant: AppCardVariant.outlined,
              borderRadius: AppRadius.lg,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              child: Row(
                children: [
                  Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      width: 40,
                      height: 16,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                  const Spacer(),
                  Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      width: 60,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
