import { ProposeCreateDailyGoalTool } from './propose-create-daily-goal.tool';
import { GoalType } from '../../../common/enums';
import type { ToolContext } from '@linvnix/shared';
import type { User } from '../../users/domain/user.entity';

describe('ProposeCreateDailyGoalTool', () => {
  let tool: ProposeCreateDailyGoalTool;

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
    tool = new ProposeCreateDailyGoalTool();
  });

  describe('static metadata', () => {
    it('declares the expected tool name', () => {
      expect(tool.name).toBe('propose_create_daily_goal');
    });

    it('declares the Vietnamese displayName', () => {
      expect(tool.displayName).toBe('Đang chuẩn bị mục tiêu mới...');
    });

    it('declares a non-empty description', () => {
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('validates parameters schema with valid input', () => {
      const parsed = tool.parameters.parse({
        type: 'STUDY_MINUTES',
        target: 30,
      });
      expect(parsed).toEqual({ type: 'STUDY_MINUTES', target: 30 });
    });

    it('rejects invalid goal type', () => {
      expect(() =>
        tool.parameters.parse({ type: 'INVALID', target: 10 }),
      ).toThrow();
    });

    it('rejects target below 1', () => {
      expect(() =>
        tool.parameters.parse({ type: 'EXERCISES', target: 0 }),
      ).toThrow();
    });

    it('rejects target above 120', () => {
      expect(() =>
        tool.parameters.parse({ type: 'EXERCISES', target: 121 }),
      ).toThrow();
    });
  });

  describe('execute', () => {
    it('returns a ProposalPayload with correct kind and endpoint', async () => {
      const result = await tool.execute(
        { type: GoalType.EXERCISES, target: 5 },
        buildCtx(),
      );

      expect(result.kind).toBe('create_daily_goal');
      expect(result.endpoint).toBe('POST /api/v1/daily-goals');
    });

    it('returns payload matching CreateDailyGoalDto shape', async () => {
      const result = await tool.execute(
        { type: GoalType.STUDY_MINUTES, target: 30 },
        buildCtx(),
      );

      expect(result.payload).toEqual({
        goalType: 'STUDY_MINUTES',
        targetValue: 30,
      });
    });

    it('localizes description for EXERCISES', async () => {
      const result = await tool.execute(
        { type: GoalType.EXERCISES, target: 10 },
        buildCtx(),
      );

      expect(result.description).toContain('bài tập');
    });

    it('localizes description for STUDY_MINUTES', async () => {
      const result = await tool.execute(
        { type: GoalType.STUDY_MINUTES, target: 30 },
        buildCtx(),
      );

      expect(result.description).toContain('phút học');
    });

    it('localizes description for LESSONS', async () => {
      const result = await tool.execute(
        { type: GoalType.LESSONS, target: 3 },
        buildCtx(),
      );

      expect(result.description).toContain('bài học');
    });

    it('does NOT perform any database writes (propose-only)', async () => {
      const result = await tool.execute(
        { type: GoalType.EXERCISES, target: 5 },
        buildCtx(),
      );

      expect(result).toBeDefined();
      expect(result.kind).toBe('create_daily_goal');
    });
  });

  describe('toDeclaration', () => {
    it('produces a function-calling declaration', () => {
      const decl = tool.toDeclaration();
      expect(decl.name).toBe('propose_create_daily_goal');
      expect(decl.description).toBe(tool.description);
      expect((decl.parameters as any).type).toBe('object');
    });
  });
});
