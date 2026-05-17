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

/// Full-screen independent chat surface — V2.
///
/// Key behaviours:
/// - Persisted history messages from server + live streaming AI bubble
///   from [AssistantFullReading.partial] rendered inline in the same list.
/// - [AssistantFullLoading]: typing indicator (AI avatar + statusText +
///   animated dots) shown inline as a bubble, not a full-screen spinner.
/// - [AssistantFullError]: error bubble inline with "Thử lại" button.
///   Compose bar remains visible.
/// - Stop icon replaces Send during FullLoading / FullReading(streaming).
/// - Partial responses show "Đã dừng" chip when interrupted.
/// - Compose bar always ready after FullReading(done) — no "Soạn tiếp".
/// - Mid→Full mirror: conversation continues, history loads while
///   streaming response renders from state.
/// - Closing (back / close button) → Collapsed, drops conversationId.
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
  bool _loadingHistory = false;
  String? _loadedConversationId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _syncConversationHistory();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────
  // History loading
  // ─────────────────────────────────────────────────────

  /// Loads history from server if conversationId changed. Called on
  /// init and whenever the notifier's conversationId changes (e.g.
  /// after the first message creates a new conversation).
  Future<void> _syncConversationHistory() async {
    final notifier = ref.read(assistantChatNotifierProvider);
    final convId = notifier.conversationId;
    if (convId == null || convId == _loadedConversationId) return;

    setState(() => _loadingHistory = true);
    try {
      final api = ref.read(aiApiProvider);
      final result = await api.getConversation(convId);
      if (mounted) {
        setState(() {
          _messages = result.messages
              .where((m) => m.isUser || m.isAssistant)
              .toList();
          _loadingHistory = false;
          _loadedConversationId = convId;
        });
        _scrollToBottom();
      }
    } catch (_) {
      if (mounted) setState(() => _loadingHistory = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  // ─────────────────────────────────────────────────────
  // User actions
  // ─────────────────────────────────────────────────────

  Future<void> _onSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    final notifier = ref.read(assistantChatNotifierProvider);
    _controller.clear();

    // Optimistically add user bubble for instant feedback.
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

    await notifier.sendMessage(text);

    // Reload history after turn completes to replace local bubble with
    // the server-persisted record.
    _loadedConversationId = null;
    await _syncConversationHistory();
  }

  void _onStop() {
    ref.read(assistantChatNotifierProvider).stop();
  }

  Future<void> _onRetry() async {
    await ref.read(assistantChatNotifierProvider).retry();
  }

  void _onConversationTap(String conversationId) {
    final notifier = ref.read(assistantChatNotifierProvider);
    notifier.openExistingConversation(conversationId);
    _loadedConversationId = null;
    _syncConversationHistory();
  }

  // ─────────────────────────────────────────────────────
  // Build
  // ─────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final displayName = ref.watch(
      currentScreenContextProvider.select((s) => s.displayName),
    );

    final assistantState = ref.watch(assistantStateMachineProvider);

    // Pop when state machine exits Full (e.g. closeFull() called).
    ref.listen<AssistantState>(assistantStateMachineProvider, (prev, next) {
      if (_isFullState(prev) && !_isFullState(next)) {
        if (mounted) Navigator.of(context).maybePop();
      }
      // Reload history when a new conversation is started (conversationId
      // changed after first AI response).
      if (next is AssistantFullReading && next.messageId != null) {
        _syncConversationHistory();
      }
      // Auto-scroll whenever new content streams in.
      if (next is AssistantFullReading) {
        _scrollToBottom();
      }
    });

    final isStreaming = assistantState is AssistantFullLoading ||
        (assistantState is AssistantFullReading && assistantState.streaming);

    return PopScope(
      onPopInvoked: (_) {
        ref.read(assistantChatNotifierProvider).closeFull();
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
                onReset: () =>
                    ref.read(assistantChatNotifierProvider).reset(),
              ),
              Divider(color: c.border, height: 1),
              Expanded(
                child: _MessageList(
                  messages: _messages,
                  loadingHistory: _loadingHistory,
                  assistantState: assistantState,
                  scrollController: _scrollController,
                  onRetry: _onRetry,
                  onDeclineProposal: (i) =>
                      ref.read(assistantChatNotifierProvider).dismissProposal(i),
                  onSuccessProposal: (i) {
                    final s = ref.read(assistantStateMachineProvider);
                    if (s is AssistantFullReading) {
                      ref.read(assistantChatNotifierProvider).updateProposal(
                            i,
                            s.proposals[i].copyWith(
                              status: ProposalCardStatus.success,
                            ),
                          );
                    }
                  },
                ),
              ),
              _ComposeBar(
                controller: _controller,
                isStreaming: isStreaming,
                onSend: _onSend,
                onStop: _onStop,
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool _isFullState(AssistantState? s) =>
      s is AssistantFullCompose ||
      s is AssistantFullLoading ||
      s is AssistantFullReading ||
      s is AssistantFullError;
}

// ─────────────────────────────────────────────────────────
// Message list
// ─────────────────────────────────────────────────────────

class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.messages,
    required this.loadingHistory,
    required this.assistantState,
    required this.scrollController,
    required this.onRetry,
    required this.onDeclineProposal,
    required this.onSuccessProposal,
  });

  final List<ConversationMessage> messages;
  final bool loadingHistory;
  final AssistantState assistantState;
  final ScrollController scrollController;
  final VoidCallback onRetry;
  final void Function(int) onDeclineProposal;
  final void Function(int) onSuccessProposal;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    // Compute extra inline items appended after persisted history:
    // [typing indicator | streaming bubble | error bubble | proposals]
    final extraItems = _buildExtraItems(context, c);

    if (loadingHistory && messages.isEmpty) {
      return const Center(child: AppSpinner());
    }

    if (messages.isEmpty && extraItems.isEmpty) {
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
      controller: scrollController,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      itemCount: messages.length + extraItems.length,
      itemBuilder: (ctx, i) {
        if (i < messages.length) {
          return _MessageBubble(message: messages[i]);
        }
        return extraItems[i - messages.length];
      },
    );
  }

  List<Widget> _buildExtraItems(BuildContext context, AppColors c) {
    final items = <Widget>[];

    switch (assistantState) {
      case AssistantFullLoading(:final statusText):
        items.add(_TypingIndicator(statusText: statusText));

      case AssistantFullReading(
          :final partial,
          :final streaming,
          :final interrupted,
          :final proposals,
        ):
        items.add(
          _AiStreamBubble(
            partial: partial,
            streaming: streaming,
            interrupted: interrupted,
          ),
        );
        for (var j = 0; j < proposals.length; j++) {
          items.add(
            ProposalCard(
              proposal: proposals[j],
              index: j,
              onDecline: onDeclineProposal,
              onSuccess: onSuccessProposal,
            ),
          );
        }

      case AssistantFullError(:final message):
        items.add(_ErrorBubble(message: message, onRetry: onRetry));

      default:
        break;
    }

    return items;
  }
}

// ─────────────────────────────────────────────────────────
// Inline bubbles
// ─────────────────────────────────────────────────────────

/// Typing indicator shown during FullLoading.
/// AI avatar + statusText + animated dots.
class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator({required this.statusText});

  final String statusText;

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<int> _dotCount;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
    _dotCount = IntTween(begin: 1, end: 3).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _AiAvatar(colors: c),
          const SizedBox(width: AppSpacing.sm),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: c.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: c.border),
              ),
              child: AnimatedBuilder(
                animation: _dotCount,
                builder: (_, __) {
                  final dots = '.' * _dotCount.value;
                  return Text(
                    '${widget.statusText}$dots',
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.bodySmall,
                      color: c.mutedForeground,
                      fontStyle: FontStyle.italic,
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Inline streaming AI bubble. Shows partial markdown with optional
/// "Đã dừng" indicator when interrupted.
class _AiStreamBubble extends StatelessWidget {
  const _AiStreamBubble({
    required this.partial,
    required this.streaming,
    required this.interrupted,
  });

  final String partial;
  final bool streaming;
  final bool interrupted;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _AiAvatar(colors: c),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: c.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: c.border),
                  ),
                  child: partial.isEmpty
                      ? Text(
                          '...',
                          style: GoogleFonts.inter(
                            fontSize: AppTypography.bodySmall,
                            color: c.mutedForeground,
                          ),
                        )
                      : MarkdownBody(
                          data: partial,
                          styleSheet: MarkdownStyleSheet.fromTheme(
                            Theme.of(context),
                          ).copyWith(
                            p: GoogleFonts.inter(
                              fontSize: AppTypography.bodySmall,
                              color: c.foreground,
                            ),
                          ),
                        ),
                ),
                if (interrupted && !streaming) ...[
                  const SizedBox(height: 4),
                  _InterruptedChip(colors: c),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InterruptedChip extends StatelessWidget {
  const _InterruptedChip({required this.colors});

  final AppColors colors;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.stop_circle_outlined, size: 12, color: colors.mutedForeground),
        const SizedBox(width: 4),
        Text(
          'Đã dừng',
          style: GoogleFonts.inter(
            fontSize: 11,
            color: colors.mutedForeground,
          ),
        ),
      ],
    );
  }
}

/// Inline error bubble shown in FullError state.
class _ErrorBubble extends StatelessWidget {
  const _ErrorBubble({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _AiAvatar(colors: c, isError: true),
          const SizedBox(width: AppSpacing.sm),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: c.destructive.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: c.destructive.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message,
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.bodySmall,
                      color: c.foreground,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  GestureDetector(
                    onTap: onRetry,
                    child: Text(
                      'Thử lại',
                      style: GoogleFonts.inter(
                        fontSize: AppTypography.bodySmall,
                        color: c.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// AI avatar icon used in inline bubbles.
class _AiAvatar extends StatelessWidget {
  const _AiAvatar({required this.colors, this.isError = false});

  final AppColors colors;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: isError
            ? colors.destructive.withOpacity(0.12)
            : colors.primary.withOpacity(0.12),
        shape: BoxShape.circle,
      ),
      child: Icon(
        isError ? Icons.error_outline : Icons.auto_awesome,
        size: 16,
        color: isError ? colors.destructive : colors.primary,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Persisted message bubble
// ─────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ConversationMessage message;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final isUser = message.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            _AiAvatar(colors: c),
            const SizedBox(width: AppSpacing.sm),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: isUser ? c.primary : c.card,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(12),
                      topRight: const Radius.circular(12),
                      bottomLeft: Radius.circular(isUser ? 12 : 4),
                      bottomRight: Radius.circular(isUser ? 4 : 12),
                    ),
                    border: isUser ? null : Border.all(color: c.border),
                  ),
                  child: isUser
                      ? Text(
                          message.content,
                          style: GoogleFonts.inter(
                            fontSize: AppTypography.bodySmall,
                            color: c.primaryForeground,
                          ),
                        )
                      : MarkdownBody(
                          data: message.content,
                          styleSheet: MarkdownStyleSheet.fromTheme(
                            Theme.of(context),
                          ).copyWith(
                            p: GoogleFonts.inter(
                              fontSize: AppTypography.bodySmall,
                              color: c.foreground,
                            ),
                          ),
                        ),
                ),
                if (message.interrupted) ...[
                  const SizedBox(height: 4),
                  _InterruptedChip(colors: c),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────

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
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.menu),
            color: c.foreground,
            onPressed: onDrawerTap,
            tooltip: 'Lịch sử hội thoại',
          ),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.auto_awesome, color: c.primary, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      'Trợ lý AI',
                      style: GoogleFonts.inter(
                        fontSize: AppTypography.bodyMedium,
                        fontWeight: FontWeight.w600,
                        color: c.foreground,
                      ),
                    ),
                  ],
                ),
                if (displayName.isNotEmpty)
                  Text(
                    displayName,
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.caption,
                      color: c.mutedForeground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            color: c.mutedForeground,
            onPressed: onReset,
            tooltip: 'Cuộc trò chuyện mới',
          ),
          IconButton(
            icon: const Icon(Icons.close),
            color: c.foreground,
            onPressed: onClose,
            tooltip: 'Đóng',
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Compose bar
// ─────────────────────────────────────────────────────────

/// Always-visible compose bar at the bottom of Full screen.
/// Shows Stop icon during streaming, Send icon otherwise.
/// No "Soạn tiếp" button — bar is always ready after FullReading(done).
class _ComposeBar extends StatelessWidget {
  const _ComposeBar({
    required this.controller,
    required this.isStreaming,
    required this.onSend,
    required this.onStop,
  });

  final TextEditingController controller;
  final bool isStreaming;
  final VoidCallback onSend;
  final VoidCallback onStop;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      decoration: BoxDecoration(
        color: c.card,
        border: Border(top: BorderSide(color: c.border)),
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 5,
              textInputAction: TextInputAction.newline,
              decoration: InputDecoration(
                hintText: 'Nhập câu hỏi...',
                hintStyle: GoogleFonts.inter(
                  fontSize: AppTypography.bodySmall,
                  color: c.mutedForeground,
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.sm,
                ),
              ),
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodySmall,
                color: c.foreground,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: isStreaming
                ? IconButton(
                    key: const ValueKey('stop'),
                    icon: Icon(Icons.stop_circle, color: c.primary, size: 28),
                    onPressed: onStop,
                    tooltip: 'Dừng',
                  )
                : IconButton(
                    key: const ValueKey('send'),
                    icon: Icon(Icons.send_rounded, color: c.primary, size: 24),
                    onPressed: onSend,
                    tooltip: 'Gửi',
                  ),
          ),
        ],
      ),
    );
  }
}
