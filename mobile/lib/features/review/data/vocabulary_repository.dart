import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/review_models.dart';

class VocabularyRepository {
  VocabularyRepository(this._dio);
  final Dio _dio;

  Future<List<DueReviewItem>> getDueForReview() async {
    try {
      final response = await _dio.get<List<dynamic>>('/vocabularies/due-review');
      return (response.data as List<dynamic>)
          .map((e) => DueReviewItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<List<UserVocabulary>> getMyVocabularies({int? page, int? limit}) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/vocabularies/my-vocabularies',
        queryParameters: {
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return (response.data as List<dynamic>)
          .map((e) => UserVocabulary.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<List<Vocabulary>> searchVocabularies(String query, {int? page, int? limit}) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/vocabularies/search',
        queryParameters: {
          'q': query,
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return (response.data as List<dynamic>)
          .map((e) => Vocabulary.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
