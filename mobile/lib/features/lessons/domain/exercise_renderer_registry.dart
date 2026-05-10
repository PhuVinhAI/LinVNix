import 'exercise_models.dart';
import 'exercise_renderer.dart';
import 'exercise_renderers/multiple_choice_renderer.dart';
import 'exercise_renderers/fill_blank_renderer.dart';
import 'exercise_renderers/matching_renderer.dart';
import 'exercise_renderers/ordering_renderer.dart';
import 'exercise_renderers/translation_renderer.dart';
import 'exercise_renderers/listening_renderer.dart';

const _renderers = <ExerciseType, ExerciseRenderer>{
  ExerciseType.multipleChoice: MultipleChoiceRenderer(),
  ExerciseType.fillBlank: FillBlankRenderer(),
  ExerciseType.matching: MatchingRenderer(),
  ExerciseType.ordering: OrderingRenderer(),
  ExerciseType.translation: TranslationRenderer(),
  ExerciseType.listening: ListeningRenderer(),
};

ExerciseRenderer getRenderer(ExerciseType type) {
  return _renderers[type] ?? const MultipleChoiceRenderer();
}
