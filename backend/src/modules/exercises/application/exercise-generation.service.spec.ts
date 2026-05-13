import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ExerciseGenerationService,
  TIER_GUIDELINES,
} from './exercise-generation.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import { ExerciseSetsRepository } from './repositories/exercise-sets.repository';
import { ExercisesRepository } from './repositories/exercises.repository';
import { ExerciseTier, ExerciseType } from '../../../common/enums';

describe('ExerciseGenerationService', () => {
  let service: ExerciseGenerationService;
  let genaiService: jest.Mocked<GenaiService>;
  let exerciseSetsRepo: jest.Mocked<ExerciseSetsRepository>;
  let exercisesRepo: jest.Mocked<ExercisesRepository>;
  let dataSource: { getRepository: jest.Mock };

  const mockLessonContext = {
    lessonTitle: 'Greetings',
    contents: [
      {
        contentType: 'text',
        vietnameseText: 'Xin chào',
        translation: 'Hello',
        phonetic: 'sin chow',
      },
    ],
    vocabularies: [
      {
        word: 'Xin chào',
        translation: 'Hello',
        phonetic: 'sin chow',
        partOfSpeech: 'noun',
        exampleSentence: 'Xin chào bạn!',
        exampleTranslation: 'Hello friend!',
      },
    ],
    grammarRules: [
      {
        title: 'Basic greeting',
        explanation: 'Use "Xin chào" for hello',
        structure: 'Xin chào + pronoun',
        examples: [{ vi: 'Xin chào anh', en: 'Hello brother' }],
      },
    ],
    basicExercises: [
      {
        exerciseType: 'multiple_choice',
        question: 'What does "Xin chào" mean?',
        correctAnswer: { selectedChoice: 'Hello' },
      },
    ],
  };

  const validAiResponse = JSON.stringify({
    exercises: [
      {
        exerciseType: 'matching',
        question:
          'Match the Vietnamese greetings with their English translations',
        options: {
          type: 'matching',
          pairs: [
            { left: 'Xin chào', right: 'Hello' },
            { left: 'Cảm ơn', right: 'Thank you' },
          ],
        },
        correctAnswer: {
          matches: [
            { left: 'Xin chào', right: 'Hello' },
            { left: 'Cảm ơn', right: 'Thank you' },
          ],
        },
        explanation: 'These are common Vietnamese greetings',
      },
    ],
  });

  beforeEach(async () => {
    genaiService = {
      chat: jest.fn(),
    } as any;

    exerciseSetsRepo = {
      findById: jest.fn(),
      findActiveByLessonAndTier: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      create: jest.fn(),
    } as any;

    exercisesRepo = {
      findBySetId: jest.fn(),
      create: jest.fn(),
      softDeleteBySetId: jest.fn(),
    } as any;

    dataSource = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({
          title: 'Greetings',
          contents: [
            {
              contentType: 'text',
              vietnameseText: 'Xin chào',
              translation: 'Hello',
              phonetic: 'sin chow',
            },
          ],
          vocabularies: [
            {
              word: 'Xin chào',
              translation: 'Hello',
              phonetic: 'sin chow',
              partOfSpeech: 'noun',
              exampleSentence: 'Xin chào bạn!',
              exampleTranslation: 'Hello friend!',
            },
          ],
          grammarRules: [
            {
              title: 'Basic greeting',
              explanation: 'Use "Xin chào" for hello',
              structure: 'Xin chào + pronoun',
              examples: [{ vi: 'Xin chào anh', en: 'Hello brother' }],
            },
          ],
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseGenerationService,
        { provide: GenaiService, useValue: genaiService },
        { provide: ExerciseSetsRepository, useValue: exerciseSetsRepo },
        { provide: ExercisesRepository, useValue: exercisesRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ExerciseGenerationService>(ExerciseGenerationService);
  });

  describe('generate', () => {
    it('throws for BASIC tier', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        tier: ExerciseTier.BASIC,
        lessonId: 'lesson-1',
      } as any);

      await expect(service.generate('set-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when set already has exercises', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        tier: ExerciseTier.EASY,
        lessonId: 'lesson-1',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([{ id: 'ex-1' } as any]);

      await expect(service.generate('set-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when set not found', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.generate('missing', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('generates and persists exercises for empty EASY set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        tier: ExerciseTier.EASY,
        lessonId: 'lesson-1',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);
      genaiService.chat.mockResolvedValue({
        text: validAiResponse,
        usageMetadata: {},
      });
      exercisesRepo.create.mockImplementation(
        async (data) =>
          ({
            id: `gen-${data.orderIndex}`,
            ...data,
          }) as any,
      );
      exerciseSetsRepo.update.mockResolvedValue({ id: 'set-1' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);

      const result = await service.generate('set-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(exercisesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          exerciseType: 'matching',
          setId: 'set-1',
          lessonId: 'lesson-1',
        }),
      );
      expect(exerciseSetsRepo.update).toHaveBeenCalledWith(
        'set-1',
        expect.objectContaining({
          isAIGenerated: true,
          generatedById: 'user-1',
        }),
      );
    });
  });

  describe('buildPrompt', () => {
    it('includes tier name and question count', () => {
      const guidelines = {
        questionCount: 8,
        preferredTypes: [ExerciseType.MATCHING, ExerciseType.MULTIPLE_CHOICE],
        description: 'Easy level',
      };

      const prompt = service.buildPrompt(
        mockLessonContext,
        guidelines,
        ExerciseTier.EASY,
      );

      expect(prompt).toContain('8');
      expect(prompt).toContain('EASY');
      expect(prompt).toContain('matching');
      expect(prompt).toContain('multiple_choice');
    });

    it('includes lesson vocabulary', () => {
      const guidelines = {
        questionCount: 8,
        preferredTypes: [ExerciseType.MATCHING],
        description: 'Easy level',
      };

      const prompt = service.buildPrompt(
        mockLessonContext,
        guidelines,
        ExerciseTier.EASY,
      );

      expect(prompt).toContain('Xin chào');
      expect(prompt).toContain('Hello');
    });

    it('includes grammar rules', () => {
      const guidelines = {
        questionCount: 8,
        preferredTypes: [ExerciseType.MATCHING],
        description: 'Easy level',
      };

      const prompt = service.buildPrompt(
        mockLessonContext,
        guidelines,
        ExerciseTier.EASY,
      );

      expect(prompt).toContain('Basic greeting');
      expect(prompt).toContain('Xin chào + pronoun');
    });

    it('includes basic exercises to avoid duplication', () => {
      const guidelines = {
        questionCount: 8,
        preferredTypes: [ExerciseType.MATCHING],
        description: 'Easy level',
      };

      const prompt = service.buildPrompt(
        mockLessonContext,
        guidelines,
        ExerciseTier.EASY,
      );

      expect(prompt).toContain('DO NOT duplicate');
      expect(prompt).toContain('What does "Xin chào" mean?');
    });

    it('omits basic exercises section when none exist', () => {
      const contextNoBasic = {
        ...mockLessonContext,
        basicExercises: [],
      };
      const guidelines = {
        questionCount: 8,
        preferredTypes: [ExerciseType.MATCHING],
        description: 'Easy level',
      };

      const prompt = service.buildPrompt(
        contextNoBasic,
        guidelines,
        ExerciseTier.EASY,
      );

      expect(prompt).not.toContain('DO NOT duplicate');
    });

    it('includes JSON schema specification', () => {
      const guidelines = {
        questionCount: 8,
        preferredTypes: [ExerciseType.MATCHING],
        description: 'Easy level',
      };

      const prompt = service.buildPrompt(
        mockLessonContext,
        guidelines,
        ExerciseTier.EASY,
      );

      expect(prompt).toContain('"exercises"');
      expect(prompt).toContain('exerciseType');
      expect(prompt).toContain('correctAnswer');
    });
  });

  describe('parseResponse', () => {
    it('parses valid JSON response', () => {
      const result = service.parseResponse(validAiResponse);

      expect(result.exercises).toHaveLength(1);
      expect(result.exercises[0].exerciseType).toBe('matching');
      expect(result.exercises[0].question).toContain('Match');
    });

    it('strips markdown code fences before parsing', () => {
      const fenced = '```json\n' + validAiResponse + '\n```';

      const result = service.parseResponse(fenced);

      expect(result.exercises).toHaveLength(1);
    });

    it('throws for non-JSON response', () => {
      expect(() => service.parseResponse('This is not JSON')).toThrow(
        BadRequestException,
      );
    });

    it('throws for JSON missing exercises array', () => {
      expect(() => service.parseResponse(JSON.stringify({ data: [] }))).toThrow(
        BadRequestException,
      );
    });

    it('throws for exercise with missing required fields', () => {
      const invalidExercise = JSON.stringify({
        exercises: [{ exerciseType: 'matching' }],
      });

      expect(() => service.parseResponse(invalidExercise)).toThrow(
        BadRequestException,
      );
    });

    it('throws for invalid exercise type', () => {
      const invalidType = JSON.stringify({
        exercises: [
          {
            exerciseType: 'invalid_type',
            question: 'Q?',
            correctAnswer: {},
          },
        ],
      });

      expect(() => service.parseResponse(invalidType)).toThrow(
        BadRequestException,
      );
    });

    it('handles response with markdown fences and no language tag', () => {
      const fenced = '```\n' + validAiResponse + '\n```';

      const result = service.parseResponse(fenced);

      expect(result.exercises).toHaveLength(1);
    });
  });

  describe('TIER_GUIDELINES', () => {
    it('MEDIUM has ~12 questions with fill-blank and translation', () => {
      expect(TIER_GUIDELINES[ExerciseTier.MEDIUM].questionCount).toBe(12);
      expect(TIER_GUIDELINES[ExerciseTier.MEDIUM].preferredTypes).toContain(
        ExerciseType.FILL_BLANK,
      );
      expect(TIER_GUIDELINES[ExerciseTier.MEDIUM].preferredTypes).toContain(
        ExerciseType.TRANSLATION,
      );
    });

    it('HARD has ~15 questions with complex grammar emphasis', () => {
      expect(TIER_GUIDELINES[ExerciseTier.HARD].questionCount).toBe(15);
      expect(TIER_GUIDELINES[ExerciseTier.HARD].preferredTypes).toContain(
        ExerciseType.TRANSLATION,
      );
      expect(TIER_GUIDELINES[ExerciseTier.HARD].preferredTypes).toContain(
        ExerciseType.ORDERING,
      );
      expect(TIER_GUIDELINES[ExerciseTier.HARD].preferredTypes).toContain(
        ExerciseType.MATCHING,
      );
    });

    it('EXPERT has ~18 questions with all exercise types', () => {
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].questionCount).toBe(18);
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].preferredTypes).toContain(
        ExerciseType.TRANSLATION,
      );
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].preferredTypes).toContain(
        ExerciseType.FILL_BLANK,
      );
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].preferredTypes).toContain(
        ExerciseType.ORDERING,
      );
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].preferredTypes).toContain(
        ExerciseType.MATCHING,
      );
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].preferredTypes).toContain(
        ExerciseType.MULTIPLE_CHOICE,
      );
      expect(TIER_GUIDELINES[ExerciseTier.EXPERT].preferredTypes).toContain(
        ExerciseType.LISTENING,
      );
    });

    it('higher tiers have more questions than lower tiers', () => {
      expect(
        TIER_GUIDELINES[ExerciseTier.MEDIUM].questionCount,
      ).toBeGreaterThan(TIER_GUIDELINES[ExerciseTier.EASY].questionCount);
      expect(TIER_GUIDELINES[ExerciseTier.HARD].questionCount).toBeGreaterThan(
        TIER_GUIDELINES[ExerciseTier.MEDIUM].questionCount,
      );
      expect(
        TIER_GUIDELINES[ExerciseTier.EXPERT].questionCount,
      ).toBeGreaterThan(TIER_GUIDELINES[ExerciseTier.HARD].questionCount);
    });
  });

  describe('regenerate', () => {
    it('throws for BASIC tier', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'set-1',
        tier: ExerciseTier.BASIC,
        lessonId: 'lesson-1',
      } as any);

      await expect(service.regenerate('set-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when set not found', async () => {
      exerciseSetsRepo.findById.mockResolvedValue(null);

      await expect(service.regenerate('missing', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('soft-deletes old set and exercises, then generates new set', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'old-set',
        tier: ExerciseTier.MEDIUM,
        lessonId: 'lesson-1',
        orderIndex: 2,
      } as any);
      exerciseSetsRepo.softDelete.mockResolvedValue(undefined);
      exercisesRepo.softDeleteBySetId.mockResolvedValue(undefined);
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'new-set',
        tier: ExerciseTier.MEDIUM,
        lessonId: 'lesson-1',
        orderIndex: 2,
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);
      genaiService.chat.mockResolvedValue({ text: validAiResponse, usageMetadata: {} });
      exercisesRepo.create.mockImplementation(async (data) => ({
        id: `gen-${data.orderIndex}`,
        ...data,
      } as any));
      exerciseSetsRepo.update.mockResolvedValue({ id: 'new-set' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);
      exerciseSetsRepo.softDelete.mockResolvedValue(undefined);
      exercisesRepo.softDeleteBySetId.mockResolvedValue(undefined);
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'new-set',
        tier: ExerciseTier.MEDIUM,
        lessonId: 'lesson-1',
        orderIndex: 2,
      } as any);
      genaiService.chat.mockResolvedValue({
        text: validAiResponse,
        usageMetadata: {},
      });
      exercisesRepo.create.mockImplementation(
        async (data) =>
          ({
            id: `gen-${data.orderIndex}`,
            ...data,
          }) as any,
      );
      exerciseSetsRepo.update.mockResolvedValue({ id: 'new-set' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);

      const result = await service.regenerate('old-set', 'user-1');

      expect(exerciseSetsRepo.softDelete).toHaveBeenCalledWith('old-set');
      expect(exercisesRepo.softDeleteBySetId).toHaveBeenCalledWith('old-set');
      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonId: 'lesson-1',
          tier: ExerciseTier.MEDIUM,
          orderIndex: 2,
        }),
      );
      expect(result).toHaveLength(1);
      expect(exercisesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          setId: 'new-set',
          lessonId: 'lesson-1',
        }),
      );
    });

    it('generates for HARD tier', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'old-hard',
        tier: ExerciseTier.HARD,
        lessonId: 'lesson-1',
        orderIndex: 3,
      } as any);
      exerciseSetsRepo.softDelete.mockResolvedValue(undefined);
      exercisesRepo.softDeleteBySetId.mockResolvedValue(undefined);
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'new-hard',
        tier: ExerciseTier.HARD,
        lessonId: 'lesson-1',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);
      genaiService.chat.mockResolvedValue({ text: validAiResponse, usageMetadata: {} });
      exercisesRepo.create.mockImplementation(async (data) => ({
        id: `gen-${data.orderIndex}`,
        ...data,
      } as any));
      exerciseSetsRepo.update.mockResolvedValue({ id: 'new-hard' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);
      exerciseSetsRepo.softDelete.mockResolvedValue(undefined);
      exercisesRepo.softDeleteBySetId.mockResolvedValue(undefined);
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'new-hard',
        tier: ExerciseTier.HARD,
        lessonId: 'lesson-1',
      } as any);
      genaiService.chat.mockResolvedValue({
        text: validAiResponse,
        usageMetadata: {},
      });
      exercisesRepo.create.mockImplementation(
        async (data) =>
          ({
            id: `gen-${data.orderIndex}`,
            ...data,
          }) as any,
      );
      exerciseSetsRepo.update.mockResolvedValue({ id: 'new-hard' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);

      const result = await service.regenerate('old-hard', 'user-1');

      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tier: ExerciseTier.HARD }),
      );
      expect(result).toHaveLength(1);
    });

    it('generates for EXPERT tier', async () => {
      exerciseSetsRepo.findById.mockResolvedValue({
        id: 'old-expert',
        tier: ExerciseTier.EXPERT,
        lessonId: 'lesson-1',
        orderIndex: 4,
      } as any);
      exerciseSetsRepo.softDelete.mockResolvedValue(undefined);
      exercisesRepo.softDeleteBySetId.mockResolvedValue(undefined);
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'new-expert',
        tier: ExerciseTier.EXPERT,
        lessonId: 'lesson-1',
      } as any);
      exercisesRepo.findBySetId.mockResolvedValue([]);
      genaiService.chat.mockResolvedValue({ text: validAiResponse, usageMetadata: {} });
      exercisesRepo.create.mockImplementation(async (data) => ({
        id: `gen-${data.orderIndex}`,
        ...data,
      } as any));
      exerciseSetsRepo.update.mockResolvedValue({ id: 'new-expert' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);
      exerciseSetsRepo.softDelete.mockResolvedValue(undefined);
      exercisesRepo.softDeleteBySetId.mockResolvedValue(undefined);
      exerciseSetsRepo.create.mockResolvedValue({
        id: 'new-expert',
        tier: ExerciseTier.EXPERT,
        lessonId: 'lesson-1',
      } as any);
      genaiService.chat.mockResolvedValue({
        text: validAiResponse,
        usageMetadata: {},
      });
      exercisesRepo.create.mockImplementation(
        async (data) =>
          ({
            id: `gen-${data.orderIndex}`,
            ...data,
          }) as any,
      );
      exerciseSetsRepo.update.mockResolvedValue({ id: 'new-expert' } as any);
      exerciseSetsRepo.findActiveByLessonAndTier.mockResolvedValue({
        id: 'basic-set',
      } as any);

      const result = await service.regenerate('old-expert', 'user-1');

      expect(exerciseSetsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tier: ExerciseTier.EXPERT }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
