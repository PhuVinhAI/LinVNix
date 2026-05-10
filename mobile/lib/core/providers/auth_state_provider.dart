import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import '../../features/profile/data/profile_providers.dart';

class AuthNotifier extends Notifier<bool> {
  @override
  bool build() {
    final apiClient = ref.read(apiClientProvider);
    apiClient.onAuthFailure = () => setAuthenticated(false);
    _checkAuth();
    return false;
  }

  Future<void> _checkAuth() async {
    final storage = ref.read(secureStorageProvider);
    final hasTokens = await storage.hasToken;
    if (!hasTokens) {
      state = false;
      return;
    }

    // Try to validate by refreshing tokens
    try {
      final refreshToken = await storage.getRefreshToken();
      if (refreshToken == null) {
        state = false;
        return;
      }

      final repository = ref.read(authRepositoryProvider);
      final tokenResponse = await repository.refreshToken(
        refreshToken: refreshToken,
      );
      await storage.saveTokens(
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      );
      state = true;
    } catch (_) {
      await storage.clearTokens();
      state = false;
    }
  }

  void setAuthenticated(bool value) {
    state = value;
  }

  Future<void> logout() async {
    final storage = ref.read(secureStorageProvider);
    final refreshToken = await storage.getRefreshToken();

    // Try to revoke refresh token server-side
    if (refreshToken != null) {
      try {
        final repository = ref.read(authRepositoryProvider);
        await repository.logout(refreshToken: refreshToken);
      } catch (_) {
        // Ignore server errors on logout - clear local tokens anyway
      }
    }

    await storage.clearTokens();

    // Clear user-specific SharedPreferences (onboarding, daily goal)
    try {
      final prefs = await ref.read(preferencesProvider.future);
      await prefs.clearOnboardingState();
    } catch (_) {}

    // Reset onboarding provider
    ref.read(onboardingCompletedProvider.notifier).reset();

    // Invalidate cached user data providers so they re-fetch for next login
    ref.invalidate(userProfileProvider);
    ref.invalidate(exerciseStatsProvider);

    state = false;
  }
}

final authStateProvider = NotifierProvider<AuthNotifier, bool>(
  AuthNotifier.new,
);
