import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/providers/auth_state_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../profile/data/profile_providers.dart';

class EmailVerificationScreen extends ConsumerStatefulWidget {
  const EmailVerificationScreen({super.key, this.email});

  final String? email;

  @override
  ConsumerState<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends ConsumerState<EmailVerificationScreen> {
  final List<TextEditingController> _codeControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isVerifying = false;
  bool _isVerified = false;
  String? _errorMessage;

  @override
  void dispose() {
    for (final c in _codeControllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _code => _codeControllers.map((c) => c.text).join();

  Future<void> _verifyCode() async {
    final code = _code;
    if (code.length != 6) return;

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(authRepositoryProvider);
      final response = await repository.verifyEmailCode(
        email: widget.email ?? '',
        code: code,
      );

      final storage = ref.read(secureStorageProvider);
      await storage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      ref.invalidate(userProfileProvider);
      ref.invalidate(exerciseStatsProvider);

      ref.read(authStateProvider.notifier).setAuthenticated(true);
      setState(() => _isVerified = true);
    } on AppException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (_) {
      setState(() => _errorMessage = 'Verification failed');
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
        AppToast.show(context, message: 'A new verification code has been sent', type: AppToastType.success);
      }
    } catch (_) {
      if (mounted) {
        AppToast.show(context, message: 'Failed to resend code', type: AppToastType.error);
      }
    }
  }

  void _onChanged(String value, int index) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    if (_code.length == 6) {
      _verifyCode();
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: const AppAppBar(title: Text('Email Verification')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_isVerifying) ...[
                  const AppSpinner(size: 24),
                  const SizedBox(height: 24),
                  const Text('Verifying your email...'),
                ] else if (_isVerified) ...[
                  Icon(
                    Icons.check_circle_outline,
                    size: 64,
                    color: c.success,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Email verified successfully!',
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  AppButton(
                    variant: AppButtonVariant.primary,
                    isFullWidth: true,
                    onPressed: () => context.go('/'),
                    label: 'Continue to Home',
                  ),
                ] else ...[
                  const Icon(
                    Icons.mark_email_read_outlined,
                    size: 64,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Enter verification code',
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'We sent a 6-digit code to ${widget.email ?? 'your email'}',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: c.mutedForeground,
                        ),
                  ),
                  const SizedBox(height: 32),
                  _OtpInputRow(
                    controllers: _codeControllers,
                    focusNodes: _focusNodes,
                    onChanged: _onChanged,
                  ),
                  if (_errorMessage != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      style: TextStyle(color: c.error),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 24),
                  AppButton(
                    variant: AppButtonVariant.primary,
                    isFullWidth: true,
                    onPressed: _code.length == 6 ? _verifyCode : null,
                    label: 'Verify',
                  ),
                  const SizedBox(height: 16),
                  AppButton(
                    variant: AppButtonVariant.text,
                    onPressed: _resendCode,
                    label: 'Resend code',
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

class _OtpInputRow extends StatelessWidget {
  const _OtpInputRow({
    required this.controllers,
    required this.focusNodes,
    required this.onChanged,
  });

  final List<TextEditingController> controllers;
  final List<FocusNode> focusNodes;
  final void Function(String value, int index) onChanged;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(6, (index) {
        return Flexible(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: SizedBox(
              height: 52,
              child: KeyboardListener(
                focusNode: FocusNode(),
                onKeyEvent: (event) {
                  if (event is KeyDownEvent &&
                      event.logicalKey == LogicalKeyboardKey.backspace) {
                    if (controllers[index].text.isEmpty && index > 0) {
                      controllers[index - 1].clear();
                      focusNodes[index - 1].requestFocus();
                    }
                  }
                },
                child: TextField(
                  controller: controllers[index],
                  focusNode: focusNodes[index],
                  textAlign: TextAlign.center,
                  textAlignVertical: TextAlignVertical.center,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(1),
                  ],
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        height: 1.0,
                      ),
                  decoration: InputDecoration(
                    counterText: '',
                    contentPadding: EdgeInsets.zero,
                    filled: true,
                    fillColor: c.card,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: BorderSide(color: c.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: BorderSide(color: c.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: BorderSide(color: c.primary, width: 2),
                    ),
                  ),
                  onChanged: (value) => onChanged(value, index),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
