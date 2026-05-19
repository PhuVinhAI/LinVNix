import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/assistant/data/builders/bookmark_context_summaries.dart';
import 'package:linvnix/features/assistant/data/builders/exercise_context_summaries.dart';
import 'package:linvnix/features/bookmarks/domain/bookmark_models.dart';
import 'package:linvnix/features/lessons/domain/exercise_set_models.dart';

void main() {
  group('bookmarkContextSummary', () {
    test('includes core vocabulary fields', () {
      final summary = bookmarkContextSummary(
        BookmarkWithVocabulary(
          id: 'bm-1',
          vocabularyId: 'v1',
          word: 'xin chào',
          translation: 'hello',
          phonetic: 'sin chào',
          partOfSpeech: 'phrase',
          difficultyLevel: 2,
          bookmarkedAt: DateTime.utc(2026, 5, 1),
        ),
      );

      expect(summary['word'], 'xin chào');
      expect(summary['translation'], 'hello');
      expect(summary['phonetic'], 'sin chào');
      expect(summary['difficultyLevel'], 2);
    });
  });

  group('setProgressContextSummary', () {
    test('maps progress state from set progress', () {
      final summary = setProgressContextSummary(
        SetProgress(
          setId: 'set-1',
          title: 'Drill',
          totalExercises: 5,
          attempted: 5,
          percentComplete: 100,
          percentCorrect: 90,
        ),
      );

      expect(summary['progressState'], 'completed');
      expect(summary['percentCorrect'], 90);
    });
  });
}
