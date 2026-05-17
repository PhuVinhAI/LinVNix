import { ProposeGenerateCustomExerciseSetTool } from './propose-generate-custom-exercise-set.tool';
import { ExerciseType } from '../../../common/enums';
import type { ToolContext } from '@linvnix/shared';
import type { User } from '../../users/domain/user.entity';

describe('ProposeGenerateCustomExerciseSetTool', () => {
  let tool: ProposeGenerateCustomExerciseSetTool;

  const buildCtx = (
    overrides: Partial<ToolContext<User>> = {},
  ): ToolContext<User> => ({
    userId: 'user-1',
    conversationId: 'conv-1',
    screenContext: { route: '/' },
    user: { id: 'user-1' } as User,
    ...overrides,
  });

  beforeEach(() => {
    tool = new ProposeGenerateCustomExerciseSetTool();
  });

  describe('static metadata', () => {
    it('declares the expected tool name', () => {
      expect(tool.name).toBe('propose_generate_custom_exercise_set');
    });

    it('declares the Vietnamese displayName', () => {
      expect(tool.displayName).toBe('Đang chuẩn bị bộ bài tập...');
    });

    it('declares a non-empty description', () => {
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('validates parameters with all required fields', () => {
      const parsed = tool.parameters.parse({
        topic: 'family vocabulary',
        level: 'A1',
        count: 10,
      });
      expect(parsed.topic).toBe('family vocabulary');
      expect(parsed.level).toBe('A1');
      expect(parsed.count).toBe(10);
    });

    it('validates parameters with optional lessonId', () => {
      const parsed = tool.parameters.parse({
        topic: 'greetings',
        level: 'A2',
        count: 5,
        lessonId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(parsed.lessonId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('rejects count above 30', () => {
      expect(() =>
        tool.parameters.parse({ topic: 'x', level: 'A1', count: 31 }),
      ).toThrow();
    });

    it('rejects count below 1', () => {
      expect(() =>
        tool.parameters.parse({ topic: 'x', level: 'A1', count: 0 }),
      ).toThrow();
    });

    it('rejects empty topic', () => {
      expect(() =>
        tool.parameters.parse({ topic: '', level: 'A1', count: 5 }),
      ).toThrow();
    });
  });

  describe('execute', () => {
    it('returns a ProposalPayload with correct kind and endpoint', async () => {
      const result = await tool.execute(
        { topic: 'family vocabulary', level: 'A1', count: 10 },
        buildCtx(),
      );

      expect(result.kind).toBe('generate_custom_exercise_set');
      expect(result.endpoint).toBe('POST /api/v1/exercise-sets/custom');
    });

    it('includes config matching CreateCustomSetDto shape', async () => {
      const result = await tool.execute(
        { topic: 'greetings', level: 'A2', count: 5 },
        buildCtx(),
      );

      expect(result.payload.config).toEqual({
        questionCount: 5,
        exerciseTypes: [ExerciseType.MULTIPLE_CHOICE],
        focusArea: 'both',
      });
      expect(result.payload.userPrompt).toBe('greetings');
    });

    it('includes lessonId in payload when provided', async () => {
      const lessonId = '550e8400-e29b-41d4-a716-446655440000';
      const result = await tool.execute(
        { topic: 'numbers', level: 'A1', count: 3, lessonId },
        buildCtx(),
      );

      expect(result.payload.lessonId).toBe(lessonId);
    });

    it('omits lessonId from payload when not provided', async () => {
      const result = await tool.execute(
        { topic: 'numbers', level: 'A1', count: 3 },
        buildCtx(),
      );

      expect(result.payload).not.toHaveProperty('lessonId');
    });

    it('does NOT perform any database writes (propose-only)', async () => {
      const result = await tool.execute(
        { topic: 'family', level: 'A1', count: 5 },
        buildCtx(),
      );

      expect(result).toBeDefined();
      expect(result.kind).toBe('generate_custom_exercise_set');
    });
  });

  describe('toDeclaration', () => {
    it('produces a function-calling declaration', () => {
      const decl = tool.toDeclaration();
      expect(decl.name).toBe('propose_generate_custom_exercise_set');
      expect(decl.description).toBe(tool.description);
      expect((decl.parameters as any).type).toBe('object');
    });
  });
});
