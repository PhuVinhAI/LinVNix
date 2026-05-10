import 'package:flutter_test/flutter_test.dart';
import 'package:linvnix/features/lessons/domain/exercise_models.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderer.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderer_registry.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderers/multiple_choice_renderer.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderers/fill_blank_renderer.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderers/matching_renderer.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderers/ordering_renderer.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderers/translation_renderer.dart';
import 'package:linvnix/features/lessons/domain/exercise_renderers/listening_renderer.dart';

Exercise _makeExercise(
  ExerciseType type,
  ExerciseOptions options,
  ExerciseAnswer answer, {
  String question = 'Test question',
  String? explanation,
}) {
  return Exercise(
    id: 'ex-1',
    exerciseType: type,
    question: question,
    options: options,
    correctAnswer: answer,
    explanation: explanation,
  );
}

void main() {
  group('ExerciseType', () {
    test('fromString parses all types', () {
      expect(ExerciseType.fromString('multiple_choice'), ExerciseType.multipleChoice);
      expect(ExerciseType.fromString('fill_blank'), ExerciseType.fillBlank);
      expect(ExerciseType.fromString('matching'), ExerciseType.matching);
      expect(ExerciseType.fromString('ordering'), ExerciseType.ordering);
      expect(ExerciseType.fromString('translation'), ExerciseType.translation);
      expect(ExerciseType.fromString('listening'), ExerciseType.listening);
    });

    test('fromString defaults to multipleChoice for unknown', () {
      expect(ExerciseType.fromString('unknown'), ExerciseType.multipleChoice);
    });

    test('timerSeconds returns correct duration per type', () {
      expect(ExerciseType.multipleChoice.timerSeconds, 60);
      expect(ExerciseType.fillBlank.timerSeconds, 60);
      expect(ExerciseType.matching.timerSeconds, 90);
      expect(ExerciseType.ordering.timerSeconds, 120);
      expect(ExerciseType.translation.timerSeconds, 180);
      expect(ExerciseType.listening.timerSeconds, 180);
    });
  });

  group('Exercise.fromJson', () {
    test('parses multiple_choice exercise', () {
      final json = {
        'id': 'e1',
        'exerciseType': 'multiple_choice',
        'question': 'What does xin chào mean?',
        'options': {
          'type': 'multiple_choice',
          'choices': ['Hello', 'Goodbye', 'Thank you'],
        },
        'correctAnswer': {'selectedChoice': 'Hello'},
        'explanation': 'Xin chào means Hello',
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.id, 'e1');
      expect(exercise.exerciseType, ExerciseType.multipleChoice);
      expect(exercise.question, 'What does xin chào mean?');
      expect(exercise.options, isA<MultipleChoiceOptions>());
      expect((exercise.options as MultipleChoiceOptions).choices, ['Hello', 'Goodbye', 'Thank you']);
      expect(exercise.correctAnswer, isA<MultipleChoiceAnswer>());
      expect((exercise.correctAnswer as MultipleChoiceAnswer).selectedChoice, 'Hello');
      expect(exercise.explanation, 'Xin chào means Hello');
    });

    test('parses fill_blank exercise', () {
      final json = {
        'id': 'e2',
        'exerciseType': 'fill_blank',
        'question': 'Tôi ___ sinh viên.',
        'options': {
          'type': 'fill_blank',
          'blanks': 1,
          'acceptedAnswers': [
            ['là', 'la'],
          ],
        },
        'correctAnswer': {'answers': ['là']},
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.exerciseType, ExerciseType.fillBlank);
      expect(exercise.options, isA<FillBlankOptions>());
      final opts = exercise.options as FillBlankOptions;
      expect(opts.blanks, 1);
      expect(opts.acceptedAnswers, [
        ['là', 'la'],
      ]);
    });

    test('parses matching exercise', () {
      final json = {
        'id': 'e3',
        'exerciseType': 'matching',
        'question': 'Match the words',
        'options': {
          'type': 'matching',
          'pairs': [
            {'left': 'con mèo', 'right': 'cat'},
            {'left': 'con chó', 'right': 'dog'},
          ],
        },
        'correctAnswer': {
          'matches': [
            {'left': 'con mèo', 'right': 'cat'},
            {'left': 'con chó', 'right': 'dog'},
          ],
        },
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.exerciseType, ExerciseType.matching);
      expect(exercise.options, isA<MatchingOptions>());
      expect((exercise.options as MatchingOptions).pairs, hasLength(2));
    });

    test('parses ordering exercise', () {
      final json = {
        'id': 'e4',
        'exerciseType': 'ordering',
        'question': 'Put in correct order',
        'options': {
          'type': 'ordering',
          'items': ['Xin', 'chào', 'bạn'],
        },
        'correctAnswer': {
          'orderedItems': ['Xin', 'chào', 'bạn'],
        },
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.exerciseType, ExerciseType.ordering);
      expect(exercise.options, isA<OrderingOptions>());
      expect((exercise.options as OrderingOptions).items, ['Xin', 'chào', 'bạn']);
    });

    test('parses translation exercise', () {
      final json = {
        'id': 'e5',
        'exerciseType': 'translation',
        'question': 'Translate: Tôi yêu Việt Nam',
        'options': {
          'type': 'translation',
          'sourceLanguage': 'vi',
          'targetLanguage': 'en',
          'acceptedTranslations': ['I love Vietnam', 'I love Viet Nam'],
        },
        'correctAnswer': {'translation': 'I love Vietnam'},
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.exerciseType, ExerciseType.translation);
      expect(exercise.options, isA<TranslationOptions>());
      final opts = exercise.options as TranslationOptions;
      expect(opts.acceptedTranslations, ['I love Vietnam', 'I love Viet Nam']);
    });

    test('parses listening exercise', () {
      final json = {
        'id': 'e6',
        'exerciseType': 'listening',
        'question': 'Listen and type',
        'options': {
          'type': 'listening',
          'audioUrl': 'https://example.com/audio.mp3',
          'transcriptType': 'exact',
          'keywords': ['xin', 'chào'],
        },
        'correctAnswer': {'transcript': 'Xin chào'},
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.exerciseType, ExerciseType.listening);
      expect(exercise.options, isA<ListeningOptions>());
      final opts = exercise.options as ListeningOptions;
      expect(opts.audioUrl, 'https://example.com/audio.mp3');
      expect(opts.transcriptType, 'exact');
      expect(opts.keywords, ['xin', 'chào']);
    });

    test('handles null options gracefully', () {
      final json = {
        'id': 'e7',
        'exerciseType': 'multiple_choice',
        'question': 'Test',
      };

      final exercise = Exercise.fromJson(json);

      expect(exercise.options, isA<MultipleChoiceOptions>());
      expect((exercise.options as MultipleChoiceOptions).choices, isEmpty);
    });
  });

  group('MultipleChoiceRenderer', () {
    const renderer = MultipleChoiceRenderer();

    test('has correct type', () {
      expect(renderer.type, ExerciseType.multipleChoice);
    });

    test('validateAnswer accepts non-empty string', () {
      final exercise = _makeExercise(
        ExerciseType.multipleChoice,
        const MultipleChoiceOptions(choices: ['A', 'B']),
        const MultipleChoiceAnswer(selectedChoice: 'A'),
      );
      expect(renderer.validateAnswer(exercise, 'A'), true);
    });

    test('validateAnswer rejects empty string', () {
      final exercise = _makeExercise(
        ExerciseType.multipleChoice,
        const MultipleChoiceOptions(choices: ['A', 'B']),
        const MultipleChoiceAnswer(selectedChoice: 'A'),
      );
      expect(renderer.validateAnswer(exercise, ''), false);
    });

    test('validateAnswer rejects null', () {
      final exercise = _makeExercise(
        ExerciseType.multipleChoice,
        const MultipleChoiceOptions(choices: ['A', 'B']),
        const MultipleChoiceAnswer(selectedChoice: 'A'),
      );
      expect(renderer.validateAnswer(exercise, null), false);
    });

    test('validateAnswer rejects non-string', () {
      final exercise = _makeExercise(
        ExerciseType.multipleChoice,
        const MultipleChoiceOptions(choices: ['A', 'B']),
        const MultipleChoiceAnswer(selectedChoice: 'A'),
      );
      expect(renderer.validateAnswer(exercise, 123), false);
    });

    test('buildAnswerPayload wraps answer correctly', () {
      expect(renderer.buildAnswerPayload('Hello'), {'selectedChoice': 'Hello'});
    });
  });

  group('FillBlankRenderer', () {
    const renderer = FillBlankRenderer();

    test('has correct type', () {
      expect(renderer.type, ExerciseType.fillBlank);
    });

    test('validateAnswer accepts correct-length list with non-empty values', () {
      final exercise = _makeExercise(
        ExerciseType.fillBlank,
        const FillBlankOptions(blanks: 2),
        const FillBlankAnswer(answers: ['a', 'b']),
      );
      expect(renderer.validateAnswer(exercise, ['hello', 'world']), true);
    });

    test('validateAnswer rejects wrong-length list', () {
      final exercise = _makeExercise(
        ExerciseType.fillBlank,
        const FillBlankOptions(blanks: 2),
        const FillBlankAnswer(answers: ['a', 'b']),
      );
      expect(renderer.validateAnswer(exercise, ['hello']), false);
    });

    test('validateAnswer rejects list with empty values', () {
      final exercise = _makeExercise(
        ExerciseType.fillBlank,
        const FillBlankOptions(blanks: 2),
        const FillBlankAnswer(answers: ['a', 'b']),
      );
      expect(renderer.validateAnswer(exercise, ['hello', '']), false);
    });

    test('validateAnswer rejects non-list', () {
      final exercise = _makeExercise(
        ExerciseType.fillBlank,
        const FillBlankOptions(blanks: 1),
        const FillBlankAnswer(answers: ['a']),
      );
      expect(renderer.validateAnswer(exercise, 'hello'), false);
    });

    test('buildAnswerPayload wraps answers correctly', () {
      expect(renderer.buildAnswerPayload(['a', 'b']), {'answers': ['a', 'b']});
    });
  });

  group('MatchingRenderer', () {
    const renderer = MatchingRenderer();

    test('has correct type', () {
      expect(renderer.type, ExerciseType.matching);
    });

    test('validateAnswer accepts correct number of pairs', () {
      final exercise = _makeExercise(
        ExerciseType.matching,
        const MatchingOptions(pairs: [
          MatchPair(left: 'A', right: '1'),
          MatchPair(left: 'B', right: '2'),
        ]),
        const MatchingAnswer(matches: [
          MatchPair(left: 'A', right: '1'),
          MatchPair(left: 'B', right: '2'),
        ]),
      );
      expect(
        renderer.validateAnswer(exercise, [
          const MatchPair(left: 'A', right: '1'),
          const MatchPair(left: 'B', right: '2'),
        ]),
        true,
      );
    });

    test('validateAnswer rejects wrong number of pairs', () {
      final exercise = _makeExercise(
        ExerciseType.matching,
        const MatchingOptions(pairs: [
          MatchPair(left: 'A', right: '1'),
          MatchPair(left: 'B', right: '2'),
        ]),
        const MatchingAnswer(matches: [
          MatchPair(left: 'A', right: '1'),
          MatchPair(left: 'B', right: '2'),
        ]),
      );
      expect(
        renderer.validateAnswer(exercise, [
          const MatchPair(left: 'A', right: '1'),
        ]),
        false,
      );
    });

    test('buildAnswerPayload formats matches correctly', () {
      final payload = renderer.buildAnswerPayload([
        const MatchPair(left: 'A', right: '1'),
        const MatchPair(left: 'B', right: '2'),
      ]);
      expect(payload, {
        'matches': [
          {'left': 'A', 'right': '1'},
          {'left': 'B', 'right': '2'},
        ],
      });
    });
  });

  group('OrderingRenderer', () {
    const renderer = OrderingRenderer();

    test('has correct type', () {
      expect(renderer.type, ExerciseType.ordering);
    });

    test('validateAnswer accepts correct-length list', () {
      final exercise = _makeExercise(
        ExerciseType.ordering,
        const OrderingOptions(items: ['A', 'B', 'C']),
        const OrderingAnswer(orderedItems: ['A', 'B', 'C']),
      );
      expect(renderer.validateAnswer(exercise, ['A', 'B', 'C']), true);
    });

    test('validateAnswer rejects wrong-length list', () {
      final exercise = _makeExercise(
        ExerciseType.ordering,
        const OrderingOptions(items: ['A', 'B', 'C']),
        const OrderingAnswer(orderedItems: ['A', 'B', 'C']),
      );
      expect(renderer.validateAnswer(exercise, ['A', 'B']), false);
    });

    test('buildAnswerPayload wraps orderedItems correctly', () {
      expect(renderer.buildAnswerPayload(['C', 'B', 'A']), {
        'orderedItems': ['C', 'B', 'A'],
      });
    });
  });

  group('TranslationRenderer', () {
    const renderer = TranslationRenderer();

    test('has correct type', () {
      expect(renderer.type, ExerciseType.translation);
    });

    test('validateAnswer accepts non-empty string', () {
      final exercise = _makeExercise(
        ExerciseType.translation,
        const TranslationOptions(sourceLanguage: 'vi', targetLanguage: 'en'),
        const TranslationAnswer(translation: 'I love Vietnam'),
      );
      expect(renderer.validateAnswer(exercise, 'I love Vietnam'), true);
    });

    test('validateAnswer rejects empty string', () {
      final exercise = _makeExercise(
        ExerciseType.translation,
        const TranslationOptions(sourceLanguage: 'vi', targetLanguage: 'en'),
        const TranslationAnswer(translation: 'I love Vietnam'),
      );
      expect(renderer.validateAnswer(exercise, ''), false);
    });

    test('validateAnswer rejects whitespace-only string', () {
      final exercise = _makeExercise(
        ExerciseType.translation,
        const TranslationOptions(sourceLanguage: 'vi', targetLanguage: 'en'),
        const TranslationAnswer(translation: 'I love Vietnam'),
      );
      expect(renderer.validateAnswer(exercise, '   '), false);
    });

    test('buildAnswerPayload trims and wraps correctly', () {
      expect(renderer.buildAnswerPayload('  hello  '), {'translation': 'hello'});
    });
  });

  group('ListeningRenderer', () {
    const renderer = ListeningRenderer();

    test('has correct type', () {
      expect(renderer.type, ExerciseType.listening);
    });

    test('validateAnswer accepts non-empty string', () {
      final exercise = _makeExercise(
        ExerciseType.listening,
        const ListeningOptions(audioUrl: 'https://a.mp3', transcriptType: 'exact'),
        const ListeningAnswer(transcript: 'Xin chào'),
      );
      expect(renderer.validateAnswer(exercise, 'Xin chào'), true);
    });

    test('validateAnswer rejects empty string', () {
      final exercise = _makeExercise(
        ExerciseType.listening,
        const ListeningOptions(audioUrl: 'https://a.mp3', transcriptType: 'exact'),
        const ListeningAnswer(transcript: 'Xin chào'),
      );
      expect(renderer.validateAnswer(exercise, ''), false);
    });

    test('buildAnswerPayload trims and wraps correctly', () {
      expect(renderer.buildAnswerPayload('  Xin chào  '), {'transcript': 'Xin chào'});
    });
  });

  group('getRenderer', () {
    test('returns correct renderer for each type', () {
      expect(getRenderer(ExerciseType.multipleChoice), isA<MultipleChoiceRenderer>());
      expect(getRenderer(ExerciseType.fillBlank), isA<FillBlankRenderer>());
      expect(getRenderer(ExerciseType.matching), isA<MatchingRenderer>());
      expect(getRenderer(ExerciseType.ordering), isA<OrderingRenderer>());
      expect(getRenderer(ExerciseType.translation), isA<TranslationRenderer>());
      expect(getRenderer(ExerciseType.listening), isA<ListeningRenderer>());
    });
  });

  group('ExerciseSubmissionResult', () {
    test('parses from JSON correctly', () {
      final json = {
        'id': 'result-1',
        'isCorrect': true,
        'score': 10,
        'userAnswer': 'Hello',
        'timeTaken': 30,
        'attemptedAt': '2024-01-01T00:00:00.000Z',
      };

      final result = ExerciseSubmissionResult.fromJson(json);

      expect(result.id, 'result-1');
      expect(result.isCorrect, true);
      expect(result.score, 10);
      expect(result.timeTaken, 30);
      expect(result.attemptedAt, isNotNull);
    });

    test('handles missing optional fields', () {
      final json = {
        'id': 'result-2',
        'isCorrect': false,
      };

      final result = ExerciseSubmissionResult.fromJson(json);

      expect(result.score, 0);
      expect(result.timeTaken, isNull);
      expect(result.attemptedAt, isNull);
    });
  });

  group('ExerciseAnswer toJson', () {
    test('MultipleChoiceAnswer serializes correctly', () {
      expect(
        const MultipleChoiceAnswer(selectedChoice: 'Hello').toJson(),
        {'selectedChoice': 'Hello'},
      );
    });

    test('FillBlankAnswer serializes correctly', () {
      expect(
        const FillBlankAnswer(answers: ['a', 'b']).toJson(),
        {'answers': ['a', 'b']},
      );
    });

    test('MatchingAnswer serializes correctly', () {
      expect(
        const MatchingAnswer(matches: [
          MatchPair(left: 'A', right: '1'),
        ]).toJson(),
        {
          'matches': [
            {'left': 'A', 'right': '1'},
          ],
        },
      );
    });

    test('OrderingAnswer serializes correctly', () {
      expect(
        const OrderingAnswer(orderedItems: ['X', 'Y']).toJson(),
        {'orderedItems': ['X', 'Y']},
      );
    });

    test('TranslationAnswer serializes correctly', () {
      expect(
        const TranslationAnswer(translation: 'Hello').toJson(),
        {'translation': 'Hello'},
      );
    });

    test('ListeningAnswer serializes correctly', () {
      expect(
        const ListeningAnswer(transcript: 'Xin chào').toJson(),
        {'transcript': 'Xin chào'},
      );
    });
  });
}
