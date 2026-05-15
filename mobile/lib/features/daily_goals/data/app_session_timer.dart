import 'dart:async';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'daily_goal_progress_providers.dart';

final appSessionMinutesProvider = Provider<int>((ref) {
  final timer = ref.watch(appSessionTimerProvider);
  return timer.accumulatedMinutes;
});

final appSessionTimerProvider = Provider<AppSessionTimer>((ref) {
  final timer = AppSessionTimer(ref);
  ref.onDispose(() => timer.dispose());
  return timer;
});

class AppSessionTimer {
  AppSessionTimer(this._ref);

  final Ref _ref;
  DateTime? _sessionStart;
  int _accumulatedSeconds = 0;
  String? _lastDate;
  Timer? _syncTimer;

  int get accumulatedMinutes => _accumulatedSeconds ~/ 60;

  String _getVnDate() {
    final now = DateTime.now();
    return now.toUtc().add(const Duration(hours: 7)).toString().substring(0, 10);
  }

  void onAppResumed() {
    final today = _getVnDate();

    if (_lastDate != null && _lastDate != today) {
      _accumulatedSeconds = 0;
    }

    _lastDate = today;
    _sessionStart = DateTime.now();

    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(minutes: 1), (_) {
      _accumulateAndSync();
    });
  }

  void onAppPaused() {
    _accumulate();
    _syncTimer?.cancel();
    _syncTimer = null;
    _syncStudyMinutes();
    _sessionStart = null;
  }

  void _accumulate() {
    if (_sessionStart == null) return;
    final elapsed = DateTime.now().difference(_sessionStart!).inSeconds;
    _accumulatedSeconds += elapsed;
    _sessionStart = DateTime.now();
  }

  void _accumulateAndSync() {
    _accumulate();
    _syncStudyMinutes();
  }

  void _syncStudyMinutes() {
    final minutes = accumulatedMinutes;
    SchedulerBinding.instance.addPostFrameCallback((_) {
      try {
        _ref.read(dailyGoalProgressProvider.notifier).syncStudyMinutes(minutes);
      } catch (_) {}
    });
  }

  void dispose() {
    _syncTimer?.cancel();
  }
}
