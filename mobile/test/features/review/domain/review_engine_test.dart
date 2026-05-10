import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/review/domain/review_engine.dart';
import 'package:linvnix/features/review/domain/review_models.dart';

void main() {
  group('ReviewEngine', () {
    group('mapStabilityToMastery', () {
      test('returns learning when stability < 21', () {
        expect(
          ReviewEngine.mapStabilityToMastery(0),
          MasteryLevel.learning,
        );
        expect(
          ReviewEngine.mapStabilityToMastery(10),
          MasteryLevel.learning,
        );
        expect(
          ReviewEngine.mapStabilityToMastery(20.99),
          MasteryLevel.learning,
        );
      });

      test('returns familiar when stability is between 21 and 99', () {
        expect(
          ReviewEngine.mapStabilityToMastery(21),
          MasteryLevel.familiar,
        );
        expect(
          ReviewEngine.mapStabilityToMastery(50),
          MasteryLevel.familiar,
        );
        expect(
          ReviewEngine.mapStabilityToMastery(99.99),
          MasteryLevel.familiar,
        );
      });

      test('returns mastered when stability >= 100', () {
        expect(
          ReviewEngine.mapStabilityToMastery(100),
          MasteryLevel.mastered,
        );
        expect(
          ReviewEngine.mapStabilityToMastery(150),
          MasteryLevel.mastered,
        );
        expect(
          ReviewEngine.mapStabilityToMastery(1000),
          MasteryLevel.mastered,
        );
      });
    });

    group('calculateScheduledDays', () {
      test('again returns 1 day', () {
        expect(
          ReviewEngine.calculateScheduledDays(Rating.again, 10),
          1,
        );
        expect(
          ReviewEngine.calculateScheduledDays(Rating.again, 50),
          1,
        );
      });

      test('hard returns stability * 1.2 rounded up', () {
        expect(
          ReviewEngine.calculateScheduledDays(Rating.hard, 10),
          12,
        );
        expect(
          ReviewEngine.calculateScheduledDays(Rating.hard, 20),
          24,
        );
      });

      test('good returns stability * 2.5 rounded up', () {
        expect(
          ReviewEngine.calculateScheduledDays(Rating.good, 10),
          25,
        );
        expect(
          ReviewEngine.calculateScheduledDays(Rating.good, 20),
          50,
        );
      });

      test('easy returns stability * 4.0 rounded up', () {
        expect(
          ReviewEngine.calculateScheduledDays(Rating.easy, 10),
          40,
        );
        expect(
          ReviewEngine.calculateScheduledDays(Rating.easy, 25),
          100,
        );
      });

      test('scheduled days capped at 365', () {
        expect(
          ReviewEngine.calculateScheduledDays(Rating.easy, 100),
          365,
        );
      });

      test('scheduled days minimum is 1', () {
        expect(
          ReviewEngine.calculateScheduledDays(Rating.hard, 0.1),
          1,
        );
      });
    });

    group('calculateNewStability', () {
      test('again reduces stability by half', () {
        expect(
          ReviewEngine.calculateNewStability(Rating.again, 10, 5),
          5.0,
        );
      });

      test('hard reduces stability by 20%', () {
        expect(
          ReviewEngine.calculateNewStability(Rating.hard, 10, 5),
          8.0,
        );
      });

      test('good increases stability by 30%', () {
        expect(
          ReviewEngine.calculateNewStability(Rating.good, 10, 5),
          13.0,
        );
      });

      test('easy doubles stability', () {
        expect(
          ReviewEngine.calculateNewStability(Rating.easy, 10, 5),
          20.0,
        );
      });
    });

    group('calculateSessionSummary', () {
      test('calculates summary from ratings', () {
        final ratings = [
          Rating.again,
          Rating.good,
          Rating.good,
          Rating.easy,
          Rating.hard,
        ];
        const duration = Duration(minutes: 5);

        final summary = ReviewEngine.calculateSessionSummary(
          ratings,
          duration,
        );

        expect(summary.totalReviewed, 5);
        expect(summary.againCount, 1);
        expect(summary.hardCount, 1);
        expect(summary.goodCount, 2);
        expect(summary.easyCount, 1);
        expect(summary.duration, duration);
      });

      test('handles empty ratings', () {
        final summary = ReviewEngine.calculateSessionSummary(
          [],
          Duration.zero,
        );

        expect(summary.totalReviewed, 0);
        expect(summary.againCount, 0);
        expect(summary.hardCount, 0);
        expect(summary.goodCount, 0);
        expect(summary.easyCount, 0);
      });
    });
  });
}
