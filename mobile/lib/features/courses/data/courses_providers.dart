import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/sync/sync.dart';
import '../../../core/providers/providers.dart';
import '../data/courses_repository.dart';
import '../domain/course_models.dart';

part 'courses_providers.g.dart';

final coursesRepositoryProvider = Provider<CoursesRepository>((ref) {
  return CoursesRepository(ref.watch(dioProvider));
});

class CoursesNotifier extends CachedRepository<List<Course>> {
  @override
  Duration get ttl => const Duration(minutes: 30);

  @override
  Future<List<Course>> fetchFromApi() async {
    final repo = ref.read(coursesRepositoryProvider);
    return repo.getPublishedCourses();
  }
}

final coursesProvider = AsyncNotifierProvider<CoursesNotifier, List<Course>>(
  CoursesNotifier.new,
);

@riverpod
class CourseDetail extends _$CourseDetail {
  Course? _cachedData;
  DateTime? _lastFetchedAt;
  static const _ttl = Duration(minutes: 30);

  @override
  Future<Course> build(String id) async {
    final now = DateTime.now();
    if (_cachedData != null &&
        _lastFetchedAt != null &&
        now.difference(_lastFetchedAt!) < _ttl) {
      return _cachedData!;
    }
    final repo = ref.read(coursesRepositoryProvider);
    final data = await repo.getCourseById(id);
    _cachedData = data;
    _lastFetchedAt = now;
    return data;
  }

  Future<void> refresh() async {
    _lastFetchedAt = null;
    ref.invalidateSelf();
  }
}

@riverpod
class ModuleDetail extends _$ModuleDetail {
  CourseModule? _cachedData;
  DateTime? _lastFetchedAt;
  static const _ttl = Duration(minutes: 30);

  @override
  Future<CourseModule> build(String id) async {
    final now = DateTime.now();
    if (_cachedData != null &&
        _lastFetchedAt != null &&
        now.difference(_lastFetchedAt!) < _ttl) {
      return _cachedData!;
    }
    final repo = ref.read(coursesRepositoryProvider);
    final data = await repo.getModuleById(id);
    _cachedData = data;
    _lastFetchedAt = now;
    return data;
  }

  Future<void> refresh() async {
    _lastFetchedAt = null;
    ref.invalidateSelf();
  }
}

class UserProgressNotifier extends CachedRepository<List<UserProgress>>
    with DataChangeBusSubscriber<List<UserProgress>> {
  @override
  Duration get ttl => const Duration(minutes: 1);

  @override
  Future<List<UserProgress>> fetchFromApi() async {
    final repo = ref.read(coursesRepositoryProvider);
    return repo.getUserProgress();
  }

  @override
  Future<List<UserProgress>> build() async {
    watchTags({'progress'});
    return super.build();
  }
}

final userProgressProvider =
    AsyncNotifierProvider<UserProgressNotifier, List<UserProgress>>(
  UserProgressNotifier.new,
);
