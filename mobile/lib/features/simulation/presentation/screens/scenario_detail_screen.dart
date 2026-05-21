import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/simulation_providers.dart';
import '../../domain/scenario_detail.dart';

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
  const ScenarioDetailScreen({super.key, required this.scenarioId});
  final String scenarioId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(scenarioDetailProvider(scenarioId));

    return detailAsync.when(
      loading: () => const _ScenarioDetailLoading(),
      error: (error, stack) => _ScenarioDetailError(
        onRetry: () => ref.invalidate(scenarioDetailProvider(scenarioId)),
      ),
      data: (detail) => _ScenarioDetailContent(detail: detail),
    );
  }
}

class _ScenarioDetailContent extends StatelessWidget {
  const _ScenarioDetailContent({required this.detail});
  final ScenarioDetail detail;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

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
                    _SectionHeader(title: 'Tiêu chí chấm điểm'),
                    const SizedBox(height: AppSpacing.md),
                    ...detail.scoringCriteria.map(
                      (criterion) => _ScoringCriterionItem(criterion: criterion),
                    ),
                  ],
                  if (detail.characters.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _SectionHeader(title: 'Nhân vật'),
                    const SizedBox(height: AppSpacing.md),
                    ...detail.characters.map(
                      (character) => _CharacterItem(character: character),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.xxl + AppSpacing.lg),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.sm,
            AppSpacing.lg,
            AppSpacing.lg,
          ),
          child: AppButton(
            variant: AppButtonVariant.primary,
            onPressed: () => context
                .push('/practice/scenarios/${detail.id}/select-character'),
            label: 'Bắt đầu',
            isFullWidth: true,
          ),
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

    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: [
        AppBadge(
          label: detail.requiredLevel,
          color: _getLevelColor(detail.requiredLevel, c),
        ),
        AppBadge(
          label: _getDifficultyLabel(detail.difficulty),
          color: _getDifficultyColor(detail.difficulty, c),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.access_time_rounded, size: 14, color: c.mutedForeground),
            const SizedBox(width: AppSpacing.xs),
            Text(
              '${detail.estimatedMinutes}m',
              style: theme.textTheme.bodySmall?.copyWith(
                    color: c.mutedForeground,
                  ),
            ),
          ],
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.people_outline, size: 14, color: c.mutedForeground),
            const SizedBox(width: AppSpacing.xs),
            Text(
              '${detail.characterCount}',
              style: theme.textTheme.bodySmall?.copyWith(
                    color: c.mutedForeground,
                  ),
            ),
          ],
        ),
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
      appBar: AppAppBar(title: const Text('Tình huống')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: c.mutedForeground),
              const SizedBox(height: AppSpacing.lg),
              const Text(
                'Không thể tải tình huống',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppButton(
                variant: AppButtonVariant.primary,
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: 'Thử lại',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
