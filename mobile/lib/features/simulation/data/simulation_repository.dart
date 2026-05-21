import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/scenario_category.dart';

class SimulationRepository {
  SimulationRepository(this._dio);
  final Dio _dio;

  Future<List<ScenarioCategory>> listCategories() async {
    try {
      final response = await _dio.get<List<dynamic>>('/simulations/categories');
      return (response.data as List<dynamic>)
          .map((e) => ScenarioCategory.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
