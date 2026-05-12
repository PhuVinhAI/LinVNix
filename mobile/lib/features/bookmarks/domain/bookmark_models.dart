enum BookmarkSort {
  newest('newest'),
  oldest('oldest'),
  az('az'),
  za('za'),
  difficulty('difficulty');

  const BookmarkSort(this.value);
  final String value;

  static BookmarkSort fromString(String value) {
    return BookmarkSort.values.firstWhere(
      (s) => s.value == value,
      orElse: () => BookmarkSort.newest,
    );
  }
}

class BookmarkWithVocabulary {
  BookmarkWithVocabulary({
    required this.id,
    required this.vocabularyId,
    required this.word,
    required this.translation,
    this.phonetic,
    this.partOfSpeech,
    this.exampleSentence,
    this.exampleTranslation,
    this.audioUrl,
    this.imageUrl,
    this.classifier,
    this.dialectVariants,
    this.audioUrls,
    this.difficultyLevel,
    required this.bookmarkedAt,
  });

  final String id;
  final String vocabularyId;
  final String word;
  final String translation;
  final String? phonetic;
  final String? partOfSpeech;
  final String? exampleSentence;
  final String? exampleTranslation;
  final String? audioUrl;
  final String? imageUrl;
  final String? classifier;
  final Map<String, String>? dialectVariants;
  final Map<String, String>? audioUrls;
  final int? difficultyLevel;
  final DateTime bookmarkedAt;

  factory BookmarkWithVocabulary.fromJson(Map<String, dynamic> json) {
    return BookmarkWithVocabulary(
      id: json['id'] as String,
      vocabularyId: json['vocabularyId'] as String,
      word: json['word'] as String,
      translation: json['translation'] as String,
      phonetic: json['phonetic'] as String?,
      partOfSpeech: json['partOfSpeech'] as String?,
      exampleSentence: json['exampleSentence'] as String?,
      exampleTranslation: json['exampleTranslation'] as String?,
      audioUrl: json['audioUrl'] as String?,
      imageUrl: json['imageUrl'] as String?,
      classifier: json['classifier'] as String?,
      dialectVariants: (json['dialectVariants'] as Map<String, dynamic>?)
          ?.map((k, v) => MapEntry(k, v as String)),
      audioUrls: (json['audioUrls'] as Map<String, dynamic>?)
          ?.map((k, v) => MapEntry(k, v as String)),
      difficultyLevel: json['difficultyLevel'] as int?,
      bookmarkedAt: DateTime.parse(json['bookmarkedAt'] as String),
    );
  }
}

class BookmarksPage {
  BookmarksPage({
    required this.items,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.totalItems,
  });

  final List<BookmarkWithVocabulary> items;
  final int page;
  final int limit;
  final int totalPages;
  final int totalItems;

  factory BookmarksPage.fromJson(Map<String, dynamic> json) {
    return BookmarksPage(
      items: (json['items'] as List<dynamic>)
          .map((e) =>
              BookmarkWithVocabulary.fromJson(e as Map<String, dynamic>))
          .toList(),
      page: json['page'] as int,
      limit: json['limit'] as int,
      totalPages: json['totalPages'] as int,
      totalItems: json['totalItems'] as int,
    );
  }
}
