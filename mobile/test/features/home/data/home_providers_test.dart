import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:linvnix/features/home/data/home_providers.dart';
import 'package:linvnix/features/courses/data/courses_providers.dart';
import 'package:linvnix/features/courses/domain/course_models.dart';

void main() {
  group('continueLearningProvider', () {
    test('returns null when no progress exists', () async {
      final container = ProviderContainer(
        overrides: [
          userProgressProvider.overrideWithValue(const AsyncValue.data([])),
        ],
      );

      final result = await container.read(continueLearningProvider.future);
      expect(result, isNull);
    });

    test('returns IN_PROGRESS lesson when available', () async {
      final progressList = [
        UserProgress(
          id: 'p1',
          status: 'COMPLETED',
          lessonId: 'l1',
          completedAt: DateTime(2024, 1, 10),
          lesson: Lesson(
            id: 'l1',
            title: 'Lesson 1',
            description: 'First lesson',
            lessonType: 'content',
            orderIndex: 0,
            moduleId: 'm1',
          ),
        ),
        UserProgress(
          id: 'p2',
          status: 'IN_PROGRESS',
          lessonId: 'l2',
          lastAccessedAt: DateTime(2024, 1, 15),
          lesson: Lesson(
            id: 'l2',
            title: 'Lesson 2',
            description: 'Second lesson',
            lessonType: 'content',
            orderIndex: 1,
            moduleId: 'm1',
          ),
        ),
      ];

      final container = ProviderContainer(
        overrides: [
          userProgressProvider.overrideWithValue(
            AsyncValue.data(progressList),
          ),
        ],
      );

      final result = await container.read(continueLearningProvider.future);
      expect(result, isNotNull);
      expect(result!.lessonId, 'l2');
      expect(result.lessonTitle, 'Lesson 2');
      expect(result.status, ContinueLearningStatus.inProgress);
    });

    test('falls back to latest COMPLETED when no IN_PROGRESS', () async {
      final progressList = [
        UserProgress(
          id: 'p1',
          status: 'COMPLETED',
          lessonId: 'l1',
          completedAt: DateTime(2024, 1, 5),
          lastAccessedAt: DateTime(2024, 1, 5),
          lesson: Lesson(
            id: 'l1',
            title: 'Lesson 1',
            description: 'First lesson',
            lessonType: 'content',
            orderIndex: 0,
            moduleId: 'm1',
          ),
        ),
        UserProgress(
          id: 'p2',
          status: 'COMPLETED',
          lessonId: 'l2',
          completedAt: DateTime(2024, 1, 15),
          lastAccessedAt: DateTime(2024, 1, 15),
          lesson: Lesson(
            id: 'l2',
            title: 'Lesson 2',
            description: 'Second lesson',
            lessonType: 'content',
            orderIndex: 1,
            moduleId: 'm1',
          ),
        ),
      ];

      final container = ProviderContainer(
        overrides: [
          userProgressProvider.overrideWithValue(
            AsyncValue.data(progressList),
          ),
        ],
      );

      final result = await container.read(continueLearningProvider.future);
      expect(result, isNotNull);
      expect(result!.lessonId, 'l2');
      expect(result.lessonTitle, 'Lesson 2');
      expect(result.status, ContinueLearningStatus.completed);
    });

    test('returns null when progress exists but lesson is null', () async {
      final progressList = [
        UserProgress(
          id: 'p1',
          status: 'IN_PROGRESS',
          lessonId: 'l1',
        ),
      ];

      final container = ProviderContainer(
        overrides: [
          userProgressProvider.overrideWithValue(
            AsyncValue.data(progressList),
          ),
        ],
      );

      final result = await container.read(continueLearningProvider.future);
      expect(result, isNull);
    });

    test('prefers most recent IN_PROGRESS over older ones', () async {
      final progressList = [
        UserProgress(
          id: 'p1',
          status: 'IN_PROGRESS',
          lessonId: 'l1',
          lastAccessedAt: DateTime(2024, 1, 5),
          lesson: Lesson(
            id: 'l1',
            title: 'Older Lesson',
            description: '',
            lessonType: 'content',
            orderIndex: 0,
            moduleId: 'm1',
          ),
        ),
        UserProgress(
          id: 'p2',
          status: 'IN_PROGRESS',
          lessonId: 'l2',
          lastAccessedAt: DateTime(2024, 1, 15),
          lesson: Lesson(
            id: 'l2',
            title: 'Newer Lesson',
            description: '',
            lessonType: 'content',
            orderIndex: 1,
            moduleId: 'm1',
          ),
        ),
      ];

      final container = ProviderContainer(
        overrides: [
          userProgressProvider.overrideWithValue(
            AsyncValue.data(progressList),
          ),
        ],
      );

      final result = await container.read(continueLearningProvider.future);
      expect(result, isNotNull);
      expect(result!.lessonId, 'l2');
      expect(result.lessonTitle, 'Newer Lesson');
    });

    test('prefers IN_PROGRESS over COMPLETED even if COMPLETED is newer',
        () async {
      final progressList = [
        UserProgress(
          id: 'p1',
          status: 'COMPLETED',
          lessonId: 'l1',
          completedAt: DateTime(2024, 1, 20),
          lastAccessedAt: DateTime(2024, 1, 20),
          lesson: Lesson(
            id: 'l1',
            title: 'Newer Completed',
            description: '',
            lessonType: 'content',
            orderIndex: 0,
            moduleId: 'm1',
          ),
        ),
        UserProgress(
          id: 'p2',
          status: 'IN_PROGRESS',
          lessonId: 'l2',
          lastAccessedAt: DateTime(2024, 1, 10),
          lesson: Lesson(
            id: 'l2',
            title: 'Older In Progress',
            description: '',
            lessonType: 'content',
            orderIndex: 1,
            moduleId: 'm1',
          ),
        ),
      ];

      final container = ProviderContainer(
        overrides: [
          userProgressProvider.overrideWithValue(
            AsyncValue.data(progressList),
          ),
        ],
      );

      final result = await container.read(continueLearningProvider.future);
      expect(result, isNotNull);
      expect(result!.lessonId, 'l2');
      expect(result.status, ContinueLearningStatus.inProgress);
    });
  });
}
