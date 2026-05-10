class ExerciseStats {
  const ExerciseStats({
    required this.totalExercises,
    required this.completedExercises,
    required this.correctAnswers,
    required this.accuracy,
    required this.totalTimeSpent,
  });

  factory ExerciseStats.fromJson(Map<String, dynamic> json) {
    return ExerciseStats(
      totalExercises: (json['totalExercises'] as num).toInt(),
      completedExercises: (json['completedExercises'] as num).toInt(),
      correctAnswers: (json['correctAnswers'] as num).toInt(),
      accuracy: (json['accuracy'] as num).toDouble(),
      totalTimeSpent: (json['totalTimeSpent'] as num).toInt(),
    );
  }

  final int totalExercises;
  final int completedExercises;
  final int correctAnswers;
  final double accuracy;
  final int totalTimeSpent;

  Map<String, dynamic> toJson() {
    return {
      'totalExercises': totalExercises,
      'completedExercises': completedExercises,
      'correctAnswers': correctAnswers,
      'accuracy': accuracy,
      'totalTimeSpent': totalTimeSpent,
    };
  }
}
