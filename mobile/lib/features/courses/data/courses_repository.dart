import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/course_models.dart';

class CoursesRepository {
  CoursesRepository(this._dio);
  final Dio _dio;

  Future<List<Course>> getPublishedCourses() async {
    try {
      final response = await _dio.get<List<dynamic>>('/courses');
      return (response.data as List<dynamic>)
          .map((e) => Course.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<Course> getCourseById(String id) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/courses/$id');
      return Course.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<CourseModule> getModuleById(String id) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/modules/$id');
      return CourseModule.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<List<UserProgress>> getUserProgress() async {
    try {
      final response = await _dio.get<List<dynamic>>('/progress');
      return (response.data as List<dynamic>)
          .map((e) => UserProgress.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
