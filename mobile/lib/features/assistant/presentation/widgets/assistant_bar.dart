import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../application/assistant_chat_notifier.dart';
import '../../data/screen_context_provider.dart';
import 'assistant_full_screen.dart';
import 'assistant_question_sheet.dart';

/// Thin always-visible entry-point to the Trợ lý AI.
///
/// V2 changes:
/// - **Tap** → opens [AssistantQuestionSheet] in Mid compose (unchanged).
/// - **Long-press** → transitions Collapsed → FullCompose and navigates
///   directly to [AssistantFullScreen], skipping the bottom sheet.
class AssistantBar extends ConsumerWidget {
  const AssistantBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = AppTheme.colors(context);
    final placeholder = ref.watch(
      currentScreenContextProvider.select((s) => s.barPlaceholder),
    );

    return Material(
      color: c.card,
      child: SafeArea(
        top: false,
        child: InkWell(
          onTap: () => _openSheet(context, ref),
          onLongPress: () => _openFullDirect(context, ref),
          child: Container(
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: c.border)),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: Row(
              children: [
                Icon(
                  Icons.auto_awesome,
                  color: c.primary,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    placeholder,
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.bodySmall,
                      color: c.mutedForeground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_up,
                  color: c.mutedForeground,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Tap → Mid bottom sheet.
  void _openSheet(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(assistantChatNotifierProvider);
    notifier.openBar();
    final navKey = ref.read(rootNavigatorKeyProvider);
    final sheetContext = navKey.currentContext ?? context;
    AppBottomSheet.show<void>(
      sheetContext,
      isScrollControlled: true,
      builder: (ctx) => const AssistantQuestionSheet(),
    ).whenComplete(() {
      // Only collapse if we're still in a Mid state; if the user
      // entered Full from the sheet, don't collapse the state machine.
      notifier.collapse();
    });
  }

  /// Long-press → Full screen directly (Collapsed → FullCompose).
  void _openFullDirect(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(assistantChatNotifierProvider);
    notifier.openFullDirect();

    final navKey = ref.read(rootNavigatorKeyProvider);
    final navContext = navKey.currentContext ?? context;
    Navigator.of(navContext).push(
      MaterialPageRoute<void>(
        builder: (_) => const AssistantFullScreen(),
        fullscreenDialog: true,
      ),
    );
  }
}
