import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/lesson_providers.dart';
import '../../data/lesson_repository.dart';
import '../../domain/lesson_models.dart';
import '../../domain/exercise_models.dart';
import '../../../../core/providers/providers.dart';
import '../../../courses/data/courses_providers.dart';
import '../../../home/data/home_providers.dart';
import '../widgets/content_widgets.dart';
import '../widgets/vocabulary_step.dart';
import '../widgets/grammar_step.dart';
import '../widgets/exercise_step.dart';

class LessonWizardScreen extends ConsumerStatefulWidget {
  const LessonWizardScreen({super.key, required this.lessonId});
  final String lessonId;

  @override
  ConsumerState<LessonWizardScreen> createState() => _LessonWizardScreenState();
}

class _LessonWizardScreenState extends ConsumerState<LessonWizardScreen> {
  PageController? _pageController;
  int _currentPage = 0;
  List<_WizardStep> _steps = [];
  bool _loading = true;
  String? _error;
  LessonDetail? _lesson;
  final Map<String, int> _exerciseScores = {};
  final Set<String> _completedExercises = {};
  final Map<String, dynamic> _exerciseAnswers = {};
  final Map<String, ExerciseSubmissionResult> _exerciseResults = {};

  @override
  void initState() {
    super.initState();
    _loadLesson();
  }

  Future<void> _loadLesson() async {
    try {
      final repo = ref.read(lessonRepositoryProvider);
      final lesson = await repo.getLessonDetail(widget.lessonId);
      final vocabs = await repo.getVocabulariesByLesson(widget.lessonId);

      if (!mounted) return;

      final progress = await repo.getLessonProgress(widget.lessonId);
      if (!mounted) return;

      final isInProgress = progress != null &&
          (progress['status'] == 'in_progress' ||
              progress['status'] == 'IN_PROGRESS');

      final steps = <_WizardStep>[];

      for (final content in lesson.contents) {
        steps.add(_WizardStep(
          type: _StepType.content,
          label: _contentLabel(content.contentType),
          content: content,
        ));
      }

      if (vocabs.isNotEmpty) {
        steps.add(_WizardStep(
          type: _StepType.vocabulary,
          label: 'Vocabulary',
          vocabularies: vocabs,
        ));
      }

      if (lesson.grammarRules.isNotEmpty) {
        steps.add(_WizardStep(
          type: _StepType.grammar,
          label: 'Grammar',
          grammarRules: lesson.grammarRules,
        ));
      }

      if (lesson.exercises.isNotEmpty) {
        final exercises = await repo.getExercisesByLesson(widget.lessonId);
        if (!mounted) return;

        for (final exercise in exercises) {
          steps.add(_WizardStep(
            type: _StepType.exercise,
            label: 'Exercise',
            fullExercise: exercise,
          ));
        }
      }

      setState(() {
        _lesson = lesson;
        _steps = steps;
        _loading = false;
      });

      _pageController = PageController();

      await repo.startLesson(widget.lessonId);

      if (isInProgress && mounted && lesson.exercises.isNotEmpty) {
        _showResumeDialog();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _showResumeDialog() {
    AppDialog.show(
      context,
      builder: (ctx) => AppDialog(
        title: 'Continue lesson?',
        content:
            'You have an in-progress lesson. Would you like to skip to the exercises?',
        actions: [
          AppDialogAction(
            label: 'Start from beginning',
            onPressed: () => Navigator.of(ctx).pop(),
          ),
          AppDialogAction(
            label: 'Continue from exercises',
            isPrimary: true,
            onPressed: () {
              Navigator.of(ctx).pop();
              _jumpToExercises();
            },
          ),
        ],
      ),
    );
  }

  void _jumpToExercises() {
    final exerciseIndex =
        _steps.indexWhere((s) => s.type == _StepType.exercise);
    if (exerciseIndex >= 0 && _pageController != null) {
      _pageController!.animateToPage(
        exerciseIndex,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  int get _totalScore => _exerciseScores.values.fold(0, (a, b) => a + b);

  int get _maxScore {
    return _steps
            .where((s) => s.type == _StepType.exercise && s.fullExercise != null)
            .length *
        10;
  }

  void _onExerciseScoreChanged(String exerciseId, int score) {
    setState(() {
      _exerciseScores[exerciseId] = score;
    });
  }

  void _onExerciseCompleted(String exerciseId) {
    setState(() {
      _completedExercises.add(exerciseId);
    });
  }

  void _onExerciseAnswerChanged(String exerciseId, dynamic answer) {
    setState(() {
      _exerciseAnswers[exerciseId] = answer;
    });
  }

  void _onExerciseResultChanged(
      String exerciseId, ExerciseSubmissionResult result) {
    setState(() {
      _exerciseResults[exerciseId] = result;
    });
  }

  bool _canGoForwardFrom(int index) {
    if (index >= _steps.length - 1) return false;
    final step = _steps[index];
    if (step.type == _StepType.exercise && step.fullExercise != null) {
      return _completedExercises.contains(step.fullExercise!.id);
    }
    return true;
  }

  @override
  void dispose() {
    _pageController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    if (_loading) {
      return Scaffold(
        appBar: const AppAppBar(title: Text('Lesson')),
        body: const _LessonLoadingSkeleton(),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: const AppAppBar(title: Text('Lesson')),
        body: _LessonError(
          message: _error!,
          onRetry: () {
            setState(() {
              _loading = true;
              _error = null;
            });
            _loadLesson();
          },
        ),
      );
    }

    if (_steps.isEmpty) {
      return Scaffold(
        appBar: AppAppBar(title: Text(_lesson?.title ?? 'Lesson')),
        body: const Center(child: Text('No content available')),
      );
    }

    final isLastStep = _currentPage == _steps.length - 1;
    final currentStep = _steps[_currentPage];
    final isExerciseStep = currentStep.type == _StepType.exercise;
    final isExerciseCompleted = isExerciseStep &&
        currentStep.fullExercise != null &&
        _completedExercises.contains(currentStep.fullExercise!.id);
    final canGoForward = _canGoForwardFrom(_currentPage);

    return Scaffold(
      appBar: AppAppBar(
        title: Text(_lesson?.title ?? 'Lesson'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: AppProgress(
            value: (_currentPage + 1) / _steps.length,
            trackColor: c.muted,
            height: 4,
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  'Step ${_currentPage + 1} of ${_steps.length}',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: c.mutedForeground,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  _steps[_currentPage].label,
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (_exerciseScores.isNotEmpty) ...[
                  const Spacer(),
                  Text(
                    'Score: $_totalScore',
                    style: theme.textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: c.primary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() => _currentPage = index);
              },
              physics: canGoForward
                  ? null
                  : const NeverScrollableScrollPhysics(),
              itemCount: _steps.length,
              itemBuilder: (context, index) {
                return _buildStep(_steps[index]);
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (_currentPage > 0)
                    Semantics(
                      label: 'Go to previous step',
                      button: true,
                      child: AppButton(
                        label: 'Back',
                        variant: AppButtonVariant.outline,
                        onPressed: () {
                          _pageController?.previousPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        },
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                  const Spacer(),
                  if (!isLastStep && canGoForward && !isExerciseStep)
                    Semantics(
                      label: 'Go to next step',
                      button: true,
                      child: AppButton(
                        label: 'Next',
                        variant: AppButtonVariant.primary,
                        onPressed: () {
                          _pageController?.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        },
                      ),
                    )
                  else if (isExerciseStep && isExerciseCompleted && !isLastStep)
                    Semantics(
                      label: 'Go to next step',
                      button: true,
                      child: AppButton(
                        label: 'Next',
                        variant: AppButtonVariant.primary,
                        onPressed: () {
                          _pageController?.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        },
                      ),
                    )
                  else if (isLastStep && (!isExerciseStep || isExerciseCompleted))
                    Semantics(
                      label: 'Complete lesson',
                      button: true,
                      child: AppButton(
                        label: 'Complete',
                        variant: AppButtonVariant.primary,
                        onPressed: _completeLesson,
                      ),
                    )
                  else if (isExerciseStep && !isExerciseCompleted)
                    Semantics(
                      label: 'Answer required to continue',
                      button: true,
                      child: AppButton(
                        label: 'Next',
                        variant: AppButtonVariant.outline,
                        onPressed: null,
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

  Widget _buildStep(_WizardStep step) {
    switch (step.type) {
      case _StepType.content:
        return _buildContentWidget(step.content!);
      case _StepType.vocabulary:
        return VocabularyStepWidget(
          vocabularies: step.vocabularies ?? [],
          lessonId: widget.lessonId,
        );
      case _StepType.grammar:
        return GrammarStepWidget(grammarRules: step.grammarRules ?? []);
      case _StepType.exercise:
        final exercise = step.fullExercise!;
        final savedAnswer = _exerciseAnswers[exercise.id];
        final savedResult = _exerciseResults[exercise.id];
        return ExerciseStepWidget(
          exercise: exercise,
          initialAnswer: savedAnswer,
          initialResult: savedResult,
          onScoreChanged: (score) =>
              _onExerciseScoreChanged(exercise.id, score),
          onCompleted: () => _onExerciseCompleted(exercise.id),
          onAnswerChanged: (answer) =>
              _onExerciseAnswerChanged(exercise.id, answer),
          onResultChanged: (result) =>
              _onExerciseResultChanged(exercise.id, result),
        );
    }
  }

  Widget _buildContentWidget(LessonContent content) {
    switch (content.contentType) {
      case 'text':
        return TextContentWidget(content: content);
      case 'audio':
        return AudioContentWidget(content: content);
      case 'image':
        return ImageContentWidget(content: content);
      case 'video':
        return VideoContentWidget(content: content);
      case 'dialogue':
        return DialogueContentWidget(content: content);
      default:
        return TextContentWidget(content: content);
    }
  }

  Future<void> _completeLesson() async {
    try {
      final repo = ref.read(lessonRepositoryProvider);
      final score = _maxScore > 0
          ? ((_totalScore / _maxScore) * 100).round()
          : 0;
      await repo.completeLesson(widget.lessonId, score: score);

      ref.invalidate(userProgressProvider);
      ref.invalidate(continueLearningProvider);
      ref.invalidate(lessonProgressProvider(widget.lessonId));

      if (mounted) {
        _showCompletionDialog(score);
      }
    } catch (e) {
      if (mounted) {
        AppToast.show(context, message: 'Error completing lesson: $e', type: AppToastType.error);
      }
    }
  }

  void _showCompletionDialog(int score) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    AppDialog.show(
      context,
      barrierDismissible: false,
      builder: (ctx) => AppDialog(
        titleWidget: Row(
          children: [
            Icon(Icons.celebration, color: c.primary),
            const SizedBox(width: 8),
            const Text('Lesson Complete!'),
          ],
        ),
        contentWidget: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Your score',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 8),
            Text(
              '$score%',
              style: theme.textTheme.headlineLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: c.primary,
              ),
            ),
            if (_exerciseScores.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                '${_exerciseScores.values.where((s) => s > 0).length} of ${_exerciseScores.length} exercises correct',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: c.mutedForeground,
                ),
              ),
            ],
          ],
        ),
        actions: [
          AppDialogAction(
            label: 'Home',
            onPressed: () {
              Navigator.of(ctx).pop();
              context.go('/');
            },
          ),
          AppDialogAction(
            label: 'Review Lesson',
            isPrimary: true,
            onPressed: () {
              Navigator.of(ctx).pop();
            },
          ),
        ],
      ),
    );
  }

  String _contentLabel(String contentType) {
    return switch (contentType) {
      'text' => 'Reading',
      'audio' => 'Listening',
      'image' => 'Image',
      'video' => 'Video',
      'dialogue' => 'Dialogue',
      _ => 'Content',
    };
  }
}

enum _StepType { content, vocabulary, grammar, exercise }

class _WizardStep {
  const _WizardStep({
    required this.type,
    required this.label,
    this.content,
    this.vocabularies,
    this.grammarRules,
    this.fullExercise,
  });

  final _StepType type;
  final String label;
  final LessonContent? content;
  final List<LessonVocabulary>? vocabularies;
  final List<GrammarRule>? grammarRules;
  final Exercise? fullExercise;
}

class _LessonLoadingSkeleton extends StatelessWidget {
  const _LessonLoadingSkeleton();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Padding(
      padding: const EdgeInsets.all(24),
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
                color: c.card,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Shimmer.fromColors(
            baseColor: c.muted,
            highlightColor: c.card,
            child: Container(
              height: 24,
              width: double.infinity,
              decoration: BoxDecoration(
                color: c.card,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Shimmer.fromColors(
            baseColor: c.muted,
            highlightColor: c.card,
            child: Container(
              height: 16,
              width: 250,
              decoration: BoxDecoration(
                color: c.card,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Shimmer.fromColors(
            baseColor: c.muted,
            highlightColor: c.card,
            child: Container(
              height: 16,
              width: double.infinity,
              decoration: BoxDecoration(
                color: c.card,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Shimmer.fromColors(
            baseColor: c.muted,
            highlightColor: c.card,
            child: Container(
              height: 16,
              width: 200,
              decoration: BoxDecoration(
                color: c.card,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LessonError extends StatelessWidget {
  const _LessonError({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: c.mutedForeground),
          const SizedBox(height: 16),
          const Text('Failed to load lesson'),
          const SizedBox(height: 8),
          AppButton(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: 'Retry',
            variant: AppButtonVariant.primary,
          ),
        ],
      ),
    );
  }
}
