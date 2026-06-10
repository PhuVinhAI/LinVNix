import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/lessons/domain/lesson_models.dart';

void main() {
  group('LessonDetail', () {
    test('creates from JSON correctly', () {
      final json = {
        'id': 'lesson-1',
        'title': 'Greetings',
        'description': 'Learn basic greetings',
        'lessonType': 'vocabulary',
        'orderIndex': 1,
        'moduleId': 'module-1',
        'estimatedDuration': 15,
        'contents': [
          {
            'id': 'content-1',
            'contentType': 'text',
            'vietnameseText': 'Xin chào',
            'orderIndex': 0,
            'translation': 'Hello',
          },
        ],
        'vocabularies': [
          {
            'id': 'vocab-1',
            'word': 'xin chào',
            'translation': 'hello',
            'partOfSpeech': 'phrase',
          },
        ],
        'grammarRules': [
          {
            'id': 'grammar-1',
            'title': 'Subject + là',
            'explanation': 'Use là for "to be"',
            'structure': 'Subject + là + Noun',
            'examples': [
              {'vi': 'Tôi là sinh viên', 'en': 'I am a student'},
            ],
          },
        ],
        'exercises': [
          {
            'id': 'exercise-1',
            'title': 'Basic Exercises',
            'description': 'Practice greetings',
            'orderIndex': 0,
          },
        ],
      };

      final lesson = LessonDetail.fromJson(json);

      expect(lesson.id, 'lesson-1');
      expect(lesson.title, 'Greetings');
      expect(lesson.lessonType, 'vocabulary');
      expect(lesson.estimatedDuration, 15);
      expect(lesson.contents, hasLength(1));
      expect(lesson.vocabularies, hasLength(1));
      expect(lesson.grammarRules, hasLength(1));
      expect(lesson.exercises, hasLength(1));
    });

    test('handles empty optional arrays', () {
      final json = {
        'id': 'lesson-1',
        'title': 'Empty',
        'description': 'Empty lesson',
        'lessonType': 'grammar',
        'orderIndex': 0,
        'moduleId': 'module-1',
      };

      final lesson = LessonDetail.fromJson(json);

      expect(lesson.contents, isEmpty);
      expect(lesson.vocabularies, isEmpty);
      expect(lesson.grammarRules, isEmpty);
      expect(lesson.exercises, isEmpty);
      expect(lesson.estimatedDuration, isNull);
    });
  });

  group('LessonContent', () {
    test('creates text content from JSON', () {
      final json = {
        'id': 'c1',
        'contentType': 'text',
        'vietnameseText': 'Xin chào thế giới',
        'orderIndex': 0,
        'translation': 'Hello world',
      };

      final content = LessonContent.fromJson(json);

      expect(content.id, 'c1');
      expect(content.contentType, 'text');
      expect(content.vietnameseText, 'Xin chào thế giới');
      expect(content.translation, 'Hello world');
    });

    test('creates audio content from JSON payload', () {
      final json = {
        'id': 'c2',
        'contentType': 'audio',
        'vietnameseText': 'Nghe và nói',
        'orderIndex': 1,
        'payload': {
          'url': 'https://example.com/audio.mp3',
          'title': 'Bài nghe 1',
          'transcript': 'Nghe và nói',
          'durationSeconds': 42,
          'speaker': 'Cô Lan',
          'segments': [
            {'startSeconds': 0, 'vi': 'Xin chào', 'en': 'Hello'},
            {'startSeconds': 5.5, 'vi': 'Bạn khỏe không?'},
          ],
        },
      };

      final content = LessonContent.fromJson(json);

      expect(content.contentType, 'audio');
      expect(content.audioPayload, isNotNull);
      expect(content.audioPayload!.url, 'https://example.com/audio.mp3');
      expect(content.audioPayload!.title, 'Bài nghe 1');
      expect(content.audioPayload!.speaker, 'Cô Lan');
      expect(content.audioPayload!.durationSeconds, 42);
      expect(content.audioPayload!.segments, hasLength(2));
      expect(content.audioPayload!.segments[1].startSeconds, 5.5);
    });

    test('creates image content from JSON payload', () {
      final json = {
        'id': 'c4',
        'contentType': 'image',
        'vietnameseText': 'Phố cổ Hà Nội buổi sáng.',
        'orderIndex': 1,
        'translation': 'Hanoi old quarter in the morning.',
        'payload': {
          'url': '/uploads/image/hanoi.jpg',
          'caption': 'Phố cổ Hà Nội buổi sáng.',
          'captionEn': 'Hanoi old quarter in the morning.',
          'aspectRatio': '16:9',
          'source': 'Ảnh: VnExpress',
        },
      };

      final content = LessonContent.fromJson(json);

      expect(content.contentType, 'image');
      expect(content.imagePayload, isNotNull);
      expect(content.imagePayload!.url, '/uploads/image/hanoi.jpg');
      expect(content.imagePayload!.caption, 'Phố cổ Hà Nội buổi sáng.');
      expect(content.imagePayload!.aspectRatio, '16:9');
      expect(content.imagePayload!.ratio, closeTo(16 / 9, 0.0001));
      expect(content.imagePayload!.source, 'Ảnh: VnExpress');
    });

    test('creates video content with chapters from JSON payload', () {
      final json = {
        'id': 'c5',
        'contentType': 'video',
        'vietnameseText': 'Cách phát âm thanh điệu.',
        'orderIndex': 2,
        'payload': {
          'url': '/uploads/video/tones.mp4',
          'title': 'Cách phát âm thanh điệu',
          'aspectRatio': '16:9',
          'provider': 'self_hosted',
          'durationSeconds': 180,
          'chapters': [
            {'startSeconds': 0, 'title': 'Mở đầu'},
            {'startSeconds': 60, 'title': 'Thanh ngang'},
          ],
        },
      };

      final content = LessonContent.fromJson(json);

      expect(content.contentType, 'video');
      expect(content.videoPayload, isNotNull);
      expect(content.videoPayload!.url, '/uploads/video/tones.mp4');
      expect(content.videoPayload!.ratio, closeTo(16 / 9, 0.0001));
      expect(content.videoPayload!.isYoutube, false);
      expect(content.videoPayload!.chapters, hasLength(2));
      expect(content.videoPayload!.chapters[1].title, 'Thanh ngang');
    });

    test('creates dialogue content from JSON', () {
      final json = {
        'id': 'c3',
        'contentType': 'dialogue',
        'vietnameseText': 'A: Xin chào\nB: Chào bạn',
        'orderIndex': 2,
        'translation': 'A: Hello\nB: Hi there',
        'dialogueData': {
          'characters': [
            {'id': 'c1', 'name': 'A', 'side': 'left'},
            {'id': 'c2', 'name': 'B', 'side': 'right'},
          ],
          'lines': [
            {'characterId': 'c1', 'vi': 'Xin chào', 'en': 'Hello'},
            {'characterId': 'c2', 'vi': 'Chào bạn', 'en': 'Hi'},
          ],
        },
      };

      final content = LessonContent.fromJson(json);

      expect(content.contentType, 'dialogue');
      expect(content.vietnameseText, contains('Xin chào'));
      expect(content.dialogueData, isNotNull);
      expect(content.dialogueData!.lines, hasLength(2));
    });
  });

  group('LessonVocabulary', () {
    test('creates from JSON with all fields', () {
      final json = {
        'id': 'v1',
        'word': 'con mèo',
        'translation': 'cat',
        'partOfSpeech': 'noun',
        'classifier': 'con',
        'dialectVariants': {
          'SOUTHERN': 'con mèo',
          'NORTHERN': 'con mèo',
        },
        'difficultyLevel': 1,
      };

      final vocab = LessonVocabulary.fromJson(json);

      expect(vocab.id, 'v1');
      expect(vocab.word, 'con mèo');
      expect(vocab.translation, 'cat');
      expect(vocab.classifier, 'con');
      expect(vocab.dialectVariants, isNotNull);
      expect(vocab.dialectVariants!['SOUTHERN'], 'con mèo');
    });

    test('creates from JSON with minimal fields', () {
      final json = {
        'id': 'v2',
        'word': 'chào',
        'translation': 'hello',
      };

      final vocab = LessonVocabulary.fromJson(json);

      expect(vocab.word, 'chào');
      expect(vocab.classifier, isNull);
      expect(vocab.dialectVariants, isNull);
    });
  });

  group('GrammarRule', () {
    test('creates from JSON with examples', () {
      final json = {
        'id': 'g1',
        'title': 'Subject Pronouns',
        'explanation': 'Vietnamese has different pronouns based on age and gender',
        'structure': 'Tôi/Bạn/Anh/Chị/Em',
        'examples': [
          {'vi': 'Tôi là Nam', 'en': 'I am Nam', 'note': 'Formal'},
          {'vi': 'Em là Mai', 'en': 'I am Mai', 'note': 'Younger speaker'},
        ],
        'notes': 'Pronouns are very important in Vietnamese',
        'difficultyLevel': 1,
      };

      final rule = GrammarRule.fromJson(json);

      expect(rule.id, 'g1');
      expect(rule.title, 'Subject Pronouns');
      expect(rule.structure, isNotNull);
      expect(rule.examples, hasLength(2));
      expect(rule.examples[0].vi, 'Tôi là Nam');
      expect(rule.examples[0].note, 'Formal');
      expect(rule.notes, isNotNull);
    });

    test('creates from JSON with minimal fields', () {
      final json = {
        'id': 'g2',
        'title': 'Simple rule',
        'explanation': 'A simple explanation',
      };

      final rule = GrammarRule.fromJson(json);

      expect(rule.structure, isNull);
      expect(rule.examples, isEmpty);
      expect(rule.notes, isNull);
    });
  });

  group('ExerciseStub', () {
    test('creates from JSON', () {
      final json = {
        'id': 'e1',
        'title': 'Basic Exercises',
        'description': 'Practice greetings',
        'orderIndex': 1,
      };

      final exercise = ExerciseStub.fromJson(json);

      expect(exercise.id, 'e1');
      expect(exercise.title, 'Basic Exercises');
      expect(exercise.description, 'Practice greetings');
      expect(exercise.orderIndex, 1);
    });
  });
}
