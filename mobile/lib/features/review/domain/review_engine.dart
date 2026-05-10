import 'review_models.dart';

class ReviewEngine {
  static MasteryLevel mapStabilityToMastery(double stability) {
    if (stability < 21) return MasteryLevel.learning;
    if (stability < 100) return MasteryLevel.familiar;
    return MasteryLevel.mastered;
  }

  static int calculateScheduledDays(Rating rating, double stability) {
    switch (rating) {
      case Rating.again:
        return 1;
      case Rating.hard:
        return (stability * 1.2).ceil().clamp(1, 365);
      case Rating.good:
        return (stability * 2.5).ceil().clamp(1, 365);
      case Rating.easy:
        return (stability * 4.0).ceil().clamp(1, 365);
    }
  }

  static double calculateNewStability(
    Rating rating,
    double currentStability,
    double difficulty,
  ) {
    switch (rating) {
      case Rating.again:
        return currentStability * 0.5;
      case Rating.hard:
        return currentStability * 0.8;
      case Rating.good:
        return currentStability * 1.3;
      case Rating.easy:
        return currentStability * 2.0;
    }
  }

  static SessionSummary calculateSessionSummary(
    List<Rating> ratings,
    Duration duration,
  ) {
    final againCount = ratings.where((r) => r == Rating.again).length;
    final hardCount = ratings.where((r) => r == Rating.hard).length;
    final goodCount = ratings.where((r) => r == Rating.good).length;
    final easyCount = ratings.where((r) => r == Rating.easy).length;

    return SessionSummary(
      totalReviewed: ratings.length,
      againCount: againCount,
      hardCount: hardCount,
      goodCount: goodCount,
      easyCount: easyCount,
      duration: duration,
    );
  }
}
