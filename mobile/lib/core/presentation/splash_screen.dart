import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      backgroundColor: c.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.language,
              size: 64,
              color: c.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'LinVNix',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: c.primary,
                  ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: c.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
