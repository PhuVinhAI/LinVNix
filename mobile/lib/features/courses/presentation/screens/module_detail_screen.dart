import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../data/courses_providers.dart';
import '../../domain/course_models.dart';

class ModuleDetailScreen extends ConsumerWidget {
  const ModuleDetailScreen({super.key, required this.moduleId});
  final String moduleId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final moduleAsync = ref.watch(moduleDetailProvider(moduleId));
    final progressAsync = ref.watch(userProgressProvider);

    return Scaffold(
      body: moduleAsync.when(
        loading: () => const _ModuleDetailLoading(),
        error: (error, stack) => _ModuleDetailError(
          onRetry: () => ref.invalidate(moduleDetailProvider(moduleId)),
        ),
        data: (module) => _ModuleDetailContent(
          module: module,
          progressMap: _buildProgressMap(progressAsync),
        ),
      ),
    );
  }

  Map<String, UserProgress> _buildProgressMap(
      AsyncValue<List<UserProgress>> progressAsync) {
    return progressAsync.whenOrNull(
          data: (progressList) {
            return {
              for (final p in progressList) p.lessonId: p,
            };
          },
        ) ??
        {};
  }
}

class _ModuleDetailContent extends StatelessWidget {
  const _ModuleDetailContent({
    required this.module,
    required this.progressMap,
  });
  final CourseModule module;
  final Map<String, UserProgress> progressMap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          title: Text(module.title),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (module.topic != null) ...[
                  Chip(
                    label: Text(module.topic!),
                    backgroundColor: theme.colorScheme.primaryContainer,
                    labelStyle: TextStyle(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                Text(
                  module.description,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                if (module.estimatedHours != null) ...[
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${module.estimatedHours}h estimated',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
                if (module.course != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.school,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        module.course!.title,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 24),
                Text(
                  'Lessons',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final lesson = module.lessons[index];
              final progress = progressMap[lesson.id];
              return _LessonCard(lesson: lesson, progress: progress);
            },
            childCount: module.lessons.length,
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 16)),
      ],
    );
  }
}

class _LessonCard extends StatelessWidget {
  const _LessonCard({required this.lesson, this.progress});
  final Lesson lesson;
  final UserProgress? progress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = _getStatusColor(progress?.status);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        onTap: () => context.push('/lessons/${lesson.id}'),
        leading: _LessonTypeIcon(lessonType: lesson.lessonType),
        title: Row(
          children: [
            Expanded(
              child: Text(
                lesson.title,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            if (lesson.isAssessment)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiaryContainer,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Quiz',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onTertiaryContainer,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(
              lesson.description,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                if (lesson.estimatedDuration != null) ...[
                  Icon(
                    Icons.access_time,
                    size: 12,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    _formatDuration(lesson.estimatedDuration!),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Icon(
                  _getStatusIcon(progress?.status),
                  size: 14,
                  color: statusColor,
                ),
                const SizedBox(width: 4),
                Text(
                  _getStatusLabel(progress?.status),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(int minutes) {
    if (minutes < 60) return '${minutes}m';
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m > 0 ? '${h}h ${m}m' : '${h}h';
  }

  Color _getStatusColor(String? status) {
    return switch (status) {
      'completed' => const Color(0xFF4CAF50),
      'in_progress' => const Color(0xFFFFC107),
      _ => const Color(0xFF9E9E9E),
    };
  }

  IconData _getStatusIcon(String? status) {
    return switch (status) {
      'completed' => Icons.check_circle,
      'in_progress' => Icons.play_circle,
      _ => Icons.radio_button_unchecked,
    };
  }

  String _getStatusLabel(String? status) {
    return switch (status) {
      'completed' => 'Completed',
      'in_progress' => 'In Progress',
      _ => 'Not Started',
    };
  }
}

class _LessonTypeIcon extends StatelessWidget {
  const _LessonTypeIcon({required this.lessonType});
  final String lessonType;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = theme.colorScheme.primaryContainer;
    final onColor = theme.colorScheme.onPrimaryContainer;

    return CircleAvatar(
      backgroundColor: color,
      radius: 20,
      child: Icon(
        _getIcon(),
        size: 20,
        color: onColor,
      ),
    );
  }

  IconData _getIcon() {
    return switch (lessonType) {
      'vocabulary' => Icons.abc,
      'grammar' => Icons.menu_book,
      'reading' => Icons.article,
      'listening' => Icons.headphones,
      'speaking' => Icons.mic,
      'writing' => Icons.edit,
      'pronunciation' => Icons.record_voice_over,
      'culture' => Icons.public,
      _ => Icons.school,
    };
  }
}

class _ModuleDetailLoading extends StatelessWidget {
  const _ModuleDetailLoading();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          title: Shimmer.fromColors(
            baseColor: colorScheme.surfaceContainerHighest,
            highlightColor: colorScheme.surfaceContainerHigh,
            child: Container(
              height: 20,
              width: 200,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Shimmer.fromColors(
                  baseColor: colorScheme.surfaceContainerHighest,
                  highlightColor: colorScheme.surfaceContainerHigh,
                  child: Container(
                    height: 16,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Shimmer.fromColors(
                  baseColor: colorScheme.surfaceContainerHighest,
                  highlightColor: colorScheme.surfaceContainerHigh,
                  child: Container(
                    height: 16,
                    width: 250,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Shimmer.fromColors(
                  baseColor: colorScheme.surfaceContainerHighest,
                  highlightColor: colorScheme.surfaceContainerHigh,
                  child: Container(
                    height: 24,
                    width: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ListTile(
                  leading: Shimmer.fromColors(
                    baseColor: colorScheme.surfaceContainerHighest,
                    highlightColor: colorScheme.surfaceContainerHigh,
                    child: const CircleAvatar(backgroundColor: Colors.white),
                  ),
                  title: Shimmer.fromColors(
                    baseColor: colorScheme.surfaceContainerHighest,
                    highlightColor: colorScheme.surfaceContainerHigh,
                    child: Container(
                      height: 16,
                      width: 150,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  subtitle: Shimmer.fromColors(
                    baseColor: colorScheme.surfaceContainerHighest,
                    highlightColor: colorScheme.surfaceContainerHigh,
                    child: Container(
                      height: 12,
                      width: 200,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              );
            },
            childCount: 5,
          ),
        ),
      ],
    );
  }
}

class _ModuleDetailError extends StatelessWidget {
  const _ModuleDetailError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Module')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('Failed to load module'),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
