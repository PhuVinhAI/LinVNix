import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/providers/auth_state_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/auth_action_skeleton.dart';
import '../widgets/otp_code_input.dart';

class EmailVerificationScreen extends ConsumerStatefulWidget {
  const EmailVerificationScreen({super.key, this.email});

  final String? email;

  @override
  ConsumerState<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends ConsumerState<EmailVerificationScreen> {
  String _code = '';
  bool _isVerifying = false;
  bool _isVerified = false;
  String? _errorMessage;

  Future<void> _verifyCode() async {
    if (_code.length != 6) return;

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.verifyEmailCode(
        email: widget.email ?? '',
        code: _code,
      );

      final storage = ref.read(secureStorageProvider);
      await storage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      ref.read(authStateProvider.notifier).notifyAuthenticated(true);
      setState(() => _isVerified = true);
    } on AppException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (_) {
      setState(() => _errorMessage = S.of(context).authVerificationFailed);
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  Future<void> _resendCode() async {
    if (widget.email == null) return;

    try {
      final dio = ref.read(dioProvider);
      await dio.post('/auth/resend-verification', data: {'email': widget.email});
      if (mounted) {
        AppToast.show(context, message: S.of(context).authVerificationCodeSent, type: AppToastType.success);
      }
    } catch (_) {
      if (mounted) {
        AppToast.show(context, message: S.of(context).authResendCodeFailed, type: AppToastType.error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = AppTheme.colors(context);
    final s = S.of(context);

    return Scaffold(
      appBar: AppAppBar(title: Text(s.authEmailVerification)),
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
                  s.authVerifyingCode,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: c.mutedForeground,
                  ),
                  textAlign: TextAlign.center,
                ),
              ] else if (_isVerified) ...[
                const SizedBox(height: AppSpacing.xxxl),
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: c.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                    ),
                    child: Icon(
                      Icons.check_rounded,
                      size: 36,
                      color: c.success,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  s.authEmailVerified,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  s.authEmailVerifiedSuccess,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: c.mutedForeground,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xxl),
                AppButton(
                  variant: AppButtonVariant.primary,
                  isFullWidth: true,
                  onPressed: () => context.go('/'),
                  label: s.authContinueHome,
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
                      Icons.mark_email_read_outlined,
                      size: 32,
                      color: c.primary,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  s.authCheckEmail,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '${s.authResetCodeDescription}\n${widget.email ?? 'your email'}',
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
                  label: s.authVerify,
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      s.authDidNotReceiveCode,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: c.mutedForeground,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    AppButton(
                      variant: AppButtonVariant.text,
                      onPressed: _resendCode,
                      label: s.authResend,
                    ),
                  ],
                ),
              ],
            ],
          ),
          ),
        ),
      ),
    );
  }
}
