import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/data/route_match.dart';
import 'package:linvnix/features/assistant/data/screen_context_provider.dart';
import 'package:linvnix/features/lessons/data/lesson_providers.dart';
import 'package:linvnix/features/lessons/domain/exercise_set_models.dart';
import 'package:linvnix/features/lessons/domain/lesson_models.dart';

class _StubExerciseSets extends ExerciseSetsNotifier {
  _StubExerciseSets(super.lessonId, this._summary);

  final LessonExerciseSummary _summary;

  @override
  Future<LessonExerciseSummary> build() async => _summary;
}

class _StubLessonDetail extends LessonDetailNotifier {
  _StubLessonDetail(super.lessonId, this._detail);

  final LessonDetail _detail;

  @override
  Future<LessonDetail> build() async => _detail;
}

void main() {
  group('exerciseHubScreenContextBuilder', () {
    test('produces exerciseHub context with set summaries', () async {
      const lessonId = 'lesson-1';
      const summary = LessonExerciseSummary(
        sets: [
          SetProgress(
            setId: 'set-default',
            title: 'Lesson practice',
            totalExercises: 10,
            attempted: 5,
            percentComplete: 50,
          ),
          SetProgress(
            setId: 'set-custom',
            title: 'Custom drill',
            isCustom: true,
            isAIGenerated: true,
            totalExercises: 8,
          ),
        ],
      );
      const detail = LessonDetail(
        id: lessonId,
        title: 'Greetings',
        description: 'Say hello',
        lessonType: 'vocabulary',
        orderIndex: 0,
        moduleId: 'mod-1',
      );

      final container = ProviderContainer(
        overrides: [
          exerciseSetsProvider(lessonId)
              .overrideWith(() => _StubExerciseSets(lessonId, summary)),
          lessonDetailProvider(lessonId)
              .overrideWith(() => _StubLessonDetail(lessonId, detail)),
        ],
      );
      addTearDown(container.dispose);

      await container.read(exerciseSetsProvider(lessonId).future);
      await container.read(lessonDetailProvider(lessonId).future);

      container.read(currentRouteMatchProvider.notifier).update(
            const RouteMatch(
              routePattern: '/lessons/:id/exercises',
              location: '/lessons/$lessonId/exercises',
              pathParameters: {'id': lessonId},
            ),
          );

      final ctx = container.read(currentScreenContextProvider);

      expect(ctx.data['screenType'], 'exerciseHub');
      expect(ctx.data['status'], 'data');
      expect(ctx.data['lessonId'], lessonId);
      expect(ctx.data['lessonTitle'], 'Greetings');
      expect(ctx.data['defaultSetCount'], 1);
      expect(ctx.data['customSetCount'], 1);
      expect(ctx.displayName, contains('Greetings'));

      final defaultSets = ctx.data['defaultSets'] as List;
      expect(defaultSets.first, containsPair('progressState', 'inProgress'));

      final customSets = ctx.data['customSets'] as List;
      expect(customSets.first, containsPair('isCustom', true));
    });
  });
}
