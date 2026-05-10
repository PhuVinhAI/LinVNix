import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
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
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              IconButton(
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
                icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                iconSize: 32,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Listen and type what you hear',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          decoration: const InputDecoration(
            labelText: 'Your transcription',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
          onChanged: widget.onAnswerChanged,
        ),
      ],
    );
  }
}
