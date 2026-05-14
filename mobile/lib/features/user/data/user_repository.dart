import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../../lessons/domain/exercise_models.dart';

class UserRepository {
  UserRepository(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getMe() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/users/me');
      return response.data!;
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<Map<String, dynamic>> updateMe(Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/users/me',
        data: data,
      );
      return response.data!;
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<Map<String, dynamic>> getMyStats() async {
    try {
      final response =
          await _dio.get<Map<String, dynamic>>('/exercises/my-stats');
      return response.data!;
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<List<ExerciseSubmissionResult>> getMyResults() async {
    try {
      final response =
          await _dio.get<List<dynamic>>('/exercises/my-results');
      return (response.data as List<dynamic>)
          .map((e) =>
              ExerciseSubmissionResult.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
