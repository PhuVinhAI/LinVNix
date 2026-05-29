import 'package:linvnix/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';

class ContentListHeader extends StatelessWidget {
  const ContentListHeader({
    super.key,
    required this.title,
    this.progressText,
    this.showCompleteAll = false,
    this.showReset = false,
    this.isCompletingAll = false,
    this.isResetting = false,
    this.onCompleteAll,
    this.onReset,
  });

  final String title;
  final String? progressText;
  final bool showCompleteAll;
  final bool showReset;
  final bool isCompletingAll;
  final bool isResetting;
  final VoidCallback? onCompleteAll;
  final VoidCallback? onReset;

  static const _compactPadding =
      EdgeInsets.symmetric(horizontal: 10, vertical: 6);

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final hasActions = showCompleteAll || showReset;

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (progressText != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    progressText!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: c.mutedForeground,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (hasActions) ...[
            const SizedBox(width: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              alignment: WrapAlignment.end,
              children: [
                if (showCompleteAll)
                  AppButton(
                    label: isCompletingAll ? '...' : S.of(context).completeAll,
                    variant: AppButtonVariant.outline,
                    padding: _compactPadding,
                    fontSize: AppTypography.bodySmall,
                    onPressed: isCompletingAll ? null : onCompleteAll,
                    icon: isCompletingAll
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.done_all, size: 14),
                  ),
                if (showReset)
                  AppButton(
                    label: isResetting ? '...' : S.of(context).resetLabel,
                    variant: AppButtonVariant.outline,
                    padding: _compactPadding,
                    fontSize: AppTypography.bodySmall,
                    onPressed: isResetting ? null : onReset,
                    icon: isResetting
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.restart_alt, size: 14),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class CustomPracticeSection extends StatelessWidget {
  const CustomPracticeSection({
    super.key,
    required this.eligible,
    required this.lockedMessage,
    required this.emptyMessage,
    required this.isCreating,
    this.error,
    this.onCreate,
    this.onCancelCreate,
    this.setCards = const [],
  });

  final bool eligible;
  final String lockedMessage;
  final String emptyMessage;
  final bool isCreating;
  final String? error;
  final VoidCallback? onCreate;
  final VoidCallback? onCancelCreate;
  final List<Widget> setCards;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome, color: c.primary, size: 20),
              const SizedBox(width: 8),
              Text(
                S.of(context).customPracticeLabel,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          if (!eligible)
            _StatusMessage(
              icon: Icons.lock_outline,
              message: lockedMessage,
            )
          else ...[
            if (setCards.isEmpty && !isCreating) ...[
              _StatusMessage(
                icon: Icons.auto_awesome_outlined,
                message: emptyMessage,
              ),
              const SizedBox(height: AppSpacing.md),
            ],
            if (isCreating) ...[
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: S.of(context).generatingExercises,
                  variant: AppButtonVariant.secondary,
                  onPressed: null,
                  icon: const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: S.of(context).cancelButton2,
                  variant: AppButtonVariant.outline,
                  onPressed: onCancelCreate,
                ),
              ),
            ] else
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: S.of(context).createCustomPractice,
                  variant: AppButtonVariant.primary,
                  onPressed: onCreate,
                  icon: const Icon(Icons.add),
                ),
              ),
          ],
          if (error != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              error!,
              style: theme.textTheme.bodySmall?.copyWith(color: c.error),
            ),
          ],
          if (setCards.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            ...setCards,
          ],
        ],
      ),
    );
  }
}

class _StatusMessage extends StatelessWidget {
  const _StatusMessage({
    required this.icon,
    required this.message,
  });

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: c.muted.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: c.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: c.mutedForeground),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: c.mutedForeground,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
