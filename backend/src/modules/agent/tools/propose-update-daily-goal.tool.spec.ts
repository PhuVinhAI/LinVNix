import { ProposeUpdateDailyGoalTool } from './propose-update-daily-goal.tool';
import type { ToolContext } from '@linvnix/shared';
import type { User } from '../../users/domain/user.entity';

describe('ProposeUpdateDailyGoalTool', () => {
  let tool: ProposeUpdateDailyGoalTool;

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
    tool = new ProposeUpdateDailyGoalTool();
  });

  describe('static metadata', () => {
    it('declares the expected tool name', () => {
      expect(tool.name).toBe('propose_update_daily_goal');
    });

    it('declares the Vietnamese displayName', () => {
      expect(tool.displayName).toBe('Đang chuẩn bị cập nhật mục tiêu...');
    });

    it('declares a non-empty description', () => {
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('validates parameters with id + target', () => {
      const parsed = tool.parameters.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        target: 20,
      });
      expect(parsed.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(parsed.target).toBe(20);
    });

    it('validates parameters with id only', () => {
      const parsed = tool.parameters.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(parsed.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(parsed.target).toBeUndefined();
    });

    it('rejects invalid uuid', () => {
      expect(() =>
        tool.parameters.parse({ id: 'not-a-uuid', target: 10 }),
      ).toThrow();
    });
  });

  describe('execute', () => {
    it('returns a ProposalPayload with correct kind and endpoint', async () => {
      const result = await tool.execute(
        { id: '550e8400-e29b-41d4-a716-446655440000', target: 20 },
        buildCtx(),
      );

      expect(result.kind).toBe('update_daily_goal');
      expect(result.endpoint).toBe(
        'PATCH /api/v1/daily-goals/550e8400-e29b-41d4-a716-446655440000',
      );
    });

    it('includes targetValue in payload when target is provided', async () => {
      const result = await tool.execute(
        { id: '550e8400-e29b-41d4-a716-446655440000', target: 45 },
        buildCtx(),
      );

      expect(result.payload).toEqual({ targetValue: 45 });
    });

    it('returns empty payload when only id is provided', async () => {
      const result = await tool.execute(
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        buildCtx(),
      );

      expect(result.payload).toEqual({});
    });

    it('substitutes the id path param in the endpoint string', async () => {
      const goalId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      const result = await tool.execute({ id: goalId, target: 10 }, buildCtx());

      expect(result.endpoint).toBe(`PATCH /api/v1/daily-goals/${goalId}`);
    });

    it('does NOT perform any database writes (propose-only)', async () => {
      const result = await tool.execute(
        { id: '550e8400-e29b-41d4-a716-446655440000', target: 10 },
        buildCtx(),
      );

      expect(result).toBeDefined();
      expect(result.kind).toBe('update_daily_goal');
    });
  });

  describe('toDeclaration', () => {
    it('produces a function-calling declaration', () => {
      const decl = tool.toDeclaration();
      expect(decl.name).toBe('propose_update_daily_goal');
      expect(decl.description).toBe(tool.description);
      expect((decl.parameters as any).type).toBe('object');
    });
  });
});
