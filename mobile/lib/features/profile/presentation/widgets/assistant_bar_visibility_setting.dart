import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/assistant_bar_visible_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';

class AssistantBarVisibilitySetting extends ConsumerWidget {
  const AssistantBarVisibilitySetting({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final visible = ref.watch(assistantBarVisibleProvider);

    return AppCard(
      variant: AppCardVariant.outlined,
      child: AppListItem(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
        leading: Icon(Icons.auto_awesome, color: c.primary, size: 20),
        titleWidget: Text(
          'Hiện thanh Trợ lý AI',
          style: theme.textTheme.bodyMedium,
        ),
        subtitleWidget: Text(
          'Ẩn thanh khi bạn không dùng AI',
          style: theme.textTheme.bodySmall?.copyWith(color: c.mutedForeground),
        ),
        trailing: AppSwitch(
          value: visible,
          onChanged: (value) =>
              ref.read(assistantBarVisibleProvider.notifier).setVisible(value),
        ),
      ),
    );
  }
}
