import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../../../../core/network/media_url.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/theme/widgets/widgets.dart';
import '../../../domain/lesson_models.dart';
import 'content_shared.dart';

/// Video — player nguyên gốc tỉ lệ chuẩn + chapter pills + transcript gập/mở.
/// Self-hosted: nhúng video_player. YouTube: hiện link mở (mobile chưa có
/// trình phát YT — học viên bấm để mở app/web).
class VideoContentWidget extends StatefulWidget {
  const VideoContentWidget({super.key, required this.content});

  final LessonContent content;

  @override
  State<VideoContentWidget> createState() => _VideoContentWidgetState();
}

class _VideoContentWidgetState extends State<VideoContentWidget> {
  VideoPlayerController? _controller;
  bool _initialized = false;
  bool _hasError = false;
  bool _transcriptOpen = false;
  bool _showControls = true;
  Timer? _hideTimer;

  VideoContentPayload? get _payload => widget.content.videoPayload;

  @override
  void initState() {
    super.initState();
    final payload = _payload;
    if (payload != null && !payload.isYoutube && payload.url.isNotEmpty) {
      _initSelfHosted(payload.url);
    }
  }

  Future<void> _initSelfHosted(String url) async {
    final controller = VideoPlayerController.networkUrl(
      Uri.parse(resolveMediaUrl(url)),
    );
    try {
      await controller.initialize();
      if (!mounted) {
        controller.dispose();
        return;
      }
      setState(() {
        _controller = controller;
        _initialized = true;
      });
      controller.addListener(_onTick);
    } catch (_) {
      if (mounted) setState(() => _hasError = true);
    }
  }

  void _onTick() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _hideTimer?.cancel();
    _controller?.removeListener(_onTick);
    _controller?.dispose();
    super.dispose();
  }

  void _togglePlay() {
    final controller = _controller;
    if (controller == null) return;
    if (controller.value.isPlaying) {
      controller.pause();
      _showControls = true;
      _hideTimer?.cancel();
    } else {
      controller.play();
      _scheduleHideControls();
    }
    setState(() {});
  }

  void _scheduleHideControls() {
    _hideTimer?.cancel();
    _hideTimer = Timer(const Duration(seconds: 2), () {
      if (mounted && (_controller?.value.isPlaying ?? false)) {
        setState(() => _showControls = false);
      }
    });
  }

  Future<void> _seek(Duration target) async {
    final controller = _controller;
    if (controller == null) return;
    await controller.seekTo(target);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final payload = _payload;
    final title = payload?.title ?? '';
    final transcript = payload?.transcript ?? widget.content.vietnameseText;
    final translation = payload?.translation ?? widget.content.translation;
    final chapters = payload?.chapters ?? const <VideoChapter>[];

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
            label: 'Video',
            icon: Icons.play_circle_outline,
            color: c.foreground,
          ),
          const SizedBox(height: AppSpacing.lg),
          _VideoFrame(
            payload: payload,
            controller: _controller,
            initialized: _initialized,
            hasError: _hasError,
            showControls: _showControls,
            onTapVideo: () {
              if (_controller != null) {
                setState(() => _showControls = !_showControls);
                if (_showControls) _scheduleHideControls();
              }
            },
            onTogglePlay: _togglePlay,
            onSeek: _seek,
          ),
          if (title.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: AppTypography.titleLarge,
                fontWeight: FontWeight.w800,
                color: c.foreground,
                height: 1.2,
              ),
            ),
          ],
          if (chapters.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            _ChapterPills(
              chapters: chapters,
              currentSeconds:
                  (_controller?.value.position.inSeconds ?? 0).toDouble(),
              onTap: _controller == null
                  ? null
                  : (s) => _seek(Duration(milliseconds: (s * 1000).round())),
            ),
          ],
          if (transcript.trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xl),
            _TranscriptCard(
              transcript: transcript,
              translation: translation,
              isOpen: _transcriptOpen,
              onToggle: () => setState(() => _transcriptOpen = !_transcriptOpen),
            ),
          ],
        ],
      ),
    );
  }
}

class _VideoFrame extends StatelessWidget {
  const _VideoFrame({
    required this.payload,
    required this.controller,
    required this.initialized,
    required this.hasError,
    required this.showControls,
    required this.onTapVideo,
    required this.onTogglePlay,
    required this.onSeek,
  });

  final VideoContentPayload? payload;
  final VideoPlayerController? controller;
  final bool initialized;
  final bool hasError;
  final bool showControls;
  final VoidCallback onTapVideo;
  final VoidCallback onTogglePlay;
  final ValueChanged<Duration> onSeek;

  @override
  Widget build(BuildContext context) {
    final ratio = payload?.ratio ?? 16 / 9;

    Widget child;
    if (payload?.isYoutube ?? false) {
      child = _YoutubeFallback(payload: payload!);
    } else if (hasError) {
      child = _VideoError();
    } else if (!initialized || controller == null) {
      child = _VideoLoading(payload: payload);
    } else {
      child = GestureDetector(
        onTap: onTapVideo,
        child: Stack(
          fit: StackFit.expand,
          children: [
            VideoPlayer(controller!),
            if (showControls)
              Container(
                color: Colors.black.withValues(alpha: 0.35),
                child: Center(
                  child: Material(
                    color: Colors.white.withValues(alpha: 0.92),
                    shape: const CircleBorder(),
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: onTogglePlay,
                      child: SizedBox(
                        width: 64,
                        height: 64,
                        child: Icon(
                          controller!.value.isPlaying
                              ? Icons.pause_rounded
                              : Icons.play_arrow_rounded,
                          color: Colors.black,
                          size: 36,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: AnimatedOpacity(
                opacity: showControls ? 1 : 0,
                duration: const Duration(milliseconds: 200),
                child: _VideoBottomBar(
                  controller: controller!,
                  onSeek: onSeek,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        color: Colors.black,
        child: AspectRatio(
          aspectRatio: ratio,
          child: child,
        ),
      ),
    );
  }
}

class _VideoBottomBar extends StatelessWidget {
  const _VideoBottomBar({
    required this.controller,
    required this.onSeek,
  });

  final VideoPlayerController controller;
  final ValueChanged<Duration> onSeek;

  @override
  Widget build(BuildContext context) {
    final value = controller.value;
    final position = value.position;
    final duration = value.duration;
    final progress = duration.inMilliseconds == 0
        ? 0.0
        : position.inMilliseconds / duration.inMilliseconds;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Colors.black.withValues(alpha: 0.6),
          ],
        ),
      ),
      child: Column(
        children: [
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: Colors.white,
              inactiveTrackColor: Colors.white.withValues(alpha: 0.3),
              thumbColor: Colors.white,
              overlayColor: Colors.white.withValues(alpha: 0.16),
              trackHeight: 3,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
            ),
            child: Slider(
              value: progress.clamp(0.0, 1.0),
              onChanged: (v) {
                onSeek(Duration(
                  milliseconds: (v * duration.inMilliseconds).round(),
                ));
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                formatDuration(position),
                style: GoogleFonts.robotoMono(
                  fontSize: AppTypography.caption,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              Text(
                formatDuration(duration),
                style: GoogleFonts.robotoMono(
                  fontSize: AppTypography.caption,
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _VideoLoading extends StatelessWidget {
  const _VideoLoading({required this.payload});
  final VideoContentPayload? payload;

  @override
  Widget build(BuildContext context) {
    final thumb = payload?.thumbnailUrl;
    return Stack(
      fit: StackFit.expand,
      children: [
        if (thumb != null && thumb.isNotEmpty)
          CachedNetworkImage(
            imageUrl: resolveMediaUrl(thumb),
            fit: BoxFit.cover,
            errorWidget: (_, _, _) => Container(color: Colors.black),
          )
        else
          Container(color: Colors.black),
        const Center(
          child: SizedBox.square(
            dimension: 32,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}

class _VideoError extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.white70),
            SizedBox(height: 8),
            Text(
              'Không thể phát video',
              style: TextStyle(color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }
}

class _YoutubeFallback extends StatelessWidget {
  const _YoutubeFallback({required this.payload});
  final VideoContentPayload payload;

  @override
  Widget build(BuildContext context) {
    final thumb = payload.thumbnailUrl;
    return Stack(
      fit: StackFit.expand,
      children: [
        if (thumb != null && thumb.isNotEmpty)
          CachedNetworkImage(
            imageUrl: resolveMediaUrl(thumb),
            fit: BoxFit.cover,
            errorWidget: (_, _, _) => Container(color: Colors.black),
          )
        else
          Container(color: Colors.black),
        Container(color: Colors.black.withValues(alpha: 0.45)),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: const Icon(
                  Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 40,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Phát qua YouTube',
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodyMedium,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ChapterPills extends StatelessWidget {
  const _ChapterPills({
    required this.chapters,
    required this.currentSeconds,
    required this.onTap,
  });

  final List<VideoChapter> chapters;
  final double currentSeconds;
  final ValueChanged<double>? onTap;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Chương',
          style: GoogleFonts.inter(
            fontSize: AppTypography.caption,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
            color: c.mutedForeground,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          height: 40,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: chapters.length,
            separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, i) {
              final ch = chapters[i];
              final next = i + 1 < chapters.length
                  ? chapters[i + 1].startSeconds
                  : double.infinity;
              final active =
                  currentSeconds >= ch.startSeconds && currentSeconds < next;
              return AppChip(
                label:
                    '${formatDurationSeconds(ch.startSeconds)}  ·  ${ch.title}',
                onTap: onTap == null ? null : () => onTap!(ch.startSeconds),
                isSelected: active,
              );
            },
          ),
        ),
      ],
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
                  Icon(Icons.subtitles_outlined,
                      size: 18, color: c.foreground),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Phụ đề / Lời thoại',
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
