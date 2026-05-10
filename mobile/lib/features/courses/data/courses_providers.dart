import 'package:flutter_riverpod/flutter_riverpod.dart';
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

final userProgressProvider = FutureProvider<List<UserProgress>>((ref) async {
  final repo = ref.watch(coursesRepositoryProvider);
  return repo.getUserProgress();
});
