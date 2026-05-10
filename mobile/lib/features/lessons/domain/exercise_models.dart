import 'package:flutter/foundation.dart';

enum ExerciseType {
  multipleChoice('multiple_choice'),
  fillBlank('fill_blank'),
  matching('matching'),
  ordering('ordering'),
  translation('translation'),
  listening('listening');

  const ExerciseType(this.value);
  final String value;

  static ExerciseType fromString(String value) {
    return ExerciseType.values.firstWhere(
      (t) => t.value == value,
      orElse: () => ExerciseType.multipleChoice,
    );
  }

  int get timerSeconds {
    switch (this) {
      case ExerciseType.multipleChoice:
        return 60;
      case ExerciseType.fillBlank:
        return 60;
      case ExerciseType.matching:
        return 90;
      case ExerciseType.ordering:
        return 120;
      case ExerciseType.translation:
        return 180;
      case ExerciseType.listening:
        return 180;
    }
  }
}

class Exercise {
  const Exercise({
    required this.id,
    required this.exerciseType,
    required this.question,
    required this.options,
    required this.correctAnswer,
    this.questionAudioUrl,
    this.explanation,
    this.orderIndex = 0,
    this.difficultyLevel = 1,
  });

  factory Exercise.fromJson(Map<String, dynamic> json) {
    final typeStr = json['exerciseType'] as String;
    final type = ExerciseType.fromString(typeStr);
    return Exercise(
      id: json['id'] as String,
      exerciseType: type,
      question: json['question'] as String,
      questionAudioUrl: json['questionAudioUrl'] as String?,
      options: ExerciseOptions.fromJson(
        type,
        json['options'] as Map<String, dynamic>?,
      ),
      correctAnswer: ExerciseAnswer.fromJson(
        type,
        json['correctAnswer'] as Map<String, dynamic>?,
      ),
      explanation: json['explanation'] as String?,
      orderIndex: (json['orderIndex'] as num?)?.toInt() ?? 0,
      difficultyLevel: (json['difficultyLevel'] as num?)?.toInt() ?? 1,
    );
  }

  final String id;
  final ExerciseType exerciseType;
  final String question;
  final String? questionAudioUrl;
  final ExerciseOptions options;
  final ExerciseAnswer correctAnswer;
  final String? explanation;
  final int orderIndex;
  final int difficultyLevel;
}

@immutable
sealed class ExerciseOptions {
  const ExerciseOptions();

  factory ExerciseOptions.fromJson(
    ExerciseType type,
    Map<String, dynamic>? json,
  ) {
    if (json == null) {
      return const MultipleChoiceOptions(choices: []);
    }
    return switch (type) {
      ExerciseType.multipleChoice => MultipleChoiceOptions.fromJson(json),
      ExerciseType.fillBlank => FillBlankOptions.fromJson(json),
      ExerciseType.matching => MatchingOptions.fromJson(json),
      ExerciseType.ordering => OrderingOptions.fromJson(json),
      ExerciseType.translation => TranslationOptions.fromJson(json),
      ExerciseType.listening => ListeningOptions.fromJson(json),
    };
  }
}

class MultipleChoiceOptions extends ExerciseOptions {
  const MultipleChoiceOptions({required this.choices});
  factory MultipleChoiceOptions.fromJson(Map<String, dynamic> json) {
    return MultipleChoiceOptions(
      choices: (json['choices'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
  final List<String> choices;
}

class FillBlankOptions extends ExerciseOptions {
  const FillBlankOptions({required this.blanks, this.acceptedAnswers});
  factory FillBlankOptions.fromJson(Map<String, dynamic> json) {
    return FillBlankOptions(
      blanks: (json['blanks'] as num?)?.toInt() ?? 1,
      acceptedAnswers: (json['acceptedAnswers'] as List<dynamic>?)
          ?.map((group) =>
              (group as List<dynamic>).map((e) => e as String).toList())
          .toList(),
    );
  }
  final int blanks;
  final List<List<String>>? acceptedAnswers;
}

class MatchingOptions extends ExerciseOptions {
  const MatchingOptions({required this.pairs});
  factory MatchingOptions.fromJson(Map<String, dynamic> json) {
    return MatchingOptions(
      pairs: (json['pairs'] as List<dynamic>?)
              ?.map((e) => MatchPair.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
  final List<MatchPair> pairs;
}

class OrderingOptions extends ExerciseOptions {
  const OrderingOptions({required this.items});
  factory OrderingOptions.fromJson(Map<String, dynamic> json) {
    return OrderingOptions(
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
  final List<String> items;
}

class TranslationOptions extends ExerciseOptions {
  const TranslationOptions({
    required this.sourceLanguage,
    required this.targetLanguage,
    this.acceptedTranslations,
  });
  factory TranslationOptions.fromJson(Map<String, dynamic> json) {
    return TranslationOptions(
      sourceLanguage: json['sourceLanguage'] as String? ?? '',
      targetLanguage: json['targetLanguage'] as String? ?? '',
      acceptedTranslations: (json['acceptedTranslations'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );
  }
  final String sourceLanguage;
  final String targetLanguage;
  final List<String>? acceptedTranslations;
}

class ListeningOptions extends ExerciseOptions {
  const ListeningOptions({
    required this.audioUrl,
    required this.transcriptType,
    this.keywords,
  });
  factory ListeningOptions.fromJson(Map<String, dynamic> json) {
    return ListeningOptions(
      audioUrl: json['audioUrl'] as String? ?? '',
      transcriptType: json['transcriptType'] as String? ?? 'exact',
      keywords: (json['keywords'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );
  }
  final String audioUrl;
  final String transcriptType;
  final List<String>? keywords;
}

class MatchPair {
  const MatchPair({required this.left, required this.right});
  factory MatchPair.fromJson(Map<String, dynamic> json) {
    return MatchPair(
      left: json['left'] as String,
      right: json['right'] as String,
    );
  }
  final String left;
  final String right;
}

@immutable
sealed class ExerciseAnswer {
  const ExerciseAnswer();

  factory ExerciseAnswer.fromJson(
    ExerciseType type,
    Map<String, dynamic>? json,
  ) {
    if (json == null) {
      return const MultipleChoiceAnswer(selectedChoice: '');
    }
    return switch (type) {
      ExerciseType.multipleChoice => MultipleChoiceAnswer.fromJson(json),
      ExerciseType.fillBlank => FillBlankAnswer.fromJson(json),
      ExerciseType.matching => MatchingAnswer.fromJson(json),
      ExerciseType.ordering => OrderingAnswer.fromJson(json),
      ExerciseType.translation => TranslationAnswer.fromJson(json),
      ExerciseType.listening => ListeningAnswer.fromJson(json),
    };
  }

  Map<String, dynamic> toJson();
}

class MultipleChoiceAnswer extends ExerciseAnswer {
  const MultipleChoiceAnswer({required this.selectedChoice});
  factory MultipleChoiceAnswer.fromJson(Map<String, dynamic> json) {
    return MultipleChoiceAnswer(
      selectedChoice: json['selectedChoice'] as String? ?? '',
    );
  }
  final String selectedChoice;

  @override
  Map<String, dynamic> toJson() => {'selectedChoice': selectedChoice};
}

class FillBlankAnswer extends ExerciseAnswer {
  const FillBlankAnswer({required this.answers});
  factory FillBlankAnswer.fromJson(Map<String, dynamic> json) {
    return FillBlankAnswer(
      answers: (json['answers'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
  final List<String> answers;

  @override
  Map<String, dynamic> toJson() => {'answers': answers};
}

class MatchingAnswer extends ExerciseAnswer {
  const MatchingAnswer({required this.matches});
  factory MatchingAnswer.fromJson(Map<String, dynamic> json) {
    return MatchingAnswer(
      matches: (json['matches'] as List<dynamic>?)
              ?.map((e) => MatchPair.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
  final List<MatchPair> matches;

  @override
  Map<String, dynamic> toJson() => {
        'matches': matches.map((m) => {'left': m.left, 'right': m.right}).toList(),
      };
}

class OrderingAnswer extends ExerciseAnswer {
  const OrderingAnswer({required this.orderedItems});
  factory OrderingAnswer.fromJson(Map<String, dynamic> json) {
    return OrderingAnswer(
      orderedItems: (json['orderedItems'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
  final List<String> orderedItems;

  @override
  Map<String, dynamic> toJson() => {'orderedItems': orderedItems};
}

class TranslationAnswer extends ExerciseAnswer {
  const TranslationAnswer({required this.translation});
  factory TranslationAnswer.fromJson(Map<String, dynamic> json) {
    return TranslationAnswer(
      translation: json['translation'] as String? ?? '',
    );
  }
  final String translation;

  @override
  Map<String, dynamic> toJson() => {'translation': translation};
}

class ListeningAnswer extends ExerciseAnswer {
  const ListeningAnswer({required this.transcript});
  factory ListeningAnswer.fromJson(Map<String, dynamic> json) {
    return ListeningAnswer(
      transcript: json['transcript'] as String? ?? '',
    );
  }
  final String transcript;

  @override
  Map<String, dynamic> toJson() => {'transcript': transcript};
}

class ExerciseSubmissionResult {
  const ExerciseSubmissionResult({
    required this.id,
    required this.isCorrect,
    required this.score,
    this.userAnswer,
    this.timeTaken,
    this.attemptedAt,
  });

  factory ExerciseSubmissionResult.fromJson(Map<String, dynamic> json) {
    return ExerciseSubmissionResult(
      id: json['id'] as String,
      isCorrect: json['isCorrect'] as bool? ?? false,
      score: (json['score'] as num?)?.toInt() ?? 0,
      userAnswer: json['userAnswer'],
      timeTaken: (json['timeTaken'] as num?)?.toInt(),
      attemptedAt: json['attemptedAt'] != null
          ? DateTime.tryParse(json['attemptedAt'] as String)
          : null,
    );
  }

  final String id;
  final bool isCorrect;
  final int score;
  final dynamic userAnswer;
  final int? timeTaken;
  final DateTime? attemptedAt;
}
