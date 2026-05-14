import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  PreferencesService(this._prefs);
  final SharedPreferences _prefs;

  static const _themeModeKey = 'theme_mode';

  Future<void> clearAll() async {
    await _prefs.clear();
  }

  int get dailyGoal => _prefs.getInt('daily_goal') ?? 20;

  Future<void> setDailyGoal(int goal) =>
      _prefs.setInt('daily_goal', goal);

  ThemeMode get themeMode {
    final value = _prefs.getString(_themeModeKey);
    switch (value) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) {
    final value = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      _ => 'system',
    };
    return _prefs.setString(_themeModeKey, value);
  }
}
