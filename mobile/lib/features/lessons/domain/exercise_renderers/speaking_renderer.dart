import 'dart:async';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../../../../core/network/media_url.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../exercise_models.dart';
import '../exercise_renderer.dart';
import '../exercise_theme_helper.dart';

class SpeakingRenderer extends ExerciseRenderer {
  const SpeakingRenderer();

  @override
  ExerciseType get type => ExerciseType.speaking;

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
      style: Theme.of(
        context,
      ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w600),
    );
  }

  @override
  Widget buildInput(
    Exercise exercise,
    BuildContext context,
    dynamic currentAnswer,
    ValueChanged<dynamic> onAnswerChanged,
  ) {
    final options = exercise.options as SpeakingOptions;
    return _SpeakingInput(
      exerciseId: exercise.id,
      promptText: options.promptText,
      promptAudioUrl: exercise.questionAudioUrl ?? options.promptAudioUrl,
      currentAnswer: currentAnswer is String ? currentAnswer : '',
      onAnswerChanged: onAnswerChanged,
    );
  }
}

class _SpeechRecognizer {
  _SpeechRecognizer._();
  static final instance = _SpeechRecognizer._();

  final stt.SpeechToText _speech = stt.SpeechToText();
  final _statusController = StreamController<String>.broadcast();
  final _errorController = StreamController<String>.broadcast();

  bool _initialized = false;
  bool _available = false;
  String? _vietnameseLocaleId;

  Stream<String> get statuses => _statusController.stream;
  Stream<String> get errors => _errorController.stream;
  bool get isListening => _speech.isListening;

  Future<bool> ensureReady() async {
    if (_initialized) return _available;

    _available = await _speech.initialize(
      onStatus: _statusController.add,
      onError: (error) => _errorController.add(error.errorMsg),
      options: [stt.SpeechToText.androidNoBluetooth],
    );
    _initialized = true;

    if (_available) {
      _vietnameseLocaleId = await _resolveVietnameseLocale();
    }

    return _available;
  }

  Future<String?> _resolveVietnameseLocale() async {
    final locales = await _speech.locales();
    for (final locale in locales) {
      final id = locale.localeId.toLowerCase().replaceAll('_', '-');
      if (id.startsWith('vi')) return locale.localeId;
    }
    return null;
  }

  Future<void> listen({required stt.SpeechResultListener onResult}) async {
    final ready = await ensureReady();
    if (!ready) return;

    await _speech.listen(
      onResult: onResult,
      listenOptions: stt.SpeechListenOptions(
        partialResults: true,
        cancelOnError: true,
        listenMode: stt.ListenMode.confirmation,
        pauseFor: const Duration(seconds: 3),
        listenFor: const Duration(seconds: 12),
        localeId: _vietnameseLocaleId,
      ),
    );
  }

  Future<void> stop() => _speech.stop();
  Future<void> cancel() => _speech.cancel();
}

class _SpeakingInput extends StatefulWidget {
  const _SpeakingInput({
    required this.exerciseId,
    required this.currentAnswer,
    required this.onAnswerChanged,
    this.promptText,
    this.promptAudioUrl = '',
  });

  final String exerciseId;
  final String? promptText;
  final String promptAudioUrl;
  final String currentAnswer;
  final ValueChanged<dynamic> onAnswerChanged;

  @override
  State<_SpeakingInput> createState() => _SpeakingInputState();
}

class _SpeakingInputState extends State<_SpeakingInput> {
  final _recognizer = _SpeechRecognizer.instance;
  final _promptPlayer = AudioPlayer();
  late final TextEditingController _transcriptController;

  StreamSubscription<String>? _statusSub;
  StreamSubscription<String>? _errorSub;
  StreamSubscription<PlayerState>? _playerSub;

  bool _isListening = false;
  bool _isPlayingPrompt = false;
  String? _error;
  String _lastCommittedTranscript = '';

  bool get _hasPromptAudio => widget.promptAudioUrl.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    _transcriptController = TextEditingController(text: widget.currentAnswer);
    _lastCommittedTranscript = widget.currentAnswer.trim();
    _statusSub = _recognizer.statuses.listen(_handleStatus);
    _errorSub = _recognizer.errors.listen(_handleError);
    _playerSub = _promptPlayer.playerStateStream.listen(_handlePlayerState);
  }

  @override
  void didUpdateWidget(covariant _SpeakingInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.exerciseId != widget.exerciseId ||
        oldWidget.currentAnswer != widget.currentAnswer) {
      _lastCommittedTranscript = widget.currentAnswer.trim();
      _setTranscript(widget.currentAnswer);
      _error = null;
    }
  }

  @override
  void dispose() {
    _statusSub?.cancel();
    _errorSub?.cancel();
    _playerSub?.cancel();
    if (_recognizer.isListening) {
      unawaited(_recognizer.stop());
    }
    _promptPlayer.dispose();
    _transcriptController.dispose();
    super.dispose();
  }

  Future<void> _togglePromptAudio() async {
    if (!_hasPromptAudio) return;

    try {
      if (_isPlayingPrompt) {
        await _promptPlayer.pause();
        return;
      }

      await _promptPlayer.setUrl(resolveMediaUrl(widget.promptAudioUrl));
      await _promptPlayer.seek(Duration.zero);
      await _promptPlayer.play();
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not play the prompt audio.';
      });
    }
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _recognizer.stop();
      return;
    }

    setState(() {
      _error = null;
      _lastCommittedTranscript = '';
      _setTranscript('');
    });
    widget.onAnswerChanged('');

    final ready = await _recognizer.ensureReady();
    if (!mounted) return;
    if (!ready) {
      setState(() {
        _error = 'Speech recognition is not available on this device.';
      });
      return;
    }

    try {
      await _recognizer.listen(onResult: _handleSpeechResult);
      if (mounted) {
        setState(() => _isListening = true);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isListening = false;
        _error = 'Could not start speech recognition.';
      });
    }
  }

  void _handleSpeechResult(SpeechRecognitionResult result) {
    final transcript = result.recognizedWords.trim();
    if (!mounted || transcript.isEmpty) return;

    setState(() => _setTranscript(transcript));
    if (result.finalResult) {
      _commitTranscript(transcript);
    }
  }

  void _handleStatus(String status) {
    if (!mounted) return;

    setState(() {
      _isListening = status == stt.SpeechToText.listeningStatus;
    });

    if (status == stt.SpeechToText.doneStatus ||
        status == stt.SpeechToText.notListeningStatus) {
      _commitTranscript(_transcriptController.text);
    }
  }

  void _handleError(String message) {
    if (!mounted) return;
    setState(() {
      _isListening = false;
      _error = message;
    });
  }

  void _handlePlayerState(PlayerState state) {
    if (!mounted) return;
    final playing =
        state.playing && state.processingState != ProcessingState.completed;
    if (_isPlayingPrompt != playing) {
      setState(() => _isPlayingPrompt = playing);
    }
    if (state.processingState == ProcessingState.completed) {
      unawaited(_promptPlayer.seek(Duration.zero));
    }
  }

  void _commitTranscript(String transcript) {
    final cleaned = transcript.trim();
    if (cleaned.isEmpty || cleaned == _lastCommittedTranscript) return;
    _lastCommittedTranscript = cleaned;
    widget.onAnswerChanged(cleaned);
  }

  void _setTranscript(String value) {
    _transcriptController.text = value;
    _transcriptController.selection = TextSelection.collapsed(
      offset: _transcriptController.text.length,
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final visuals = getExerciseVisuals(context, ExerciseType.speaking);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppCard(
          variant: AppCardVariant.muted,
          padding: const EdgeInsets.all(AppSpacing.md),
          borderRadius: AppRadius.md,
          child: Row(
            children: [
              IconButton(
                tooltip: 'Play prompt',
                onPressed: _hasPromptAudio ? _togglePromptAudio : null,
                icon: Icon(
                  _isPlayingPrompt
                      ? Icons.pause_rounded
                      : Icons.volume_up_rounded,
                ),
                color: visuals.accent,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  widget.promptText ?? 'Listen, then say it aloud',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: c.foreground,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Center(
          child: Column(
            children: [
              Material(
                color: visuals.accent,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: _toggleListening,
                  child: SizedBox.square(
                    dimension: 76,
                    child: Icon(
                      _isListening ? Icons.stop_rounded : Icons.mic_rounded,
                      color: Colors.white,
                      size: 34,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                _isListening ? 'Listening...' : 'Tap to speak',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: _isListening ? visuals.accent : c.mutedForeground,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        AppInput(
          controller: _transcriptController,
          label: 'Recognized text',
          maxLines: 2,
          readOnly: true,
        ),
        if (_error != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            _error!,
            style: theme.textTheme.bodySmall?.copyWith(color: c.error),
          ),
        ],
      ],
    );
  }
}
