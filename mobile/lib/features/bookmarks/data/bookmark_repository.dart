import 'package:dio/dio.dart';
import '../../../core/network/exception_mapper.dart';
import '../domain/bookmark_models.dart';

class BookmarkRepository {
  BookmarkRepository(this._dio);
  final Dio _dio;

  Future<BookmarkStats> getBookmarkStats() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/vocabularies/bookmarks/stats',
      );
      return BookmarkStats.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<bool> toggleBookmark(String vocabularyId) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/vocabularies/$vocabularyId/bookmark',
      );
      return response.data!['isBookmarked'] as bool;
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<BookmarksPage> getBookmarks({
    int page = 1,
    int limit = 20,
    String? search,
    BookmarkSort sort = BookmarkSort.newest,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/vocabularies/bookmarks',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (search != null) 'search': search,
          'sort': sort.value,
        },
      );
      return BookmarksPage.fromJson(response.data!);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
