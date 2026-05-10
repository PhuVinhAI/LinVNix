import 'dart:async';
import 'package:flutter/material.dart';

class TimerBar extends StatefulWidget {
  const TimerBar({
    super.key,
    required this.totalSeconds,
    required this.onTimeout,
  });

  final int totalSeconds;
  final VoidCallback onTimeout;

  @override
  State<TimerBar> createState() => _TimerBarState();
}

class _TimerBarState extends State<TimerBar> {
  late int _remainingSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.totalSeconds;
    _startTimer();
  }

  @override
  void didUpdateWidget(TimerBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.totalSeconds != widget.totalSeconds) {
      _timer?.cancel();
      _remainingSeconds = widget.totalSeconds;
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _remainingSeconds--;
      });
      if (_remainingSeconds <= 0) {
        timer.cancel();
        widget.onTimeout();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = _remainingSeconds / widget.totalSeconds;
    final isLow = _remainingSeconds <= 10;
    final minutes = _remainingSeconds ~/ 60;
    final seconds = _remainingSeconds % 60;

    return Column(
      children: [
        Row(
          children: [
            Icon(
              Icons.timer,
              size: 16,
              color: isLow
                  ? theme.colorScheme.error
                  : theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 4),
            Text(
              '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
              style: theme.textTheme.labelMedium?.copyWith(
                color: isLow
                    ? theme.colorScheme.error
                    : theme.colorScheme.onSurfaceVariant,
                fontWeight: isLow ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: theme.colorScheme.surfaceContainerHighest,
          color: isLow ? theme.colorScheme.error : theme.colorScheme.primary,
          minHeight: 4,
        ),
      ],
    );
  }
}
