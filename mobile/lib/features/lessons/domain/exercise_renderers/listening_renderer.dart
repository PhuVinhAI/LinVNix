import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';

class ListeningRenderer extends ExerciseRenderer {
  const ListeningRenderer();

  @override
  ExerciseType get type => ExerciseType.listening;

  @override
  bool validateAnswer(Exercise exercise, dynamic answer) {
    return answer is String && answer.trim().isNotEmpty;
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    return {'transcript': (answer as String).trim()};
  }

  @override
  Widget buildQuestion(Exercise exercise, BuildContext context) {
    return Text(
      exercise.question,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
    );
  }

  @override
  Widget buildInput(
    Exercise exercise,
    BuildContext context,
    dynamic currentAnswer,
    ValueChanged<dynamic> onAnswerChanged,
  ) {
    final options = exercise.options as ListeningOptions;
    return _ListeningInput(
      audioUrl: options.audioUrl,
      onAnswerChanged: onAnswerChanged,
    );
  }
}

class _ListeningInput extends StatefulWidget {
  const _ListeningInput({
    required this.audioUrl,
    required this.onAnswerChanged,
  });

  final String audioUrl;
  final ValueChanged<dynamic> onAnswerChanged;

  @override
  State<_ListeningInput> createState() => _ListeningInputState();
}

class _ListeningInputState extends State<_ListeningInput> {
  AudioPlayer? _player;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    try {
      await _player!.setUrl(widget.audioUrl);
    } catch (_) {}
  }

  @override
  void dispose() {
    _player?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppCard(
          variant: AppCardVariant.muted,
          child: Row(
            children: [
              AppButton(
                variant: AppButtonVariant.text,
                icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                onPressed: () async {
                  if (_isPlaying) {
                    await _player?.pause();
                  } else {
                    await _player?.play();
                  }
                  if (mounted) {
                    setState(() => _isPlaying = !_isPlaying);
                  }
                },
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Listen and type what you hear',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: c.mutedForeground,
                      ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        AppInput(
          label: 'Your transcription',
          maxLines: 3,
          onChanged: widget.onAnswerChanged,
        ),
      ],
    );
  }
}
