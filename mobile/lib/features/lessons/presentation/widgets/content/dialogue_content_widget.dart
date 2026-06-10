import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:just_audio/just_audio.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../../../core/network/media_url.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/theme/widgets/widgets.dart';
import '../../../domain/lesson_models.dart';
import '../dialogue_color.dart';

/// Hội thoại — render dạng chat bong bóng hai phía. Giữ nguyên hành vi cũ
/// nhưng đặt cùng thư mục với 4 widget mới để tổ chức gọn.
class DialogueContentWidget extends StatelessWidget {
  const DialogueContentWidget({super.key, required this.content});
  final LessonContent content;

  @override
  Widget build(BuildContext context) {
    final dialogue = content.dialogueData;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (dialogue == null || dialogue.characters.isEmpty)
            _EmptyDialoguePlaceholder()
          else
            ..._buildBubbles(dialogue),
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
  // ignore: unused_element
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
    if (_isPlaying != playing) setState(() => _isPlaying = playing);
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

    final avatar = AppAvatar(
      radius: 20,
      backgroundColor: c.muted,
      child: Text(
        initialFor(character.name),
        style: GoogleFonts.inter(
          color: c.foreground,
          fontWeight: FontWeight.w600,
          fontSize: AppTypography.caption,
        ),
      ),
    );

    final bubbleDecoration = isLeft
        ? BoxDecoration(
            color: c.card,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: c.border, width: 1),
          )
        : BoxDecoration(
            color: c.primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: c.primary.withValues(alpha: 0.3),
              width: 1,
            ),
          );

    final column = Column(
      crossAxisAlignment:
          isLeft ? CrossAxisAlignment.start : CrossAxisAlignment.end,
      children: [
        if (showHeader && character.name.trim().isNotEmpty) ...[
          Text(
            character.name,
            style: GoogleFonts.inter(
              fontSize: AppTypography.caption,
              fontWeight: FontWeight.w600,
              color: c.mutedForeground,
            ),
          ),
          const SizedBox(height: 2),
        ],
        Container(
          decoration: bubbleDecoration,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                line.vi,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodyMedium,
                  color: c.foreground,
                  height: 1.4,
                ),
              ),
              if (line.en != null && line.en!.trim().isNotEmpty) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  line.en!,
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.bodySmall,
                    color: c.mutedForeground,
                    fontStyle: FontStyle.italic,
                    height: 1.4,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isLeft) ...[
            avatar,
            const SizedBox(width: AppSpacing.sm),
            Expanded(child: column),
          ] else ...[
            Expanded(child: column),
            const SizedBox(width: AppSpacing.sm),
            avatar,
          ],
        ],
      ),
    );
  }
}
