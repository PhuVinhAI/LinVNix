import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/lesson_providers.dart';
import '../../domain/exercise_set_models.dart';
import '../../domain/exercise_models.dart';

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
  bool _isCreatingCustom = false;
  String? _customError;

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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Failed to load exercises', style: theme.textTheme.bodyLarge, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                AppButton(
                  label: 'Retry',
                  variant: AppButtonVariant.primary,
                  onPressed: () => ref.invalidate(exerciseSetsProvider(widget.lessonId)),
                ),
              ],
            ),
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
                    ? () => context.push('/lessons/${widget.lessonId}/exercises/play/${tier.value}')
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
              const SizedBox(height: 32),
              _CustomPracticeSection(
                isUnlocked: summary.customPracticeUnlocked,
                customSets: summary.customSets,
                isCreating: _isCreatingCustom,
                error: _customError,
                onCreate: () => _showCustomConfigForm(context, summary),
                onPlaySet: (setId) => context.push(
                  '/lessons/${widget.lessonId}/exercises/play/custom/$setId',
                ),
                onRegenerate: (setId) => _handleRegenerateCustom(setId),
              ),
            ],
          );
        },
      ),
    );
  }

  bool _canPlayTier(LessonTierSummary summary, ExerciseTier tier) {
    if (!summary.isTierUnlocked(tier)) return false;
    if (tier == ExerciseTier.basic) return true;
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

  Future<void> _handleRegenerateCustom(String setId) async {
    setState(() {
      _isCreatingCustom = true;
      _customError = null;
    });

    try {
      final repo = ref.read(lessonRepositoryProvider);
      await repo.regenerateExercises(setId);
      if (mounted) {
        setState(() {
          _isCreatingCustom = false;
        });
        ref.invalidate(exerciseSetsProvider(widget.lessonId));
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isCreatingCustom = false;
          _customError = e.toString();
        });
      }
    }
  }

  void _showCustomConfigForm(BuildContext context, LessonTierSummary summary) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => _CustomConfigForm(
        lessonId: widget.lessonId,
        onSubmit: (config) async {
          Navigator.of(ctx).pop();
          setState(() {
            _isCreatingCustom = true;
            _customError = null;
          });
          try {
            final repo = ref.read(lessonRepositoryProvider);
            await repo.createCustomSet(widget.lessonId, config);
            if (mounted) {
              setState(() => _isCreatingCustom = false);
              ref.invalidate(exerciseSetsProvider(widget.lessonId));
            }
          } catch (e) {
            if (mounted) {
              setState(() {
                _isCreatingCustom = false;
                _customError = e.toString();
              });
            }
          }
        },
      ),
    );
  }

  void showUnlockAnimation(ExerciseTier tier) {
    setState(() => _newlyUnlockedTier = tier);
  }
}

class _CustomPracticeSection extends StatelessWidget {
  const _CustomPracticeSection({
    required this.isUnlocked,
    required this.customSets,
    this.isCreating = false,
    this.error,
    this.onCreate,
    this.onPlaySet,
    this.onRegenerate,
  });

  final bool isUnlocked;
  final List<TierProgress> customSets;
  final bool isCreating;
  final String? error;
  final VoidCallback? onCreate;
  final void Function(String setId)? onPlaySet;
  final void Function(String setId)? onRegenerate;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.tune, color: c.primary, size: 20),
            const SizedBox(width: 8),
            Text(
              'Luyện tập tự do',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Tự cấu hình bài tập AI theo ý muốn',
          style: theme.textTheme.bodyMedium?.copyWith(color: c.mutedForeground),
        ),
        const SizedBox(height: 16),
        if (!isUnlocked)
          AppCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(Icons.lock, color: c.muted, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Hoàn thành Basic tier để mở khóa',
                    style: theme.textTheme.bodyMedium?.copyWith(color: c.mutedForeground),
                  ),
                ),
              ],
            ),
          ),
        if (isUnlocked) ...[
          SizedBox(
            width: double.infinity,
            child: AppButton(
              label: isCreating ? 'Đang tạo...' : 'Tạo bài tập tự do',
              variant: AppButtonVariant.primary,
              onPressed: isCreating ? null : onCreate,
              icon: isCreating ? null : const Icon(Icons.add),
            ),
          ),
          if (error != null) ...[
            const SizedBox(height: 8),
            Text(error!, style: theme.textTheme.bodySmall?.copyWith(color: c.error)),
          ],
          const SizedBox(height: 12),
          ...customSets.map((cs) => _CustomSetCard(
            progress: cs,
            onTap: cs.totalExercises > 0 ? () => onPlaySet?.call(cs.setId) : null,
            onRegenerate: onRegenerate,
          )),
        ],
      ],
    );
  }
}

class _CustomSetCard extends StatelessWidget {
  const _CustomSetCard({
    required this.progress,
    this.onTap,
    this.onRegenerate,
  });

  final TierProgress progress;
  final VoidCallback? onTap;
  final void Function(String)? onRegenerate;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final color = c.primary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.edit_note, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    progress.title,
                    style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    progress.isCompleted
                        ? '${progress.percentCorrect.round()}%'
                        : progress.isInProgress
                            ? '${progress.percentComplete.round()}%'
                            : progress.totalExercises > 0
                                ? '${progress.totalExercises} câu'
                                : 'Chưa có bài',
                    style: theme.textTheme.bodySmall?.copyWith(color: c.mutedForeground),
                  ),
                ],
              ),
            ),
            if (progress.isCompleted)
              Icon(Icons.check_circle, color: color, size: 22),
            if (progress.isInProgress)
              SizedBox(
                width: 24,
                height: 24,
                child: AppProgress(
                  value: progress.percentComplete / 100,
                  color: color,
                ),
              ),
            PopupMenuButton<String>(
              icon: Icon(Icons.more_vert, color: c.mutedForeground, size: 20),
              onSelected: (value) {
                if (value == 'regenerate') onRegenerate?.call(progress.setId);
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'regenerate', child: Text('Tạo lại')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CustomConfigForm extends StatefulWidget {
  const _CustomConfigForm({
    required this.lessonId,
    required this.onSubmit,
  });

  final String lessonId;
  final Future<void> Function(CustomSetConfig config) onSubmit;

  @override
  State<_CustomConfigForm> createState() => _CustomConfigFormState();
}

class _CustomConfigFormState extends State<_CustomConfigForm> {
  double _questionCount = 10;
  final Set<String> _selectedTypes = {ExerciseType.multipleChoice.value, ExerciseType.matching.value};
  FocusArea _focusArea = FocusArea.both;
  bool _isSubmitting = false;

  static const _allExerciseTypes = ExerciseType.values;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Cấu hình bài tập tự do',
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),

          Text('Số câu hỏi: ${_questionCount.round()}', style: theme.textTheme.bodyMedium),
          Slider(
            value: _questionCount,
            min: 1,
            max: 30,
            divisions: 29,
            label: _questionCount.round().toString(),
            onChanged: (v) => setState(() => _questionCount = v),
          ),
          const SizedBox(height: 12),

          Text('Loại bài tập', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: _allExerciseTypes.map((type) {
              final selected = _selectedTypes.contains(type.value);
              return FilterChip(
                label: Text(_typeDisplayName(type)),
                selected: selected,
                onSelected: (sel) {
                  setState(() {
                    if (sel) {
                      _selectedTypes.add(type.value);
                    } else if (_selectedTypes.length > 1) {
                      _selectedTypes.remove(type.value);
                    }
                  });
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          Text('Trọng tâm', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          SegmentedButton<FocusArea>(
            segments: FocusArea.values
                .map((fa) => ButtonSegment(value: fa, label: Text(fa.displayName)))
                .toList(),
            selected: {_focusArea},
            onSelectionChanged: (s) => setState(() => _focusArea = s.first),
          ),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: AppButton(
              label: _isSubmitting ? 'Đang tạo...' : 'Tạo bài tập',
              variant: AppButtonVariant.primary,
              onPressed: _selectedTypes.isEmpty || _isSubmitting ? null : _handleSubmit,
              icon: const Icon(Icons.auto_awesome),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  String _typeDisplayName(ExerciseType type) {
    return switch (type) {
      ExerciseType.multipleChoice => 'Trắc nghiệm',
      ExerciseType.fillBlank => 'Điền từ',
      ExerciseType.matching => 'Nối cặp',
      ExerciseType.ordering => 'Sắp xếp',
      ExerciseType.translation => 'Dịch',
      ExerciseType.listening => 'Nghe',
    };
  }

  Future<void> _handleSubmit() async {
    setState(() => _isSubmitting = true);
    final config = CustomSetConfig(
      questionCount: _questionCount.round(),
      exerciseTypes: _selectedTypes.toList(),
      focusArea: _focusArea,
    );
    await widget.onSubmit(config);
    if (mounted) setState(() => _isSubmitting = false);
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
    if (!widget.isUnlocked) return 'Locked';
    if (widget.isGenerating) return 'Generating...';
    if (widget.generationError != null) return 'Generation failed';
    if (_needsGeneration) return 'Ready to generate';
    if (widget.progress == null) return 'Locked';
    if (widget.progress!.isCompleted) return 'Completed';
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
                      child: Icon(
                        Icons.celebration,
                        color: c.primary,
                        size: 32,
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
