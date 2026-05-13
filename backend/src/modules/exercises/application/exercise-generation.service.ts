import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { ExerciseTier, ExerciseType } from '../../../common/enums';
import { Exercise } from '../domain/exercise.entity';
import type {
  ExerciseOptions,
  ExerciseAnswer,
} from '../domain/exercise-options.types';

interface LessonContext {
  lessonTitle: string;
  contents: Array<{
    contentType: string;
    vietnameseText: string;
    translation?: string;
    phonetic?: string;
  }>;
  vocabularies: Array<{
    word: string;
    translation: string;
    phonetic?: string;
    partOfSpeech: string;
    exampleSentence?: string;
    exampleTranslation?: string;
  }>;
  grammarRules: Array<{
    title: string;
    explanation: string;
    structure?: string;
    examples: Array<{ vi: string; en: string }>;
  }>;
  basicExercises: Array<{
    exerciseType: string;
    question: string;
    correctAnswer: any;
  }>;
}

export const TIER_GUIDELINES: Record<
  ExerciseTier,
  {
    questionCount: number;
    preferredTypes: ExerciseType[];
    description: string;
  }
> = {
  [ExerciseTier.BASIC]: {
    questionCount: 6,
    preferredTypes: [ExerciseType.MULTIPLE_CHOICE, ExerciseType.MATCHING],
    description:
      'Basic level — focus on recognition and simple recall of vocabulary',
  },
  [ExerciseTier.EASY]: {
    questionCount: 8,
    preferredTypes: [ExerciseType.MATCHING, ExerciseType.MULTIPLE_CHOICE],
    description:
      'Easy level — prefer matching and multiple choice, use vocabulary and grammar from lesson',
  },
  [ExerciseTier.MEDIUM]: {
    questionCount: 12,
    preferredTypes: [
      ExerciseType.FILL_BLANK,
      ExerciseType.TRANSLATION,
      ExerciseType.MULTIPLE_CHOICE,
      ExerciseType.MATCHING,
    ],
    description:
      'Medium level — more fill-blank and translation, increasing complexity',
  },
  [ExerciseTier.HARD]: {
    questionCount: 15,
    preferredTypes: [
      ExerciseType.TRANSLATION,
      ExerciseType.FILL_BLANK,
      ExerciseType.ORDERING,
      ExerciseType.MATCHING,
    ],
    description:
      'Hard level — complex grammar, harder vocabulary, emphasize translation',
  },
  [ExerciseTier.EXPERT]: {
    questionCount: 18,
    preferredTypes: [
      ExerciseType.TRANSLATION,
      ExerciseType.FILL_BLANK,
      ExerciseType.ORDERING,
      ExerciseType.MATCHING,
      ExerciseType.MULTIPLE_CHOICE,
      ExerciseType.LISTENING,
    ],
    description:
      'Expert level — all exercise types at max complexity, advanced vocabulary and grammar',
  },
};

const GeneratedExerciseSchema = z.object({
  exerciseType: z.enum([
    'multiple_choice',
    'fill_blank',
    'matching',
    'ordering',
    'translation',
    'listening',
  ]),
  question: z.string().min(1),
  options: z.any().optional(),
  correctAnswer: z.any(),
  explanation: z.string().optional(),
});

const GenerationResponseSchema = z.object({
  exercises: z.array(GeneratedExerciseSchema).min(1),
});

@Injectable()
export class ExerciseGenerationService {
  private readonly logger = new Logger(ExerciseGenerationService.name);

  constructor(
    private readonly genaiService: GenaiService,
    private readonly exerciseSetsRepository: ExerciseSetsRepository,
    private readonly exercisesRepository: ExercisesRepository,
    private readonly dataSource: DataSource,
  ) {}

  async generate(setId: string, userId: string): Promise<Exercise[]> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new BadRequestException(`ExerciseSet ${setId} not found`);
    }
    if (set.tier === ExerciseTier.BASIC) {
      throw new BadRequestException(
        'Cannot AI-generate exercises for BASIC tier',
      );
    }

    const existing = await this.exercisesRepository.findBySetId(setId);
    if (existing.length > 0) {
      throw new BadRequestException(
        'Set already has exercises. Use regenerate instead.',
      );
    }

    if (set.isCustom) {
      return this.doGenerate(set, userId);
    }

    return this.doGenerate(set, userId);
  }

  async generateForTier(
    lessonId: string,
    tier: ExerciseTier,
    userId: string,
  ): Promise<Exercise[]> {
    if (tier === ExerciseTier.BASIC) {
      throw new BadRequestException(
        'Cannot AI-generate exercises for BASIC tier',
      );
    }

    let set = await this.exerciseSetsRepository.findActiveByLessonAndTier(
      lessonId,
      tier,
    );

    if (!set) {
      set = await this.exerciseSetsRepository.create({
        lessonId,
        tier,
        isAIGenerated: false,
        title: `AI Generated - ${tier}`,
        orderIndex: this.tierToOrderIndex(tier),
      });
    }

    const existing = await this.exercisesRepository.findBySetId(set.id);
    if (existing.length > 0) {
      throw new BadRequestException(
        'Set already has exercises. Use regenerate instead.',
      );
    }

    return this.doGenerate(set, userId);
  }

  async regenerate(setId: string, userId: string): Promise<Exercise[]> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new BadRequestException(`ExerciseSet ${setId} not found`);
    }
    if (set.tier === ExerciseTier.BASIC) {
      throw new BadRequestException('Cannot regenerate BASIC tier exercises');
    }

    await this.exerciseSetsRepository.softDelete(setId);
    await this.exercisesRepository.softDeleteBySetId(setId);

    const newSetData: Partial<
      import('../domain/exercise-set.entity').ExerciseSet
    > = {
      lessonId: set.lessonId,
      isAIGenerated: false,
      title: set.isCustom ? 'Custom Practice' : `AI Generated - ${set.tier}`,
      orderIndex: set.orderIndex,
    };

    if (set.isCustom) {
      (newSetData as any).isCustom = true;
      (newSetData as any).customConfig = set.customConfig;
      (newSetData as any).tier = null;
    } else {
      (newSetData as any).tier = set.tier;
    }

    const newSet = await this.exerciseSetsRepository.create(newSetData);

    return this.doGenerate(newSet, userId);
  }

  async generateCustom(setId: string, userId: string): Promise<Exercise[]> {
    const set = await this.exerciseSetsRepository.findById(setId);
    if (!set) {
      throw new BadRequestException(`ExerciseSet ${setId} not found`);
    }
    if (!set.isCustom) {
      throw new BadRequestException(
        'Use generate() for tier-based sets, not generateCustom()',
      );
    }

    const existing = await this.exercisesRepository.findBySetId(setId);
    if (existing.length > 0) {
      throw new BadRequestException(
        'Set already has exercises. Use regenerate instead.',
      );
    }

    return this.doGenerate(set, userId);
  }

  private async doGenerate(
    set: import('../domain/exercise-set.entity').ExerciseSet,
    userId: string,
  ): Promise<Exercise[]> {
    const context = await this.loadLessonContext(set.lessonId);

    let guidelines: {
      questionCount: number;
      preferredTypes: ExerciseType[];
      description: string;
    };
    let tierLabel: string;

    if (set.isCustom && set.customConfig) {
      const config = set.customConfig;
      tierLabel = `Custom (${config.focusArea})`;
      guidelines = {
        questionCount: config.questionCount,
        preferredTypes: config.exerciseTypes,
        description: this.getFocusAreaDescription(config.focusArea),
      };
    } else {
      tierLabel = set.tier ?? 'Custom';
      guidelines = TIER_GUIDELINES[set.tier as ExerciseTier];
    }

    const prompt = this.buildPrompt(context, guidelines, tierLabel);
    const systemInstruction = this.buildSystemInstruction();

    const response = await this.genaiService.chat({
      messages: [{ role: 'user', content: prompt }],
      systemInstruction,
    });

    const generated = this.parseResponse(response.text);

    const exercises = await this.persistExercises(generated, set, prompt);

    await this.exerciseSetsRepository.update(set.id, {
      isAIGenerated: true,
      generatedById: userId,
      promptUsed: prompt,
    });

    this.logger.log(
      `Generated ${exercises.length} exercises for set ${set.id} (tier: ${tierLabel})`,
    );

    return exercises;
  }

  async loadLessonContext(lessonId: string): Promise<LessonContext> {
    const lessonRepo = this.dataSource.getRepository('Lesson');
    const lesson = await lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['contents', 'vocabularies', 'grammarRules'],
    });

    if (!lesson) {
      throw new BadRequestException(`Lesson ${lessonId} not found`);
    }

    const basicSet =
      await this.exerciseSetsRepository.findActiveByLessonAndTier(
        lessonId,
        ExerciseTier.BASIC,
      );

    let basicExercises: Array<{
      exerciseType: string;
      question: string;
      correctAnswer: any;
    }> = [];
    if (basicSet) {
      const exercises = await this.exercisesRepository.findBySetId(basicSet.id);
      basicExercises = exercises.map((e) => ({
        exerciseType: e.exerciseType,
        question: e.question,
        correctAnswer: e.correctAnswer,
      }));
    }

    return {
      lessonTitle: lesson.title,
      contents: (lesson.contents || []).map((c: any) => ({
        contentType: c.contentType,
        vietnameseText: c.vietnameseText,
        translation: c.translation,
        phonetic: c.phonetic,
      })),
      vocabularies: (lesson.vocabularies || []).map((v: any) => ({
        word: v.word,
        translation: v.translation,
        phonetic: v.phonetic,
        partOfSpeech: v.partOfSpeech,
        exampleSentence: v.exampleSentence,
        exampleTranslation: v.exampleTranslation,
      })),
      grammarRules: (lesson.grammarRules || []).map((g: any) => ({
        title: g.title,
        explanation: g.explanation,
        structure: g.structure,
        examples: g.examples,
      })),
      basicExercises,
    };
  }

  buildPrompt(
    context: LessonContext,
    guidelines: (typeof TIER_GUIDELINES)[ExerciseTier],
    tier: string,
  ): string {
    const contextSection = this.formatContext(context);
    const avoidSection = this.formatBasicExercises(context.basicExercises);

    return `Generate ${guidelines.questionCount} Vietnamese language exercises for the ${tier} tier (${guidelines.description}).
Preferred exercise types: ${guidelines.preferredTypes.join(', ')}.

## Lesson: ${context.lessonTitle}

${contextSection}
${avoidSection}

Each exercise must:
- Test different vocabulary or grammar from the lesson
- Be unique (not duplicating basic tier exercises above)
- Mix Vietnamese and English naturally per exercise type
  - matching: Vietnamese↔English pairs
  - translation: either direction (Vietnamese→English or English→Vietnamese)
  - fill_blank / multiple_choice / ordering: Vietnamese questions
  - listening: Vietnamese audio (provide transcript, set audioUrl to empty string)

Return ONLY valid JSON matching this schema — no markdown fences, no commentary:
{
  "exercises": [
    {
      "exerciseType": "matching" | "multiple_choice" | "fill_blank" | "ordering" | "translation" | "listening",
      "question": "string — the question text",
      "options": { ... exercise-type-specific options ... },
      "correctAnswer": { ... exercise-type-specific answer ... },
      "explanation": "optional string explaining the answer"
    }
  ]
}

Exercise-type option/answer shapes:
- multiple_choice: options={choices:["A","B","C","D"]}, correctAnswer={selectedChoice:"B"}
- fill_blank: options={blanks:1,acceptedAnswers:[["answer1","answer2"]]}, correctAnswer={answers:["answer1"]}
- matching: options={pairs:[{left:"Vi",right:"En"}]}, correctAnswer={matches:[{left:"Vi",right:"En"}]}
- ordering: options={items:["C","A","B"]}, correctAnswer={orderedItems:["A","B","C"]}
- translation: options={sourceLanguage:"vi",targetLanguage:"en",acceptedTranslations:["Hello"]}, correctAnswer={translation:"Hello"}
- listening: options={audioUrl:"",transcriptType:"exact",keywords:["keyword"]}, correctAnswer={transcript:"text"}`;
  }

  parseResponse(
    responseText: string,
  ): z.infer<typeof GenerationResponseSchema> {
    let text = responseText.trim();

    if (text.startsWith('```')) {
      const firstNewline = text.indexOf('\n');
      const lastBacktick = text.lastIndexOf('```');
      if (firstNewline > 0 && lastBacktick > firstNewline) {
        text = text.slice(firstNewline + 1, lastBacktick).trim();
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.logger.error('Failed to parse AI response as JSON');
      this.logger.debug('Response text:', text.slice(0, 500));
      throw new BadRequestException(
        'AI response is not valid JSON. Please try again.',
      );
    }

    const result = GenerationResponseSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.error('AI response schema validation failed');
      this.logger.debug('Validation errors:', result.error.errors);
      throw new BadRequestException(
        'AI response does not match expected schema. Please try again.',
      );
    }

    return result.data;
  }

  private buildSystemInstruction(): string {
    return `You are a Vietnamese language exercise generator. You MUST respond with ONLY valid JSON — no markdown code fences, no explanation text, no commentary. The JSON must conform to the schema provided in the user prompt. Generate exercises that are pedagogically sound, culturally appropriate, and test the specific vocabulary and grammar from the lesson context provided.`;
  }

  private formatContext(context: LessonContext): string {
    const parts: string[] = [];

    if (context.contents.length > 0) {
      parts.push('### Lesson Content');
      for (const c of context.contents) {
        parts.push(
          `- [${c.contentType}] ${c.vietnameseText}${c.translation ? ` = ${c.translation}` : ''}${c.phonetic ? ` (${c.phonetic})` : ''}`,
        );
      }
    }

    if (context.vocabularies.length > 0) {
      parts.push('\n### Vocabulary');
      for (const v of context.vocabularies) {
        parts.push(
          `- ${v.word} (${v.partOfSpeech}) = ${v.translation}${v.phonetic ? ` [${v.phonetic}]` : ''}${v.exampleSentence ? ` — "${v.exampleSentence}"` : ''}`,
        );
      }
    }

    if (context.grammarRules.length > 0) {
      parts.push('\n### Grammar Rules');
      for (const g of context.grammarRules) {
        parts.push(
          `- ${g.title}: ${g.explanation}${g.structure ? ` [${g.structure}]` : ''}`,
        );
        for (const ex of g.examples) {
          parts.push(`    Example: ${ex.vi} = ${ex.en}`);
        }
      }
    }

    return parts.join('\n');
  }

  private formatBasicExercises(
    basicExercises: LessonContext['basicExercises'],
  ): string {
    if (basicExercises.length === 0) return '';

    const lines = [
      '\n### Existing Basic Tier Exercises (DO NOT duplicate these)',
    ];
    for (const e of basicExercises) {
      lines.push(`- [${e.exerciseType}] ${e.question}`);
    }
    return lines.join('\n');
  }

  private async persistExercises(
    generated: z.infer<typeof GenerationResponseSchema>,
    set: import('../domain/exercise-set.entity').ExerciseSet,
    _prompt: string,
  ): Promise<Exercise[]> {
    const exercises: Exercise[] = [];

    for (let i = 0; i < generated.exercises.length; i++) {
      const ex = generated.exercises[i];
      const exercise = await this.exercisesRepository.create({
        exerciseType: ex.exerciseType as ExerciseType,
        question: ex.question,
        options: ex.options as ExerciseOptions,
        correctAnswer: ex.correctAnswer as ExerciseAnswer,
        explanation: ex.explanation,
        orderIndex: i + 1,
        difficultyLevel: this.tierToDifficulty(set.tier),
        lessonId: set.lessonId,
        setId: set.id,
      });
      exercises.push(exercise);
    }

    return exercises;
  }

  private tierToDifficulty(tier: ExerciseTier | null): number {
    if (!tier) return 3;
    switch (tier) {
      case ExerciseTier.BASIC:
        return 1;
      case ExerciseTier.EASY:
        return 2;
      case ExerciseTier.MEDIUM:
        return 3;
      case ExerciseTier.HARD:
        return 4;
      case ExerciseTier.EXPERT:
        return 5;
      default:
        return 1;
    }
  }

  private getFocusAreaDescription(focusArea: string): string {
    switch (focusArea) {
      case 'vocabulary':
        return 'Focus on vocabulary — emphasize matching, multiple choice, and translation exercises that test word recognition and recall';
      case 'grammar':
        return 'Focus on grammar — emphasize fill-blank, ordering, and translation exercises that test grammar structure and sentence construction';
      case 'both':
      default:
        return 'Mix of vocabulary and grammar — use a balanced variety of exercise types covering both word knowledge and grammar structure';
    }
  }

  private tierToOrderIndex(tier: ExerciseTier): number {
    const order: Record<ExerciseTier, number> = {
      [ExerciseTier.BASIC]: 0,
      [ExerciseTier.EASY]: 1,
      [ExerciseTier.MEDIUM]: 2,
      [ExerciseTier.HARD]: 3,
      [ExerciseTier.EXPERT]: 4,
    };
    return order[tier] ?? 0;
  }
}
