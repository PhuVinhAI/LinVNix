enum ExerciseTier {
  basic('BASIC'),
  easy('EASY'),
  medium('MEDIUM'),
  hard('HARD'),
  expert('EXPERT');

  const ExerciseTier(this.value);
  final String value;

  static ExerciseTier fromString(String value) {
    return ExerciseTier.values.firstWhere(
      (t) => t.value == value,
      orElse: () => ExerciseTier.basic,
    );
  }

  String get displayName {
    return switch (this) {
      ExerciseTier.basic => 'Basic',
      ExerciseTier.easy => 'Easy',
      ExerciseTier.medium => 'Medium',
      ExerciseTier.hard => 'Hard',
      ExerciseTier.expert => 'Expert',
    };
  }
}

enum FocusArea {
  vocabulary('vocabulary'),
  grammar('grammar'),
  both('both');

  const FocusArea(this.value);
  final String value;

  static FocusArea fromString(String value) {
    return FocusArea.values.firstWhere(
      (f) => f.value == value,
      orElse: () => FocusArea.both,
    );
  }

  String get displayName {
    return switch (this) {
      FocusArea.vocabulary => 'Từ vựng',
      FocusArea.grammar => 'Ngữ pháp',
      FocusArea.both => 'Cả hai',
    };
  }
}

class CustomSetConfig {
  const CustomSetConfig({
    required this.questionCount,
    required this.exerciseTypes,
    required this.focusArea,
  });

  factory CustomSetConfig.fromJson(Map<String, dynamic> json) {
    return CustomSetConfig(
      questionCount: (json['questionCount'] as num?)?.toInt() ?? 10,
      exerciseTypes: (json['exerciseTypes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      focusArea: FocusArea.fromString(json['focusArea'] as String? ?? 'both'),
    );
  }

  Map<String, dynamic> toJson() => {
        'questionCount': questionCount,
        'exerciseTypes': exerciseTypes,
        'focusArea': focusArea.value,
      };

  final int questionCount;
  final List<String> exerciseTypes;
  final FocusArea focusArea;
}

class ExerciseSetModel {
  const ExerciseSetModel({
    required this.id,
    required this.lessonId,
    required this.tier,
    required this.title,
    this.isCustom = false,
    this.isAIGenerated = false,
    this.orderIndex = 0,
    this.customConfig,
  });

  factory ExerciseSetModel.fromJson(Map<String, dynamic> json) {
    return ExerciseSetModel(
      id: json['id'] as String,
      lessonId: json['lessonId'] as String,
      tier: json['tier'] != null
          ? ExerciseTier.fromString(json['tier'] as String)
          : null,
      title: json['title'] as String,
      isCustom: json['isCustom'] as bool? ?? false,
      isAIGenerated: json['isAIGenerated'] as bool? ?? false,
      orderIndex: (json['orderIndex'] as num?)?.toInt() ?? 0,
      customConfig: json['customConfig'] != null
          ? CustomSetConfig.fromJson(
              json['customConfig'] as Map<String, dynamic>)
          : null,
    );
  }

  final String id;
  final String lessonId;
  final ExerciseTier? tier;
  final String title;
  final bool isCustom;
  final bool isAIGenerated;
  final int orderIndex;
  final CustomSetConfig? customConfig;
}

class TierProgress {
  const TierProgress({
    required this.tier,
    required this.title,
    this.isCustom = false,
    this.isAIGenerated = false,
    this.totalExercises = 0,
    this.attempted = 0,
    this.correct = 0,
    this.percentComplete = 0,
    this.percentCorrect = 0,
    this.setId = '',
  });

  factory TierProgress.fromJson(Map<String, dynamic> json) {
    return TierProgress(
      tier: json['tier'] != null
          ? ExerciseTier.fromString(json['tier'] as String)
          : null,
      title: json['title'] as String,
      isCustom: json['isCustom'] as bool? ?? false,
      isAIGenerated: json['isAIGenerated'] as bool? ?? false,
      totalExercises: (json['totalExercises'] as num?)?.toInt() ?? 0,
      attempted: (json['attempted'] as num?)?.toInt() ?? 0,
      correct: (json['correct'] as num?)?.toInt() ?? 0,
      percentComplete: (json['percentComplete'] as num?)?.toDouble() ?? 0,
      percentCorrect: (json['percentCorrect'] as num?)?.toDouble() ?? 0,
      setId: json['setId'] as String? ?? '',
    );
  }

  final ExerciseTier? tier;
  final String title;
  final bool isCustom;
  final bool isAIGenerated;
  final int totalExercises;
  final int attempted;
  final int correct;
  final double percentComplete;
  final double percentCorrect;
  final String setId;

  bool get isCompleted => percentComplete == 100 && percentCorrect >= 80;
  bool get isInProgress => attempted > 0 && !isCompleted;
  bool get isNotStarted => attempted == 0;
}

class LessonTierSummary {
  const LessonTierSummary({
    required this.sets,
    required this.unlockedTiers,
    this.customSets = const [],
    this.customPracticeUnlocked = false,
  });

  factory LessonTierSummary.fromJson(Map<String, dynamic> json) {
    return LessonTierSummary(
      sets: (json['sets'] as List<dynamic>?)
              ?.map((e) => TierProgress.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      unlockedTiers: (json['unlockedTiers'] as List<dynamic>?)
              ?.map((e) => ExerciseTier.fromString(e as String))
              .toList() ??
          const [ExerciseTier.basic],
      customSets: (json['customSets'] as List<dynamic>?)
              ?.map((e) => TierProgress.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      customPracticeUnlocked:
          json['customPracticeUnlocked'] as bool? ?? false,
    );
  }

  final List<TierProgress> sets;
  final List<ExerciseTier> unlockedTiers;
  final List<TierProgress> customSets;
  final bool customPracticeUnlocked;

  bool isTierUnlocked(ExerciseTier tier) {
    return unlockedTiers.contains(tier);
  }

  TierProgress? progressForTier(ExerciseTier tier) {
    final idx = sets.indexWhere((s) => s.tier == tier);
    return idx >= 0 ? sets[idx] : null;
  }
}

class SetProgressDetail {
  const SetProgressDetail({
    this.totalExercises = 0,
    this.attempted = 0,
    this.correct = 0,
    this.percentCorrect = 0,
    this.percentComplete = 0,
    this.nextTierUnlocked,
  });

  factory SetProgressDetail.fromJson(Map<String, dynamic> json) {
    return SetProgressDetail(
      totalExercises: (json['totalExercises'] as num?)?.toInt() ?? 0,
      attempted: (json['attempted'] as num?)?.toInt() ?? 0,
      correct: (json['correct'] as num?)?.toInt() ?? 0,
      percentCorrect: (json['percentCorrect'] as num?)?.toDouble() ?? 0,
      percentComplete: (json['percentComplete'] as num?)?.toDouble() ?? 0,
      nextTierUnlocked: json['nextTierUnlocked'] != null
          ? ExerciseTier.fromString(json['nextTierUnlocked'] as String)
          : null,
    );
  }

  final int totalExercises;
  final int attempted;
  final int correct;
  final double percentCorrect;
  final double percentComplete;
  final ExerciseTier? nextTierUnlocked;
}

enum TierStatus { completed, inProgress, locked }

class TierSummaryItem {
  const TierSummaryItem({
    required this.tier,
    required this.status,
    required this.percentCorrect,
  });

  factory TierSummaryItem.fromJson(Map<String, dynamic> json) {
    return TierSummaryItem(
      tier: ExerciseTier.fromString(json['tier'] as String),
      status: _parseStatus(json['status'] as String),
      percentCorrect: (json['percentCorrect'] as num?)?.toDouble() ?? 0,
    );
  }

  final ExerciseTier tier;
  final TierStatus status;
  final double percentCorrect;

  static TierStatus _parseStatus(String value) {
    return switch (value) {
      'completed' => TierStatus.completed,
      'in_progress' => TierStatus.inProgress,
      _ => TierStatus.locked,
    };
  }
}

class TierSummary {
  const TierSummary({
    required this.currentTier,
    required this.unlockedTiers,
    required this.tiers,
  });

  factory TierSummary.fromJson(Map<String, dynamic> json) {
    return TierSummary(
      currentTier: ExerciseTier.fromString(json['currentTier'] as String),
      unlockedTiers: (json['unlockedTiers'] as List<dynamic>)
          .map((e) => ExerciseTier.fromString(e as String))
          .toList(),
      tiers: (json['tiers'] as List<dynamic>)
          .map((e) => TierSummaryItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  final ExerciseTier currentTier;
  final List<ExerciseTier> unlockedTiers;
  final List<TierSummaryItem> tiers;
}
