import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/providers.dart';
import '../../../profile/data/profile_providers.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _currentStep = 0;
  String? _selectedLevel;
  String? _selectedDialect;
  int _dailyGoal = 20;
  bool _isSubmitting = false;

  static const _levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  static const _dialects = [
    _DialectOption('STANDARD', 'Standard', 'Chuẩn chung'),
    _DialectOption('NORTHERN', 'Northern', 'Miền Bắc (Hà Nội)'),
    _DialectOption('CENTRAL', 'Central', 'Miền Trung (Huế, Đà Nẵng)'),
    _DialectOption('SOUTHERN', 'Southern', 'Miền Nam (Sài Gòn)'),
  ];

  bool get _canProceed {
    switch (_currentStep) {
      case 0:
        return _selectedLevel != null;
      case 1:
        return _selectedDialect != null;
      case 2:
        return true;
      default:
        return false;
    }
  }

  void _nextStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submit();
    }
  }

  void _skipStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);

    try {
      final updateData = <String, dynamic>{
        'onboardingCompleted': true,
      };
      if (_selectedLevel != null) {
        updateData['currentLevel'] = _selectedLevel;
      }
      if (_selectedDialect != null) {
        updateData['preferredDialect'] = _selectedDialect;
      }

      final repository = ref.read(userRepositoryProvider);
      await repository.updateMe(updateData);

      final prefs = await ref.read(preferencesProvider.future);
      await prefs.setDailyGoal(_dailyGoal);
      await prefs.setOnboardingCompleted();

      ref.read(onboardingCompletedProvider.notifier).markCompleted();

      // Invalidate profile so router reads fresh onboardingCompleted from server
      ref.invalidate(userProfileProvider);

      if (mounted) {
        context.go('/');
      }
    } on AppException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('An unexpected error occurred'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: _ProgressIndicator(
                currentStep: _currentStep,
                totalSteps: 3,
              ),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (index) {
                  setState(() => _currentStep = index);
                },
                children: [
                  _LevelStep(
                    levels: _levels,
                    selected: _selectedLevel,
                    onSelect: (level) {
                      setState(() => _selectedLevel = level);
                    },
                  ),
                  _DialectStep(
                    dialects: _dialects,
                    selected: _selectedDialect,
                    onSelect: (dialect) {
                      setState(() => _selectedDialect = dialect);
                    },
                  ),
                  _DailyGoalStep(
                    goal: _dailyGoal,
                    onChanged: (value) {
                      setState(() => _dailyGoal = value);
                    },
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  TextButton(
                    onPressed: _isSubmitting ? null : _skipStep,
                    child: Text(_currentStep < 2 ? 'Skip' : 'Skip All'),
                  ),
                  const Spacer(),
                  FilledButton(
                    onPressed: (_canProceed && !_isSubmitting)
                        ? _nextStep
                        : null,
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(_currentStep < 2 ? 'Next' : 'Get Started'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressIndicator extends StatelessWidget {
  const _ProgressIndicator({
    required this.currentStep,
    required this.totalSteps,
  });

  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(totalSteps, (index) {
        final isActive = index <= currentStep;
        return Expanded(
          child: Container(
            height: 4,
            margin: EdgeInsets.only(right: index < totalSteps - 1 ? 8 : 0),
            decoration: BoxDecoration(
              color: isActive
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }
}

class _LevelStep extends StatelessWidget {
  const _LevelStep({
    required this.levels,
    required this.selected,
    required this.onSelect,
  });

  final List<String> levels;
  final String? selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "What's your current level?",
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Select the level that best describes your Vietnamese proficiency.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.5,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: levels.length,
              itemBuilder: (context, index) {
                final level = levels[index];
                final isSelected = level == selected;
                return _SelectableCard(
                  label: level,
                  subtitle: _levelSubtitle(level),
                  isSelected: isSelected,
                  onTap: () => onSelect(level),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  static String _levelSubtitle(String level) {
    return switch (level) {
      'A1' => 'Beginner',
      'A2' => 'Elementary',
      'B1' => 'Intermediate',
      'B2' => 'Upper Intermediate',
      'C1' => 'Advanced',
      'C2' => 'Proficient',
      _ => '',
    };
  }
}

class _DialectStep extends StatelessWidget {
  const _DialectStep({
    required this.dialects,
    required this.selected,
    required this.onSelect,
  });

  final List<_DialectOption> dialects;
  final String? selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Which dialect do you prefer?',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Choose the Vietnamese dialect you want to focus on.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 32),
          ...dialects.map((dialect) {
            final isSelected = dialect.value == selected;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _SelectableCard(
                label: dialect.label,
                subtitle: dialect.description,
                isSelected: isSelected,
                onTap: () => onSelect(dialect.value),
                isWide: true,
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _DailyGoalStep extends StatelessWidget {
  const _DailyGoalStep({
    required this.goal,
    required this.onChanged,
  });

  final int goal;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Set your daily goal',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'How many words do you want to review each day? You can change this later.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 48),
          Center(
            child: Text(
              '$goal',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
          ),
          const SizedBox(height: 8),
          Center(
            child: Text(
              'words per day',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ),
          const SizedBox(height: 32),
          Slider(
            value: goal.toDouble(),
            min: 5,
            max: 50,
            divisions: 9,
            label: '$goal',
            onChanged: (value) => onChanged(value.round()),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('5', style: Theme.of(context).textTheme.bodySmall),
              Text('50', style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ],
      ),
    );
  }
}

class _SelectableCard extends StatelessWidget {
  const _SelectableCard({
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.subtitle,
    this.isWide = false,
  });

  final String label;
  final String? subtitle;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isWide;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Material(
      color: isSelected
          ? colorScheme.primaryContainer
          : colorScheme.surfaceContainerHigh,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? colorScheme.primary
                  : colorScheme.outlineVariant,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: isWide
              ? Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            label,
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: isSelected
                                      ? colorScheme.onPrimaryContainer
                                      : colorScheme.onSurface,
                                ),
                          ),
                          if (subtitle != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              subtitle!,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: isSelected
                                        ? colorScheme.onPrimaryContainer
                                        : colorScheme.onSurfaceVariant,
                                  ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (isSelected)
                      Icon(
                        Icons.check_circle,
                        color: colorScheme.primary,
                      ),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      label,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isSelected
                                ? colorScheme.onPrimaryContainer
                                : colorScheme.onSurface,
                          ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        subtitle!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: isSelected
                                  ? colorScheme.onPrimaryContainer
                                  : colorScheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}

class _DialectOption {
  const _DialectOption(this.value, this.label, this.description);
  final String value;
  final String label;
  final String description;
}
