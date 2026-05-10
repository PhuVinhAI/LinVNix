import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/lesson_providers.dart';
import '../../domain/exercise_models.dart';
import '../../domain/exercise_renderer.dart';
import '../../domain/exercise_renderer_registry.dart';
import 'question_header.dart';
import 'timer_bar.dart';
import 'submit_button.dart';
import 'explanation_panel.dart';

class ExerciseStepWidget extends ConsumerStatefulWidget {
  const ExerciseStepWidget({
    super.key,
    required this.exercise,
    required this.onScoreChanged,
  });

  final Exercise exercise;
  final ValueChanged<int> onScoreChanged;

  @override
  ConsumerState<ExerciseStepWidget> createState() =>
      _ExerciseStepWidgetState();
}

class _ExerciseStepWidgetState extends ConsumerState<ExerciseStepWidget> {
  dynamic _currentAnswer;
  bool _submitted = false;
  bool _submitting = false;
  ExerciseSubmissionResult? _result;
  String? _error;

  ExerciseRenderer get _renderer => getRenderer(widget.exercise.exerciseType);

  bool get _isValid => _renderer.validateAnswer(widget.exercise, _currentAnswer);

  Future<void> _submit() async {
    if (!_isValid || _submitted || _submitting) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final repo = ref.read(lessonRepositoryProvider);
      final payload = _renderer.buildAnswerPayload(_currentAnswer);
      final result = await repo.submitExerciseAnswer(
        widget.exercise.id,
        payload,
      );

      if (!mounted) return;

      setState(() {
        _result = result;
        _submitted = true;
        _submitting = false;
      });

      if (result.isCorrect) {
        widget.onScoreChanged(result.score);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _submitting = false;
      });
    }
  }

  void _onTimeout() {
    if (!_submitted) {
      _submit();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TimerBar(
            totalSeconds: widget.exercise.exerciseType.timerSeconds,
            onTimeout: _onTimeout,
          ),
          const SizedBox(height: 24),
          QuestionHeader(
            exercise: widget.exercise,
            renderer: _renderer.buildQuestion(widget.exercise, context),
          ),
          const SizedBox(height: 24),
          if (!_submitted)
            _renderer.buildInput(
              widget.exercise,
              context,
              _currentAnswer,
              (answer) => setState(() => _currentAnswer = answer),
            ),
          const SizedBox(height: 24),
          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _error!,
                style: TextStyle(color: theme.colorScheme.onErrorContainer),
              ),
            ),
            const SizedBox(height: 16),
          ],
          if (!_submitted)
            SubmitButton(
              isEnabled: _isValid,
              isLoading: _submitting,
              onPressed: _submit,
            ),
          if (_submitted && _result != null) ...[
            ExplanationPanel(
              isCorrect: _result!.isCorrect,
              correctAnswer: _correctAnswerText(),
              explanation: widget.exercise.explanation,
              score: _result!.score,
            ),
          ],
        ],
      ),
    );
  }

  String _correctAnswerText() {
    final answer = widget.exercise.correctAnswer;
    return switch (answer) {
      MultipleChoiceAnswer(:final selectedChoice) => selectedChoice,
      FillBlankAnswer(:final answers) => answers.join(', '),
      MatchingAnswer(:final matches) =>
        matches.map((m) => '${m.left} → ${m.right}').join(', '),
      OrderingAnswer(:final orderedItems) => orderedItems.join(' → '),
      TranslationAnswer(:final translation) => translation,
      ListeningAnswer(:final transcript) => transcript,
    };
  }
}
