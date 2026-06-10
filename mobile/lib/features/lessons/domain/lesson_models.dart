class LessonDetail {
  const LessonDetail({
    required this.id,
    required this.title,
    required this.description,
    required this.lessonType,
    required this.orderIndex,
    required this.moduleId,
    this.estimatedDuration,
    this.contents = const [],
    this.vocabularies = const [],
    this.grammarRules = const [],
    this.exercises = const [],
  });

  factory LessonDetail.fromJson(Map<String, dynamic> json) {
    return LessonDetail(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      lessonType: json['lessonType'] as String,
      orderIndex: (json['orderIndex'] as num).toInt(),
      moduleId: json['moduleId'] as String,
      estimatedDuration: (json['estimatedDuration'] as num?)?.toInt(),
      contents: (json['contents'] as List<dynamic>?)
              ?.map((e) => LessonContent.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      vocabularies: (json['vocabularies'] as List<dynamic>?)
              ?.map((e) => LessonVocabulary.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      grammarRules: (json['grammarRules'] as List<dynamic>?)
              ?.map((e) => GrammarRule.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      exercises: (json['exercises'] as List<dynamic>?)
              ?.map((e) => ExerciseStub.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  final String id;
  final String title;
  final String description;
  final String lessonType;
  final int orderIndex;
  final String moduleId;
  final int? estimatedDuration;
  final List<LessonContent> contents;
  final List<LessonVocabulary> vocabularies;
  final List<GrammarRule> grammarRules;
  final List<ExerciseStub> exercises;

  bool get hasExercises => exercises.isNotEmpty;
}

/// Nội dung học — wrapper giữ order_index + preview, payload chi tiết tách
/// theo loại (xem 4 class payload riêng dưới).
class LessonContent {
  const LessonContent({
    required this.id,
    required this.contentType,
    required this.vietnameseText,
    required this.orderIndex,
    this.translation,
    this.notes,
    this.dialogueData,
    this.textPayload,
    this.imagePayload,
    this.audioPayload,
    this.videoPayload,
  });

  factory LessonContent.fromJson(Map<String, dynamic> json) {
    final type = (json['contentType'] as String?) ?? 'text';
    final rawPayload = json['payload'];
    final dialogue = json['dialogueData'];
    return LessonContent(
      id: json['id'] as String,
      contentType: type,
      vietnameseText: (json['vietnameseText'] as String?) ?? '',
      orderIndex: (json['orderIndex'] as num).toInt(),
      translation: json['translation'] as String?,
      notes: json['notes'] as String?,
      dialogueData: dialogue is Map<String, dynamic>
          ? LessonDialogueData.fromJson(dialogue)
          : null,
      textPayload: type == 'text' && rawPayload is Map<String, dynamic>
          ? TextContentPayload.fromJson(rawPayload)
          : null,
      imagePayload: type == 'image' && rawPayload is Map<String, dynamic>
          ? ImageContentPayload.fromJson(rawPayload)
          : null,
      audioPayload: type == 'audio' && rawPayload is Map<String, dynamic>
          ? AudioContentPayload.fromJson(rawPayload)
          : null,
      videoPayload: type == 'video' && rawPayload is Map<String, dynamic>
          ? VideoContentPayload.fromJson(rawPayload)
          : null,
    );
  }

  final String id;
  final String contentType;

  /// Preview rút gọn — fallback hiển thị khi payload chưa parse được.
  final String vietnameseText;
  final int orderIndex;
  final String? translation;
  final String? notes;
  final LessonDialogueData? dialogueData;

  final TextContentPayload? textPayload;
  final ImageContentPayload? imagePayload;
  final AudioContentPayload? audioPayload;
  final VideoContentPayload? videoPayload;
}

/// Payload cho loại TEXT — body + bản dịch + (tuỳ chọn) tách paragraph
/// và highlight từ chìa khoá.
class TextContentPayload {
  const TextContentPayload({
    required this.body,
    this.translation,
    this.paragraphs = const [],
    this.keyTerms = const [],
  });

  factory TextContentPayload.fromJson(Map<String, dynamic> json) {
    return TextContentPayload(
      body: (json['body'] as String?) ?? '',
      translation: json['translation'] as String?,
      paragraphs: (json['paragraphs'] as List<dynamic>?)
              ?.whereType<Map<String, dynamic>>()
              .map(TextParagraph.fromJson)
              .toList(growable: false) ??
          const [],
      keyTerms: (json['keyTerms'] as List<dynamic>?)
              ?.whereType<Map<String, dynamic>>()
              .map(TextKeyTerm.fromJson)
              .toList(growable: false) ??
          const [],
    );
  }

  final String body;
  final String? translation;
  final List<TextParagraph> paragraphs;
  final List<TextKeyTerm> keyTerms;
}

class TextParagraph {
  const TextParagraph({required this.vi, this.en});
  factory TextParagraph.fromJson(Map<String, dynamic> json) => TextParagraph(
        vi: (json['vi'] as String?) ?? '',
        en: json['en'] as String?,
      );
  final String vi;
  final String? en;
}

class TextKeyTerm {
  const TextKeyTerm({required this.term, required this.meaning});
  factory TextKeyTerm.fromJson(Map<String, dynamic> json) => TextKeyTerm(
        term: (json['term'] as String?) ?? '',
        meaning: (json['meaning'] as String?) ?? '',
      );
  final String term;
  final String meaning;
}

/// Payload cho loại IMAGE — url + caption song ngữ + aspect ratio + nguồn.
class ImageContentPayload {
  const ImageContentPayload({
    required this.url,
    required this.caption,
    this.captionEn,
    this.altText,
    this.aspectRatio = 'auto',
    this.source,
  });

  factory ImageContentPayload.fromJson(Map<String, dynamic> json) {
    return ImageContentPayload(
      url: (json['url'] as String?) ?? '',
      caption: (json['caption'] as String?) ?? '',
      captionEn: json['captionEn'] as String?,
      altText: json['altText'] as String?,
      aspectRatio: (json['aspectRatio'] as String?) ?? 'auto',
      source: json['source'] as String?,
    );
  }

  final String url;
  final String caption;
  final String? captionEn;
  final String? altText;
  /// Một trong: '1:1' '4:3' '3:4' '16:9' '9:16' 'auto'.
  final String aspectRatio;
  final String? source;

  /// Tỉ lệ width/height — null nếu auto (giữ tỉ lệ gốc của ảnh).
  double? get ratio {
    switch (aspectRatio) {
      case '1:1':
        return 1 / 1;
      case '4:3':
        return 4 / 3;
      case '3:4':
        return 3 / 4;
      case '16:9':
        return 16 / 9;
      case '9:16':
        return 9 / 16;
      default:
        return null;
    }
  }
}

/// Payload cho loại AUDIO — url + tiêu đề + transcript + ảnh cover + segments.
class AudioContentPayload {
  const AudioContentPayload({
    required this.url,
    required this.title,
    required this.transcript,
    this.translation,
    this.speaker,
    this.coverImageUrl,
    this.durationSeconds,
    this.segments = const [],
  });

  factory AudioContentPayload.fromJson(Map<String, dynamic> json) {
    return AudioContentPayload(
      url: (json['url'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      transcript: (json['transcript'] as String?) ?? '',
      translation: json['translation'] as String?,
      speaker: json['speaker'] as String?,
      coverImageUrl: json['coverImageUrl'] as String?,
      durationSeconds: (json['durationSeconds'] as num?)?.toInt(),
      segments: (json['segments'] as List<dynamic>?)
              ?.whereType<Map<String, dynamic>>()
              .map(AudioSegment.fromJson)
              .toList(growable: false) ??
          const [],
    );
  }

  final String url;
  final String title;
  final String transcript;
  final String? translation;
  final String? speaker;
  final String? coverImageUrl;
  final int? durationSeconds;
  final List<AudioSegment> segments;
}

class AudioSegment {
  const AudioSegment({required this.startSeconds, required this.vi, this.en});
  factory AudioSegment.fromJson(Map<String, dynamic> json) => AudioSegment(
        startSeconds: (json['startSeconds'] as num?)?.toDouble() ?? 0,
        vi: (json['vi'] as String?) ?? '',
        en: json['en'] as String?,
      );
  final double startSeconds;
  final String vi;
  final String? en;
}

/// Payload cho loại VIDEO — url + tiêu đề + thumbnail + aspect + provider
/// + transcript + chapters.
class VideoContentPayload {
  const VideoContentPayload({
    required this.url,
    required this.title,
    this.aspectRatio = '16:9',
    this.provider = 'self_hosted',
    this.thumbnailUrl,
    this.transcript,
    this.translation,
    this.durationSeconds,
    this.chapters = const [],
  });

  factory VideoContentPayload.fromJson(Map<String, dynamic> json) {
    return VideoContentPayload(
      url: (json['url'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      aspectRatio: (json['aspectRatio'] as String?) ?? '16:9',
      provider: (json['provider'] as String?) ?? 'self_hosted',
      thumbnailUrl: json['thumbnailUrl'] as String?,
      transcript: json['transcript'] as String?,
      translation: json['translation'] as String?,
      durationSeconds: (json['durationSeconds'] as num?)?.toInt(),
      chapters: (json['chapters'] as List<dynamic>?)
              ?.whereType<Map<String, dynamic>>()
              .map(VideoChapter.fromJson)
              .toList(growable: false) ??
          const [],
    );
  }

  final String url;
  final String title;
  /// Một trong: '16:9' '9:16' '4:3' '1:1'.
  final String aspectRatio;
  /// 'self_hosted' | 'youtube'.
  final String provider;
  final String? thumbnailUrl;
  final String? transcript;
  final String? translation;
  final int? durationSeconds;
  final List<VideoChapter> chapters;

  double get ratio {
    switch (aspectRatio) {
      case '9:16':
        return 9 / 16;
      case '4:3':
        return 4 / 3;
      case '1:1':
        return 1 / 1;
      default:
        return 16 / 9;
    }
  }

  bool get isYoutube => provider == 'youtube';
}

class VideoChapter {
  const VideoChapter({required this.startSeconds, required this.title});
  factory VideoChapter.fromJson(Map<String, dynamic> json) => VideoChapter(
        startSeconds: (json['startSeconds'] as num?)?.toDouble() ?? 0,
        title: (json['title'] as String?) ?? '',
      );
  final double startSeconds;
  final String title;
}

enum DialogueSide { left, right }

class DialogueCharacter {
  const DialogueCharacter({
    required this.id,
    required this.name,
    required this.side,
  });

  factory DialogueCharacter.fromJson(Map<String, dynamic> json) {
    final rawSide = json['side'] as String?;
    return DialogueCharacter(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      side: rawSide == 'right' ? DialogueSide.right : DialogueSide.left,
    );
  }

  final String id;
  final String name;
  final DialogueSide side;
}

class DialogueLineEntry {
  const DialogueLineEntry({
    required this.characterId,
    required this.vi,
    this.en,
    this.audio,
  });

  factory DialogueLineEntry.fromJson(Map<String, dynamic> json) {
    return DialogueLineEntry(
      characterId: json['characterId'] as String,
      vi: json['vi'] as String? ?? '',
      en: json['en'] as String?,
      audio: json['audio'] as String?,
    );
  }

  final String characterId;
  final String vi;
  final String? en;
  final String? audio;
}

class LessonDialogueData {
  const LessonDialogueData({
    required this.characters,
    required this.lines,
  });

  factory LessonDialogueData.fromJson(Map<String, dynamic> json) {
    final rawChars = (json['characters'] as List<dynamic>?) ?? const [];
    final rawLines = (json['lines'] as List<dynamic>?) ?? const [];
    return LessonDialogueData(
      characters: rawChars
          .whereType<Map<String, dynamic>>()
          .map(DialogueCharacter.fromJson)
          .toList(growable: false),
      lines: rawLines
          .whereType<Map<String, dynamic>>()
          .map(DialogueLineEntry.fromJson)
          .toList(growable: false),
    );
  }

  final List<DialogueCharacter> characters;
  final List<DialogueLineEntry> lines;
}

class LessonVocabulary {
  const LessonVocabulary({
    required this.id,
    required this.word,
    required this.translation,
    this.partOfSpeech,
    this.exampleSentence,
    this.exampleTranslation,
    this.audioUrl,
    this.imageUrl,
    this.classifier,
    this.dialectVariants,
    this.audioUrls,
    this.difficultyLevel,
    this.isBookmarked = false,
  });

  factory LessonVocabulary.fromJson(Map<String, dynamic> json) {
    return LessonVocabulary(
      id: json['id'] as String,
      word: json['word'] as String,
      translation: json['translation'] as String,
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
      isBookmarked: json['isBookmarked'] as bool? ?? false,
    );
  }

  final String id;
  final String word;
  final String translation;
  final String? partOfSpeech;
  final String? exampleSentence;
  final String? exampleTranslation;
  final String? audioUrl;
  final String? imageUrl;
  final String? classifier;
  final Map<String, String>? dialectVariants;
  final Map<String, String>? audioUrls;
  final int? difficultyLevel;
  final bool isBookmarked;
}

class GrammarRule {
  const GrammarRule({
    required this.id,
    required this.title,
    required this.explanation,
    this.structure,
    this.examples = const [],
    this.notes,
    this.difficultyLevel,
  });

  factory GrammarRule.fromJson(Map<String, dynamic> json) {
    return GrammarRule(
      id: json['id'] as String,
      title: json['title'] as String,
      explanation: json['explanation'] as String,
      structure: json['structure'] as String?,
      examples: (json['examples'] as List<dynamic>?)
              ?.map((e) => GrammarExample.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      notes: json['notes'] as String?,
      difficultyLevel: json['difficultyLevel'] as int?,
    );
  }

  final String id;
  final String title;
  final String explanation;
  final String? structure;
  final List<GrammarExample> examples;
  final String? notes;
  final int? difficultyLevel;
}

class GrammarExample {
  const GrammarExample({
    required this.vi,
    required this.en,
    this.note,
  });

  factory GrammarExample.fromJson(Map<String, dynamic> json) {
    return GrammarExample(
      vi: json['vi'] as String,
      en: json['en'] as String,
      note: json['note'] as String?,
    );
  }

  final String vi;
  final String en;
  final String? note;
}

class ExerciseStub {
  const ExerciseStub({
    required this.id,
    required this.title,
    this.description,
    this.orderIndex = 0,
  });

  factory ExerciseStub.fromJson(Map<String, dynamic> json) {
    return ExerciseStub(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      orderIndex: (json['orderIndex'] as num?)?.toInt() ?? 0,
    );
  }

  final String id;
  final String title;
  final String? description;
  final int orderIndex;
}
