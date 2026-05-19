import '../../../bookmarks/domain/bookmark_models.dart';

/// Compact bookmark entry for assistant screen context.
Map<String, dynamic> bookmarkContextSummary(BookmarkWithVocabulary bookmark) {
  return {
    'vocabularyId': bookmark.vocabularyId,
    'word': bookmark.word,
    'translation': bookmark.translation,
    if (bookmark.phonetic != null) 'phonetic': bookmark.phonetic,
    if (bookmark.partOfSpeech != null) 'partOfSpeech': bookmark.partOfSpeech,
    if (bookmark.difficultyLevel != null)
      'difficultyLevel': bookmark.difficultyLevel,
  };
}
