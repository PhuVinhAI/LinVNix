import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/conversation_list_provider.dart';
import '../../data/conversation_model.dart';

class ConversationDrawer extends ConsumerStatefulWidget {
  const ConversationDrawer({
    super.key,
    required this.onConversationTap,
    required this.onNewConversation,
  });

  final void Function(String conversationId) onConversationTap;
  final VoidCallback onNewConversation;

  @override
  ConsumerState<ConversationDrawer> createState() =>
      _ConversationDrawerState();
}

class _ConversationDrawerState extends ConsumerState<ConversationDrawer> {
  String? _renamingId;
  final TextEditingController _renameController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    // Pre-load conversations in background so the list is ready
    // before the user opens the drawer for the first time.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final current = ref.read(conversationListProvider);
      if (!current.hasValue) {
        ref.read(conversationListProvider.notifier).refresh();
      }
    });
    _searchController.addListener(() {
      setState(() => _searchQuery = _searchController.text.trim().toLowerCase());
    });
  }

  @override
  void dispose() {
    _renameController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final conversations = ref.watch(conversationListProvider);

    final filteredList = conversations.whenOrNull(
      data: (list) => _searchQuery.isEmpty
          ? list
          : list
              .where((conv) =>
                  conv.displayTitle.toLowerCase().contains(_searchQuery))
              .toList(),
    );

    return Drawer(
      backgroundColor: c.card,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Header ────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Conversations',
                      style: GoogleFonts.inter(
                        fontSize: AppTypography.titleSmall,
                        fontWeight: FontWeight.w600,
                        color: c.foreground,
                      ),
                    ),
                  ),
                  // Primary-styled New button
                  FilledButton.icon(
                    onPressed: () => _createNew(context),
                    style: FilledButton.styleFrom(
                      backgroundColor: c.primary,
                      foregroundColor: c.primaryForeground,
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.lg,
                        vertical: AppSpacing.sm,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                    icon: const Icon(Icons.add, size: 18),
                    label: Text(
                      'New',
                      style: GoogleFonts.inter(
                        fontSize: AppTypography.bodyMedium,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Search bar ────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              child: TextField(
                controller: _searchController,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodySmall,
                  color: c.foreground,
                ),
                decoration: InputDecoration(
                  hintText: 'Search conversations...',
                  hintStyle: GoogleFonts.inter(
                    fontSize: AppTypography.bodySmall,
                    color: c.mutedForeground,
                  ),
                  prefixIcon: Icon(
                    Icons.search,
                    size: 18,
                    color: c.mutedForeground,
                  ),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear,
                              size: 16, color: c.mutedForeground),
                          onPressed: () => _searchController.clear(),
                        )
                      : null,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: AppSpacing.sm,
                  ),
                  filled: true,
                  fillColor: c.muted.withValues(alpha: 0.4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide(color: c.primary, width: 1),
                  ),
                ),
              ),
            ),

            Divider(color: c.border, height: 1),

            // ── List ──────────────────────────────────────────────
            Expanded(
              child: conversations.when(
                loading: () =>
                    const Center(child: AppSpinner()),
                error: (e, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.error_outline, color: c.error, size: 32),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'Could not load conversations',
                          style: GoogleFonts.inter(
                            fontSize: AppTypography.bodySmall,
                            color: c.mutedForeground,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        AppButton(
                          label: 'Retry',
                          onPressed: () =>
                              ref.read(conversationListProvider.notifier).refresh(),
                          variant: AppButtonVariant.outline,
                        ),
                      ],
                    ),
                  ),
                ),
                data: (_) {
                  final list = filteredList ?? [];

                  if (list.isEmpty) {
                    return Center(
                      child: Text(
                        _searchQuery.isNotEmpty
                            ? 'No results found'
                            : 'No conversations yet',
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.bodySmall,
                          color: c.mutedForeground,
                        ),
                      ),
                    );
                  }
                  return RefreshIndicator(
                    onRefresh: () =>
                        ref.read(conversationListProvider.notifier).refresh(),
                    child: ListView.builder(
                      itemCount: list.length,
                      itemBuilder: (ctx, i) => _ConversationRow(
                        conversation: list[i],
                        isRenaming: _renamingId == list[i].id,
                        renameController: _renameController,
                        onTap: () {
                          Navigator.of(context).maybePop();
                          widget.onConversationTap(list[i].id);
                        },
                        onRename: () => _startRename(list[i]),
                        onDelete: () => _confirmDelete(context, list[i]),
                        onRenameSubmit: (title) =>
                            _submitRename(list[i].id, title),
                        onRenameCancel: () => setState(() {
                          _renamingId = null;
                          _renameController.clear();
                        }),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _createNew(BuildContext context) {
    Navigator.of(context).maybePop();
    widget.onNewConversation();
  }

  void _startRename(ConversationSummary conv) {
    setState(() {
      _renamingId = conv.id;
      _renameController.text = conv.displayTitle;
    });
  }

  Future<void> _submitRename(String id, String title) async {
    final trimmed = title.trim();
    if (trimmed.isEmpty) return;
    setState(() => _renamingId = null);
    await ref.read(conversationListProvider.notifier).rename(id, trimmed);
  }

  Future<void> _confirmDelete(
    BuildContext context,
    ConversationSummary conv,
  ) async {
    final confirmed = await AppDialog.show<bool>(
      context,
      barrierDismissible: true,
      builder: (ctx) => AppDialog(
        title: 'Delete conversation',
        content:
            'Are you sure you want to delete "${conv.displayTitle}"? This action cannot be undone.',
        actions: [
          AppDialogAction(
            label: 'Cancel',
            onPressed: () => Navigator.of(ctx).pop(false),
          ),
          AppDialogAction(
            label: 'Delete',
            isPrimary: true,
            onPressed: () => Navigator.of(ctx).pop(true),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(conversationListProvider.notifier).delete(conv.id);
    }
  }
}

class _ConversationRow extends StatelessWidget {
  const _ConversationRow({
    required this.conversation,
    required this.isRenaming,
    required this.renameController,
    required this.onTap,
    required this.onRename,
    required this.onDelete,
    required this.onRenameSubmit,
    required this.onRenameCancel,
  });

  final ConversationSummary conversation;
  final bool isRenaming;
  final TextEditingController renameController;
  final VoidCallback onTap;
  final VoidCallback onRename;
  final VoidCallback onDelete;
  final void Function(String title) onRenameSubmit;
  final VoidCallback onRenameCancel;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    if (isRenaming) {
      return Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xs,
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: renameController,
                autofocus: true,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.bodySmall,
                  color: c.foreground,
                ),
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ),
                onSubmitted: onRenameSubmit,
              ),
            ),
            IconButton(
              icon: Icon(Icons.check, size: 18, color: c.primary),
              onPressed: () => onRenameSubmit(renameController.text),
            ),
            IconButton(
              icon: Icon(Icons.close, size: 18, color: c.mutedForeground),
              onPressed: onRenameCancel,
            ),
          ],
        ),
      );
    }

    return ListTile(
      title: Text(
        conversation.displayTitle,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: GoogleFonts.inter(
          fontSize: AppTypography.bodySmall,
          color: c.foreground,
        ),
      ),
      subtitle: Text(
        _formatDate(conversation.updatedAt),
        style: GoogleFonts.inter(
          fontSize: AppTypography.caption,
          color: c.mutedForeground,
        ),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: Icon(Icons.edit, size: 16, color: c.mutedForeground),
            tooltip: 'Rename',
            onPressed: onRename,
          ),
          IconButton(
            icon: Icon(Icons.delete_outline, size: 16, color: c.error),
            tooltip: 'Delete',
            onPressed: onDelete,
          ),
        ],
      ),
      onTap: onTap,
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours < 1) {
      final m = diff.inMinutes;
      return '$m ${m == 1 ? 'minute' : 'minutes'} ago';
    }
    if (diff.inDays < 1) {
      final h = diff.inHours;
      return '$h ${h == 1 ? 'hour' : 'hours'} ago';
    }
    if (diff.inDays < 7) {
      final d = diff.inDays;
      return '$d ${d == 1 ? 'day' : 'days'} ago';
    }
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
