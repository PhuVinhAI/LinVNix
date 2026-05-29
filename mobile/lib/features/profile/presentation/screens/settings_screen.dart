import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/constants/app_info.dart';
import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/providers/assistant_bar_provider.dart';
import '../../../../core/providers/auth_state_provider.dart';
import '../../../../core/providers/providers.dart';
import '../../../../core/providers/locale_provider.dart';
import '../../../../core/providers/theme_provider.dart';
import '../../../../core/sync/sync.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../daily_goals/data/notification_service.dart';
import '../../../daily_goals/presentation/widgets/daily_goal_section.dart';
import '../../../lessons/data/lesson_providers.dart';
import '../../../user/domain/user_profile.dart';
import '../../data/profile_providers.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: AppAppBar(title: Text(S.of(context).settingsTitle)),
      body: profileAsync.when(
        loading: () => const _SettingsLoadingSkeleton(),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  S.of(context).failedToLoadSettings,
                  style: Theme.of(context).textTheme.titleMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                AppButton(
                  label: S.of(context).retryButton,
                  variant: AppButtonVariant.outline,
                  onPressed: () =>
                      ref.read(userProfileProvider.notifier).refresh(),
                ),
              ],
            ),
          ),
        ),
        data: (profile) => ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.sm,
          ),
          children: [
            _AccountHeader(profile: profile),
            const SizedBox(height: AppSpacing.lg),
            _SettingsSection(
              title: S.of(context).accountSection,
              children: [
                _SettingsTile(
                  icon: Icons.person_outline,
                  title: S.of(context).editProfileTitle,
                  subtitle: S.of(context).editProfileSubtitle,
                  onTap: () => _showEditProfileDialog(context, ref, profile),
                ),
                _SettingsTile(
                  icon: Icons.lock_outline,
                  title: S.of(context).changePasswordTitle,
                  subtitle: S.of(context).changePasswordSubtitle,
                  onTap: () => _startChangePassword(context, ref, profile),
                ),
                _SettingsTile(
                  icon: Icons.cleaning_services_outlined,
                  title: S.of(context).clearDataTitle,
                  subtitle:
                      S.of(context).clearDataSubtitle,
                  isDestructive: true,
                  onTap: () => _showClearDataDialog(context, ref),
                ),
                _SettingsTile(
                  icon: Icons.delete_forever_outlined,
                  title: S.of(context).deleteAccountTitle,
                  subtitle: S.of(context).permanentlyRemoveAccountData,
                  isDestructive: true,
                  onTap: () => _showDeleteAccountDialog(context, ref),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            const _ThemeSection(),
            const SizedBox(height: AppSpacing.lg),
            const _LanguageSection(),
            const SizedBox(height: AppSpacing.lg),
            const _AssistantBarSection(),
            const SizedBox(height: AppSpacing.lg),
            const DailyGoalSection(),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: S.of(context).logOutLabel,
              variant: AppButtonVariant.outline,
              icon: const Icon(Icons.logout),
              onPressed: () => _showLogoutDialog(context, ref),
            ),
            const SizedBox(height: AppSpacing.lg),
            Center(
              child: Text(
                '$appName v$appVersion',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.colors(context).mutedForeground,
                    ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    AppDialog.show(
      context,
      builder: (ctx) => AppDialog(
        title: S.of(context).logOutLabel,
        content: S.of(context).areYouSureLogOut,
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(ctx),
          ),
          AppDialogAction(
            label: S.of(context).logOutLabel,
            isPrimary: true,
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ref.read(exerciseSessionServiceProvider).clearAll();
              } catch (_) {}
              await ref.read(authStateProvider.notifier).logout();
              if (ctx.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _startChangePassword(
    BuildContext context,
    WidgetRef ref,
    UserProfile profile,
  ) async {
    final confirmed = await AppDialog.show<bool>(
      context,
      builder: (ctx) => AppDialog(
        title: S.of(context).changePasswordTitle,
        content:
            S.of(context).sendVerificationCodeContinueParam(profile.email),
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(ctx, false),
          ),
          AppDialogAction(
            label: S.of(context).authContinueHome,
            isPrimary: true,
            onPressed: () => Navigator.pop(ctx, true),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.forgotPassword(email: profile.email);
      if (context.mounted) {
        context.push(
          '/reset-password-otp?email=${Uri.encodeComponent(profile.email)}&from=settings',
        );
      }
    } on AppException catch (e) {
      if (context.mounted) {
        AppToast.show(context, message: e.message, type: AppToastType.error);
      }
    } catch (_) {
      if (context.mounted) {
        AppToast.show(
          context,
          message: S.of(context).couldNotStartPasswordReset,
          type: AppToastType.error,
        );
      }
    }
  }

  void _showClearDataDialog(BuildContext context, WidgetRef ref) {
    AppDialog.show(
      context,
      builder: (ctx) => AppDialog(
        title: S.of(context).clearDataTitle,
        content:
            S.of(context).clearDataWarningDesc,
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(ctx),
          ),
          AppDialogAction(
            label: S.of(context).deleteData,
            isPrimary: true,
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ref.read(userRepositoryProvider).clearUserData();
                await ref.read(exerciseSessionServiceProvider).clearAll();

                try {
                  final prefs = await ref.read(preferencesProvider.future);
                  await prefs.clearOnboardingState();
                  await prefs.clearLevelUpPromptFlags();
                } catch (_) {}

                try {
                  await NotificationService.cancelDailyReminder();
                } catch (_) {}

                ref.read(onboardingCompletedProvider.notifier).reset();
                ref.read(dataChangeBusProvider.notifier).emit({
                  'auth',
                  'exercise',
                  'progress',
                  'exercise-set',
                  'bookmark',
                  'daily-goal',
                  'simulation',
                  'simulation-results',
                });

                await ref.read(userProfileProvider.notifier).refresh();
                await ref.read(exerciseStatsProvider.notifier).refresh();

                if (context.mounted) {
                  AppToast.show(
                    context,
                    message: S.of(context).allLearningDataDeleted,
                    type: AppToastType.success,
                  );
                  context.go('/onboarding');
                }
              } on AppException catch (e) {
                if (context.mounted) {
                  AppToast.show(
                    context,
                    message: e.message,
                    type: AppToastType.error,
                  );
                }
              } catch (_) {
                if (context.mounted) {
                  AppToast.show(
                    context,
                    message: S.of(context).couldNotClearData,
                    type: AppToastType.error,
                  );
                }
              }
            },
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context, WidgetRef ref) {
    AppDialog.show(
      context,
      builder: (ctx) => AppDialog(
        title: S.of(context).deleteAccountTitle,
        content:
            '${S.of(context).deleteAccountWarningDesc1}${S.of(context).actionCannotBeUndone}',
        actions: [
          AppDialogAction(
            label: S.of(context).cancelButton2,
            onPressed: () => Navigator.pop(ctx),
          ),
          AppDialogAction(
            label: S.of(context).deleteAccountTitle,
            isPrimary: true,
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ref.read(userRepositoryProvider).deleteAccount();
                try {
                  await ref.read(exerciseSessionServiceProvider).clearAll();
                } catch (_) {}
                try {
                  final prefs = await ref.read(preferencesProvider.future);
                  await prefs.clearOnboardingState();
                  await prefs.clearLevelUpPromptFlags();
                } catch (_) {}
                try {
                  await NotificationService.cancelDailyReminder();
                } catch (_) {}
                ref.read(onboardingCompletedProvider.notifier).reset();
                ref.read(dataChangeBusProvider.notifier).emit({
                  'auth',
                  'daily-goal',
                  'bookmark',
                  'exercise',
                  'progress',
                  'exercise-set',
                  'simulation',
                  'simulation-results',
                });
                await ref.read(authStateProvider.notifier).logout();
                if (context.mounted) {
                  AppToast.show(
                    context,
                    message: S.of(context).accountDeletedSuccess,
                    type: AppToastType.success,
                  );
                  context.go('/login');
                }
              } on AppException catch (e) {
                if (context.mounted) {
                  AppToast.show(
                    context,
                    message: e.message,
                    type: AppToastType.error,
                  );
                }
              } catch (_) {
                if (context.mounted) {
                  AppToast.show(
                    context,
                    message: S.of(context).couldNotDeleteAccount,
                    type: AppToastType.error,
                  );
                }
              }
            },
          ),
        ],
      ),
    );
  }

  void _showEditProfileDialog(
    BuildContext context,
    WidgetRef ref,
    UserProfile profile,
  ) {
    final fullNameController = TextEditingController(text: profile.fullName);
    String? selectedLanguage = profile.nativeLanguage;
    String? selectedLevel = profile.currentLevel;
    String? selectedDialect = profile.preferredDialect;

    const languages = [
      'English',
      'Chinese',
      'Japanese',
      'Korean',
      'French',
      'German',
      'Spanish',
      'Vietnamese',
    ];

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const dialects = ['STANDARD', 'NORTHERN', 'CENTRAL', 'SOUTHERN'];

    AppDialog.show(
      context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AppDialog(
          title: S.of(context).editProfileTitle,
          contentWidget: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AppInput(
                  controller: fullNameController,
                  label: S.of(context).nameLabel,
                ),
                const SizedBox(height: 16),
                AppDropdownField<String>(
                  label: S.of(context).nativeLanguageLabel,
                  value: selectedLanguage,
                  items: languages,
                  itemLabelBuilder: (lang) => switch (lang) {
                    'English' => S.of(context).languageEnglish,
                    'Chinese' => S.of(context).languageChinese,
                    'Japanese' => S.of(context).languageJapanese,
                    'Korean' => S.of(context).languageKorean,
                    'French' => S.of(context).languageFrench,
                    'German' => S.of(context).languageGerman,
                    'Spanish' => S.of(context).languageSpanish,
                    'Vietnamese' => S.of(context).languageVietnamese,
                    _ => lang,
                  },
                  onChanged: (value) {
                    setState(() => selectedLanguage = value);
                  },
                ),
                const SizedBox(height: 16),
                AppDropdownField<String>(
                  label: S.of(context).currentLevelLabel,
                  value: selectedLevel,
                  items: levels,
                  onChanged: (value) {
                    setState(() => selectedLevel = value);
                  },
                ),
                const SizedBox(height: 16),
                AppDropdownField<String>(
                  label: S.of(context).preferredDialectLabel,
                  value: selectedDialect,
                  items: dialects,
                  itemLabelBuilder: (val) => formatDialect(context, val),
                  onChanged: (value) {
                    setState(() => selectedDialect = value);
                  },
                ),
              ],
            ),
          ),
          actions: [
            AppDialogAction(
              label: S.of(context).cancelButton2,
              onPressed: () => Navigator.pop(context),
            ),
            AppDialogAction(
              label: S.of(context).saveLabel,
              isPrimary: true,
              onPressed: () async {
                Navigator.pop(context);
                try {
                  await ref.read(userProfileProvider.notifier).updateProfile(
                        fullName: fullNameController.text.trim(),
                        nativeLanguage: selectedLanguage,
                        currentLevel: selectedLevel,
                        preferredDialect: selectedDialect,
                      );
                  if (context.mounted) {
                    AppToast.show(
                      context,
                      message: S.of(context).profileUpdated,
                      type: AppToastType.success,
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    AppToast.show(
                      context,
                      message: S.of(context).failedToUpdateProfileParam(e.toString()),
                      type: AppToastType.error,
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

String formatDialect(BuildContext context, String dialect) {
  switch (dialect) {
    case 'STANDARD':
      return S.of(context).standardDialect;
    case 'NORTHERN':
      return S.of(context).northernDialect;
    case 'CENTRAL':
      return S.of(context).centralDialect;
    case 'SOUTHERN':
      return S.of(context).southernDialect;
    default:
      return dialect;
  }
}

class _SettingsLoadingSkeleton extends StatelessWidget {
  const _SettingsLoadingSkeleton();

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    Widget shimmerBox({
      required double width,
      required double height,
      BorderRadius? borderRadius,
      BoxShape shape = BoxShape.rectangle,
    }) {
      return Shimmer.fromColors(
        baseColor: c.muted,
        highlightColor: c.card,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: shape == BoxShape.circle ? null : borderRadius,
            shape: shape,
          ),
        ),
      );
    }

    Widget settingsTileSkeleton() {
      return Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
        child: Row(
          children: [
            shimmerBox(width: 20, height: 20, borderRadius: BorderRadius.circular(4)),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  shimmerBox(
                    width: 120,
                    height: 14,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  const SizedBox(height: 6),
                  shimmerBox(
                    width: 200,
                    height: 12,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ],
              ),
            ),
            shimmerBox(width: 20, height: 20, borderRadius: BorderRadius.circular(4)),
          ],
        ),
      );
    }

    Widget sectionTitleSkeleton(double width) {
      return shimmerBox(
        width: width,
        height: 14,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      );
    }

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      children: [
        AppCard(
          variant: AppCardVariant.outlined,
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              shimmerBox(width: 56, height: 56, shape: BoxShape.circle),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    shimmerBox(
                      width: 140,
                      height: 16,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    shimmerBox(
                      width: 180,
                      height: 12,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        sectionTitleSkeleton(64),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              settingsTileSkeleton(),
              AppDivider(),
              settingsTileSkeleton(),
              AppDivider(),
              settingsTileSkeleton(),
              AppDivider(),
              settingsTileSkeleton(),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        sectionTitleSkeleton(88),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              Expanded(
                child: shimmerBox(
                  height: 72,
                  width: double.infinity,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: shimmerBox(
                  height: 72,
                  width: double.infinity,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: shimmerBox(
                  height: 72,
                  width: double.infinity,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        sectionTitleSkeleton(72),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: EdgeInsets.zero,
          child: settingsTileSkeleton(),
        ),
        const SizedBox(height: AppSpacing.lg),
        sectionTitleSkeleton(80),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              settingsTileSkeleton(),
              AppDivider(),
              settingsTileSkeleton(),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        shimmerBox(
          width: double.infinity,
          height: 44,
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

class _AccountHeader extends StatelessWidget {
  const _AccountHeader({required this.profile});
  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);

    return AppCard(
      variant: AppCardVariant.outlined,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          AppAvatar(
            radius: 28,
            backgroundColor: c.primary.withValues(alpha: 0.08),
            backgroundImage:
                profile.avatarUrl != null ? NetworkImage(profile.avatarUrl!) : null,
            child: profile.avatarUrl == null
                ? Icon(Icons.person, size: 28, color: c.primary)
                : null,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.fullName,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  profile.email,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: c.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              for (var i = 0; i < children.length; i++) ...[
                if (i > 0) AppDivider(),
                children[i],
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.isDestructive = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final color = isDestructive ? c.error : c.foreground;

    return AppListItem(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      leading: Icon(icon, size: 20, color: isDestructive ? c.error : c.primary),
      titleWidget: Text(
        title,
        style: theme.textTheme.bodyMedium?.copyWith(
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitleWidget: subtitle != null
          ? Text(
              subtitle!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
            )
          : null,
      trailing: Icon(Icons.chevron_right, color: c.mutedForeground, size: 20),
      onTap: onTap,
    );
  }
}

class _ThemeSection extends ConsumerWidget {
  const _ThemeSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentMode = ref.watch(themeModeProvider);

    Future<void> setMode(ThemeMode mode) async {
      await ref.read(themeModeProvider.notifier).setThemeMode(mode);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          S.of(context).appearanceLabel,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              _ThemeBlock(
                icon: Icons.brightness_auto,
                label: S.of(context).systemTheme,
                isSelected: currentMode == ThemeMode.system,
                onTap: () => setMode(ThemeMode.system),
              ),
              const SizedBox(width: AppSpacing.md),
              _ThemeBlock(
                icon: Icons.light_mode,
                label: S.of(context).lightTheme,
                isSelected: currentMode == ThemeMode.light,
                onTap: () => setMode(ThemeMode.light),
              ),
              const SizedBox(width: AppSpacing.md),
              _ThemeBlock(
                icon: Icons.dark_mode,
                label: S.of(context).darkTheme,
                isSelected: currentMode == ThemeMode.dark,
                onTap: () => setMode(ThemeMode.dark),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ThemeBlock extends StatelessWidget {
  const _ThemeBlock({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: isSelected ? c.primary.withValues(alpha: 0.12) : c.muted,
            borderRadius: BorderRadius.circular(AppRadius.xl),
            border: Border.all(
              color: isSelected ? c.primary : c.border,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Icon(
                icon,
                size: 28,
                color: isSelected ? c.primary : c.mutedForeground,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                label,
                style: TextStyle(
                  fontSize: AppTypography.bodySmall,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? c.primary : c.foreground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LanguageSection extends ConsumerWidget {
  const _LanguageSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final languages = [
      ('en', 'English', S.of(context).languageEnglish),
      ('vi', S.of(context).languageVietnamese, S.of(context).languageVietnamese),
      ('zh', '中文', S.of(context).languageChinese),
      ('ja', '日本語', S.of(context).languageJapanese),
      ('ko', '한국어', S.of(context).languageKorean),
      ('fr', 'Français', S.of(context).languageFrench),
      ('es', 'Español', S.of(context).languageSpanish),
      ('de', 'Deutsch', S.of(context).languageGerman),
      ('th', 'ภาษาไทย', S.of(context).languageThai),
    ];

    final theme = Theme.of(context);
    final currentCode = ref.watch(localeProvider)?.languageCode ?? 'en';
    final current = languages.firstWhere(
      (l) => l.$1 == currentCode,
      orElse: () => languages.first,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          S.of(context).languageSection,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: EdgeInsets.zero,
          child: _SettingsTile(
            icon: Icons.translate_outlined,
            title: current.$2,
            subtitle: current.$3,
            onTap: () => _showLanguagePicker(context, ref, currentCode, languages),
          ),
        ),
      ],
    );
  }

  void _showLanguagePicker(
    BuildContext context,
    WidgetRef ref,
    String currentCode,
    List<(String, String, String)> languages,
  ) {
    AppMenuBottomSheet.show(
      context,
      title: S.of(context).languageSection,
      items: languages
          .map(
            (l) => AppMenuBottomSheetItem(
              label: l.$2,
              sublabel: l.$3,
              isSelected: l.$1 == currentCode,
              onTap: () =>
                  ref.read(localeProvider.notifier).setLocale(Locale(l.$1)),
            ),
          )
          .toList(),
    );
  }
}

class _AssistantBarSection extends ConsumerWidget {
  const _AssistantBarSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final enabled = ref.watch(assistantBarEnabledProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          S.of(context).assistantSection,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.outlined,
          padding: EdgeInsets.zero,
          child: AppListItem(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            leading: Icon(Icons.auto_awesome, color: c.primary, size: 20),
            titleWidget: Text(
              S.of(context).aiAssistantBarTitle,
              style: theme.textTheme.bodyMedium,
            ),
            subtitleWidget: Text(
              S.of(context).aiAssistantBarSubtitle,
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
            ),
            trailing: AppSwitch(
              value: enabled,
              onChanged: (value) => ref
                  .read(assistantBarEnabledProvider.notifier)
                  .setEnabled(value),
            ),
          ),
        ),
      ],
    );
  }
}
