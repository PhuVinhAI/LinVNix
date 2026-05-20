import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../widgets/auth_action_skeleton.dart';
import '../widgets/otp_code_input.dart';

class ResetPasswordOtpScreen extends ConsumerStatefulWidget {
  const ResetPasswordOtpScreen({
    super.key,
    required this.email,
    this.fromSettings = false,
  });

  final String email;
  final bool fromSettings;

  @override
  ConsumerState<ResetPasswordOtpScreen> createState() =>
      _ResetPasswordOtpScreenState();
}

class _ResetPasswordOtpScreenState
    extends ConsumerState<ResetPasswordOtpScreen> {
  String _code = '';
  bool _isVerifying = false;
  String? _errorMessage;

  Future<void> _verifyCode() async {
    if (_code.length != 6) return;

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.verifyResetCode(
        email: widget.email,
        code: _code,
      );

      if (mounted) {
        final from = widget.fromSettings ? '&from=settings' : '';
        context.push('/reset-password?token=${response.resetToken}$from');
      }
    } on AppException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (_) {
      setState(() => _errorMessage = 'Verification failed');
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  Future<void> _resendCode() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.forgotPassword(email: widget.email);
      if (mounted) {
        AppToast.show(context, message: 'A new reset code has been sent', type: AppToastType.success);
      }
    } catch (_) {
      if (mounted) {
        AppToast.show(context, message: 'Failed to resend code', type: AppToastType.error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: const AppAppBar(title: Text('Reset Password')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: AppSpacing.xl,
            ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_isVerifying) ...[
                const SizedBox(height: AppSpacing.xxxl),
                const AuthActionSkeleton(),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  'Verifying code...',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: c.mutedForeground,
                  ),
                  textAlign: TextAlign.center,
                ),
              ] else ...[
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
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
                Text(
                  'Enter reset code',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'We sent a 6-digit code to\n${widget.email}',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: c.mutedForeground,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                AutofillGroup(
                  child: OtpCodeInput(
                    onChanged: (code) => setState(() => _code = code),
                    onCompleted: (_) => _verifyCode(),
                  ),
                ),
                if (_errorMessage != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    _errorMessage!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: c.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  variant: AppButtonVariant.primary,
                  isFullWidth: true,
                  onPressed: _code.length == 6 ? _verifyCode : null,
                  label: 'Verify Code',
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Didn\'t receive a code?',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: c.mutedForeground,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    AppButton(
                      variant: AppButtonVariant.text,
                      onPressed: _resendCode,
                      label: 'Resend',
                    ),
                  ],
                ),
                if (!widget.fromSettings) ...[
                  const SizedBox(height: AppSpacing.xs),
                  AppButton(
                    variant: AppButtonVariant.text,
                    isFullWidth: true,
                    onPressed: () => context.go('/login'),
                    label: 'Back to Sign In',
                  ),
                ],
              ],
            ],
          ),
          ),
        ),
      ),
    );
  }
}
