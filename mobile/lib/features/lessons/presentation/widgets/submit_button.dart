import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';

class SubmitButton extends StatelessWidget {
  const SubmitButton({
    super.key,
    required this.isEnabled,
    required this.isLoading,
    required this.onPressed,
  });

  final bool isEnabled;
  final bool isLoading;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: 'Submit',
      onPressed: isEnabled ? onPressed : null,
      isLoading: isLoading,
      isFullWidth: true,
    );
  }
}
