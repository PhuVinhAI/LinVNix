import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/simulation_providers.dart';
import '../../domain/simulation_result_summary.dart';

class ResultsHistoryScreen extends ConsumerStatefulWidget {
  const ResultsHistoryScreen({super.key, this.scenarioId});
  final String? scenarioId;

  @override
  ConsumerState<ResultsHistoryScreen> createState() =>
      _ResultsHistoryScreenState();
}

class _ResultsHistoryScreenState extends ConsumerState<ResultsHistoryScreen> {
  String? _selectedScenarioId;

  @override
  void initState() {
    super.initState();
    _selectedScenarioId = widget.scenarioId;
  }

  void _onBack() {
    if (context.canPop()) {
      context.pop();
      return;
    }
    context.go('/practice');
  }

  @override
  Widget build(BuildContext context) {
    final resultsAsync =
        ref.watch(simulationResultsProvider(_selectedScenarioId));

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _onBack();
      },
      child: Scaffold(
        appBar: AppAppBar(
          title: Text(S.of(context).conversationHistoryTitle),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: _onBack,
          ),
        ),
        body: resultsAsync.when(
        loading: () => const _ResultsLoading(),
        error: (error, stack) => _ResultsError(
          onRetry: () => ref
              .read(simulationResultsProvider(_selectedScenarioId).notifier)
              .refresh(),
        ),
        data: (results) => _ResultsContent(
          results: results,
          selectedScenarioId: _selectedScenarioId,
          onFilterChanged: (scenarioId) {
            setState(() => _selectedScenarioId = scenarioId);
          },
          onRefresh: () => ref
              .read(simulationResultsProvider(_selectedScenarioId).notifier)
              .refresh(),
        ),
        ),
      ),
    );
  }
}

class _ResultsContent extends StatelessWidget {
  const _ResultsContent({
    required this.results,
    this.selectedScenarioId,
    required this.onFilterChanged,
    required this.onRefresh,
  });

  final List<SimulationResultSummary> results;
  final String? selectedScenarioId;
  final void Function(String?) onFilterChanged;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (results.isEmpty) {
      return const _ResultsEmpty();
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          _FilterRow(
            selectedScenarioId: selectedScenarioId,
            onFilterChanged: onFilterChanged,
          ),
          const SizedBox(height: AppSpacing.md),
          ...results.map(
            (r) => _ResultCard(
              result: r,
              historyScenarioId: selectedScenarioId,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterRow extends StatelessWidget {
  const _FilterRow({
    this.selectedScenarioId,
    required this.onFilterChanged,
  });

  final String? selectedScenarioId;
  final void Function(String?) onFilterChanged;

  @override
  Widget build(BuildContext context) {
    if (selectedScenarioId == null) return const SizedBox.shrink();

    final c = AppTheme.colors(context);

    return Row(
      children: [
        Icon(Icons.filter_list, size: 16, color: c.mutedForeground),
        const SizedBox(width: AppSpacing.xs),
        Text(
          S.of(context).filteringByScenario,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: () => onFilterChanged(null),
          child: Text(
            S.of(context).clearFilter,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: c.primary,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
      ],
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({
    required this.result,
    this.historyScenarioId,
  });
  final SimulationResultSummary result;
  final String? historyScenarioId;

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  String _endReasonLabel(BuildContext context, String reason) {
    return switch (reason) {
      'COMPLETED' => S.of(context).completedLabel,
      'TOO_MANY_ERRORS' => S.of(context).tooManyErrorsLabel,
      'INAPPROPRIATE' => S.of(context).inappropriateContentLabel,
      'ABUSIVE' => S.of(context).abusiveContentLabel,
      _ => reason,
    };
  }

  Color _scoreColor(double score, AppColors c) {
    if (score >= 71) return c.success;
    if (score >= 41) return c.warning;
    return c.error;
  }

  Color _endReasonColor(String reason, AppColors c) {
    return switch (reason) {
      'COMPLETED' => c.success,
      'TOO_MANY_ERRORS' => c.warning,
      _ => c.error,
    };
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final scoreColor = _scoreColor(result.totalScore, c);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: AppCard(
        variant: AppCardVariant.outlined,
        borderRadius: AppRadius.lg,
        padding: const EdgeInsets.all(AppSpacing.md),
        onTap: () {
          final query = StringBuffer('fromHistory=true');
          if (historyScenarioId != null && historyScenarioId!.isNotEmpty) {
            query.write('&scenarioId=$historyScenarioId');
          }
          context.push('/practice/results/${result.id}?$query');
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  result.totalScore.round().toString(),
                  style: theme.textTheme.titleMedium?.copyWith(
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
                AppBadge(
                  label: _endReasonLabel(context, result.endReason),
                  color: _endReasonColor(result.endReason, c),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            if (result.scenarioTitle != null)
              Text(
                result.scenarioTitle!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                if (result.characterName != null) ...[
                  Icon(
                    Icons.person_outline,
                    size: 14,
                    color: c.mutedForeground,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    result.characterName!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: c.mutedForeground,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                ],
                Icon(
                  Icons.access_time_rounded,
                  size: 14,
                  color: c.mutedForeground,
                ),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  _formatDate(result.createdAt),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: c.mutedForeground,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultsEmpty extends StatelessWidget {
  const _ResultsEmpty();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: c.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.history_outlined,
                size: 80,
                color: c.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              S.of(context).noResultsYet,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: c.foreground,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              S.of(context).completeSimulationToSeeResults,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: c.mutedForeground,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultsLoading extends StatelessWidget {
  const _ResultsLoading();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: List.generate(
        5,
        (_) => Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: AppCard(
            variant: AppCardVariant.outlined,
            borderRadius: AppRadius.lg,
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Shimmer.fromColors(
                      baseColor: c.muted,
                      highlightColor: c.card,
                      child: Container(
                        width: 48,
                        height: 24,
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
                        width: 80,
                        height: 20,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Shimmer.fromColors(
                  baseColor: c.muted,
                  highlightColor: c.card,
                  child: Container(
                    height: 16,
                    width: 200,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Shimmer.fromColors(
                  baseColor: c.muted,
                  highlightColor: c.card,
                  child: Container(
                    height: 14,
                    width: 160,
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
    );
  }
}

class _ResultsError extends StatelessWidget {
  const _ResultsError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: c.error.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline_rounded,
                size: 80,
                color: c.error,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              S.of(context).unableToLoadDataMessage,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: c.foreground,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppButton(
              variant: AppButtonVariant.primary,
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: S.of(context).retryButton,
            ),
          ],
        ),
      ),
    );
  }
}
