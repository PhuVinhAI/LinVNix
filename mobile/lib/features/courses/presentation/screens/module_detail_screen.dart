import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../lessons/data/lesson_providers.dart';
import '../../../lessons/domain/exercise_set_models.dart';
import '../../../lessons/presentation/widgets/custom_practice_bottom_sheet.dart';
import '../../../profile/data/profile_providers.dart';
import '../../data/courses_providers.dart';
import '../../domain/course_models.dart';
import '../widgets/course_content_sections.dart';
import '../../../../l10n/app_localizations.dart';

const _levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

bool _isLevelHigher(String userLevel, String contentLevel) {
  final userIndex = _levelOrder.indexOf(userLevel);
  final contentIndex = _levelOrder.indexOf(contentLevel);
  return userIndex > contentIndex;
}

class ModuleDetailScreen extends ConsumerStatefulWidget {
  const ModuleDetailScreen({super.key, required this.moduleId});
  final String moduleId;

  @override
  ConsumerState<ModuleDetailScreen> createState() =>
      _ModuleDetailScreenState();
}

enum _BusyAction { none, create, regenerate, delete, reset, completeAll, resetModule }

class _ModuleDetailScreenState extends ConsumerState<ModuleDetailScreen>
    with WidgetsBindingObserver {
  String? _busySetId;
  _BusyAction _busyAction = _BusyAction.none;
  String? _error;
  bool _isCreatingCustom = false;
  String? _creatingSetId;
  String? _regeneratingNewSetId;
  CancelToken? _aiCancelToken;

  CancelToken _newAiCancelToken() {
    _aiCancelToken?.cancel();
    final next = CancelToken();
    _aiCancelToken = next;
    return next;
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void deactivate() {
    _aiCancelToken?.cancel();
    _cleanupIncompleteSet();
    super.deactivate();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _aiCancelToken?.cancel();
    _cleanupIncompleteSet();
    super.dispose();
  }

  void _cleanupIncompleteSet() {
    try {
      final repo = ref.read(lessonRepositoryProvider);
      if (_creatingSetId != null) {
        final id = _creatingSetId!;
        _creatingSetId = null;
        repo.deleteCustomExerciseSet(id).catchError((_) {});
      }
      if (_regeneratingNewSetId != null) {
        final id = _regeneratingNewSetId!;
        _regeneratingNewSetId = null;
        repo.deleteCustomExerciseSet(id).catchError((_) {});
      }
    } catch (_) {
      _creatingSetId = null;
      _regeneratingNewSetId = null;
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached) {
      _cleanupIncompleteSet();
    }
  }

  Map<String, UserProgress> _buildProgressMap(
      AsyncValue<List<UserProgress>> progressAsync) {
    return progressAsync.whenOrNull(
          data: (progressList) {
            return {for (final p in progressList) p.lessonId: p};
          },
        ) ??
        {};
  }

  bool _moduleHasAnyProgress(
      CourseModule module, Map<String, UserProgress> progressMap) {
    for (final lesson in module.lessons) {
      if (progressMap.containsKey(lesson.id)) return true;
    }
    return false;
  }

  Future<void> _pushExercisePlay(String setId) async {
    await context.push('/modules/${widget.moduleId}/exercises/play/$setId');
    if (!mounted) return;
    await ref
        .read(moduleExerciseSetsProvider(widget.moduleId).notifier)
        .refresh();
  }

  Future<void> _handleCreateCustom(CustomSetConfig config) async {
    setState(() {
      _isCreatingCustom = true;
      _busyAction = _BusyAction.create;
      _error = null;
    });
    String? setId;
    try {
      final notifier =
          ref.read(moduleExerciseSetsProvider(widget.moduleId).notifier);
      final set = await notifier.createCustomSet(config);
      setId = set.id;
      _creatingSetId = setId;

      final token = _newAiCancelToken();
      await notifier.generateSet(setId,
          userPrompt: config.userPrompt, cancelToken: token);
      _creatingSetId = null;
      if (mounted) {
        setState(() {
          _isCreatingCustom = false;
          _busyAction = _BusyAction.none;
        });
      }
    } catch (e) {
      if (!mounted) return;

      if (e is RequestCancelledException) {
        if (setId != null) {
          final repo = ref.read(lessonRepositoryProvider);
          await repo.deleteCustomExerciseSet(setId).catchError((_) {});
        }
        _creatingSetId = null;
        setState(() {
          _isCreatingCustom = false;
          _busyAction = _BusyAction.none;
        });
        return;
      }

      if (setId != null) {
        final repo = ref.read(lessonRepositoryProvider);
        await repo.deleteCustomExerciseSet(setId).catchError((_) {});
      }
      _creatingSetId = null;
      setState(() {
        _isCreatingCustom = false;
        _busyAction = _BusyAction.none;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleRegenerate(String setId, {String? userPrompt}) async {
    setState(() {
      _busySetId = setId;
      _busyAction = _BusyAction.regenerate;
      _error = null;
      _regeneratingNewSetId = null;
    });
    String? newSetId;
    try {
      final notifier =
          ref.read(moduleExerciseSetsProvider(widget.moduleId).notifier);
      newSetId = await notifier.regenerateSet(setId, userPrompt: userPrompt);
      _regeneratingNewSetId = newSetId;

      final token = _newAiCancelToken();
      await notifier.generateSet(newSetId,
          userPrompt: userPrompt, cancelToken: token);
      _regeneratingNewSetId = null;
      if (mounted) {
        setState(() {
          _busySetId = null;
          _busyAction = _BusyAction.none;
        });
      }
    } catch (e) {
      if (!mounted) return;

      if (newSetId != null) {
        final repo = ref.read(lessonRepositoryProvider);
        await repo.deleteCustomExerciseSet(newSetId).catchError((_) {});
      }
      _regeneratingNewSetId = null;

      if (e is RequestCancelledException) {
        setState(() {
          _busySetId = null;
          _busyAction = _BusyAction.none;
        });
        return;
      }
      setState(() {
        _busySetId = null;
        _busyAction = _BusyAction.none;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleDelete(String setId) async {
    setState(() {
      _busySetId = setId;
      _busyAction = _BusyAction.delete;
      _error = null;
    });
    try {
      final notifier =
          ref.read(moduleExerciseSetsProvider(widget.moduleId).notifier);
      await notifier.deleteSet(setId);
      if (mounted) {
        setState(() {
          _busySetId = null;
          _busyAction = _BusyAction.none;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busySetId = null;
        _busyAction = _BusyAction.none;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleReset(String setId) async {
    setState(() {
      _busySetId = setId;
      _busyAction = _BusyAction.reset;
      _error = null;
    });
    try {
      final notifier =
          ref.read(moduleExerciseSetsProvider(widget.moduleId).notifier);
      await notifier.resetSetProgress(setId);
      await ref.read(exerciseSessionServiceProvider).delete(setId);
      if (mounted) {
        setState(() {
          _busySetId = null;
          _busyAction = _BusyAction.none;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busySetId = null;
        _busyAction = _BusyAction.none;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleCompleteAll() async {
    setState(() {
      _busyAction = _BusyAction.completeAll;
      _error = null;
    });
    try {
      final notifier =
          ref.read(moduleExerciseSetsProvider(widget.moduleId).notifier);
      await notifier.completeAllModuleProgress();
      ref.invalidate(userProgressProvider);
      ref.invalidate(moduleDetailProvider(widget.moduleId));
      if (mounted) {
        setState(() {
          _busyAction = _BusyAction.none;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busyAction = _BusyAction.none;
        _error = e.toString();
      });
    }
  }

  Future<void> _handleResetModule() async {
    setState(() {
      _busyAction = _BusyAction.resetModule;
      _error = null;
    });
    try {
      final notifier =
          ref.read(moduleExerciseSetsProvider(widget.moduleId).notifier);
      await notifier.resetModuleProgress();
      ref.invalidate(userProgressProvider);
      ref.invalidate(moduleDetailProvider(widget.moduleId));
      if (mounted) {
        setState(() {
          _busyAction = _BusyAction.none;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busyAction = _BusyAction.none;
        _error = e.toString();
      });
    }
  }

  void _showCreationForm({String? initialUserPrompt}) {
    AppBottomSheet.show(
      context,
      isScrollControlled: true,
      builder: (ctx) => CustomPracticeBottomSheet.creation(
        initialUserPrompt: initialUserPrompt,
        onSubmit: (config) async {
          Navigator.of(ctx).pop();
          await _handleCreateCustom(config);
        },
      ),
    );
  }

  void _showInfoSheet(SetProgress set) {
    final isRegenerating = _busySetId == set.setId &&
        _busyAction == _BusyAction.regenerate;

    AppBottomSheet.show(
      context,
      isScrollControlled: true,
      builder: (ctx) => CustomPracticeBottomSheet.info(
        progress: set,
        onPlay: () {
          Navigator.of(ctx).pop();
          _pushExercisePlay(set.setId);
        },
        onRegenerate: () {
          Navigator.of(ctx).pop();
          _confirmRegenerate(set.setId, set.title, set.userPrompt);
        },
        onReset: () {
          Navigator.of(ctx).pop();
          _confirmReset(set.setId, set.title);
        },
        onDelete: () {
          Navigator.of(ctx).pop();
          _confirmDelete(set.setId);
        },
        onCancel: isRegenerating ? () => _aiCancelToken?.cancel() : null,
      ),
    );
  }

  void _confirmDelete(String setId) {
    AppDialog.show(
      context,
      builder: (dialogCtx) => AppDialog(
        title: S.of(context).deleteCustomSetQuestion,
        content:
            S.of(context).deleteCustomPracticeSetWarning,
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: S.of(context).deleteLabel,
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
        title: S.of(context).resetProgressQuestion,
        content: S.of(context).clearAnswersWarningParam(title),
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: S.of(context).resetLabel,
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

  void _confirmRegenerate(String setId, String title, String? userPrompt) {
    AppDialog.show(
      context,
      builder: (dialogCtx) => AppDialog(
        title: S.of(context).regenerateExercisesQuestion,
        content: S.of(context).freshAiQuestionsWarningParam(title),
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: S.of(context).regenerateLabel,
            isPrimary: true,
            onPressed: () {
              Navigator.pop(dialogCtx);
              _handleRegenerate(setId, userPrompt: userPrompt);
            },
          ),
        ],
      ),
    );
  }

  void _confirmCompleteAll() {
    AppDialog.show(
      context,
      builder: (dialogCtx) => AppDialog(
        title: S.of(context).markAllLessonsCompletedQuestion,
        content:
            S.of(context).markModuleCompleteWarning,
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: S.of(context).completeAll,
            isPrimary: true,
            onPressed: () {
              Navigator.pop(dialogCtx);
              _handleCompleteAll();
            },
          ),
        ],
      ),
    );
  }

  void _confirmResetModule() {
    AppDialog.show(
      context,
      builder: (dialogCtx) => AppDialog(
        title: S.of(context).resetAllProgressQuestion,
        content:
            S.of(context).resetModuleProgressWarning,
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(dialogCtx),
          ),
          AppDialogAction(
            label: S.of(context).resetLabel,
            isPrimary: true,
            onPressed: () {
              Navigator.pop(dialogCtx);
              _handleResetModule();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final moduleAsync = ref.watch(moduleDetailProvider(widget.moduleId));
    final progressAsync = ref.watch(userProgressProvider);
    final userProfileAsync = ref.watch(userProfileProvider);
    final exerciseSetsAsync =
        ref.watch(moduleExerciseSetsProvider(widget.moduleId));

    return Scaffold(
      body: moduleAsync.when(
        loading: () => const _ModuleDetailLoading(),
        error: (error, stack) => _ModuleDetailError(
          onRetry: () => ref.invalidate(moduleDetailProvider(widget.moduleId)),
        ),
        data: (module) {
          final progressMap = _buildProgressMap(progressAsync);
          final userLevel = userProfileAsync.whenOrNull(
              data: (profile) => profile.currentLevel);
          final moduleLevel = module.course?.level;
          final showCompleteAll = userLevel != null &&
              moduleLevel != null &&
              _isLevelHigher(userLevel, moduleLevel);
          final hasProgress = _moduleHasAnyProgress(module, progressMap);
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                title: Text(module.title),
              ),
              SliverToBoxAdapter(child: _ModuleInfoSection(module: module)),
              _buildListHeaderSliver(
                exerciseSetsAsync,
                showCompleteAll,
                hasProgress,
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final lesson = module.lessons[index];
                    final progress = progressMap[lesson.id];
                    return _LessonCard(lesson: lesson, progress: progress);
                  },
                  childCount: module.lessons.length,
                ),
              ),
              _buildCustomPracticeSliver(context, exerciseSetsAsync),
              const SliverToBoxAdapter(
                  child: SizedBox(height: AppSpacing.lg)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildListHeaderSliver(
    AsyncValue<ModuleExerciseSummary> exerciseSetsAsync,
    bool showCompleteAll,
    bool hasProgress,
  ) {
    return exerciseSetsAsync.when(
      loading: () => SliverToBoxAdapter(
        child: ContentListHeader(title: S.of(context).lessonsTitle),
      ),
      error: (_, _) => SliverToBoxAdapter(
        child: ContentListHeader(title: S.of(context).lessonsTitle),
      ),
      data: (summary) {
        final hasBypassProgress = summary.completedLessonsCount > 0;
        final shouldShowReset = hasProgress || hasBypassProgress;

        return SliverToBoxAdapter(
          child: ContentListHeader(
            title: S.of(context).lessonsTitle,
            progressText: S.of(context).completedCountParam(
                  summary.completedLessonsCount,
                  summary.totalLessonsCount,
                ),
            showCompleteAll: showCompleteAll,
            showReset: shouldShowReset,
            isCompletingAll: _busyAction == _BusyAction.completeAll,
            isResetting: _busyAction == _BusyAction.resetModule,
            onCompleteAll: _confirmCompleteAll,
            onReset: _confirmResetModule,
          ),
        );
      },
    );
  }

  Widget _buildCustomPracticeSliver(
    BuildContext context,
    AsyncValue<ModuleExerciseSummary> exerciseSetsAsync,
  ) {
    return exerciseSetsAsync.when(
      loading: () => const SliverToBoxAdapter(child: SizedBox.shrink()),
      error: (_, _) => const SliverToBoxAdapter(child: SizedBox.shrink()),
      data: (summary) {
        final customSets = summary.moduleSets;

        return SliverToBoxAdapter(
          child: CustomPracticeSection(
            eligible: summary.eligible,
            lockedMessage:
                S.of(context).unlockCustomPracticeModuleHint,
            emptyMessage:
                S.of(context).noCustomPracticeSetsYet,
            isCreating: _isCreatingCustom,
            error: _error,
            onCreate: _showCreationForm,
            onCancelCreate: () => _aiCancelToken?.cancel(),
            setCards: customSets
                .map(
                  (set) => _ModuleSetCard(
                    progress: set,
                    isBusy: _busySetId == set.setId,
                    isRegenerating: _busySetId == set.setId &&
                        _busyAction == _BusyAction.regenerate,
                    onTap: () => _showInfoSheet(set),
                    onCancel: () => _aiCancelToken?.cancel(),
                  ),
                )
                .toList(),
          ),
        );
      },
    );
  }
}

class _ModuleInfoSection extends StatelessWidget {
  const _ModuleInfoSection({required this.module});

  final CourseModule module;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: c.border, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (module.topic != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm + 2,
                  vertical: AppSpacing.xs + 1,
                ),
                decoration: BoxDecoration(
                  color: c.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text(
                  module.topic!,
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.caption,
                    fontWeight: FontWeight.w600,
                    color: c.primary,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],
            Text(
              module.description,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: c.foreground,
                height: 1.5,
              ),
            ),
            if (module.estimatedHours != null || module.course != null) ...[
              const SizedBox(height: AppSpacing.md),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.xs,
                children: [
                  if (module.estimatedHours != null)
                    _ModuleMetaChip(
                      icon: Icons.access_time_rounded,
                      label: '${module.estimatedHours}h',
                    ),
                  if (module.course != null)
                    _ModuleMetaChip(
                      icon: Icons.school_outlined,
                      label: module.course!.title,
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ModuleMetaChip extends StatelessWidget {
  const _ModuleMetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm + 2,
        vertical: AppSpacing.xs + 1,
      ),
      decoration: BoxDecoration(
        color: c.muted,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: c.mutedForeground),
          const SizedBox(width: AppSpacing.xs),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: AppTypography.caption,
              fontWeight: FontWeight.w500,
              color: c.mutedForeground,
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleSetCard extends StatelessWidget {
  const _ModuleSetCard({
    required this.progress,
    this.isBusy = false,
    this.isRegenerating = false,
    this.onTap,
    this.onCancel,
  });

  final SetProgress progress;
  final bool isBusy;
  final bool isRegenerating;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isBusy ? null : onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md + 2),
            decoration: BoxDecoration(
              color: c.card,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: c.border, width: 1),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: c.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Icon(Icons.auto_awesome, color: c.primary, size: 22),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        progress.title,
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.bodyLarge,
                          fontWeight: FontWeight.w600,
                          color: c.foreground,
                          height: 1.25,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (progress.description != null &&
                          progress.description!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          progress.description!,
                          style: GoogleFonts.inter(
                            fontSize: AppTypography.bodySmall,
                            color: c.mutedForeground,
                            height: 1.4,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 2),
                      Text(
                        progress.isCompleted
                            ? '${progress.percentCorrect.round()}%'
                            : progress.isInProgress
                                ? '${progress.percentComplete.round()}%'
                                : '${progress.totalExercises} questions',
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.caption,
                          color: c.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                _ModuleSetTrailing(
                  progress: progress,
                  isBusy: isBusy,
                  isRegenerating: isRegenerating,
                  onCancel: onCancel,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ModuleSetTrailing extends StatelessWidget {
  const _ModuleSetTrailing({
    required this.progress,
    required this.isBusy,
    required this.isRegenerating,
    this.onCancel,
  });

  final SetProgress progress;
  final bool isBusy;
  final bool isRegenerating;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    if (isBusy) {
      return SizedBox(
        width: 44,
        height: 44,
        child: isRegenerating && onCancel != null
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const AppSpinner(size: 20, strokeWidth: 2),
                  const SizedBox(height: 2),
                  Text(
                    S.of(context).cancelButton2,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      color: c.mutedForeground,
                    ),
                  ),
                ],
              )
            : const Center(child: AppSpinner(size: 22)),
      );
    }
    if (progress.isCompleted) {
      return Icon(Icons.check_circle, color: c.primary, size: 26);
    }
    if (progress.isInProgress) {
      return SizedBox(
        width: 28,
        height: 28,
        child: AppProgress(
          value: progress.percentComplete / 100,
          color: c.primary,
        ),
      );
    }
    return Icon(Icons.play_circle_outline, color: c.primary, size: 26);
  }
}

class _LessonCard extends StatelessWidget {
  const _LessonCard({required this.lesson, this.progress});

  final Lesson lesson;
  final UserProgress? progress;

  Color _statusColor(String? status, AppColors c) {
    return switch (status) {
      'completed' => c.success,
      'in_progress' => c.warning,
      _ => c.mutedForeground,
    };
  }

  IconData _statusIcon(String? status) {
    return switch (status) {
      'completed' => Icons.check_circle,
      'in_progress' => Icons.play_circle,
      _ => Icons.radio_button_unchecked,
    };
  }

  String _statusLabel(BuildContext context, String? status) {
    return switch (status) {
      'completed' => S.of(context).completedLabel,
      'in_progress' => S.of(context).inProgressLabel,
      _ => S.of(context).notStartedLabel,
    };
  }

  String _formatDuration(int minutes) {
    if (minutes < 60) return '${minutes}m';
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m > 0 ? '${h}h ${m}m' : '${h}h';
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final statusColor = _statusColor(progress?.status, c);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.push('/lessons/${lesson.id}'),
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md + 2),
            decoration: BoxDecoration(
              color: c.card,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: c.border, width: 1),
            ),
            child: Row(
              children: [
                _LessonTypeIcon(lessonType: lesson.lessonType),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              lesson.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: AppTypography.bodyLarge,
                                fontWeight: FontWeight.w600,
                                color: c.foreground,
                                height: 1.25,
                              ),
                            ),
                          ),
                          if (lesson.isAssessment)
                            Container(
                              margin: const EdgeInsets.only(left: AppSpacing.sm),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: c.muted,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.sm),
                              ),
                              child: Text(
                                S.of(context).quizLabel,
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: c.foreground,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        lesson.description,
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.bodySmall,
                          color: c.mutedForeground,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: AppSpacing.xs + 2),
                      Row(
                        children: [
                          if (lesson.estimatedDuration != null) ...[
                            Icon(Icons.access_time_rounded,
                                size: 12, color: c.mutedForeground),
                            const SizedBox(width: AppSpacing.xs),
                            Text(
                              _formatDuration(lesson.estimatedDuration!),
                              style: GoogleFonts.inter(
                                fontSize: AppTypography.caption,
                                color: c.mutedForeground,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                          ],
                          Icon(_statusIcon(progress?.status),
                              size: 13, color: statusColor),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            _statusLabel(context, progress?.status),
                            style: GoogleFonts.inter(
                              fontSize: AppTypography.caption,
                              fontWeight: FontWeight.w500,
                              color: statusColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Icon(Icons.chevron_right, color: c.mutedForeground, size: 22),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LessonTypeIcon extends StatelessWidget {
  const _LessonTypeIcon({required this.lessonType});
  final String lessonType;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: c.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Icon(_getIcon(), size: 22, color: c.primary),
    );
  }

  IconData _getIcon() {
    return switch (lessonType) {
      'vocabulary' => Icons.abc,
      'grammar' => Icons.menu_book,
      'reading' => Icons.article,
      'listening' => Icons.headphones,
      'speaking' => Icons.mic,
      'writing' => Icons.edit,
      'pronunciation' => Icons.record_voice_over,
      'culture' => Icons.public,
      _ => Icons.school,
    };
  }
}

class _ModuleDetailLoading extends StatelessWidget {
  const _ModuleDetailLoading();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          title: Shimmer.fromColors(
            baseColor: c.muted,
            highlightColor: c.card,
            child: Container(
              height: 20,
              width: 200,
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
                    width: 100,
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
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              return Container(
                margin: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  0,
                  AppSpacing.lg,
                  AppSpacing.md,
                ),
                padding: const EdgeInsets.all(AppSpacing.md + 2),
                decoration: BoxDecoration(
                  color: c.card,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: c.border, width: 1),
                ),
                child: Row(
                  children: [
                    Shimmer.fromColors(
                      baseColor: c.muted,
                      highlightColor: c.card,
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Shimmer.fromColors(
                            baseColor: c.muted,
                            highlightColor: c.card,
                            child: Container(
                              height: 16,
                              width: 150,
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
                              height: 12,
                              width: 200,
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
                  ],
                ),
              );
            },
            childCount: 5,
          ),
        ),
      ],
    );
  }
}

class _ModuleDetailError extends StatelessWidget {
  const _ModuleDetailError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: AppAppBar(title: Text(S.of(context).moduleDetailTitle)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: c.error.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                ),
                child: Icon(Icons.error_outline, size: 30, color: c.error),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                S.of(context).failedToLoadModule,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodyLarge,
                  fontWeight: FontWeight.w600,
                  color: c.foreground,
                ),
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
      ),
    );
  }
}
