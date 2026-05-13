import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/lesson_providers.dart';
import '../../domain/exercise_set_models.dart';

class ExerciseTierScreen extends ConsumerStatefulWidget {
  const ExerciseTierScreen({super.key, required this.lessonId});
  final String lessonId;

  @override
  ConsumerState<ExerciseTierScreen> createState() => _ExerciseTierScreenState();
}

class _ExerciseTierScreenState extends ConsumerState<ExerciseTierScreen> {
  ExerciseTier? _newlyUnlockedTier;
  ExerciseTier? _generatingTier;
  String? _generationError;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final tierAsync = ref.watch(exerciseSetsProvider(widget.lessonId));

    return Scaffold(
      appBar: AppAppBar(title: const Text('Exercise Tiers')),
      body: tierAsync.when(
        loading: () => const Center(child: AppSpinner()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Failed to load exercises', style: theme.textTheme.bodyLarge),
              const SizedBox(height: 8),
              AppButton(
                label: 'Retry',
                variant: AppButtonVariant.primary,
                onPressed: () => ref.invalidate(exerciseSetsProvider(widget.lessonId)),
              ),
            ],
          ),
        ),
        data: (summary) {
          final allTiers = ExerciseTier.values;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                'Choose your level',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Complete each tier to unlock the next one',
                style: theme.textTheme.bodyMedium?.copyWith(color: c.mutedForeground),
              ),
              const SizedBox(height: 24),
              ...allTiers.map((tier) => _TierCard(
                tier: tier,
                progress: summary.progressForTier(tier),
                isUnlocked: summary.isTierUnlocked(tier),
                isNewlyUnlocked: _newlyUnlockedTier == tier,
                isGenerating: _generatingTier == tier,
                generationError: _generatingTier == tier ? _generationError : null,
                onTap: _canPlayTier(summary, tier)
                    ? () => context.go('/lessons/${widget.lessonId}/exercises/play/${tier.value}')
                    : null,
                onGenerate: summary.isTierUnlocked(tier) && tier != ExerciseTier.basic
                    ? () => _handleGenerate(tier)
                    : null,
                onRetryGenerate: _generatingTier == tier && _generationError != null
                    ? () => _handleGenerate(tier)
                    : null,
                onUnlockAnimationDone: _newlyUnlockedTier == tier
                    ? () => setState(() => _newlyUnlockedTier = null)
                    : null,
              )),
            ],
          );
        },
      ),
    );
  }

  bool _canPlayTier(LessonTierSummary summary, ExerciseTier tier) {
    if (!summary.isTierUnlocked(tier)) return false;
    final progress = summary.progressForTier(tier);
    if (progress == null) return false;
    return progress.totalExercises > 0;
  }

  Future<void> _handleGenerate(ExerciseTier tier) async {
    setState(() {
      _generatingTier = tier;
      _generationError = null;
    });

    try {
      final repo = ref.read(lessonRepositoryProvider);
      await repo.generateExercisesForTier(widget.lessonId, tier.value);
      if (mounted) {
        setState(() {
          _generatingTier = null;
          _generationError = null;
        });
        ref.invalidate(exerciseSetsProvider(widget.lessonId));
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _generatingTier = null;
          _generationError = e.toString();
        });
      }
    }
  }

  void showUnlockAnimation(ExerciseTier tier) {
    setState(() => _newlyUnlockedTier = tier);
  }
}

class _TierCard extends StatefulWidget {
  const _TierCard({
    required this.tier,
    this.progress,
    required this.isUnlocked,
    this.isNewlyUnlocked = false,
    this.isGenerating = false,
    this.generationError,
    this.onTap,
    this.onGenerate,
    this.onRetryGenerate,
    this.onUnlockAnimationDone,
  });

  final ExerciseTier tier;
  final TierProgress? progress;
  final bool isUnlocked;
  final bool isNewlyUnlocked;
  final bool isGenerating;
  final String? generationError;
  final VoidCallback? onTap;
  final VoidCallback? onGenerate;
  final VoidCallback? onRetryGenerate;
  final VoidCallback? onUnlockAnimationDone;

  @override
  State<_TierCard> createState() => _TierCardState();
}

class _TierCardState extends State<_TierCard> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _fadeInAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _fadeInAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    if (widget.isNewlyUnlocked) {
      _controller.forward().then((_) {
        widget.onUnlockAnimationDone?.call();
      });
    }
  }

  @override
  void didUpdateWidget(covariant _TierCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.isNewlyUnlocked && widget.isNewlyUnlocked) {
      _controller.forward().then((_) {
        widget.onUnlockAnimationDone?.call();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  bool get _needsGeneration {
    if (!widget.isUnlocked) return false;
    if (widget.tier == ExerciseTier.basic) return false;
    final progress = widget.progress;
    return progress == null || progress.totalExercises == 0;
  }

  Color _tierColor(AppColors c) {
    if (!widget.isUnlocked) return c.muted;
    return switch (widget.tier) {
      ExerciseTier.basic => c.primary,
      ExerciseTier.easy => const Color(0xFF4CAF50),
      ExerciseTier.medium => const Color(0xFFFF9800),
      ExerciseTier.hard => const Color(0xFFF44336),
      ExerciseTier.expert => const Color(0xFF9C27B0),
    };
  }

  IconData _tierIcon() {
    return switch (widget.tier) {
      ExerciseTier.basic => Icons.looks_one,
      ExerciseTier.easy => Icons.looks_two,
      ExerciseTier.medium => Icons.looks_3,
      ExerciseTier.hard => Icons.looks_4,
      ExerciseTier.expert => Icons.looks_5,
    };
  }

  String _statusText() {
    if (!widget.isUnlocked) return '🔒';
    if (widget.isGenerating) return 'Generating...';
    if (widget.generationError != null) return 'Generation failed';
    if (_needsGeneration) return 'Ready to generate';
    if (widget.progress == null) return '🔒';
    if (widget.progress!.isCompleted) return '✓';
    if (widget.progress!.isInProgress) return '${widget.progress!.percentComplete.round()}%';
    return '0%';
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final color = _tierColor(c);

    Widget card = Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        onTap: widget.onTap,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: widget.isUnlocked
                      ? Icon(_tierIcon(), color: color, size: 24)
                      : const Icon(Icons.lock, size: 24, color: Colors.grey),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.tier.displayName,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: widget.isUnlocked ? c.foreground : c.mutedForeground,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _statusText(),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: widget.isUnlocked ? c.mutedForeground : c.muted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.isUnlocked && widget.progress != null && widget.progress!.isInProgress)
                  SizedBox(
                    width: 32,
                    height: 32,
                    child: AppProgress(
                      value: widget.progress!.percentComplete / 100,
                      color: color,
                    ),
                  ),
                if (widget.isUnlocked && widget.progress != null && widget.progress!.isCompleted)
                  Icon(Icons.check_circle, color: color, size: 28),
              ],
            ),
            if (widget.isGenerating) ...[
              const SizedBox(height: 12),
              Center(child: AppSpinner()),
            ],
            if (widget.generationError != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.error_outline, color: c.error, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.generationError!,
                      style: theme.textTheme.bodySmall?.copyWith(color: c.error),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              AppButton(
                label: 'Retry',
                variant: AppButtonVariant.outline,
                onPressed: widget.onRetryGenerate,
              ),
            ],
            if (_needsGeneration && !widget.isGenerating && widget.generationError == null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: 'Generate Exercises',
                  variant: AppButtonVariant.primary,
                  onPressed: widget.onGenerate,
                ),
              ),
            ],
          ],
        ),
      ),
    );

    if (widget.isNewlyUnlocked) {
      card = AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: [
              child!,
              if (_fadeInAnimation.value > 0)
                Positioned(
                  top: 0,
                  right: 16,
                  child: Transform.scale(
                    scale: _scaleAnimation.value,
                    child: Opacity(
                      opacity: _fadeInAnimation.value,
                      child: const Text(
                        '🎉',
                        style: TextStyle(fontSize: 32),
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
        child: card,
      );
    }

    return card;
  }
}
