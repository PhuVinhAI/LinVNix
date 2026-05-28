import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/widgets/widgets.dart';
import '../../../../core/theme/app_theme.dart';
import '../../application/image_discovery_notifier.dart';
import '../widgets/vocabulary_card.dart';

class ImageDiscoveryScreen extends ConsumerStatefulWidget {
  const ImageDiscoveryScreen({super.key});

  @override
  ConsumerState<ImageDiscoveryScreen> createState() =>
      _ImageDiscoveryScreenState();
}

class _ImageDiscoveryScreenState extends ConsumerState<ImageDiscoveryScreen> {
  final _inputController = TextEditingController();
  final _focusNode = FocusNode();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _inputController.dispose();
    _focusNode.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _pick(ImageSource source) async {
    await ref.read(imageDiscoveryProvider.notifier).pickImage(source);
  }

  Future<void> _send([String? prompt]) async {
    final text = (prompt ?? _inputController.text).trim();
    if (text.isEmpty) return;
    if (!ref.read(imageDiscoveryProvider).hasImage) return;
    if (prompt == null) _inputController.clear();
    await ref.read(imageDiscoveryProvider.notifier).sendPrompt(text);
    _scrollToBottom();
  }

  void _resetSession() {
    _inputController.clear();
    _focusNode.unfocus();
    ref.read(imageDiscoveryProvider.notifier).reset();
    if (_scrollController.hasClients) {
      _scrollController.jumpTo(0);
    }
  }

  bool _canReset(ImageDiscoveryState state) =>
      state.hasImage || state.messages.isNotEmpty || state.error != null;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(imageDiscoveryProvider);
    final c = AppTheme.colors(context);

    ref.listen(imageDiscoveryProvider, (previous, next) {
      if (previous?.messages.length != next.messages.length ||
          previous?.isLoading != next.isLoading) {
        _scrollToBottom();
      }
      if (next.error != null && next.error != previous?.error) {
        final failed = next.failedOutboundContent;
        if (failed != null && failed.isNotEmpty) {
          _inputController.text = failed;
          _inputController.selection =
              TextSelection.collapsed(offset: failed.length);
          _focusNode.requestFocus();
        }
        AppToast.show(
          context,
          message: next.error!,
          type: AppToastType.error,
        );
      }
    });

    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        title: const Text('Image Discovery'),
        actions: [
          if (_canReset(state))
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Reset session',
              onPressed: _resetSession,
            ),
        ],
      ),
      body: SafeArea(
        top: false,
        bottom: false,
        child: Column(
          children: [
            _ImageActions(
              isLoading: state.isLoading,
              onCamera: () => _pick(ImageSource.camera),
              onGallery: () => _pick(ImageSource.gallery),
              canAddImages: state.canAddImages,
            ),
            if (state.images.isNotEmpty)
              _ImageGrid(
                images: state.images,
                onRemove: (id) =>
                    ref.read(imageDiscoveryProvider.notifier).removeImage(id),
              )
            else
              Divider(color: c.border, height: 1),
            Expanded(
              child: _MessageList(
                state: state,
                scrollController: _scrollController,
              ),
            ),
            if (state.hasImage)
              _QuickActions(
                enabled: !state.isLoading,
                onPrompt: _send,
              ),
            _ComposeBar(
              controller: _inputController,
              focusNode: _focusNode,
              isLoading: state.isLoading,
              hasImage: state.hasImage,
              onSend: () => unawaited(_send()),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageActions extends StatelessWidget {
  const _ImageActions({
    required this.isLoading,
    required this.onCamera,
    required this.onGallery,
    required this.canAddImages,
  });

  final bool isLoading;
  final VoidCallback onCamera;
  final VoidCallback onGallery;
  final bool canAddImages;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          Expanded(
            child: AppButton(
              variant: AppButtonVariant.secondary,
              icon: const Icon(Icons.camera_alt_outlined),
              label: 'Take Photo',
              onPressed: isLoading || !canAddImages ? null : onCamera,
              padding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: AppButton(
              variant: AppButtonVariant.secondary,
              icon: const Icon(Icons.image_outlined),
              label: 'Upload',
              onPressed: isLoading || !canAddImages ? null : onGallery,
              padding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ],
      ),
    );
  }
}

class _ImageGrid extends StatelessWidget {
  const _ImageGrid({required this.images, required this.onRemove});

  static const _thumbnailSize = 96.0;

  final List<ImageDiscoveryImage> images;
  final ValueChanged<String> onRemove;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: SizedBox(
        height: _thumbnailSize,
        child: ListView.separated(
          key: const ValueKey('image_discovery_image_grid'),
          scrollDirection: Axis.horizontal,
          itemCount: images.length,
          separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
          itemBuilder: (context, index) {
            final image = images[index];

            return SizedBox(
              width: _thumbnailSize,
              height: _thumbnailSize,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.md),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.memory(image.bytes, fit: BoxFit.cover),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: c.card.withValues(alpha: 0.88),
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: Icon(Icons.close, color: c.foreground),
                          tooltip: 'Remove image',
                          iconSize: 18,
                          constraints: const BoxConstraints.tightFor(
                            width: 32,
                            height: 32,
                          ),
                          padding: EdgeInsets.zero,
                          onPressed: () => onRemove(image.id),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _MessageList extends StatelessWidget {
  const _MessageList({required this.state, required this.scrollController});

  final ImageDiscoveryState state;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    if (state.messages.isEmpty && !state.isLoading) {
      return const _EmptyImageDiscoveryState();
    }

    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      itemCount: state.messages.length + (state.isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.messages.length && state.isLoading) {
          return const _LoadingMessage();
        }

        return _MessageBubble(message: state.messages[index]);
      },
    );
  }
}

class _EmptyImageDiscoveryState extends StatelessWidget {
  const _EmptyImageDiscoveryState();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Center(
      child: Icon(
        Icons.photo_camera_outlined,
        size: 72,
        color: c.mutedForeground.withValues(alpha: 0.6),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ImageDiscoveryMessage message;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final isUser = message.isUser;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: isUser
            ? BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78)
            : const BoxConstraints(),
        width: isUser ? null : double.infinity,
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: isUser
            ? const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              )
            : EdgeInsets.zero,
        decoration: isUser
            ? BoxDecoration(
                color: c.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              )
            : null,
        child: isUser
            ? Text(
                message.text,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodyMedium,
                  color: c.foreground,
                ),
              )
            : _AssistantMessage(message: message),
      ),
    );
  }
}

class _AssistantMessage extends ConsumerWidget {
  const _AssistantMessage({required this.message});

  final ImageDiscoveryMessage message;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MarkdownBody(data: message.text, selectable: true),
        if (message.vocabularies.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          ...message.vocabularies.map(
            (vocabulary) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: VocabularyCard(
                vocabulary: vocabulary,
                onAdd: (vocabulary) => ref
                    .read(imageDiscoveryProvider.notifier)
                    .addVocabularyFromAnalysis(vocabulary),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _LoadingMessage extends StatelessWidget {
  const _LoadingMessage();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        children: [
          const AppSpinner(size: 18),
          const SizedBox(width: AppSpacing.sm),
          Text(
            'Analyzing image...',
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodySmall,
              color: c.mutedForeground,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.enabled, required this.onPrompt});

  final bool enabled;
  final Future<void> Function(String prompt) onPrompt;

  static const _actions = <({String label, String prompt})>[
    (
      label: 'Analyze image',
      prompt: 'Analyze these images and explain what they show.',
    ),
    (
      label: 'Find vocabulary',
      prompt: 'Find useful Vietnamese vocabulary in these images.',
    ),
    (
      label: 'Translate text',
      prompt: 'Translate any visible Vietnamese text in these images.',
    ),
    (
      label: 'Explain content',
      prompt: 'Explain the context and meaning of these images.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        0,
      ),
      child: Wrap(
        spacing: AppSpacing.sm,
        runSpacing: AppSpacing.sm,
        children: _actions
            .map(
              (action) => AppChip(
                label: action.label,
                onTap: enabled
                    ? () => unawaited(onPrompt(action.prompt))
                    : null,
              ),
            )
            .toList(),
      ),
    );
  }
}

class _ComposeBar extends StatelessWidget {
  const _ComposeBar({
    required this.controller,
    required this.focusNode,
    required this.isLoading,
    required this.hasImage,
    required this.onSend,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isLoading;
  final bool hasImage;
  final VoidCallback onSend;

  bool get canSend => hasImage && !isLoading;

  String get hintText {
    if (isLoading) return 'Analyzing...';
    if (!hasImage) return 'Add at least one photo to send a message';
    return 'Ask about the image...';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        MediaQuery.viewInsetsOf(context).bottom + AppSpacing.sm,
      ),
      child: AppChatComposeField(
        controller: controller,
        focusNode: focusNode,
        hintText: hintText,
        enabled: !isLoading,
        onSend: canSend ? onSend : null,
        onSubmitted: canSend ? (_) => onSend() : null,
      ),
    );
  }
}
