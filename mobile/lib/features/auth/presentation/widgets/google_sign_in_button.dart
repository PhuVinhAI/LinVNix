import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';

class GoogleSignInButton extends StatefulWidget {
  const GoogleSignInButton({
    required this.onSuccess,
    super.key,
    this.enabled = true,
  });

  final void Function(String idToken) onSuccess;
  final bool enabled;

  @override
  State<GoogleSignInButton> createState() => _GoogleSignInButtonState();
}

class _GoogleSignInButtonState extends State<GoogleSignInButton> {
  bool _isLoading = false;

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    try {
      final account = await GoogleSignIn.instance.authenticate();
      final auth = account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        throw Exception('Failed to obtain Google ID token');
      }
      widget.onSuccess(idToken);
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled ||
          e.code == GoogleSignInExceptionCode.interrupted) {
      } else if (mounted) {
        AppToast.show(context, message: 'Google Sign-In failed: ${e.description}', type: AppToastType.error);
      }
    } catch (e) {
      if (mounted) {
        AppToast.show(context, message: 'Google Sign-In failed: $e', type: AppToastType.error);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final isEnabled = widget.enabled && !_isLoading;

    return GestureDetector(
      onTap: isEnabled ? _handleGoogleSignIn : null,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isEnabled ? Colors.white : c.muted,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(
            color: isEnabled ? const Color(0xFF747775) : Colors.transparent,
            width: 1,
          ),
          boxShadow: isEnabled
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: _isLoading
            ? SizedBox(
                height: 24,
                child: Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: c.mutedForeground,
                  ),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  FaIcon(
                    FontAwesomeIcons.google,
                    size: 20,
                    color: isEnabled ? const Color(0xFF1F1F1F) : c.mutedForeground,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Sign in with Google',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                          color: isEnabled
                              ? const Color(0xFF1F1F1F)
                              : c.mutedForeground,
                          fontFamily: 'Roboto',
                        ),
                  ),
                ],
              ),
      ),
    );
  }
}
