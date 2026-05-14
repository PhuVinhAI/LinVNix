import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/lesson_providers.dart';
import '../../domain/exercise_models.dart';
import '../../domain/exercise_set_models.dart';

class ExerciseHubScreen extends ConsumerStatefulWidget {
  const ExerciseHubScreen({super.key, required this.lessonId});
  final String lessonId;

  @override
  ConsumerState<ExerciseHubScreen> createState() => _ExerciseHubScreenState();
}

class _ExerciseHubScreenState extends ConsumerState<ExerciseHubScreen> {
  String? _busySetId;
  String? _error;
  bool _isCreatingCustom = false;
  CancelToken? _aiCancelToken;

  CancelToken _newAiCancelToken() {
    _aiCancelToken?.cancel();
    final next = CancelToken();
    _aiCancelToken = next;
    return next;
  }

  @override
  void dispose() {
    _aiCancelToken?.cancel();
    super.dispose();
  }

  Future<void> _pushExercisePlay(String setId) async {
    await context.push('/lessons/${widget.lessonId}/exercises/play/$setId');
    if (!mounted) return;
    await ref.read(exerciseSetsProvider(widget.lessonId).notifier).refresh();
  }

  Future<void> _handleRegenerate(String setId) async {
    setState(() {
      _busySetId = setId;
      _error = null;
    });
    try {
      final token = _newAiCancelToken();
      final notifier = ref.read(exerciseSetsProvider(widget.lessonId).notifier);
      await notifier.regenerateSet(setId, cancelToken: token);
      if (mounted) {
        setState(() => _busySetId = null);
      }
    } catch (e) {
      if (!mounted) return;
      if (e is RequestCancelledException) {
        setState(() => _busySetId = null);
        return;
      }
      setState(() {
        _busySetId = null;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleDelete(String setId) async {
    setState(() {
      _busySetId = setId;
      _error = null;
    });
    try {
      final notifier = ref.read(exerciseSetsProvider(widget.lessonId).notifier);
      await notifier.deleteSet(setId);
      if (mounted) {
        setState(() => _busySetId = null);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busySetId = null;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleReset(String setId) async {
    setState(() {
      _busySetId = setId;
      _error = null;
    });
    try {
      final notifier = ref.read(exerciseSetsProvider(widget.lessonId).notifier);
      await notifier.resetSetProgress(setId);
      if (mounted) {
        setState(() => _busySetId = null);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busySetId = null;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleCreateCustom(CustomSetConfig config) async {
    setState(() {
      _isCreatingCustom = true;
      _error = null;
    });
    try {
      final token = _newAiCancelToken();
      final notifier = ref.read(exerciseSetsProvider(widget.lessonId).notifier);
      await notifier.createCustomSet(config, cancelToken: token);
      if (mounted) {
        setState(() => _isCreatingCustom = false);
      }
    } catch (e) {
      if (!mounted) return;
      if (e is RequestCancelledException) {
        setState(() => _isCreatingCustom = false);
        return;
      }
      setState(() {
        _isCreatingCustom = false;
        _error = e.toString();
      });
    }
  }

  void _showCustomConfigForm() {
    AppBottomSheet.show(
      context,
      isScrollControlled: true,
      builder: (ctx) => _CustomConfigForm(
        lessonId: widget.lessonId,
        onSubmit: (config) async {
          Navigator.of(ctx).pop();
          await _handleCreateCustom(config);
        },
      ),
    );
  }

  void _confirmDelete(String setId) {
    AppDialog.show(
      context,
      builder: (dialogCtx) => AppDialog(
        title: 'Delete custom set?',
        content:
            'This set will be removed from your list. You can create a new one anytime.',
        actions: [
          AppDialogAction(
            label: 'Cancel',
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: 'Delete',
            isPrimary: true,
            onPressed: () {
              Navigator.pop(dialogCtx);
              _handleDelete(setId);
            },
          ),
        ],
      ),
    );
  }

  void _confirmReset(String setId, String title) {
    AppDialog.show(
      context,
      builder: (dialogCtx) => AppDialog(
        title: 'Reset progress?',
        content:
            'Your answers for "$title" will be cleared. You can start over anytime.',
        actions: [
          AppDialogAction(
            label: 'Cancel',
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: 'Reset',
            isPrimary: true,
            onPressed: () {
              Navigator.pop(dialogCtx);
              _handleReset(setId);
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final summaryAsync = ref.watch(exerciseSetsProvider(widget.lessonId));

    return Scaffold(
      appBar: const AppAppBar(title: Text('Practice')),
      body: summaryAsync.when(
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
                  onPressed: () => ref.read(exerciseSetsProvider(widget.lessonId).notifier).refresh(),
                ),
              ],
            ),
          ),
        ),
        data: (summary) {
          final defaultSets = summary.defaultSets;
          final customSets = summary.customSets;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (defaultSets.isNotEmpty) ...[
                Text(
                  'Lesson Exercises',
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Practice with the lesson\'s built-in exercises',
                  style: theme.textTheme.bodyMedium?.copyWith(color: c.mutedForeground),
                ),
                const SizedBox(height: 16),
                ...defaultSets.map((set) => _SetCard(
                  progress: set,
                  isBusy: _busySetId == set.setId,
                  onPlay: () => _pushExercisePlay(set.setId),
                  onReset: () => _confirmReset(set.setId, set.title),
                )),
                const SizedBox(height: 32),
              ],
              Row(
                children: [
                  Icon(Icons.auto_awesome, color: c.primary, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Custom Practice',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Generate AI-powered exercises tailored to your needs',
                style: theme.textTheme.bodyMedium?.copyWith(color: c.mutedForeground),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: _isCreatingCustom ? 'Creating...' : 'Create custom set',
                  variant: AppButtonVariant.primary,
                  onPressed: _isCreatingCustom ? null : _showCustomConfigForm,
                  icon: _isCreatingCustom ? null : const Icon(Icons.add),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: theme.textTheme.bodySmall?.copyWith(color: c.error)),
              ],
              const SizedBox(height: 12),
              ...customSets.map((set) => _SetCard(
                progress: set,
                isBusy: _busySetId == set.setId,
                onPlay: () => _pushExercisePlay(set.setId),
                onReset: () => _confirmReset(set.setId, set.title),
                onRegenerate: () => _handleRegenerate(set.setId),
                onDelete: () => _confirmDelete(set.setId),
                isCustom: true,
              )),
              if (customSets.isEmpty && defaultSets.isEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 32),
                  child: Center(
                    child: Text(
                      'No exercises yet. Create a custom set to start practicing!',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(color: c.mutedForeground),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _SetCard extends StatelessWidget {
  const _SetCard({
    required this.progress,
    required this.isBusy,
    this.onPlay,
    this.onReset,
    this.onRegenerate,
    this.onDelete,
    this.isCustom = false,
  });

  final SetProgress progress;
  final bool isBusy;
  final VoidCallback? onPlay;
  final VoidCallback? onReset;
  final VoidCallback? onRegenerate;
  final VoidCallback? onDelete;
  final bool isCustom;

  void _openActionsMenu(BuildContext context) {
    final c = AppTheme.colors(context);
    AppBottomSheet.show(
      context,
      builder: (sheetCtx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.sm,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Actions',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: c.foreground,
                            ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Close',
                      onPressed: () => Navigator.pop(sheetCtx),
                      icon: Icon(Icons.close, color: c.mutedForeground),
                      style: IconButton.styleFrom(
                        foregroundColor: c.mutedForeground,
                        minimumSize: const Size(48, 48),
                        fixedSize: const Size(48, 48),
                      ),
                    ),
                  ],
                ),
              ),
              Divider(height: 1, color: c.border),
              if (isCustom && onRegenerate != null)
                AppListItem(
                  leading: Icon(Icons.auto_awesome, color: c.primary, size: 22),
                  title: 'Regenerate exercises',
                  subtitle: 'Replace all questions with new AI content',
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.md,
                  ),
                  onTap: () {
                    Navigator.pop(sheetCtx);
                    onRegenerate!();
                  },
                ),
              if (onReset != null)
                AppListItem(
                  leading: Icon(Icons.replay, color: c.warning, size: 22),
                  title: 'Reset progress',
                  subtitle: 'Clear your answers and start over',
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.md,
                  ),
                  onTap: () {
                    Navigator.pop(sheetCtx);
                    onReset!();
                  },
                ),
              if (isCustom && onDelete != null)
                AppListItem(
                  leading: Icon(Icons.delete_outline, color: c.error, size: 22),
                  title: 'Delete set',
                  subtitle: 'Remove from custom practice list',
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.md,
                  ),
                  onTap: () {
                    Navigator.pop(sheetCtx);
                    onDelete!();
                  },
                ),
              const SizedBox(height: AppSpacing.sm),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final color = isCustom ? c.accent : c.primary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        padding: EdgeInsets.zero,
        child: Row(
          children: [
            Expanded(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onPlay,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isCustom ? Icons.auto_awesome : Icons.edit_note,
                            color: color,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                progress.title,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                progress.isCompleted
                                    ? '${progress.percentCorrect.round()}%'
                                    : progress.isInProgress
                                        ? '${progress.percentComplete.round()}%'
                                        : '${progress.totalExercises} questions',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: c.mutedForeground,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (progress.isCompleted)
                          Icon(Icons.check_circle, color: color, size: 28)
                        else if (progress.isInProgress)
                          SizedBox(
                            width: 32,
                            height: 32,
                            child: AppProgress(
                              value: progress.percentComplete / 100,
                              color: color,
                            ),
                          )
                        else
                          Icon(Icons.play_circle_outline, color: color, size: 28),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: isBusy
                  ? const Padding(
                      padding: EdgeInsets.all(16),
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: AppSpinner(),
                      ),
                    )
                  : IconButton(
                      icon: Icon(Icons.keyboard_arrow_down_rounded,
                          color: c.mutedForeground, size: 26),
                      tooltip: 'Actions',
                      onPressed: () => _openActionsMenu(context),
                    ),
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
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.sm,
                AppSpacing.sm,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Text(
                      'Configure custom practice',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: c.foreground,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Close',
                    onPressed: () => Navigator.pop(context),
                    icon: Icon(Icons.close, color: c.mutedForeground),
                    style: IconButton.styleFrom(
                      foregroundColor: c.mutedForeground,
                      minimumSize: const Size(48, 48),
                      fixedSize: const Size(48, 48),
                    ),
                  ),
                ],
              ),
            ),
            Divider(height: 1, color: c.border),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.md,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Number of questions: ${_questionCount.round()}',
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  AppSlider(
                    value: _questionCount,
                    min: 1,
                    max: 30,
                    divisions: 29,
                    label: _questionCount.round().toString(),
                    onChanged: (v) => setState(() => _questionCount = v),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Exercise types',
                    style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _allExerciseTypes.map((type) {
                      final selected = _selectedTypes.contains(type.value);
                      return AppChip(
                        label: _typeDisplayName(type),
                        isSelected: selected,
                        onTap: () {
                          setState(() {
                            if (!selected) {
                              _selectedTypes.add(type.value);
                            } else if (_selectedTypes.length > 1) {
                              _selectedTypes.remove(type.value);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Focus',
                    style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: FocusArea.values.map((fa) {
                      final selected = _focusArea == fa;
                      return AppChip(
                        label: fa.displayName,
                        isSelected: selected,
                        color: c.accent,
                        onTap: () => setState(() => _focusArea = fa),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  AppButton(
                    label: _isSubmitting ? 'Creating...' : 'Create exercises',
                    variant: AppButtonVariant.primary,
                    onPressed: _selectedTypes.isEmpty || _isSubmitting ? null : _handleSubmit,
                    icon: const Icon(Icons.auto_awesome),
                    isFullWidth: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _typeDisplayName(ExerciseType type) {
    return switch (type) {
      ExerciseType.multipleChoice => 'Multiple choice',
      ExerciseType.fillBlank => 'Fill in the blank',
      ExerciseType.matching => 'Matching',
      ExerciseType.ordering => 'Ordering',
      ExerciseType.translation => 'Translation',
      ExerciseType.listening => 'Listening',
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
