import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/daily_goal_models.dart';

class DailyGoalsRepository {
  DailyGoalsRepository(this._dio);
  final Dio _dio;

  Future<List<DailyGoal>> getGoals() async {
    try {
      final response = await _dio.get<List<dynamic>>('/daily-goals');
      return (response.data as List<dynamic>)
          .map((e) => DailyGoal.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<DailyGoal> createGoal(GoalType goalType, int targetValue) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/daily-goals',
        data: {
          'goalType': goalType.value,
          'targetValue': targetValue,
        },
      );
      return DailyGoal.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<DailyGoal> updateGoal(String id, int targetValue) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/daily-goals/$id',
        data: {'targetValue': targetValue},
      );
      return DailyGoal.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<void> deleteGoal(String id) async {
    try {
      await _dio.delete('/daily-goals/$id');
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
