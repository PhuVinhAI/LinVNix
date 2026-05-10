import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/review_models.dart';

class ReviewRepository {
  ReviewRepository(this._dio);
  final Dio _dio;

  Future<ReviewResult> submitReview({
    required String vocabularyId,
    required Rating rating,
    DateTime? reviewDate,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/vocabularies/$vocabularyId/review',
        data: {
          'rating': rating.value,
          if (reviewDate != null) 'reviewDate': reviewDate.toIso8601String(),
        },
      );
      return ReviewResult.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<Map<String, dynamic>> submitBatchReview({
    required List<({String vocabularyId, Rating rating})> reviews,
    DateTime? reviewDate,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/vocabularies/review/batch',
        data: {
          'reviews': reviews
              .map((r) => {
                    'vocabularyId': r.vocabularyId,
                    'rating': r.rating.value,
                  })
              .toList(),
          if (reviewDate != null) 'reviewDate': reviewDate.toIso8601String(),
        },
      );
      return response.data!;
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<UserVocabulary> addToLearning(String vocabularyId) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/vocabularies/$vocabularyId/learn',
      );
      return UserVocabulary.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
