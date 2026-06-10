import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:just_audio/just_audio.dart';
import '../../../../../core/network/media_url.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/theme/widgets/widgets.dart';
import '../../../domain/lesson_models.dart';
import 'content_shared.dart';

/// Âm thanh — bài học nghe. UI: ảnh cover lớn (nếu có), tiêu đề + người nói,
/// thanh tua + nút play to, nút tốc độ, gập/mở transcript, danh sách segment
/// để học viên tua tới từng câu.
class AudioContentWidget extends StatefulWidget {
  const AudioContentWidget({super.key, required this.content});

  final LessonContent content;

  @override
  State<AudioContentWidget> createState() => _AudioContentWidgetState();
}

class _AudioContentWidgetState extends State<AudioContentWidget> {
  static const _speedPresets = [0.75, 1.0, 1.25, 1.5];
  final _player = AudioPlayer();

  StreamSubscription<PlayerState>? _stateSub;
  StreamSubscription<Duration>? _positionSub;
  StreamSubscription<Duration?>? _durationSub;

  bool _isPlaying = false;
  bool _isLoading = true;
  bool _hasError = false;
  bool _transcriptOpen = false;
  int _speedIndex = 1;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  bool _seeking = false;
  double _seekPosition = 0;

  AudioContentPayload? get _payload => widget.content.audioPayload;

  @override
  void initState() {
    super.initState();
    _stateSub = _player.playerStateStream.listen(_onState);
    _positionSub = _player.positionStream.listen((p) {
      if (mounted && !_seeking) setState(() => _position = p);
    });
    _durationSub = _player.durationStream.listen((d) {
      if (mounted && d != null) setState(() => _duration = d);
    });
    final fallback = _payload?.durationSeconds;
    if (fallback != null) {
      _duration = Duration(seconds: fallback);
    }
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    final url = _payload?.url ?? '';
    if (url.isEmpty) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
      return;
    }
    try {
      await _player.setUrl(resolveMediaUrl(url));
      if (mounted) setState(() => _isLoading = false);
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = true;
        });
      }
    }
  }

  void _onState(PlayerState state) {
    if (!mounted) return;
    final playing =
        state.playing && state.processingState != ProcessingState.completed;
    if (_isPlaying != playing) setState(() => _isPlaying = playing);
    if (state.processingState == ProcessingState.completed) {
      unawaited(_player.seek(Duration.zero));
      unawaited(_player.pause());
    }
  }

  @override
  void dispose() {
    _stateSub?.cancel();
    _positionSub?.cancel();
    _durationSub?.cancel();
    _player.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_isLoading || _hasError) return;
    if (_isPlaying) {
      await _player.pause();
      return;
    }
    if (_player.processingState == ProcessingState.completed) {
      await _player.seek(Duration.zero);
    }
    await _player.play();
  }

  Future<void> _cycleSpeed() async {
    final next = (_speedIndex + 1) % _speedPresets.length;
    setState(() => _speedIndex = next);
    await _player.setSpeed(_speedPresets[next]);
  }

  Future<void> _seekTo(Duration target) async {
    await _player.seek(target);
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final payload = _payload;
    final title = payload?.title ?? '';
    final speaker = payload?.speaker;
    final cover = payload?.coverImageUrl;
    final transcript = payload?.transcript ?? widget.content.vietnameseText;
    final translation = payload?.translation ?? widget.content.translation;
    final segments = payload?.segments ?? const <AudioSegment>[];

    final progress = _duration.inMilliseconds == 0
        ? 0.0
        : ((_seeking ? _seekPosition : _position.inMilliseconds.toDouble()) /
                _duration.inMilliseconds)
            .clamp(0.0, 1.0);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.xl,
        AppSpacing.xl,
        AppSpacing.xxxl,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ContentTypeBadge(
            label: 'Âm thanh',
            icon: Icons.graphic_eq,
            color: c.foreground,
          ),
          const SizedBox(height: AppSpacing.lg),
          if (cover != null && cover.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: resolveMediaUrl(cover),
                  fit: BoxFit.cover,
                  errorWidget: (_, _, _) => Container(color: c.muted),
                ),
              ),
            )
          else
            _AudioWaveformPlaceholder(),
          const SizedBox(height: AppSpacing.lg),
          if (title.isNotEmpty)
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: AppTypography.titleLarge,
                fontWeight: FontWeight.w800,
                color: c.foreground,
                height: 1.2,
              ),
            ),
          if (speaker != null && speaker.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                Icon(Icons.person_outline,
                    size: 14, color: c.mutedForeground),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  speaker,
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.bodySmall,
                    color: c.mutedForeground,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          _PlayerControls(
            color: c,
            isPlaying: _isPlaying,
            isLoading: _isLoading,
            hasError: _hasError,
            progress: progress,
            position: _seeking
                ? Duration(milliseconds: _seekPosition.round())
                : _position,
            duration: _duration,
            speed: _speedPresets[_speedIndex],
            onToggle: _toggle,
            onSpeedTap: _cycleSpeed,
            onSeekStart: () => setState(() {
              _seeking = true;
              _seekPosition = _position.inMilliseconds.toDouble();
            }),
            onSeekUpdate: (value) {
              setState(() {
                _seekPosition = value * _duration.inMilliseconds;
              });
            },
            onSeekEnd: () async {
              setState(() => _seeking = false);
              await _seekTo(Duration(milliseconds: _seekPosition.round()));
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          if (segments.isNotEmpty) ...[
            _SegmentList(
              segments: segments,
              currentSeconds: _position.inSeconds,
              onTap: (s) => _seekTo(Duration(milliseconds: (s * 1000).round())),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],
          if (transcript.trim().isNotEmpty)
            _TranscriptCard(
              transcript: transcript,
              translation: translation,
              isOpen: _transcriptOpen,
              onToggle: () => setState(() => _transcriptOpen = !_transcriptOpen),
            ),
        ],
      ),
    );
  }
}

class _AudioWaveformPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      height: 120,
      decoration: BoxDecoration(
        color: c.muted,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: c.border),
      ),
      child: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var i = 0; i < 18; i++)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2.5),
                child: Container(
                  width: 4,
                  height: 12.0 +
                      32.0 * ((i % 5 == 0)
                          ? 1
                          : (i % 3 == 0)
                              ? 0.7
                              : (i % 2 == 0)
                                  ? 0.4
                                  : 0.25),
                  decoration: BoxDecoration(
                    color: c.mutedForeground.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PlayerControls extends StatelessWidget {
  const _PlayerControls({
    required this.color,
    required this.isPlaying,
    required this.isLoading,
    required this.hasError,
    required this.progress,
    required this.position,
    required this.duration,
    required this.speed,
    required this.onToggle,
    required this.onSpeedTap,
    required this.onSeekStart,
    required this.onSeekUpdate,
    required this.onSeekEnd,
  });

  final AppColors color;
  final bool isPlaying;
  final bool isLoading;
  final bool hasError;
  final double progress;
  final Duration position;
  final Duration duration;
  final double speed;
  final VoidCallback onToggle;
  final VoidCallback onSpeedTap;
  final VoidCallback onSeekStart;
  final ValueChanged<double> onSeekUpdate;
  final VoidCallback onSeekEnd;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.lg,
      ),
      decoration: BoxDecoration(
        color: color.card,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: color.border, width: 1.5),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _RoundPlayButton(
                isPlaying: isPlaying,
                isLoading: isLoading,
                hasError: hasError,
                onTap: onToggle,
                color: color,
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppSlider(
                      value: progress,
                      onChangeStart: hasError
                          ? null
                          : (_) => onSeekStart(),
                      onChanged: hasError ? null : onSeekUpdate,
                      onChangeEnd: hasError
                          ? null
                          : (_) => onSeekEnd(),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          formatDuration(position),
                          style: GoogleFonts.robotoMono(
                            fontSize: AppTypography.caption,
                            fontWeight: FontWeight.w600,
                            color: color.foreground,
                          ),
                        ),
                        Text(
                          formatDuration(duration),
                          style: GoogleFonts.robotoMono(
                            fontSize: AppTypography.caption,
                            color: color.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Align(
            alignment: Alignment.centerLeft,
            child: AppChip(
              label: '${speed}x',
              onTap: hasError ? null : onSpeedTap,
            ),
          ),
        ],
      ),
    );
  }
}

class _RoundPlayButton extends StatelessWidget {
  const _RoundPlayButton({
    required this.isPlaying,
    required this.isLoading,
    required this.hasError,
    required this.onTap,
    required this.color,
  });

  final bool isPlaying;
  final bool isLoading;
  final bool hasError;
  final VoidCallback onTap;
  final AppColors color;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: hasError ? color.muted : color.primary,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: hasError || isLoading ? null : onTap,
        child: SizedBox(
          width: 64,
          height: 64,
          child: isLoading
              ? const Padding(
                  padding: EdgeInsets.all(20),
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Colors.white,
                  ),
                )
              : Icon(
                  hasError
                      ? Icons.error_outline
                      : isPlaying
                          ? Icons.pause_rounded
                          : Icons.play_arrow_rounded,
                  size: 32,
                  color: hasError ? color.mutedForeground : color.primaryForeground,
                ),
        ),
      ),
    );
  }
}

class _SegmentList extends StatelessWidget {
  const _SegmentList({
    required this.segments,
    required this.currentSeconds,
    required this.onTap,
  });

  final List<AudioSegment> segments;
  final int currentSeconds;
  final ValueChanged<double> onTap;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Theo dõi từng câu',
          style: GoogleFonts.inter(
            fontSize: AppTypography.caption,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
            color: c.mutedForeground,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        for (var i = 0; i < segments.length; i++)
          _SegmentRow(
            segment: segments[i],
            isActive: _isActive(segments, i, currentSeconds.toDouble()),
            onTap: () => onTap(segments[i].startSeconds),
          ),
      ],
    );
  }

  bool _isActive(List<AudioSegment> list, int index, double now) {
    final start = list[index].startSeconds;
    final end = index + 1 < list.length
        ? list[index + 1].startSeconds
        : double.infinity;
    return now >= start && now < end;
  }
}

class _SegmentRow extends StatelessWidget {
  const _SegmentRow({
    required this.segment,
    required this.isActive,
    required this.onTap,
  });

  final AudioSegment segment;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: isActive ? c.primary.withValues(alpha: 0.10) : c.card,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.md),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: isActive ? c.primary.withValues(alpha: 0.4) : c.border,
                width: 1,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isActive ? c.primary : c.muted,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Text(
                    formatDurationSeconds(segment.startSeconds),
                    style: GoogleFonts.robotoMono(
                      fontSize: AppTypography.caption,
                      fontWeight: FontWeight.w700,
                      color: isActive ? c.primaryForeground : c.mutedForeground,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        segment.vi,
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.bodyMedium,
                          fontWeight: FontWeight.w500,
                          color: c.foreground,
                          height: 1.4,
                        ),
                      ),
                      if (segment.en != null &&
                          segment.en!.trim().isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          segment.en!,
                          style: GoogleFonts.inter(
                            fontSize: AppTypography.bodySmall,
                            color: c.mutedForeground,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TranscriptCard extends StatelessWidget {
  const _TranscriptCard({
    required this.transcript,
    required this.translation,
    required this.isOpen,
    required this.onToggle,
  });

  final String transcript;
  final String? translation;
  final bool isOpen;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: c.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            onTap: onToggle,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Row(
                children: [
                  Icon(Icons.text_snippet_outlined,
                      size: 18, color: c.foreground),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Lời thoại đầy đủ',
                      style: GoogleFonts.inter(
                        fontSize: AppTypography.bodyMedium,
                        fontWeight: FontWeight.w700,
                        color: c.foreground,
                      ),
                    ),
                  ),
                  Icon(
                    isOpen ? Icons.expand_less : Icons.expand_more,
                    color: c.mutedForeground,
                  ),
                ],
              ),
            ),
          ),
          if (isOpen)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    transcript,
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.bodyMedium,
                      color: c.foreground,
                      height: 1.55,
                    ),
                  ),
                  if (translation != null &&
                      translation!.trim().isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.md),
                    Container(height: 1, color: c.border),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      translation!,
                      style: GoogleFonts.inter(
                        fontSize: AppTypography.bodySmall,
                        color: c.mutedForeground,
                        fontStyle: FontStyle.italic,
                        height: 1.5,
                      ),
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}
