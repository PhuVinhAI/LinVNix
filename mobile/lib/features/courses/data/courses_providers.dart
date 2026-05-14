import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/sync/sync.dart';
import '../../../core/providers/providers.dart';
import '../data/courses_repository.dart';
import '../domain/course_models.dart';

final coursesRepositoryProvider = Provider<CoursesRepository>((ref) {
  return CoursesRepository(ref.watch(dioProvider));
});

final coursesProvider = FutureProvider<List<Course>>((ref) async {
  final repo = ref.watch(coursesRepositoryProvider);
  return repo.getPublishedCourses();
});

final courseDetailProvider = FutureProvider.family<Course, String>((ref, id) async {
  final repo = ref.watch(coursesRepositoryProvider);
  return repo.getCourseById(id);
});

final moduleDetailProvider = FutureProvider.family<CourseModule, String>((ref, id) async {
  final repo = ref.watch(coursesRepositoryProvider);
  return repo.getModuleById(id);
});

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
