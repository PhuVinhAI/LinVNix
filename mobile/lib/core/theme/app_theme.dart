import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const _brandSeedColor = Color(0xFFE53935);

class VietnameseAccentTokens extends ThemeExtension<VietnameseAccentTokens> {
  const VietnameseAccentTokens({
    required this.accentPrimary,
    required this.accentSecondary,
    required this.toneHigh,
    required this.toneMid,
    required this.toneLow,
    required this.diacriticColor,
  });

  final Color accentPrimary;
  final Color accentSecondary;
  final Color toneHigh;
  final Color toneMid;
  final Color toneLow;
  final Color diacriticColor;

  @override
  VietnameseAccentTokens copyWith({
    Color? accentPrimary,
    Color? accentSecondary,
    Color? toneHigh,
    Color? toneMid,
    Color? toneLow,
    Color? diacriticColor,
  }) {
    return VietnameseAccentTokens(
      accentPrimary: accentPrimary ?? this.accentPrimary,
      accentSecondary: accentSecondary ?? this.accentSecondary,
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
      accentPrimary: Color.lerp(accentPrimary, other.accentPrimary, t)!,
      accentSecondary: Color.lerp(accentSecondary, other.accentSecondary, t)!,
      toneHigh: Color.lerp(toneHigh, other.toneHigh, t)!,
      toneMid: Color.lerp(toneMid, other.toneMid, t)!,
      toneLow: Color.lerp(toneLow, other.toneLow, t)!,
      diacriticColor: Color.lerp(diacriticColor, other.diacriticColor, t)!,
    );
  }

  static const light = VietnameseAccentTokens(
    accentPrimary: Color(0xFFE53935),
    accentSecondary: Color(0xFFFF8F00),
    toneHigh: Color(0xFFD32F2F),
    toneMid: Color(0xFFF57C00),
    toneLow: Color(0xFF388E3C),
    diacriticColor: Color(0xFF1565C0),
  );

  static const dark = VietnameseAccentTokens(
    accentPrimary: Color(0xFFEF5350),
    accentSecondary: Color(0xFFFFB300),
    toneHigh: Color(0xFFEF5350),
    toneMid: Color(0xFFFFA726),
    toneLow: Color(0xFF66BB6A),
    diacriticColor: Color(0xFF42A5F5),
  );
}

TextTheme _buildVietnameseTextTheme(TextTheme base) {
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

  static ThemeData light() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _brandSeedColor,
      brightness: Brightness.light,
    );
    final textTheme = _buildVietnameseTextTheme(
      ThemeData(colorScheme: colorScheme).textTheme,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      extensions: const [VietnameseAccentTokens.light],
    );
  }

  static ThemeData dark() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _brandSeedColor,
      brightness: Brightness.dark,
    );
    final textTheme = _buildVietnameseTextTheme(
      ThemeData(colorScheme: colorScheme, brightness: Brightness.dark).textTheme,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      extensions: const [VietnameseAccentTokens.dark],
    );
  }
}
