import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key, this.token});

  final String? token;

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _isReset = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    if (!_formKey.currentState!.validate()) return;
    if (widget.token == null) return;

    setState(() => _isLoading = true);

    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.resetPassword(
        token: widget.token!,
        newPassword: _passwordController.text,
      );
      setState(() => _isReset = true);
    } on AppException catch (e) {
      if (mounted) {
        AppToast.show(context, message: e.message, type: AppToastType.error);
      }
    } catch (_) {
      if (mounted) {
        AppToast.show(context, message: 'An unexpected error occurred', type: AppToastType.error);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: const AppAppBar(title: Text('Reset Password')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: _isReset
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      size: 64,
                      color: c.success,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Password reset successfully!',
                      style: Theme.of(context).textTheme.titleLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'You can now sign in with your new password.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    AppButton(
                      variant: AppButtonVariant.primary,
                      isFullWidth: true,
                      onPressed: () => context.go('/login'),
                      label: 'Sign In',
                    ),
                  ],
                )
              : Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Set new password',
                        style: Theme.of(context).textTheme.titleLarge,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      AppInput(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        label: 'New Password',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                          onPressed: () {
                            setState(
                                () => _obscurePassword = !_obscurePassword);
                          },
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password is required';
                          }
                          if (value.length < 8) {
                            return 'Password must be at least 8 characters';
                          }
                          if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)')
                              .hasMatch(value)) {
                            return 'Must contain uppercase, lowercase, and digit';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        controller: _confirmPasswordController,
                        obscureText: _obscureConfirmPassword,
                        label: 'Confirm New Password',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                          onPressed: () {
                            setState(() =>
                                _obscureConfirmPassword =
                                    !_obscureConfirmPassword);
                          },
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please confirm your password';
                          }
                          if (value != _passwordController.text) {
                            return 'Passwords do not match';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 32),
                      AppButton(
                        variant: AppButtonVariant.primary,
                        isFullWidth: true,
                        onPressed: _isLoading ? null : _handleReset,
                        isLoading: _isLoading,
                        label: 'Reset Password',
                      ),
                      const SizedBox(height: 16),
                      AppButton(
                        variant: AppButtonVariant.text,
                        onPressed: () => context.go('/login'),
                        label: 'Back to Sign In',
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
