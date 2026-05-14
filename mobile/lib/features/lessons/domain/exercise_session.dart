import 'dart:convert';

import 'exercise_session_codec.dart';

class ExerciseSession {
  const ExerciseSession({
    required this.setId,
    required this.lessonId,
    required this.tier,
    required this.currentIndex,
    required this.answers,
    required this.results,
    required this.exercises,
    this.createdAt,
    this.updatedAt,
  });

  factory ExerciseSession.fromMap(Map<dynamic, dynamic> map) {
    final answersRaw = map['answers'] as Map<dynamic, dynamic>?;
    final resultsRaw = map['results'] as Map<dynamic, dynamic>?;

    int parseKey(dynamic k) {
      if (k is int) return k;
      if (k is num) return k.toInt();
      if (k is String) return int.tryParse(k) ?? 0;
      return 0;
    }

    final exercises = (map['exercises'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map<dynamic, dynamic>))
            .toList() ??
        const <Map<String, dynamic>>[];

    return ExerciseSession(
      setId: map['setId'] as String,
      lessonId: map['lessonId'] as String,
      tier: map['tier'] as String,
      currentIndex: (map['currentIndex'] as num?)?.toInt() ?? 0,
      answers: ExerciseSessionCodec.decodeAnswers(answersRaw, exercises),
      results: resultsRaw?.map((k, v) => MapEntry<int, Map<String, dynamic>>(
            parseKey(k),
            Map<String, dynamic>.from(v as Map<dynamic, dynamic>),
          )) ??
          const {},
      exercises: exercises,
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'] as String)
          : null,
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt'] as String)
          : null,
    );
  }

  final String setId;
  final String lessonId;
  final String tier;
  final int currentIndex;
  final Map<int, dynamic> answers;
  final Map<int, Map<String, dynamic>> results;
  final List<Map<String, dynamic>> exercises;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Map<String, dynamic> toMap() {
    final encodedAnswers = ExerciseSessionCodec.encodeAnswers(answers, exercises);
    final root = <String, dynamic>{
      'setId': setId,
      'lessonId': lessonId,
      'tier': tier,
      'currentIndex': currentIndex,
      'answers': encodedAnswers,
      'results': results.map((k, v) => MapEntry<String, dynamic>(k.toString(), v)),
      'exercises': exercises,
      'createdAt': (createdAt ?? DateTime.now()).toIso8601String(),
      'updatedAt': DateTime.now().toIso8601String(),
    };
    return Map<String, dynamic>.from(
      jsonDecode(jsonEncode(root)) as Map,
    );
  }

  ExerciseSession copyWith({
    String? setId,
    String? lessonId,
    String? tier,
    int? currentIndex,
    Map<int, dynamic>? answers,
    Map<int, Map<String, dynamic>>? results,
    List<Map<String, dynamic>>? exercises,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ExerciseSession(
      setId: setId ?? this.setId,
      lessonId: lessonId ?? this.lessonId,
      tier: tier ?? this.tier,
      currentIndex: currentIndex ?? this.currentIndex,
      answers: answers ?? this.answers,
      results: results ?? this.results,
      exercises: exercises ?? this.exercises,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
