import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
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
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          title: Text(module.title),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (module.topic != null) ...[
                  AppChip(
                    label: module.topic!,
                    color: c.primary,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                ],
                Text(
                  module.description,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: AppSpacing.sm),
                if (module.estimatedHours != null) ...[
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: c.mutedForeground,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        '${module.estimatedHours}h estimated',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: c.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ],
                if (module.course != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Icon(
                        Icons.school,
                        size: 16,
                        color: c.mutedForeground,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        module.course!.title,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: c.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: AppSpacing.xl),
                Text(
                  'Lessons',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
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
        const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),
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
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final statusColor = _getStatusColor(progress?.status, c);

    return AppCard(
      variant: AppCardVariant.outlined,
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 6),
      padding: const EdgeInsets.only(left: 12, right: 4, top: 6, bottom: 6),
      child: AppListItem(
        onTap: () => context.push('/lessons/${lesson.id}'),
        leading: _LessonTypeIcon(lessonType: lesson.lessonType),
        titleWidget: Row(
          children: [
            Expanded(
              child: Text(
                lesson.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            if (lesson.isAssessment)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: c.muted,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text(
                  'Quiz',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: c.foreground,
                  ),
                ),
              ),
          ],
        ),
        subtitleWidget: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lesson.description,
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                if (lesson.estimatedDuration != null) ...[
                  Icon(
                    Icons.access_time,
                    size: 12,
                    color: c.mutedForeground,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    _formatDuration(lesson.estimatedDuration!),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: c.mutedForeground,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                ],
                Icon(
                  _getStatusIcon(progress?.status),
                  size: 14,
                  color: statusColor,
                ),
                const SizedBox(width: AppSpacing.xs),
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

  Color _getStatusColor(String? status, AppColors c) {
    return switch (status) {
      'completed' => c.success,
      'in_progress' => c.warning,
      _ => c.mutedForeground,
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
    final c = AppTheme.colors(context);

    return AppAvatar(
      backgroundColor: c.muted,
      radius: 20,
      child: Icon(
        _getIcon(),
        size: 20,
        color: c.foreground,
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
    final c = AppTheme.colors(context);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          title: Shimmer.fromColors(
            baseColor: c.muted,
            highlightColor: c.card,
            child: Container(
              height: 20,
              width: 200,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Shimmer.fromColors(
                  baseColor: c.muted,
                  highlightColor: c.card,
                  child: Container(
                    height: 16,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Shimmer.fromColors(
                  baseColor: c.muted,
                  highlightColor: c.card,
                  child: Container(
                    height: 16,
                    width: 250,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Shimmer.fromColors(
                  baseColor: c.muted,
                  highlightColor: c.card,
                  child: Container(
                    height: 24,
                    width: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
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
              return AppCard(
                variant: AppCardVariant.outlined,
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 6),
                padding: const EdgeInsets.only(left: 12, right: 4, top: 6, bottom: 6),
                child: AppListItem(
                  leading: Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: AppAvatar(backgroundColor: Colors.white),
                  ),
                  titleWidget: Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      height: 16,
                      width: 150,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ),
                  subtitleWidget: Shimmer.fromColors(
                    baseColor: c.muted,
                    highlightColor: c.card,
                    child: Container(
                      height: 12,
                      width: 200,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
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
    final c = AppTheme.colors(context);

    return Scaffold(
      appBar: AppAppBar(title: const Text('Module')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: c.mutedForeground),
            const SizedBox(height: AppSpacing.lg),
            const Text('Failed to load module'),
            const SizedBox(height: AppSpacing.sm),
            AppButton(
              variant: AppButtonVariant.primary,
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: 'Retry',
            ),
          ],
        ),
      ),
    );
  }
}
