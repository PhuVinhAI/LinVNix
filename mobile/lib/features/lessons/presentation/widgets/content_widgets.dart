import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../l10n/app_localizations.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:just_audio/just_audio.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/network/media_url.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../domain/lesson_models.dart';
import 'dialogue_color.dart';

class TextContentWidget extends StatelessWidget {
  const TextContentWidget({super.key, required this.content});
  final LessonContent content;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (content.translation != null)
            _ContentTranslation(text: content.translation!, topSpacing: 0),
          SizedBox(height: content.translation != null ? 8 : 0),
          Text(
            content.vietnameseText,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodyLarge,
              color: c.mutedForeground,
              height: 1.5,
            ),
          ),
          if (content.phonetic != null) ...[
            const SizedBox(height: 4),
            Text(
              content.phonetic!,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: c.mutedForeground,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
          if (content.notes != null) ...[
            const SizedBox(height: 16),
            Text(
              content.notes!,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: c.mutedForeground,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class AudioContentWidget extends StatefulWidget {
  const AudioContentWidget({super.key, required this.content});
  final LessonContent content;

  @override
  State<AudioContentWidget> createState() => _AudioContentWidgetState();
}

class _AudioContentWidgetState extends State<AudioContentWidget> {
  static const _speedPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  int _speedIndex = 2;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.content.translation != null)
            _ContentTranslation(text: widget.content.translation!, topSpacing: 0),
          SizedBox(height: widget.content.translation != null ? 8 : 0),
          Text(
            widget.content.vietnameseText,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodyLarge,
              color: c.mutedForeground,
              height: 1.5,
            ),
          ),
          if (widget.content.phonetic != null) ...[
            const SizedBox(height: 4),
            Text(
              widget.content.phonetic!,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: c.mutedForeground,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
          const SizedBox(height: 24),
          if (widget.content.audioUrl != null) ...[
            AppCard(
              variant: AppCardVariant.muted,
              padding: const EdgeInsets.all(AppSpacing.lg),
              borderRadius: AppRadius.lg,
              child: Opacity(
                opacity: 0.5,
                child: Row(
                  children: [
                    IconButton(
                      onPressed: null,
                      icon: const Icon(Icons.play_arrow),
                      iconSize: 32,
                    ),
                    Expanded(
                      child: AppSlider(
                        value: 0,
                        onChanged: null,
                      ),
                    ),
                    const Text('0:00'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerLeft,
              child: AppChip(
                label: '${_speedPresets[_speedIndex]}x',
                onTap: () {
                  setState(() {
                    _speedIndex = (_speedIndex + 1) % _speedPresets.length;
                  });
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class ImageContentWidget extends StatelessWidget {
  const ImageContentWidget({super.key, required this.content});
  final LessonContent content;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (content.translation != null)
            _ContentTranslation(text: content.translation!, topSpacing: 0),
          SizedBox(height: content.translation != null ? 8 : 0),
          if (content.imageUrl != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: CachedNetworkImage(
                imageUrl: resolveMediaUrl(content.imageUrl!),
                placeholder: (_, _) => Shimmer.fromColors(
                  baseColor: c.muted,
                  highlightColor: c.card,
                  child: Container(
                    height: 200,
                    width: double.infinity,
                    color: c.card,
                  ),
                ),
                errorWidget: (_, _, _) => AppCard(
                  variant: AppCardVariant.muted,
                  borderRadius: AppRadius.lg,
                  child: SizedBox(
                    height: 200,
                    width: double.infinity,
                    child: Icon(
                      Icons.broken_image,
                      size: 48,
                      color: c.mutedForeground,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          Text(
            content.vietnameseText,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodyLarge,
              color: c.mutedForeground,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class VideoContentWidget extends StatefulWidget {
  const VideoContentWidget({super.key, required this.content});
  final LessonContent content;

  @override
  State<VideoContentWidget> createState() => _VideoContentWidgetState();
}

class _VideoContentWidgetState extends State<VideoContentWidget> {
  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.content.translation != null)
            _ContentTranslation(
              text: widget.content.translation!,
              topSpacing: 0,
            ),
          SizedBox(height: widget.content.translation != null ? 8 : 0),
          if (widget.content.videoUrl != null) ...[
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: const Center(
                child: Icon(Icons.play_circle_fill,
                    size: 64, color: Colors.white70),
              ),
            ),
            const SizedBox(height: 16),
          ],
          Text(
            widget.content.vietnameseText,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodyLarge,
              color: c.mutedForeground,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class DialogueContentWidget extends StatelessWidget {
  const DialogueContentWidget({super.key, required this.content});
  final LessonContent content;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final dialogue = content.dialogueData;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.chat_bubble_outline, size: 20, color: c.primary),
              const SizedBox(width: 8),
              Text(
                S.of(context).dialogueTitle,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.titleMedium,
                  fontWeight: FontWeight.w700,
                  color: c.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (dialogue == null || dialogue.characters.isEmpty)
            _EmptyDialoguePlaceholder()
          else
            ..._buildBubbles(dialogue),
          if (content.audioUrl != null) ...[
            const SizedBox(height: 16),
            _DialogueAudioCard(audioUrl: content.audioUrl!),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildBubbles(LessonDialogueData dialogue) {
    final byId = {for (final c in dialogue.characters) c.id: c};
    final widgets = <Widget>[];
    DialogueCharacter? previous;
    for (final line in dialogue.lines) {
      final character = byId[line.characterId] ?? dialogue.characters.first;
      final showHeader = previous?.id != character.id;
      widgets.add(_ChatBubble(
        character: character,
        line: line,
        showHeader: showHeader,
      ));
      previous = character;
    }
    return widgets;
  }
}

class _EmptyDialoguePlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: c.muted,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: c.border),
      ),
      child: Text(
        'Hội thoại chưa được cấu hình.',
        style: GoogleFonts.inter(
          fontSize: AppTypography.bodyMedium,
          color: c.mutedForeground,
        ),
      ),
    );
  }
}

class _DialogueAudioCard extends StatefulWidget {
  const _DialogueAudioCard({required this.audioUrl});

  final String audioUrl;

  @override
  State<_DialogueAudioCard> createState() => _DialogueAudioCardState();
}

class _DialogueAudioCardState extends State<_DialogueAudioCard> {
  final _player = AudioPlayer();
  StreamSubscription<PlayerState>? _stateSub;
  bool _isPlaying = false;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _stateSub = _player.playerStateStream.listen(_handleState);
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    try {
      await _player.setUrl(resolveMediaUrl(widget.audioUrl));
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

  void _handleState(PlayerState state) {
    if (!mounted) return;
    final playing =
        state.playing && state.processingState != ProcessingState.completed;
    if (_isPlaying != playing) {
      setState(() => _isPlaying = playing);
    }
    if (state.processingState == ProcessingState.completed) {
      unawaited(_player.seek(Duration.zero));
      unawaited(_player.pause());
    }
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

  @override
  void dispose() {
    _stateSub?.cancel();
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return AppCard(
      variant: AppCardVariant.muted,
      padding: const EdgeInsets.all(AppSpacing.md),
      borderRadius: AppRadius.md,
      child: Row(
        children: [
          Icon(Icons.headphones, color: c.foreground),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              _hasError ? S.of(context).audioUnavailable : S.of(context).listenToDialogue,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: _hasError ? c.error : c.foreground,
              ),
            ),
          ),
          IconButton(
            onPressed: _isLoading || _hasError ? null : _toggle,
            icon: _isLoading
                ? SizedBox.square(
                    dimension: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: c.foreground,
                    ),
                  )
                : Icon(
                    _isPlaying ? Icons.pause : Icons.play_arrow,
                    color: c.foreground,
                  ),
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({
    required this.character,
    required this.line,
    required this.showHeader,
  });

  final DialogueCharacter character;
  final DialogueLineEntry line;
  final bool showHeader;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final isLeft = character.side == DialogueSide.left;
    final color = colorForCharacter(character.id);

    final avatar = Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: color.avatarBackground,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        initialFor(character.name),
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: color.avatarForeground,
        ),
      ),
    );

    final bubble = Column(
      crossAxisAlignment:
          isLeft ? CrossAxisAlignment.start : CrossAxisAlignment.end,
      children: [
        if (showHeader && character.name.trim().isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 4, left: 2, right: 2),
            child: Text(
              character.name,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodySmall,
                fontWeight: FontWeight.w700,
                color: color.foreground,
              ),
            ),
          ),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          decoration: BoxDecoration(
            color: color.background,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(AppRadius.lg),
              topRight: const Radius.circular(AppRadius.lg),
              bottomLeft: isLeft
                  ? const Radius.circular(2)
                  : const Radius.circular(AppRadius.lg),
              bottomRight: isLeft
                  ? const Radius.circular(AppRadius.lg)
                  : const Radius.circular(2),
            ),
            border: Border.all(color: color.border, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                line.vi,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodyLarge,
                  fontWeight: FontWeight.w500,
                  height: 1.5,
                  color: c.foreground,
                ),
              ),
              if (line.en != null && line.en!.trim().isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  line.en!,
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.bodySmall,
                    color: c.mutedForeground,
                    height: 1.4,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );

    final maxBubbleWidth = MediaQuery.of(context).size.width * 0.72;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            isLeft ? MainAxisAlignment.start : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (isLeft) ...[
            avatar,
            const SizedBox(width: 8),
          ],
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxBubbleWidth),
            child: bubble,
          ),
          if (!isLeft) ...[
            const SizedBox(width: 8),
            avatar,
          ],
        ],
      ),
    );
  }
}

/// English translation — displayed as the primary/large text.
class _ContentTranslation extends StatelessWidget {
  const _ContentTranslation({
    required this.text,
    this.topSpacing = 12,
  });

  final String text;
  final double topSpacing;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Padding(
      padding: EdgeInsets.only(top: topSpacing),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: AppTypography.headlineSmall,
          fontWeight: FontWeight.w600,
          color: c.foreground,
          height: 1.6,
        ),
      ),
    );
  }
}
