import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../data/simulation_providers.dart';
import '../../domain/scenario_category.dart';

class PracticeScreen extends ConsumerWidget {
  const PracticeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(simulationCategoriesProvider);

    return Scaffold(
      appBar: AppAppBar(title: const Text('Practice')),
      body: categoriesAsync.when(
        loading: () => const _CategoriesLoading(),
        error: (error, stack) => _CategoriesError(
          onRetry: () =>
              ref.read(simulationCategoriesProvider.notifier).refresh(),
        ),
        data: (categories) => _PracticeContent(
          categories: categories,
          onRefresh: () =>
              ref.read(simulationCategoriesProvider.notifier).refresh(),
        ),
      ),
    );
  }
}

class _PracticeContent extends StatelessWidget {
  const _PracticeContent({required this.categories, required this.onRefresh});
  final List<ScenarioCategory> categories;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Semantics(
              label: 'No categories icon',
              child: Icon(
                Icons.category_outlined,
                size: 64,
                color: AppTheme.colors(context).mutedForeground,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'No categories yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppTheme.colors(context).mutedForeground,
                  ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            'Danh mục tình huống',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: AppSpacing.md),
          _CategoryGrid(categories: categories),
          const SizedBox(height: AppSpacing.xl),
          Text(
            'All Scenarios',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _CategoryGrid extends StatelessWidget {
  const _CategoryGrid({required this.categories});
  final List<ScenarioCategory> categories;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: AppSpacing.md,
        crossAxisSpacing: AppSpacing.md,
        childAspectRatio: 1.1,
      ),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final category = categories[index];
        return _CategoryCard(category: category);
      },
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.category});
  final ScenarioCategory category;

  IconData _getIconData(String iconName) {
    return switch (iconName) {
      'shopping-cart' => Icons.shopping_cart,
      'restaurant' => Icons.restaurant,
      'medical-services' => Icons.medical_services,
      'directions-car' => Icons.directions_car,
      'home' => Icons.home,
      'work' => Icons.work,
      'school' => Icons.school,
      'flight' => Icons.flight,
      'phone' => Icons.phone,
      'sports' => Icons.sports_soccer,
      'music' => Icons.music_note,
      'pets' => Icons.pets,
      _ => Icons.category,
    };
  }

  Color _parseColor(String hexColor) {
    final hex = hexColor.replaceFirst('#', '');
    if (hex.length == 6) {
      return Color(int.parse('FF$hex', radix: 16));
    }
    if (hex.length == 8) {
      return Color(int.parse(hex, radix: 16));
    }
    return AppColors.light.primary;
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final color = _parseColor(category.color);

    return AppCard(
      variant: AppCardVariant.filled,
      borderRadius: AppRadius.lg,
      padding: const EdgeInsets.all(AppSpacing.md),
      color: color.withValues(alpha: 0.08),
      borderColor: color.withValues(alpha: 0.15),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              _getIconData(category.icon),
              size: 28,
              color: color,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            category.name,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: c.foreground,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _CategoriesLoading extends StatelessWidget {
  const _CategoriesLoading();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Shimmer.fromColors(
          baseColor: c.muted,
          highlightColor: c.card,
          child: Container(
            height: 20,
            width: 160,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: AppSpacing.md,
            crossAxisSpacing: AppSpacing.md,
            childAspectRatio: 1.1,
          ),
          itemCount: 6,
          itemBuilder: (context, index) {
            return Shimmer.fromColors(
              baseColor: c.muted,
              highlightColor: c.card,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: c.border),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      height: 14,
                      width: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _CategoriesError extends StatelessWidget {
  const _CategoriesError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Semantics(
              label: 'Error loading categories',
              child: Icon(Icons.error_outline, size: 64, color: c.error),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Failed to load categories',
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Semantics(
              label: 'Retry loading categories',
              button: true,
              child: AppButton(
                variant: AppButtonVariant.primary,
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: 'Retry',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
