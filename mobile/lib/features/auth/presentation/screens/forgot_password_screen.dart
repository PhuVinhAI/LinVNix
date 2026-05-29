import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.forgotPassword(email: _emailController.text.trim());
      if (mounted) {
        context.push(
            '/reset-password-otp?email=${_emailController.text.trim()}');
      }
    } on AppException catch (e) {
      if (mounted) {
        AppToast.show(context, message: e.message, type: AppToastType.error);
      }
    } catch (_) {
      if (mounted) {
        AppToast.show(context, message: S.of(context).unexpectedErrorMessage, type: AppToastType.error);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = AppTheme.colors(context);
    final s = S.of(context);

    return Scaffold(
      appBar: AppAppBar(title: Text(s.authForgotPassword)),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: AppSpacing.xl,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Icon
                  Center(
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: c.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                      ),
                      child: Icon(
                        Icons.lock_reset_outlined,
                        size: 32,
                        color: c.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  // Title
                  Text(
                    s.authResetPassword,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  // Description
                  Text(
                    s.authResetPasswordDescription,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: c.mutedForeground,
                      height: 1.5,
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                // Email input
                AppInput(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  label: s.emailLabel,
                  prefixIcon: const Icon(Icons.email_outlined),
                  hint: s.authResetPasswordDescription,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return s.authEmailRequired;
                    }
                    if (!value.contains('@')) {
                      return s.authEmailInvalid;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppSpacing.xl),
                // Submit button
                AppButton(
                  variant: AppButtonVariant.primary,
                  isFullWidth: true,
                  onPressed: _isLoading ? null : _handleSubmit,
                  isLoading: _isLoading,
                  label: s.authSendResetCode,
                ),
                const SizedBox(height: AppSpacing.md),
                // Back link
                AppButton(
                  variant: AppButtonVariant.text,
                  isFullWidth: true,
                  onPressed: () => context.pop(),
                  label: s.authBackToSignIn,
                ),
              ],
            ),
          ),
          ),
        ),
      ),
    );
  }
}
