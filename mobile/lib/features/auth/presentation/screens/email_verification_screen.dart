import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';

class EmailVerificationScreen extends ConsumerStatefulWidget {
  const EmailVerificationScreen({super.key, this.token});

  final String? token;

  @override
  ConsumerState<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends ConsumerState<EmailVerificationScreen> {
  bool _isVerifying = false;
  bool _isVerified = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.token != null) {
      _verifyEmail(widget.token!);
    }
  }

  Future<void> _verifyEmail(String token) async {
    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.verifyEmail(token: token);
      setState(() => _isVerified = true);
    } on AppException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (_) {
      setState(() => _errorMessage = 'Verification failed');
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email Verification'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isVerifying) ...[
                const CircularProgressIndicator(),
                const SizedBox(height: 24),
                const Text('Verifying your email...'),
              ] else if (_isVerified) ...[
                const Icon(
                  Icons.check_circle_outline,
                  size: 64,
                  color: Colors.green,
                ),
                const SizedBox(height: 24),
                Text(
                  'Email verified successfully!',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                FilledButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Continue to Home'),
                ),
              ] else if (widget.token == null) ...[
                const Icon(
                  Icons.email_outlined,
                  size: 64,
                ),
                const SizedBox(height: 24),
                Text(
                  'Check your email',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'We sent a verification link to your email address. '
                  'Click the link to verify your account.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                FilledButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Continue to Home'),
                ),
              ] else ...[
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 24),
                Text(
                  _errorMessage ?? 'Verification failed',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                FilledButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Continue to Home'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
