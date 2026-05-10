enum MasteryLevel {
  newWord('NEW'),
  learning('LEARNING'),
  familiar('FAMILIAR'),
  mastered('MASTERED');

  const MasteryLevel(this.value);
  final String value;

  static MasteryLevel fromString(String value) {
    return MasteryLevel.values.firstWhere(
      (m) => m.value == value,
      orElse: () => MasteryLevel.newWord,
    );
  }

  String get displayName {
    switch (this) {
      case MasteryLevel.newWord:
        return 'New';
      case MasteryLevel.learning:
        return 'Learning';
      case MasteryLevel.familiar:
        return 'Familiar';
      case MasteryLevel.mastered:
        return 'Mastered';
    }
  }
}

enum Rating {
  again(1),
  hard(2),
  good(3),
  easy(4);

  const Rating(this.value);
  final int value;

  static Rating fromValue(int value) {
    return Rating.values.firstWhere(
      (r) => r.value == value,
      orElse: () => throw ArgumentError('Invalid rating value: $value'),
    );
  }

  String get displayName {
    switch (this) {
      case Rating.again:
        return 'Again';
      case Rating.hard:
        return 'Hard';
      case Rating.good:
        return 'Good';
      case Rating.easy:
        return 'Easy';
    }
  }
}

class Vocabulary {
  Vocabulary({
    required this.id,
    required this.word,
    required this.translation,
    this.phonetic,
    this.partOfSpeech,
    this.exampleSentence,
    this.exampleTranslation,
    this.audioUrl,
    this.imageUrl,
    this.classifier,
    this.difficultyLevel,
  });

  final String id;
  final String word;
  final String translation;
  final String? phonetic;
  final String? partOfSpeech;
  final String? exampleSentence;
  final String? exampleTranslation;
  final String? audioUrl;
  final String? imageUrl;
  final String? classifier;
  final int? difficultyLevel;

  factory Vocabulary.fromJson(Map<String, dynamic> json) {
    return Vocabulary(
      id: json['id'] as String,
      word: json['word'] as String,
      translation: json['translation'] as String,
      phonetic: json['phonetic'] as String?,
      partOfSpeech: json['partOfSpeech'] as String?,
      exampleSentence: json['exampleSentence'] as String?,
      exampleTranslation: json['exampleTranslation'] as String?,
      audioUrl: json['audioUrl'] as String?,
      imageUrl: json['imageUrl'] as String?,
      classifier: json['classifier'] as String?,
      difficultyLevel: json['difficultyLevel'] as int?,
    );
  }
}

class UserVocabulary {
  UserVocabulary({
    required this.id,
    required this.vocabulary,
    this.masteryLevel = MasteryLevel.newWord,
    this.reviewCount = 0,
    this.nextReviewDate,
    this.lastReviewedAt,
    this.stability,
    this.difficulty,
  });

  final String id;
  final Vocabulary vocabulary;
  final MasteryLevel masteryLevel;
  final int reviewCount;
  final DateTime? nextReviewDate;
  final DateTime? lastReviewedAt;
  final double? stability;
  final double? difficulty;

  factory UserVocabulary.fromJson(Map<String, dynamic> json) {
    return UserVocabulary(
      id: json['id'] as String,
      vocabulary: Vocabulary.fromJson(json['vocabulary'] as Map<String, dynamic>),
      masteryLevel: MasteryLevel.fromString(json['masteryLevel'] as String? ?? 'NEW'),
      reviewCount: json['reviewCount'] as int? ?? 0,
      nextReviewDate: json['nextReviewDate'] != null
          ? DateTime.parse(json['nextReviewDate'] as String)
          : null,
      lastReviewedAt: json['lastReviewedAt'] != null
          ? DateTime.parse(json['lastReviewedAt'] as String)
          : null,
      stability: (json['stability'] as num?)?.toDouble(),
      difficulty: (json['difficulty'] as num?)?.toDouble(),
    );
  }
}

class ReviewResult {
  ReviewResult({
    required this.id,
    required this.vocabularyId,
    required this.masteryLevel,
    required this.reviewCount,
    this.nextReviewAt,
    this.lastReviewedAt,
    this.stability,
    this.difficulty,
    this.scheduledDays,
  });

  final String id;
  final String vocabularyId;
  final MasteryLevel masteryLevel;
  final int reviewCount;
  final DateTime? nextReviewAt;
  final DateTime? lastReviewedAt;
  final double? stability;
  final double? difficulty;
  final int? scheduledDays;

  factory ReviewResult.fromJson(Map<String, dynamic> json) {
    return ReviewResult(
      id: json['id'] as String,
      vocabularyId: json['vocabularyId'] as String? ?? '',
      masteryLevel: MasteryLevel.fromString(json['masteryLevel'] as String? ?? 'NEW'),
      reviewCount: json['reviewCount'] as int? ?? 0,
      nextReviewAt: json['nextReviewAt'] != null
          ? DateTime.parse(json['nextReviewAt'] as String)
          : null,
      lastReviewedAt: json['lastReviewedAt'] != null
          ? DateTime.parse(json['lastReviewedAt'] as String)
          : null,
      stability: (json['stability'] as num?)?.toDouble(),
      difficulty: (json['difficulty'] as num?)?.toDouble(),
      scheduledDays: json['scheduledDays'] as int?,
    );
  }
}

class DueReviewItem {
  DueReviewItem({
    required this.id,
    required this.vocabulary,
    this.masteryLevel = MasteryLevel.learning,
    this.nextReviewDate,
  });

  final String id;
  final Vocabulary vocabulary;
  final MasteryLevel masteryLevel;
  final DateTime? nextReviewDate;

  factory DueReviewItem.fromJson(Map<String, dynamic> json) {
    return DueReviewItem(
      id: json['id'] as String,
      vocabulary: Vocabulary.fromJson(json['vocabulary'] as Map<String, dynamic>),
      masteryLevel: MasteryLevel.fromString(json['masteryLevel'] as String? ?? 'LEARNING'),
      nextReviewDate: json['nextReviewDate'] != null
          ? DateTime.parse(json['nextReviewDate'] as String)
          : null,
    );
  }
}

class SessionSummary {
  SessionSummary({
    required this.totalReviewed,
    required this.againCount,
    required this.hardCount,
    required this.goodCount,
    required this.easyCount,
    required this.duration,
  });

  final int totalReviewed;
  final int againCount;
  final int hardCount;
  final int goodCount;
  final int easyCount;
  final Duration duration;
}
