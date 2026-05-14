import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/core/sync/sync.dart';
import 'package:linvnix/core/theme/app_theme.dart';
import 'package:linvnix/features/courses/data/courses_providers.dart';
import 'package:linvnix/features/courses/domain/course_models.dart';
import 'package:linvnix/features/courses/presentation/screens/module_detail_screen.dart';
import 'package:linvnix/features/lessons/data/lesson_providers.dart';
import 'package:linvnix/features/lessons/domain/exercise_set_models.dart';

const _testModule = CourseModule(
  id: 'mod-1',
  title: 'Test Module',
  description: 'A test module',
  orderIndex: 1,
  courseId: 'course-1',
  lessons: [
    Lesson(
      id: 'lesson-1',
      title: 'Lesson 1',
      description: 'First lesson',
      lessonType: 'vocabulary',
      orderIndex: 1,
      moduleId: 'mod-1',
    ),
    Lesson(
      id: 'lesson-2',
      title: 'Lesson 2',
      description: 'Second lesson',
      lessonType: 'grammar',
      orderIndex: 2,
      moduleId: 'mod-1',
    ),
  ],
);

class _FakeModuleDetail extends ModuleDetail {
  @override
  Future<CourseModule> build(String id) async => _testModule;
}

class _FakeModuleExerciseSetsNotifier extends ModuleExerciseSetsNotifier {
  final ModuleExerciseSummary _data;

  _FakeModuleExerciseSetsNotifier(String moduleId, this._data)
      : super(moduleId);

  @override
  Future<ModuleExerciseSummary> build() async {
    watchTags({'exercise-set', 'module-$moduleId'});
    return _data;
  }
}

class _FakeUserProgressNotifier extends UserProgressNotifier {
  @override
  Future<List<UserProgress>> build() async => const [];
}

void main() {
  group('ModuleDetailScreen custom practice section', () {
    testWidgets(
        'custom practice section hidden when no lessons completed (eligible=false)',
        (tester) async {
      final notEligibleSummary = const ModuleExerciseSummary(
        eligible: false,
        completedLessonsCount: 0,
        totalLessonsCount: 2,
        moduleSets: [],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            moduleDetailProvider.overrideWith(() => _FakeModuleDetail()),
            moduleExerciseSetsProvider.overrideWith(
              () => _FakeModuleExerciseSetsNotifier('mod-1', notEligibleSummary),
            ),
            userProgressProvider
                .overrideWith(() => _FakeUserProgressNotifier()),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ModuleDetailScreen(moduleId: 'mod-1'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Custom Practice'), findsNothing);
      expect(find.text('0/2 lessons completed'), findsNothing);
      expect(find.text('Create Custom Practice'), findsNothing);
    });

    testWidgets(
        'custom practice section visible with correct progress count when eligible',
        (tester) async {
      final eligibleSummary = const ModuleExerciseSummary(
        eligible: true,
        completedLessonsCount: 1,
        totalLessonsCount: 2,
        moduleSets: [],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            moduleDetailProvider.overrideWith(() => _FakeModuleDetail()),
            moduleExerciseSetsProvider.overrideWith(
              () => _FakeModuleExerciseSetsNotifier('mod-1', eligibleSummary),
            ),
            userProgressProvider
                .overrideWith(() => _FakeUserProgressNotifier()),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ModuleDetailScreen(moduleId: 'mod-1'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Custom Practice'), findsOneWidget);
      expect(find.text('1/2 lessons completed'), findsOneWidget);
      expect(find.text('Create Custom Practice'), findsOneWidget);
    });

    testWidgets(
        'custom practice section shows existing sets when available',
        (tester) async {
      final summaryWithSets = ModuleExerciseSummary(
        eligible: true,
        completedLessonsCount: 2,
        totalLessonsCount: 2,
        moduleSets: [
          SetProgress(
            setId: 'set-1',
            title: 'Module Review',
            description: 'AI-generated review',
            isCustom: true,
            isAIGenerated: true,
            totalExercises: 10,
            attempted: 5,
            correct: 4,
            percentComplete: 50,
            percentCorrect: 80,
          ),
        ],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            moduleDetailProvider.overrideWith(() => _FakeModuleDetail()),
            moduleExerciseSetsProvider.overrideWith(
              () => _FakeModuleExerciseSetsNotifier('mod-1', summaryWithSets),
            ),
            userProgressProvider
                .overrideWith(() => _FakeUserProgressNotifier()),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ModuleDetailScreen(moduleId: 'mod-1'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Custom Practice'), findsOneWidget);
      expect(find.text('2/2 lessons completed'), findsOneWidget);
      expect(find.text('Module Review'), findsOneWidget);
      expect(find.text('AI-generated review'), findsOneWidget);
      expect(find.text('Create Custom Practice'), findsOneWidget);
    });

    testWidgets(
        'custom practice section shows lessons list below it', (tester) async {
      final eligibleSummary = const ModuleExerciseSummary(
        eligible: true,
        completedLessonsCount: 1,
        totalLessonsCount: 2,
        moduleSets: [],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            moduleDetailProvider.overrideWith(() => _FakeModuleDetail()),
            moduleExerciseSetsProvider.overrideWith(
              () => _FakeModuleExerciseSetsNotifier('mod-1', eligibleSummary),
            ),
            userProgressProvider
                .overrideWith(() => _FakeUserProgressNotifier()),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ModuleDetailScreen(moduleId: 'mod-1'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Lessons'), findsOneWidget);
      expect(find.text('Lesson 1'), findsOneWidget);
      expect(find.text('Lesson 2'), findsOneWidget);
    });
  });
}

