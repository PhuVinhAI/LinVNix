import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/data/route_match.dart';
import 'package:linvnix/features/assistant/data/screen_context_provider.dart';
import 'package:linvnix/features/bookmarks/data/bookmark_providers.dart';
import 'package:linvnix/features/bookmarks/domain/bookmark_models.dart';
import 'package:linvnix/features/profile/data/profile_providers.dart';
import 'package:linvnix/features/profile/domain/exercise_stats.dart';
import 'package:linvnix/features/user/domain/user_profile.dart';

class _StubUserProfile extends UserProfileNotifier {
  _StubUserProfile(this._profile);

  final UserProfile _profile;

  @override
  Future<UserProfile> build() async => _profile;
}

class _StubExerciseStats extends ExerciseStatsNotifier {
  _StubExerciseStats(this._stats);

  final ExerciseStats _stats;

  @override
  Future<ExerciseStats> build() async => _stats;
}

class _StubBookmarkStats extends BookmarkStatsNotifier {
  _StubBookmarkStats(this._stats);

  final BookmarkStats _stats;

  @override
  Future<BookmarkStats> build() async => _stats;
}

void main() {
  group('profileScreenContextBuilder', () {
    test('produces profile context with stats', () async {
      const profile = UserProfile(
        id: 'user-1',
        email: 'learner@example.com',
        fullName: 'Alex',
        currentLevel: 'A1',
        preferredDialect: 'northern',
        nativeLanguage: 'en',
      );
      const exerciseStats = ExerciseStats(
        totalExercises: 100,
        completedExercises: 40,
        correctAnswers: 35,
        accuracy: 87.5,
        totalTimeSpent: 3600,
      );
      final bookmarkStats = BookmarkStats(
        total: 12,
        byPartOfSpeech: {'noun': 8, 'verb': 4},
      );

      final container = ProviderContainer(
        overrides: [
          userProfileProvider.overrideWith(() => _StubUserProfile(profile)),
          exerciseStatsProvider
              .overrideWith(() => _StubExerciseStats(exerciseStats)),
          bookmarkStatsProvider
              .overrideWith(() => _StubBookmarkStats(bookmarkStats)),
        ],
      );
      addTearDown(container.dispose);

      await container.read(userProfileProvider.future);
      await container.read(exerciseStatsProvider.future);
      await container.read(bookmarkStatsProvider.future);

      container.read(currentRouteMatchProvider.notifier).update(
            const RouteMatch(routePattern: '/profile', location: '/profile'),
          );

      final ctx = container.read(currentScreenContextProvider);

      expect(ctx.data['screenType'], 'profile');
      expect(ctx.data['status'], 'data');
      expect(ctx.displayName, contains('Alex'));

      final profileSummary = ctx.data['profile'] as Map<String, dynamic>;
      expect(profileSummary['fullName'], 'Alex');
      expect(profileSummary['currentLevel'], 'A1');

      final stats = ctx.data['exerciseStats'] as Map<String, dynamic>;
      expect(stats['completedExercises'], 40);

      final vocabStats = ctx.data['bookmarkStats'] as Map<String, dynamic>;
      expect(vocabStats['total'], 12);
    });

    test('returns loading snapshot while profile is pending', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(currentRouteMatchProvider.notifier).update(
            const RouteMatch(routePattern: '/profile', location: '/profile'),
          );

      final ctx = container.read(currentScreenContextProvider);

      expect(ctx.data['screenType'], 'profile');
      expect(ctx.data['status'], 'loading');
      expect(ctx.data.containsKey('uiSnapshot'), isFalse);
    });
  });
}
