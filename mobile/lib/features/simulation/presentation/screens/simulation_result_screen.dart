import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/simulation_providers.dart';
import '../../domain/simulation_result_detail.dart';

Color _scoreColor(double score, AppColors c) {
  if (score >= 71) return c.success;
  if (score >= 41) return c.warning;
  return c.error;
}

void _popResultScreen(
  BuildContext context, {
  required bool fromConversation,
  required bool fromHistory,
  String? historyScenarioId,
}) {
  if (fromConversation) {
    context.go('/practice');
    return;
  }
  if (fromHistory) {
    if (context.canPop()) {
      context.pop();
      return;
    }
    final query = historyScenarioId != null && historyScenarioId.isNotEmpty
        ? '?scenarioId=$historyScenarioId'
        : '';
    context.go('/practice/history$query');
    return;
  }
  if (context.canPop()) {
    context.pop();
    return;
  }
  context.go('/practice');
}

class SimulationResultScreen extends ConsumerWidget {
  const SimulationResultScreen({
    super.key,
    required this.resultId,
    this.fromConversation = false,
    this.fromHistory = false,
    this.historyScenarioId,
  });
  final String resultId;
  final bool fromConversation;
  final bool fromHistory;
  final String? historyScenarioId;

  void _pop(BuildContext context) => _popResultScreen(
        context,
        fromConversation: fromConversation,
        fromHistory: fromHistory,
        historyScenarioId: historyScenarioId,
      );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultAsync = ref.watch(simulationResultDetailProvider(resultId));

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _pop(context);
      },
      child: resultAsync.when(
        loading: () => _ResultLoading(onPop: () => _pop(context)),
        error: (error, stack) => _ResultError(
          onPop: () => _pop(context),
          onRetry: () => ref.invalidate(simulationResultDetailProvider(resultId)),
        ),
        data: (result) => _ResultContent(
          result: result,
          onPop: () => _pop(context),
        ),
      ),
    );
  }
}

class _ResultContent extends StatelessWidget {
  const _ResultContent({
    required this.result,
    required this.onPop,
  });
  final SimulationResultDetail result;
  final VoidCallback onPop;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: Text(S.of(context).simulationResultTitle),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: onPop,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _TotalScoreDisplay(totalScore: result.totalScore),
                  if (result.criteriaScores.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _SectionHeader(title: S.of(context).gradingCriteria),
                    const SizedBox(height: AppSpacing.md),
                    ...result.criteriaScores.map(
                      (cs) => _CriteriaScoreItem(criteriaScore: cs),
                    ),
                  ],
                  if (result.aiSummary != null &&
                      result.aiSummary!.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _SectionHeader(title: S.of(context).aiFeedback),
                    const SizedBox(height: AppSpacing.md),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: c.muted.withAlpha(80),
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                      child: Text(
                        result.aiSummary!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: c.foreground,
                            ),
                      ),
                    ),
                  ],
                  if (result.isTooManyErrors) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _EndReasonMessage(
                      icon: Icons.menu_book_outlined,
                      iconColor: c.warning,
                      message: S.of(context).reviewLessonBeforeRetry,
                      bgColor: c.warning.withAlpha(12),
                    ),
                  ],
                  if (result.isInappropriate) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _EndReasonMessage(
                      icon: Icons.warning_amber_rounded,
                      iconColor: c.error,
                      message:
                          S.of(context).inappropriateContentEndMessage,
                      bgColor: c.error.withAlpha(12),
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (result.canReplay)
                AppButton(
                  variant: AppButtonVariant.primary,
                  onPressed: () => context.push(
                    '/practice/scenarios/${result.scenarioId}',
                  ),
                  label: S.of(context).playAgain,
                  isFullWidth: true,
                ),
              if (result.canReplay) const SizedBox(height: AppSpacing.sm),
              AppButton(
                variant: AppButtonVariant.outline,
                onPressed: () => context.push(
                  '/practice/sessions/${result.sessionId}?history=true&fromResult=true',
                ),
                label: S.of(context).reviewConversation,
                isFullWidth: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TotalScoreDisplay extends StatelessWidget {
  const _TotalScoreDisplay({required this.totalScore});
  final double totalScore;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final scoreColor = _scoreColor(totalScore, c);

    return Center(
      child: Column(
        children: [
          SizedBox(
            width: 120,
            height: 120,
            child: Stack(
              alignment: Alignment.center,
              children: [
                AppProgress(
                  value: totalScore / 100,
                  isCircular: true,
                  color: scoreColor,
                  trackColor: c.muted,
                  radius: 60,
                  strokeWidth: 6,
                ),
                Text(
                  totalScore.round().toString(),
                  style: GoogleFonts.inter(
                    fontSize: 36,
                    fontWeight: FontWeight.w700,
                    color: scoreColor,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            S.of(context).overallScoreLabel,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodySmall,
              color: c.mutedForeground,
            ),
          ),
        ],
      ),
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

class _CriteriaScoreItem extends StatelessWidget {
  const _CriteriaScoreItem({required this.criteriaScore});
  final CriteriaScore criteriaScore;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final progress =
        criteriaScore.maxScore > 0
            ? criteriaScore.score / criteriaScore.maxScore
            : 0.0;
    final scoreColor = _scoreColor(progress * 100, c);

    return Padding(
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
                Expanded(
                  child: Text(
                    criteriaScore.name,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Text(
                  '${criteriaScore.score.round()}/${criteriaScore.maxScore.round()}',
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.bodySmall,
                    fontWeight: FontWeight.w600,
                    color: scoreColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            AppProgress(
              value: progress,
              color: scoreColor,
              trackColor: c.muted,
              height: 6,
            ),
            if (criteriaScore.comment != null &&
                criteriaScore.comment!.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                criteriaScore.comment!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: c.mutedForeground,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EndReasonMessage extends StatelessWidget {
  const _EndReasonMessage({
    required this.icon,
    required this.iconColor,
    required this.message,
    required this.bgColor,
  });

  final IconData icon;
  final Color iconColor;
  final String message;
  final Color bgColor;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: iconColor.withAlpha(40)),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: c.foreground,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultLoading extends StatelessWidget {
  const _ResultLoading({required this.onPop});
  final VoidCallback onPop;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: onPop,
            ),
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
                children: [
                  Center(
                    child: Shimmer.fromColors(
                      baseColor: c.muted,
                      highlightColor: c.card,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
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
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: AppCard(
                        variant: AppCardVariant.outlined,
                        borderRadius: AppRadius.lg,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Shimmer.fromColors(
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
                            const SizedBox(height: AppSpacing.sm),
                            Shimmer.fromColors(
                              baseColor: c.muted,
                              highlightColor: c.card,
                              child: Container(
                                height: 6,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius:
                                      BorderRadius.circular(AppRadius.sm),
                                ),
                              ),
                            ),
                          ],
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

class _ResultError extends StatelessWidget {
  const _ResultError({
    required this.onPop,
    required this.onRetry,
  });
  final VoidCallback onPop;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: AppAppBar(
        title: Text(S.of(context).simulationResultTitle),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: onPop,
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: c.mutedForeground),
              const SizedBox(height: AppSpacing.lg),
              Text(
                S.of(context).unableToLoadResultMessage,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppButton(
                variant: AppButtonVariant.primary,
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: S.of(context).retryButton,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
