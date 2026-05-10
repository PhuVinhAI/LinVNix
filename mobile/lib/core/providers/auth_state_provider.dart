import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';

class AuthNotifier extends Notifier<bool> {
  @override
  bool build() {
    _checkAuth();
    return false;
  }

  Future<void> _checkAuth() async {
    final storage = ref.read(secureStorageProvider);
    state = await storage.hasToken;
  }

  void setAuthenticated(bool value) {
    state = value;
  }

  Future<void> logout() async {
    final storage = ref.read(secureStorageProvider);
    await storage.clearTokens();
    state = false;
  }
}

final authStateProvider = NotifierProvider<AuthNotifier, bool>(
  AuthNotifier.new,
);
