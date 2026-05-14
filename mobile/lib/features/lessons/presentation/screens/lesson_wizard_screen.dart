import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/lesson_providers.dart';
import '../../domain/lesson_models.dart';
import '../widgets/content_widgets.dart';
import '../widgets/vocabulary_step.dart';
import '../widgets/grammar_step.dart';

class LessonWizardScreen extends ConsumerStatefulWidget {
  const LessonWizardScreen({super.key, required this.lessonId});
  final String lessonId;

  @override
  ConsumerState<LessonWizardScreen> createState() => _LessonWizardScreenState();
}

class _LessonWizardScreenState extends ConsumerState<LessonWizardScreen> {
  PageController? _pageController;
  int _currentPage = 0;
  bool _initialProgressHandled = false;
  bool _startExercisesDialogOpen = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  static bool _isInProgress(Map<String, dynamic>? progress) {
    if (progress == null) return false;
    final s = progress['status']?.toString().toLowerCase();
    return s == 'in_progress';
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
            label: 'Go to exercises',
            isPrimary: true,
            onPressed: () {
              Navigator.of(ctx).pop();
              _navigateToExerciseHub();
            },
          ),
        ],
      ),
    );
  }

  void _navigateToExerciseHub() {
    context.push('/lessons/${widget.lessonId}/exercises');
  }

  void _showExercisePrompt() {
    if (_startExercisesDialogOpen) return;
    _startExercisesDialogOpen = true;

    ref
        .read(lessonProgressProvider(widget.lessonId).notifier)
        .markContentReviewed();

    AppDialog.show<void>(
      context,
      barrierDismissible: false,
      builder: (ctx) => AppDialog(
        title: 'Start exercises?',
        content:
            'You have finished the lesson content. Would you like to practice with exercises?',
        actions: [
          AppDialogAction(
            label: 'Not now',
            onPressed: () {
              Navigator.of(ctx).pop();
              if (mounted) context.pop();
            },
          ),
          AppDialogAction(
            label: 'Let\'s practice',
            isPrimary: true,
            onPressed: () {
              Navigator.of(ctx).pop();
              _navigateToExerciseHub();
            },
          ),
        ],
      ),
    ).whenComplete(() {
      if (mounted) {
        setState(() => _startExercisesDialogOpen = false);
      }
    });
  }

  bool _canGoForwardFrom(int index, int stepCount) {
    if (index >= stepCount - 1) return false;
    return true;
  }

  @override
  void didUpdateWidget(covariant LessonWizardScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.lessonId != widget.lessonId) {
      _initialProgressHandled = false;
      _startExercisesDialogOpen = false;
      _currentPage = 0;
      _pageController?.dispose();
      _pageController = PageController();
    }
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

    final lessonAsync = ref.watch(lessonDetailProvider(widget.lessonId));
    final vocabAsync = ref.watch(lessonVocabulariesProvider(widget.lessonId));
    final progressAsync = ref.watch(lessonProgressProvider(widget.lessonId));

    final isInitialLoading = (lessonAsync.isLoading && lessonAsync.value == null) ||
                             (vocabAsync.isLoading && vocabAsync.value == null);
    if (isInitialLoading) {
      return Scaffold(
        appBar: const AppAppBar(title: Text('Lesson')),
        body: const _LessonLoadingSkeleton(),
      );
    }

    if (lessonAsync.hasError || vocabAsync.hasError) {
      return Scaffold(
        appBar: const AppAppBar(title: Text('Lesson')),
        body: _LessonError(
          message: (lessonAsync.error ?? vocabAsync.error!).toString(),
          onRetry: () {
            ref.invalidate(lessonDetailProvider(widget.lessonId));
            ref.invalidate(lessonVocabulariesProvider(widget.lessonId));
          },
        ),
      );
    }

    final lesson = lessonAsync.value!;
    final vocabs = vocabAsync.value ?? [];
    final progress = progressAsync.value;

    if (!_initialProgressHandled && !progressAsync.isLoading) {
      if (progressAsync.hasError) {
        _initialProgressHandled = true;
        Future.microtask(() => ref
            .read(lessonProgressProvider(widget.lessonId).notifier)
            .startLesson());
      } else if (progressAsync.hasValue) {
        _initialProgressHandled = true;
        final hadExistingProgress = progress != null;
        final showResume = hadExistingProgress && _isInProgress(progress);
        Future.microtask(() async {
          final notifier =
              ref.read(lessonProgressProvider(widget.lessonId).notifier);
          if (showResume) {
            if (mounted) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) _showResumeDialog();
              });
            }
          }
          await notifier.startLesson();
        });
      }
    }

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

    if (steps.isEmpty) {
      return Scaffold(
        appBar: AppAppBar(title: Text(lesson.title)),
        body: const Center(child: Text('No content available')),
      );
    }

    final isLastStep = _currentPage == steps.length - 1;
    final canGoForward = _canGoForwardFrom(_currentPage, steps.length);

    return Scaffold(
      appBar: AppAppBar(
        title: Text(lesson.title),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: AppProgress(
            value: (_currentPage + 1) / steps.length,
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
                  'Step ${_currentPage + 1} of ${steps.length}',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: c.mutedForeground,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  steps[_currentPage].label,
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() => _currentPage = index);
              },
              itemCount: steps.length,
              itemBuilder: (context, index) {
                return _buildStep(steps[index]);
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
                  if (!isLastStep && canGoForward)
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
                  else if (isLastStep)
                    Semantics(
                      label: 'Continue to exercises',
                      button: true,
                      child: AppButton(
                        label: 'Continue',
                        variant: AppButtonVariant.primary,
                        onPressed: _showExercisePrompt,
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

enum _StepType { content, vocabulary, grammar }

class _WizardStep {
  const _WizardStep({
    required this.type,
    required this.label,
    this.content,
    this.vocabularies,
    this.grammarRules,
  });

  final _StepType type;
  final String label;
  final LessonContent? content;
  final List<LessonVocabulary>? vocabularies;
  final List<GrammarRule>? grammarRules;
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
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: c.mutedForeground),
            const SizedBox(height: 16),
            const Text('Failed to load lesson', textAlign: TextAlign.center),
            const SizedBox(height: 8),
            AppButton(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: 'Retry',
              variant: AppButtonVariant.primary,
            ),
          ],
        ),
      ),
    );
  }
}
