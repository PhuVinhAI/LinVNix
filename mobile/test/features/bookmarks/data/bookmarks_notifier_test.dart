import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:mocktail/mocktail.dart';
import 'package:linvnix/features/bookmarks/data/bookmark_providers.dart';
import 'package:linvnix/features/bookmarks/domain/bookmark_models.dart';
import 'package:linvnix/core/providers/providers.dart';

class MockDio extends Mock implements Dio {}

void main() {
  late MockDio mockDio;

  setUp(() {
    mockDio = MockDio();
    registerFallbackValue(RequestOptions(path: ''));
  });

  group('BookmarksNotifier', () {
    test('loads initial page', () async {
      when(() => mockDio.get<Map<String, dynamic>>(
            '/vocabularies/bookmarks',
            queryParameters: any(named: 'queryParameters'),
          )).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: '/vocabularies/bookmarks'),
          statusCode: 200,
          data: {
            'items': [
              {
                'id': 'b1',
                'vocabularyId': 'v1',
                'word': 'con mèo',
                'translation': 'cat',
                'bookmarkedAt': '2026-01-01T00:00:00.000Z',
              },
            ],
            'page': 1,
            'limit': 20,
            'totalPages': 1,
            'totalItems': 1,
          },
        ),
      );

      final container = ProviderContainer(
        overrides: [
          dioProvider.overrideWithValue(mockDio),
        ],
      );

      final result = await container.read(bookmarksProvider.future);
      expect(result.items, hasLength(1));
      expect(result.items[0].word, 'con mèo');
      expect(result.totalItems, 1);
    });

    test('toggleBookmark removes item when unbookmarked', () async {
      when(() => mockDio.get<Map<String, dynamic>>(
            '/vocabularies/bookmarks',
            queryParameters: any(named: 'queryParameters'),
          )).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: '/vocabularies/bookmarks'),
          statusCode: 200,
          data: {
            'items': [
              {
                'id': 'b1',
                'vocabularyId': 'v1',
                'word': 'con mèo',
                'translation': 'cat',
                'bookmarkedAt': '2026-01-01T00:00:00.000Z',
              },
              {
                'id': 'b2',
                'vocabularyId': 'v2',
                'word': 'con chó',
                'translation': 'dog',
                'bookmarkedAt': '2026-01-02T00:00:00.000Z',
              },
            ],
            'page': 1,
            'limit': 20,
            'totalPages': 1,
            'totalItems': 2,
          },
        ),
      );

      when(() => mockDio.post<Map<String, dynamic>>(
            '/vocabularies/v1/bookmark',
          )).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: '/vocabularies/v1/bookmark'),
          statusCode: 200,
          data: {'isBookmarked': false},
        ),
      );

      final container = ProviderContainer(
        overrides: [
          dioProvider.overrideWithValue(mockDio),
        ],
      );

      await container.read(bookmarksProvider.future);
      final isBookmarked =
          await container.read(bookmarksProvider.notifier).toggleBookmark('v1');
      expect(isBookmarked, false);

      final updated = container.read(bookmarksProvider).value;
      expect(updated!.items, hasLength(1));
      expect(updated.items[0].vocabularyId, 'v2');
      expect(updated.totalItems, 1);
    });

    test('toggleBookmark keeps item when bookmarked', () async {
      when(() => mockDio.get<Map<String, dynamic>>(
            '/vocabularies/bookmarks',
            queryParameters: any(named: 'queryParameters'),
          )).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: '/vocabularies/bookmarks'),
          statusCode: 200,
          data: {
            'items': [
              {
                'id': 'b1',
                'vocabularyId': 'v1',
                'word': 'con mèo',
                'translation': 'cat',
                'bookmarkedAt': '2026-01-01T00:00:00.000Z',
              },
            ],
            'page': 1,
            'limit': 20,
            'totalPages': 1,
            'totalItems': 1,
          },
        ),
      );

      when(() => mockDio.post<Map<String, dynamic>>(
            '/vocabularies/v1/bookmark',
          )).thenAnswer(
        (_) async => Response(
          requestOptions: RequestOptions(path: '/vocabularies/v1/bookmark'),
          statusCode: 201,
          data: {'isBookmarked': true},
        ),
      );

      final container = ProviderContainer(
        overrides: [
          dioProvider.overrideWithValue(mockDio),
        ],
      );

      await container.read(bookmarksProvider.future);
      final isBookmarked =
          await container.read(bookmarksProvider.notifier).toggleBookmark('v1');
      expect(isBookmarked, true);

      final updated = container.read(bookmarksProvider).value;
      expect(updated!.items, hasLength(1));
    });

    test('refresh resets and reloads', () async {
      int callCount = 0;
      when(() => mockDio.get<Map<String, dynamic>>(
            '/vocabularies/bookmarks',
            queryParameters: any(named: 'queryParameters'),
          )).thenAnswer((_) async {
        callCount++;
        return Response(
          requestOptions: RequestOptions(path: '/vocabularies/bookmarks'),
          statusCode: 200,
          data: {
            'items': [
              {
                'id': 'b1',
                'vocabularyId': 'v1',
                'word': 'con mèo $callCount',
                'translation': 'cat',
                'bookmarkedAt': '2026-01-01T00:00:00.000Z',
              },
            ],
            'page': 1,
            'limit': 20,
            'totalPages': 1,
            'totalItems': 1,
          },
        );
      });

      final container = ProviderContainer(
        overrides: [
          dioProvider.overrideWithValue(mockDio),
        ],
      );

      await container.read(bookmarksProvider.future);
      expect(callCount, 1);

      await container.read(bookmarksProvider.notifier).refresh();
      final result = await container.read(bookmarksProvider.future);
      expect(result.items[0].word, 'con mèo 2');
    });
  });

  group('bookmarkSortProvider', () {
    test('defaults to newest', () {
      final container = ProviderContainer();
      expect(container.read(bookmarkSortProvider), BookmarkSort.newest);
    });
  });

  group('bookmarkSearchProvider', () {
    test('defaults to null', () {
      final container = ProviderContainer();
      expect(container.read(bookmarkSearchProvider), isNull);
    });
  });
}
