import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../app_theme.dart';

class AppNavBar extends StatelessWidget {
  const AppNavBar({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.destinations,
    this.onCenterAction,
    this.centerActionIcon = Icons.camera_alt_rounded,
    this.centerActionTooltip = 'Open camera',
  });

  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final List<AppNavBarDestination> destinations;
  final VoidCallback? onCenterAction;
  final IconData centerActionIcon;
  final String centerActionTooltip;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final centerIndex = destinations.length ~/ 2;
    final items = <Widget>[];

    for (var index = 0; index < destinations.length; index++) {
      if (index == centerIndex) {
        items.add(const Expanded(child: SizedBox(height: 56)));
      }

      items.add(
        _AppNavBarDestinationItem(
          destination: destinations[index],
          isSelected: index == selectedIndex,
          onTap: () => onDestinationSelected(index),
        ),
      );
    }

    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.topCenter,
      children: [
        Container(
          margin: const EdgeInsets.only(top: AppSpacing.xl),
          decoration: BoxDecoration(
            color: c.card,
            border: Border(top: BorderSide(color: c.border, width: 1)),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
              child: Row(children: items),
            ),
          ),
        ),
        Positioned(
          top: 0,
          child: _AppNavBarCenterAction(
            icon: centerActionIcon,
            tooltip: centerActionTooltip,
            onTap: onCenterAction,
          ),
        ),
      ],
    );
  }
}

class _AppNavBarDestinationItem extends StatelessWidget {
  const _AppNavBarDestinationItem({
    required this.destination,
    required this.isSelected,
    required this.onTap,
  });

  final AppNavBarDestination destination;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final itemColor = isSelected ? c.primary : c.mutedForeground;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                decoration: isSelected
                    ? BoxDecoration(
                        color: c.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      )
                    : null,
                child: Icon(
                  isSelected ? destination.selectedIcon : destination.icon,
                  color: itemColor,
                  size: 22,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                destination.label,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.caption,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: itemColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AppNavBarCenterAction extends StatelessWidget {
  const _AppNavBarCenterAction({
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final enabled = onTap != null;

    return Tooltip(
      message: tooltip,
      child: Semantics(
        button: true,
        label: tooltip,
        child: GestureDetector(
          key: const ValueKey('app_nav_bar_camera_fab'),
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          child: AnimatedOpacity(
            opacity: enabled ? 1 : 0.5,
            duration: const Duration(milliseconds: 120),
            child: Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: c.primary,
                shape: BoxShape.circle,
                border: Border.all(color: c.card, width: 4),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.12),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Icon(icon, color: c.primaryForeground, size: 26),
            ),
          ),
        ),
      ),
    );
  }
}

class AppNavBarDestination {
  const AppNavBarDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
}
