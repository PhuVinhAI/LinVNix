import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

abstract class AppTypography {
  static const double caption = 12;
  static const double bodySmall = 14;
  static const double bodyMedium = 16;
  static const double bodyLarge = 18;
  static const double titleSmall = 20;
  static const double titleMedium = 22;
  static const double titleLarge = 24;
  static const double headlineSmall = 28;
  static const double headlineMedium = 32;
  static const double headlineLarge = 36;
  static const double displaySmall = 40;
  static const double displayMedium = 48;
  static const double displayLarge = 56;
}

abstract class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
}

abstract class AppRadius {
  static const double sm = 4;
  static const double md = 8;
  static const double lg = 12;
  static const double xl = 16;
  static const double full = 999;
}

class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.primary,
    required this.primaryForeground,
    required this.secondary,
    required this.secondaryForeground,
    required this.accent,
    required this.accentForeground,
    required this.background,
    required this.foreground,
    required this.card,
    required this.cardForeground,
    required this.muted,
    required this.mutedForeground,
    required this.border,
    required this.inputBorder,
    required this.success,
    required this.successForeground,
    required this.warning,
    required this.warningForeground,
    required this.error,
    required this.errorForeground,
    required this.info,
    required this.infoForeground,
  });

  final Color primary;
  final Color primaryForeground;
  final Color secondary;
  final Color secondaryForeground;
  final Color accent;
  final Color accentForeground;
  final Color background;
  final Color foreground;
  final Color card;
  final Color cardForeground;
  final Color muted;
  final Color mutedForeground;
  final Color border;
  final Color inputBorder;
  final Color success;
  final Color successForeground;
  final Color warning;
  final Color warningForeground;
  final Color error;
  final Color errorForeground;
  final Color info;
  final Color infoForeground;

  static const light = AppColors(
    primary: Color(0xFFE53935),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFFFF8F00),
    secondaryForeground: Color(0xFFFFFFFF),
    accent: Color(0xFF1565C0),
    accentForeground: Color(0xFFFFFFFF),
    background: Color(0xFFF8F9FA),
    foreground: Color(0xFF1A1A2E),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF1A1A2E),
    muted: Color(0xFFF1F3F5),
    mutedForeground: Color(0xFF6B7280),
    border: Color(0xFFE5E7EB),
    inputBorder: Color(0xFFD1D5DB),
    success: Color(0xFF10B981),
    successForeground: Color(0xFFFFFFFF),
    warning: Color(0xFFF59E0B),
    warningForeground: Color(0xFFFFFFFF),
    error: Color(0xFFEF4444),
    errorForeground: Color(0xFFFFFFFF),
    info: Color(0xFF3B82F6),
    infoForeground: Color(0xFFFFFFFF),
  );

  static const dark = AppColors(
    primary: Color(0xFFFF6B6B),
    primaryForeground: Color(0xFF1A1A2E),
    secondary: Color(0xFFFFB347),
    secondaryForeground: Color(0xFF1A1A2E),
    accent: Color(0xFF60A5FA),
    accentForeground: Color(0xFF0F0F1A),
    background: Color(0xFF0F0F1A),
    foreground: Color(0xFFF1F5F9),
    card: Color(0xFF1A1A2E),
    cardForeground: Color(0xFFF1F5F9),
    muted: Color(0xFF252540),
    mutedForeground: Color(0xFF94A3B8),
    border: Color(0xFF2D2D44),
    inputBorder: Color(0xFF3B3B5C),
    success: Color(0xFF34D399),
    successForeground: Color(0xFF0F0F1A),
    warning: Color(0xFFFBBF24),
    warningForeground: Color(0xFF0F0F1A),
    error: Color(0xFFF87171),
    errorForeground: Color(0xFF0F0F1A),
    info: Color(0xFF60A5FA),
    infoForeground: Color(0xFF0F0F1A),
  );

  @override
  AppColors copyWith({
    Color? primary,
    Color? primaryForeground,
    Color? secondary,
    Color? secondaryForeground,
    Color? accent,
    Color? accentForeground,
    Color? background,
    Color? foreground,
    Color? card,
    Color? cardForeground,
    Color? muted,
    Color? mutedForeground,
    Color? border,
    Color? inputBorder,
    Color? success,
    Color? successForeground,
    Color? warning,
    Color? warningForeground,
    Color? error,
    Color? errorForeground,
    Color? info,
    Color? infoForeground,
  }) {
    return AppColors(
      primary: primary ?? this.primary,
      primaryForeground: primaryForeground ?? this.primaryForeground,
      secondary: secondary ?? this.secondary,
      secondaryForeground: secondaryForeground ?? this.secondaryForeground,
      accent: accent ?? this.accent,
      accentForeground: accentForeground ?? this.accentForeground,
      background: background ?? this.background,
      foreground: foreground ?? this.foreground,
      card: card ?? this.card,
      cardForeground: cardForeground ?? this.cardForeground,
      muted: muted ?? this.muted,
      mutedForeground: mutedForeground ?? this.mutedForeground,
      border: border ?? this.border,
      inputBorder: inputBorder ?? this.inputBorder,
      success: success ?? this.success,
      successForeground: successForeground ?? this.successForeground,
      warning: warning ?? this.warning,
      warningForeground: warningForeground ?? this.warningForeground,
      error: error ?? this.error,
      errorForeground: errorForeground ?? this.errorForeground,
      info: info ?? this.info,
      infoForeground: infoForeground ?? this.infoForeground,
    );
  }

  @override
  AppColors lerp(AppColors? other, double t) {
    if (other is! AppColors) return this;
    return AppColors(
      primary: Color.lerp(primary, other.primary, t)!,
      primaryForeground: Color.lerp(primaryForeground, other.primaryForeground, t)!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      secondaryForeground: Color.lerp(secondaryForeground, other.secondaryForeground, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentForeground: Color.lerp(accentForeground, other.accentForeground, t)!,
      background: Color.lerp(background, other.background, t)!,
      foreground: Color.lerp(foreground, other.foreground, t)!,
      card: Color.lerp(card, other.card, t)!,
      cardForeground: Color.lerp(cardForeground, other.cardForeground, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      mutedForeground: Color.lerp(mutedForeground, other.mutedForeground, t)!,
      border: Color.lerp(border, other.border, t)!,
      inputBorder: Color.lerp(inputBorder, other.inputBorder, t)!,
      success: Color.lerp(success, other.success, t)!,
      successForeground: Color.lerp(successForeground, other.successForeground, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      warningForeground: Color.lerp(warningForeground, other.warningForeground, t)!,
      error: Color.lerp(error, other.error, t)!,
      errorForeground: Color.lerp(errorForeground, other.errorForeground, t)!,
      info: Color.lerp(info, other.info, t)!,
      infoForeground: Color.lerp(infoForeground, other.infoForeground, t)!,
    );
  }
}

class VietnameseAccentTokens extends ThemeExtension<VietnameseAccentTokens> {
  const VietnameseAccentTokens({
    required this.toneHigh,
    required this.toneMid,
    required this.toneLow,
    required this.diacriticColor,
  });

  final Color toneHigh;
  final Color toneMid;
  final Color toneLow;
  final Color diacriticColor;

  @override
  VietnameseAccentTokens copyWith({
    Color? toneHigh,
    Color? toneMid,
    Color? toneLow,
    Color? diacriticColor,
  }) {
    return VietnameseAccentTokens(
      toneHigh: toneHigh ?? this.toneHigh,
      toneMid: toneMid ?? this.toneMid,
      toneLow: toneLow ?? this.toneLow,
      diacriticColor: diacriticColor ?? this.diacriticColor,
    );
  }

  @override
  VietnameseAccentTokens lerp(VietnameseAccentTokens? other, double t) {
    if (other is! VietnameseAccentTokens) return this;
    return VietnameseAccentTokens(
      toneHigh: Color.lerp(toneHigh, other.toneHigh, t)!,
      toneMid: Color.lerp(toneMid, other.toneMid, t)!,
      toneLow: Color.lerp(toneLow, other.toneLow, t)!,
      diacriticColor: Color.lerp(diacriticColor, other.diacriticColor, t)!,
    );
  }

  static const light = VietnameseAccentTokens(
    toneHigh: Color(0xFFD32F2F),
    toneMid: Color(0xFFF57C00),
    toneLow: Color(0xFF388E3C),
    diacriticColor: Color(0xFF1565C0),
  );

  static const dark = VietnameseAccentTokens(
    toneHigh: Color(0xFFEF5350),
    toneMid: Color(0xFFFFA726),
    toneLow: Color(0xFF66BB6A),
    diacriticColor: Color(0xFF42A5F5),
  );
}

TextTheme _buildTextTheme(TextTheme base) {
  return base.copyWith(
    displayLarge: GoogleFonts.beVietnamPro(textStyle: base.displayLarge),
    displayMedium: GoogleFonts.beVietnamPro(textStyle: base.displayMedium),
    displaySmall: GoogleFonts.beVietnamPro(textStyle: base.displaySmall),
    headlineLarge: GoogleFonts.beVietnamPro(textStyle: base.headlineLarge),
    headlineMedium: GoogleFonts.beVietnamPro(textStyle: base.headlineMedium),
    headlineSmall: GoogleFonts.beVietnamPro(textStyle: base.headlineSmall),
    titleLarge: GoogleFonts.beVietnamPro(textStyle: base.titleLarge),
    titleMedium: GoogleFonts.beVietnamPro(textStyle: base.titleMedium),
    titleSmall: GoogleFonts.beVietnamPro(textStyle: base.titleSmall),
    bodyLarge: GoogleFonts.beVietnamPro(textStyle: base.bodyLarge),
    bodyMedium: GoogleFonts.beVietnamPro(textStyle: base.bodyMedium),
    bodySmall: GoogleFonts.beVietnamPro(textStyle: base.bodySmall),
    labelLarge: GoogleFonts.beVietnamPro(textStyle: base.labelLarge),
    labelMedium: GoogleFonts.beVietnamPro(textStyle: base.labelMedium),
    labelSmall: GoogleFonts.beVietnamPro(textStyle: base.labelSmall),
  );
}

class AppTheme {
  AppTheme._();

  static AppColors colors(BuildContext context) {
    return Theme.of(context).extension<AppColors>()!;
  }

  static VietnameseAccentTokens accents(BuildContext context) {
    return Theme.of(context).extension<VietnameseAccentTokens>()!;
  }

  static ThemeData light() {
    final c = AppColors.light;
    final colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: c.primary,
      onPrimary: c.primaryForeground,
      secondary: c.secondary,
      onSecondary: c.secondaryForeground,
      error: c.error,
      onError: c.errorForeground,
      surface: c.background,
      onSurface: c.foreground,
      surfaceContainerHighest: c.muted,
      onSurfaceVariant: c.mutedForeground,
      outline: c.border,
      outlineVariant: c.inputBorder,
      tertiary: c.accent,
      onTertiary: c.accentForeground,
      primaryContainer: c.muted,
      onPrimaryContainer: c.foreground,
      secondaryContainer: c.muted,
      onSecondaryContainer: c.foreground,
      tertiaryContainer: c.muted,
      onTertiaryContainer: c.foreground,
      errorContainer: c.muted,
      onErrorContainer: c.error,
      surfaceContainerHigh: c.card,
      surfaceContainerLow: c.muted,
      inverseSurface: c.foreground,
      onInverseSurface: c.background,
      shadow: Colors.transparent,
      scrim: Colors.black,
    );

    final textTheme = _buildTextTheme(
      ThemeData(colorScheme: colorScheme).textTheme,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: c.background,
      extensions: const [AppColors.light, VietnameseAccentTokens.light],
      appBarTheme: AppBarTheme(
        backgroundColor: c.background,
        foregroundColor: c.foreground,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.beVietnamPro(
          fontSize: AppTypography.titleMedium,
          fontWeight: FontWeight.w600,
          color: c.foreground,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: c.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          side: BorderSide(color: c.border, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.card,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.inputBorder, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.inputBorder, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.error, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        hintStyle: GoogleFonts.beVietnamPro(
          color: c.mutedForeground,
          fontSize: AppTypography.bodyMedium,
        ),
        labelStyle: GoogleFonts.beVietnamPro(
          color: c.mutedForeground,
          fontSize: AppTypography.bodySmall,
        ),
      ),
      dividerTheme: DividerThemeData(
        color: c.border,
        thickness: 1,
        space: 1,
      ),
      dividerColor: c.border,
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: c.card,
        selectedItemColor: c.primary,
        unselectedItemColor: c.mutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: c.card,
        elevation: 0,
        indicatorColor: c.primary.withValues(alpha: 0.12),
        surfaceTintColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.beVietnamPro(
              fontSize: AppTypography.caption,
              fontWeight: FontWeight.w600,
              color: c.primary,
            );
          }
          return GoogleFonts.beVietnamPro(
            fontSize: AppTypography.caption,
            color: c.mutedForeground,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return IconThemeData(color: c.primary, size: 24);
          }
          return IconThemeData(color: c.mutedForeground, size: 24);
        }),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        elevation: 0,
        backgroundColor: c.primary,
        foregroundColor: c.primaryForeground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: c.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(color: c.border, width: 1),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: c.foreground,
        contentTextStyle: GoogleFonts.beVietnamPro(
          color: c.background,
          fontSize: AppTypography.bodyMedium,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        elevation: 0,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: c.muted,
        selectedColor: c.primary.withValues(alpha: 0.12),
        labelStyle: GoogleFonts.beVietnamPro(
          fontSize: AppTypography.caption,
          color: c.foreground,
        ),
        side: BorderSide(color: c.border, width: 1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        elevation: 0,
        pressElevation: 0,
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: c.primary,
        inactiveTrackColor: c.muted,
        thumbColor: c.primary,
        overlayColor: c.primary.withValues(alpha: 0.12),
        trackHeight: 4,
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: c.primary,
        linearTrackColor: c.muted,
        circularTrackColor: c.muted,
      ),
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xs,
        ),
      ),
    );
  }

  static ThemeData dark() {
    final c = AppColors.dark;
    final colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: c.primary,
      onPrimary: c.primaryForeground,
      secondary: c.secondary,
      onSecondary: c.secondaryForeground,
      error: c.error,
      onError: c.errorForeground,
      surface: c.background,
      onSurface: c.foreground,
      surfaceContainerHighest: c.muted,
      onSurfaceVariant: c.mutedForeground,
      outline: c.border,
      outlineVariant: c.inputBorder,
      tertiary: c.accent,
      onTertiary: c.accentForeground,
      primaryContainer: c.muted,
      onPrimaryContainer: c.foreground,
      secondaryContainer: c.muted,
      onSecondaryContainer: c.foreground,
      tertiaryContainer: c.muted,
      onTertiaryContainer: c.foreground,
      errorContainer: c.muted,
      onErrorContainer: c.error,
      surfaceContainerHigh: c.card,
      surfaceContainerLow: c.muted,
      inverseSurface: c.foreground,
      onInverseSurface: c.background,
      shadow: Colors.transparent,
      scrim: Colors.black,
    );

    final textTheme = _buildTextTheme(
      ThemeData(colorScheme: colorScheme, brightness: Brightness.dark).textTheme,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: c.background,
      extensions: const [AppColors.dark, VietnameseAccentTokens.dark],
      appBarTheme: AppBarTheme(
        backgroundColor: c.background,
        foregroundColor: c.foreground,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.beVietnamPro(
          fontSize: AppTypography.titleMedium,
          fontWeight: FontWeight.w600,
          color: c.foreground,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: c.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          side: BorderSide(color: c.border, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.card,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.inputBorder, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.inputBorder, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.error, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: c.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        hintStyle: GoogleFonts.beVietnamPro(
          color: c.mutedForeground,
          fontSize: AppTypography.bodyMedium,
        ),
        labelStyle: GoogleFonts.beVietnamPro(
          color: c.mutedForeground,
          fontSize: AppTypography.bodySmall,
        ),
      ),
      dividerTheme: DividerThemeData(
        color: c.border,
        thickness: 1,
        space: 1,
      ),
      dividerColor: c.border,
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: c.card,
        selectedItemColor: c.primary,
        unselectedItemColor: c.mutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: c.card,
        elevation: 0,
        indicatorColor: c.primary.withValues(alpha: 0.15),
        surfaceTintColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.fromMap(
          {
            WidgetState.selected: GoogleFonts.beVietnamPro(
              fontSize: AppTypography.caption,
              fontWeight: FontWeight.w600,
              color: c.primary,
            ),
            WidgetState.any: GoogleFonts.beVietnamPro(
              fontSize: AppTypography.caption,
              color: c.mutedForeground,
            ),
          },
        ),
        iconTheme: WidgetStateProperty.fromMap(
          {
            WidgetState.selected: IconThemeData(color: c.primary, size: 24),
            WidgetState.any: IconThemeData(color: c.mutedForeground, size: 24),
          },
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        elevation: 0,
        backgroundColor: c.primary,
        foregroundColor: c.primaryForeground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: c.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(color: c.border, width: 1),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: c.foreground,
        contentTextStyle: GoogleFonts.beVietnamPro(
          color: c.background,
          fontSize: AppTypography.bodyMedium,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        elevation: 0,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: c.muted,
        selectedColor: c.primary.withValues(alpha: 0.15),
        labelStyle: GoogleFonts.beVietnamPro(
          fontSize: AppTypography.caption,
          color: c.foreground,
        ),
        side: BorderSide(color: c.border, width: 1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        elevation: 0,
        pressElevation: 0,
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: c.primary,
        inactiveTrackColor: c.muted,
        thumbColor: c.primary,
        overlayColor: c.primary.withValues(alpha: 0.15),
        trackHeight: 4,
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: c.primary,
        linearTrackColor: c.muted,
        circularTrackColor: c.muted,
      ),
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xs,
        ),
      ),
    );
  }
}
