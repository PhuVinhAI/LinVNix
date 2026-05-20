import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          color: c.primary.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.translate_rounded,
                          size: 52,
                          color: c.primary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      Text(
                        'LinVNix',
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.headlineLarge,
                          fontWeight: FontWeight.w700,
                          color: c.foreground,
                          height: 1.2,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'Learn Vietnamese',
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.bodyLarge,
                          color: c.mutedForeground,
                          height: 1.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
              child: SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: c.primary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
