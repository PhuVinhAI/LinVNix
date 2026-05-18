import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../application/assistant_chat_notifier.dart';
import '../../application/assistant_state_machine.dart';
import '../../data/ai_api_provider.dart';
import '../../data/conversation_model.dart';
import '../../data/screen_context_provider.dart';
import '../../domain/assistant_state.dart';
import 'conversation_drawer.dart';
import 'proposal_card.dart';

/// Full-screen chat view. Shows the complete conversation history with
/// user bubbles (right-aligned) and AI messages (full-width markdown).
/// A drawer on the left lists all conversations with rename/delete.
class AssistantFullScreen extends ConsumerStatefulWidget {
  const AssistantFullScreen({super.key});

  @override
  ConsumerState<AssistantFullScreen> createState() =>
      _AssistantFullScreenState();
}

class _AssistantFullScreenState extends ConsumerState<AssistantFullScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<ConversationMessage> _messages = [];
  bool _loadingMessages = false;
  String? _loadedConversationId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCurrentConversation();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentConversation() async {
    final notifier = ref.read(assistantChatNotifierProvider);
    final convId = notifier.conversationId;
    if (convId == null || convId == _loadedConversationId) return;

    setState(() => _loadingMessages = true);
    try {
      final api = ref.read(aiApiProvider);
      final result = await api.getConversation(convId);
      if (mounted) {
        setState(() {
          _messages = result.messages
              .where((m) => m.isUser || m.isAssistant)
              .toList();
          _loadingMessages = false;
          _loadedConversationId = convId;
        });
        _scrollToBottom();
      }
    } catch (_) {
      if (mounted) setState(() => _loadingMessages = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  Future<void> _onSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    final notifier = ref.read(assistantChatNotifierProvider);
    _controller.clear();

    // Add the user message to local list immediately for display.
    setState(() {
      _messages = [
        ..._messages,
        ConversationMessage(
          id: 'local-${DateTime.now().millisecondsSinceEpoch}',
          role: 'user',
          content: text,
        ),
      ];
    });
    _scrollToBottom();

    unawaited(notifier.sendMessage(text));
  }

  void _onConversationTap(String conversationId) {
    final notifier = ref.read(assistantChatNotifierProvider);
    notifier.openExistingConversation(conversationId);
    _loadedConversationId = null;
    _loadCurrentConversation();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final displayName = ref.watch(
      currentScreenContextProvider.select((s) => s.displayName),
    );

    final assistantState = ref.watch(assistantStateMachineProvider);

    // If state machine exits Full, pop this screen.
    ref.listen(assistantStateMachineProvider, (prev, next) {
      if (_isFullState(prev) && !_isFullState(next)) {
        Navigator.of(context).maybePop();
      }
      if (_isFullState(next)) {
        _loadCurrentConversation();
        _scrollToBottom();
      }
      if (next is AssistantFullReading && !next.streaming) {
        _loadedConversationId = null;
        _loadCurrentConversation();
      }
    });

    return PopScope<void>(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          unawaited(ref.read(assistantChatNotifierProvider).closeFull());
        }
      },
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: c.background,
        drawer: ConversationDrawer(onConversationTap: _onConversationTap),
        body: SafeArea(
          child: Column(
            children: [
              _Header(
                displayName: displayName,
                onDrawerTap: () => _scaffoldKey.currentState?.openDrawer(),
                onClose: () =>
                    ref.read(assistantChatNotifierProvider).closeFull(),
                onReset: () => ref.read(assistantChatNotifierProvider).reset(),
              ),
              Divider(color: c.border, height: 1),
              Expanded(child: _buildBody(c, assistantState)),
              _ComposeBar(
                controller: _controller,
                isBusy: _isFullBusy(assistantState),
                onSend: _onSend,
                onStop: () => ref.read(assistantChatNotifierProvider).stop(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(AppColors c, AssistantState assistantState) {
    if (_loadingMessages && _messages.isEmpty) {
      return const Center(child: AppSpinner());
    }

    final liveItemCount = _liveItemCount(assistantState);
    final visibleMessages = _messages
        .where((m) => !_isPersistedLiveAssistantMessage(m, assistantState))
        .toList();

    if (visibleMessages.isEmpty && liveItemCount == 0) {
      return Center(
        child: Text(
          'Bắt đầu cuộc trò chuyện',
          style: GoogleFonts.inter(
            fontSize: AppTypography.bodyMedium,
            color: c.mutedForeground,
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      itemCount: visibleMessages.length + liveItemCount,
      itemBuilder: (ctx, i) {
        if (i < visibleMessages.length) {
          return _MessageBubble(message: visibleMessages[i]);
        }
        return _buildLiveItem(assistantState);
      },
    );
  }

  Widget _buildLiveItem(AssistantState assistantState) {
    return switch (assistantState) {
      AssistantFullLoading(:final statusText) => _TypingIndicator(
        statusText: statusText,
      ),
      AssistantFullReading(
        :final partial,
        :final interrupted,
        :final proposals,
      ) =>
        _LiveAssistantBubble(
          partial: partial,
          interrupted: interrupted,
          proposals: proposals,
        ),
      AssistantFullError(:final message) => _InlineErrorBubble(
        message: message,
      ),
      _ => const SizedBox.shrink(),
    };
  }

  int _liveItemCount(AssistantState assistantState) {
    return switch (assistantState) {
      AssistantFullLoading() ||
      AssistantFullReading() ||
      AssistantFullError() => 1,
      _ => 0,
    };
  }

  bool _isPersistedLiveAssistantMessage(
    ConversationMessage message,
    AssistantState assistantState,
  ) {
    return assistantState is AssistantFullReading &&
        assistantState.messageId != null &&
        message.id == assistantState.messageId;
  }
}

bool _isFullState(AssistantState? state) {
  return switch (state) {
    AssistantFullCompose() ||
    AssistantFullLoading() ||
    AssistantFullReading() ||
    AssistantFullError() => true,
    _ => false,
  };
}

bool _isFullBusy(AssistantState state) {
  return switch (state) {
    AssistantFullLoading() => true,
    AssistantFullReading(:final streaming) => streaming,
    _ => false,
  };
}

class _Header extends StatelessWidget {
  const _Header({
    required this.displayName,
    required this.onDrawerTap,
    required this.onClose,
    required this.onReset,
  });

  final String displayName;
  final VoidCallback onDrawerTap;
  final VoidCallback onClose;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.sm,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.menu),
            color: c.mutedForeground,
            tooltip: 'Danh sách hội thoại',
            onPressed: onDrawerTap,
          ),
          Expanded(
            child: Text(
              'Trợ lý AI · $displayName',
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodySmall,
                fontWeight: FontWeight.w600,
                color: c.mutedForeground,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            color: c.mutedForeground,
            tooltip: 'Reset hội thoại',
            onPressed: onReset,
          ),
          IconButton(
            icon: const Icon(Icons.close),
            color: c.mutedForeground,
            tooltip: 'Đóng',
            onPressed: onClose,
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ConversationMessage message;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    if (message.isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75,
          ),
          margin: const EdgeInsets.only(bottom: AppSpacing.sm),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          decoration: BoxDecoration(
            color: c.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Text(
            message.content,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodyMedium,
              color: c.foreground,
            ),
          ),
        ),
      );
    }

    // Assistant message — full width, markdown rendered.
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (message.content.isNotEmpty)
              MarkdownBody(data: message.content, selectable: true)
            else
              Text(
                '_(không có phản hồi)_',
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodySmall,
                  color: c.mutedForeground,
                  fontStyle: FontStyle.italic,
                ),
              ),
            if (message.interrupted)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Text(
                  'Đã dừng',
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.caption,
                    color: c.mutedForeground,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator({required this.statusText});

  final String statusText;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: c.primary.withValues(alpha: 0.12),
              child: Icon(Icons.auto_awesome, size: 16, color: c.primary),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
                decoration: BoxDecoration(
                  color: c.muted.withValues(alpha: 0.45),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        statusText,
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.bodyMedium,
                          color: c.mutedForeground,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    const _TypingDots(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TypingDots extends StatefulWidget {
  const _TypingDots();

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots> {
  int _tick = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 350), (_) {
      if (mounted) setState(() => _tick = (_tick + 1) % 4);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Text(
      '.' * (_tick + 1),
      style: GoogleFonts.inter(
        fontSize: AppTypography.bodyMedium,
        color: c.mutedForeground,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class _LiveAssistantBubble extends ConsumerWidget {
  const _LiveAssistantBubble({
    required this.partial,
    required this.interrupted,
    required this.proposals,
  });

  final String partial;
  final bool interrupted;
  final List<ProposalState> proposals;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = AppTheme.colors(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            MarkdownBody(
              data: partial.isEmpty ? '_(không có phản hồi)_' : partial,
              selectable: true,
            ),
            if (interrupted)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Text(
                  'Đã dừng',
                  style: GoogleFonts.inter(
                    fontSize: AppTypography.caption,
                    color: c.mutedForeground,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            for (var i = 0; i < proposals.length; i++)
              ProposalCard(
                proposal: proposals[i],
                index: i,
                onDecline: (idx) => ref
                    .read(assistantChatNotifierProvider)
                    .dismissProposal(idx),
                onSuccess: (idx) => ref
                    .read(assistantChatNotifierProvider)
                    .updateProposal(
                      idx,
                      proposals[idx].copyWith(
                        status: ProposalCardStatus.success,
                      ),
                    ),
              ),
          ],
        ),
      ),
    );
  }
}

class _InlineErrorBubble extends ConsumerWidget {
  const _InlineErrorBubble({required this.message});

  final String message;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = AppTheme.colors(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: c.error.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: c.error.withValues(alpha: 0.24)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.error_outline, color: c.error),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    message,
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.bodyMedium,
                      color: c.foreground,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerLeft,
              child: AppButton(
                onPressed: () =>
                    ref.read(assistantChatNotifierProvider).retry(),
                label: 'Thử lại',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComposeBar extends StatelessWidget {
  const _ComposeBar({
    required this.controller,
    required this.isBusy,
    required this.onSend,
    required this.onStop,
  });

  final TextEditingController controller;
  final bool isBusy;
  final VoidCallback onSend;
  final VoidCallback onStop;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: c.border)),
        color: c.card,
      ),
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.sm,
        MediaQuery.of(context).viewInsets.bottom + AppSpacing.sm,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              maxLines: 5,
              minLines: 1,
              textCapitalization: TextCapitalization.sentences,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: c.foreground,
              ),
              decoration: InputDecoration(
                hintText: 'Nhập tin nhắn...',
                hintStyle: GoogleFonts.inter(color: c.mutedForeground),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(color: c.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(color: c.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(color: c.primary, width: 1.5),
                ),
              ),
              onSubmitted: (_) => onSend(),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          IconButton(
            icon: Icon(
              isBusy ? Icons.stop_rounded : Icons.send,
              color: c.primary,
            ),
            tooltip: isBusy ? 'Dừng' : 'Gửi',
            onPressed: isBusy ? onStop : onSend,
          ),
        ],
      ),
    );
  }
}
