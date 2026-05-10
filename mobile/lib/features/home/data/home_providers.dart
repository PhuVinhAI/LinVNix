import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../courses/data/courses_providers.dart';
import '../../courses/domain/course_models.dart';

final continueLearningProvider = FutureProvider<ContinueLearning?>((ref) async {
  final progressList = await ref.watch(userProgressProvider.future);

  if (progressList.isEmpty) return null;

  final sorted = List<UserProgress>.of(progressList)
    ..sort((a, b) {
      final aDate = a.lastAccessedAt ?? a.completedAt;
      final bDate = b.lastAccessedAt ?? b.completedAt;
      if (aDate == null && bDate == null) return 0;
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return bDate.compareTo(aDate);
    });

  final inProgress = sorted.where((p) => p.status == 'IN_PROGRESS').firstOrNull;
  if (inProgress != null && inProgress.lesson != null) {
    return ContinueLearning(
      lessonId: inProgress.lessonId,
      lessonTitle: inProgress.lesson!.title,
      status: ContinueLearningStatus.inProgress,
    );
  }

  final completed = sorted.where((p) => p.status == 'COMPLETED').firstOrNull;
  if (completed != null && completed.lesson != null) {
    return ContinueLearning(
      lessonId: completed.lessonId,
      lessonTitle: completed.lesson!.title,
      status: ContinueLearningStatus.completed,
    );
  }

  return null;
});

enum ContinueLearningStatus { inProgress, completed }

class ContinueLearning {
  const ContinueLearning({
    required this.lessonId,
    required this.lessonTitle,
    required this.status,
  });

  final String lessonId;
  final String lessonTitle;
  final ContinueLearningStatus status;
}
