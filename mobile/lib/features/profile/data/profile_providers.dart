import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/providers.dart';
import '../../user/domain/user_profile.dart';
import '../domain/exercise_stats.dart';

class UserProfileNotifier extends AsyncNotifier<UserProfile> {
  @override
  Future<UserProfile> build() async {
    final repository = ref.read(userRepositoryProvider);
    final data = await repository.getMe();
    return UserProfile.fromJson(data);
  }

  Future<void> updateProfile({
    String? fullName,
    String? nativeLanguage,
    String? currentLevel,
    String? preferredDialect,
    String? avatarUrl,
  }) async {
    final repository = ref.read(userRepositoryProvider);
    final data = <String, dynamic>{};
    if (fullName != null) data['fullName'] = fullName;
    if (nativeLanguage != null) data['nativeLanguage'] = nativeLanguage;
    if (currentLevel != null) data['currentLevel'] = currentLevel;
    if (preferredDialect != null) data['preferredDialect'] = preferredDialect;
    if (avatarUrl != null) data['avatarUrl'] = avatarUrl;

    final updated = await repository.updateMe(data);
    state = AsyncData(UserProfile.fromJson(updated));
  }
}

final userProfileProvider =
    AsyncNotifierProvider<UserProfileNotifier, UserProfile>(
  UserProfileNotifier.new,
);

class ExerciseStatsNotifier extends AsyncNotifier<ExerciseStats> {
  @override
  Future<ExerciseStats> build() async {
    final repository = ref.read(userRepositoryProvider);
    final data = await repository.getMyStats();
    return ExerciseStats.fromJson(data);
  }
}

final exerciseStatsProvider =
    AsyncNotifierProvider<ExerciseStatsNotifier, ExerciseStats>(
  ExerciseStatsNotifier.new,
);
