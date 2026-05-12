import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../app_theme.dart';

enum AppButtonVariant { primary, secondary, outline, text, danger }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.icon,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = false,
    this.padding,
    this.borderRadius,
    this.fontSize,
  });

  final VoidCallback? onPressed;
  final Widget? child;
  final String? label;
  final Widget? icon;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final double? fontSize;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final radius = borderRadius ?? AppRadius.md;
    final effectivePadding = padding ??
        const EdgeInsets.symmetric(
          horizontal: AppSpacing.xl,
          vertical: AppSpacing.md,
        );
    final effectiveFontSize = fontSize ?? AppTypography.bodyMedium;

    final (bgColor, fgColor, bdColor, bdWidth) = switch (variant) {
      AppButtonVariant.primary => (c.primary, c.primaryForeground, Colors.transparent, 0.0),
      AppButtonVariant.secondary => (c.muted, c.foreground, Colors.transparent, 0.0),
      AppButtonVariant.outline => (Colors.transparent, c.foreground, c.border, 1.0),
      AppButtonVariant.text => (Colors.transparent, c.primary, Colors.transparent, 0.0),
      AppButtonVariant.danger => (c.error, c.errorForeground, Colors.transparent, 0.0),
    };

    final disabledBg = c.muted;
    final disabledFg = c.mutedForeground;
    final isDisabled = onPressed == null || isLoading;

    Widget content;
    if (isLoading) {
      content = SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: isDisabled ? disabledFg : fgColor,
        ),
      );
    } else if (icon != null && label != null) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconTheme(data: IconThemeData(color: isDisabled ? disabledFg : fgColor, size: 20), child: icon!),
          const SizedBox(width: AppSpacing.sm),
          Text(label!, style: GoogleFonts.beVietnamPro(fontSize: effectiveFontSize, fontWeight: FontWeight.w600, color: isDisabled ? disabledFg : fgColor)),
        ],
      );
    } else if (icon != null) {
      content = IconTheme(data: IconThemeData(color: isDisabled ? disabledFg : fgColor, size: 20), child: icon!);
    } else if (label != null) {
      content = Text(label!, style: GoogleFonts.beVietnamPro(fontSize: effectiveFontSize, fontWeight: FontWeight.w600, color: isDisabled ? disabledFg : fgColor));
    } else {
      content = child ?? const SizedBox.shrink();
    }

    Widget button = GestureDetector(
      onTap: isDisabled ? null : onPressed,
      child: Container(
        padding: effectivePadding,
        decoration: BoxDecoration(
          color: isDisabled ? disabledBg : bgColor,
          borderRadius: BorderRadius.circular(radius),
          border: Border.all(color: isDisabled ? Colors.transparent : bdColor, width: bdWidth),
        ),
        child: Center(child: content),
      ),
    );

    if (isFullWidth) {
      button = SizedBox(width: double.infinity, child: button);
    }

    return button;
  }
}
