import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/daily_goal_progress_models.dart';

class DailyGoalProgressRepository {
  DailyGoalProgressRepository(this._dio);
  final Dio _dio;

  Future<DailyGoalProgress> getTodayProgress() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/daily-goals/progress/today',
      );
      return DailyGoalProgress.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
