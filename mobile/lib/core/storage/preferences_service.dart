import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  PreferencesService(this._prefs);
  final SharedPreferences _prefs;

  static const _onboardingCompletedKey = 'onboarding_completed';
  static const _dailyGoalKey = 'daily_goal';

  bool get isOnboardingCompleted =>
      _prefs.getBool(_onboardingCompletedKey) ?? false;

  Future<void> setOnboardingCompleted() =>
      _prefs.setBool(_onboardingCompletedKey, true);

  int get dailyGoal => _prefs.getInt(_dailyGoalKey) ?? 20;

  Future<void> setDailyGoal(int goal) =>
      _prefs.setInt(_dailyGoalKey, goal);
}
