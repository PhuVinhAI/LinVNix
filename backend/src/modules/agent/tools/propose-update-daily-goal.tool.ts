import { Injectable } from '@nestjs/common';
import {
  ProposeTool,
  type ProposalPayload,
  type ToolContext,
} from '@linvnix/shared';
import { z } from 'zod';
import { GoalType } from '../../../common/enums';
import type { User } from '../../users/domain/user.entity';

const paramsSchema = z
  .object({
    id: z.string().uuid(),
    type: z
      .enum([GoalType.EXERCISES, GoalType.STUDY_MINUTES, GoalType.LESSONS])
      .optional(),
    target: z.number().int().min(1).max(120).optional(),
  })
  .strip();

type ProposeUpdateDailyGoalParams = z.infer<typeof paramsSchema>;

@Injectable()
export class ProposeUpdateDailyGoalTool extends ProposeTool<ProposeUpdateDailyGoalParams> {
  readonly name = 'propose_update_daily_goal';
  readonly displayName = 'Đang chuẩn bị cập nhật mục tiêu...';
  readonly description =
    'Proposes updating an existing daily goal. Does NOT update directly — ' +
    'returns a proposal payload the mobile app renders as a confirm card. ' +
    'On "Có" the mobile client calls PATCH /api/v1/daily-goals/:id. ' +
    'Parameters: id (goal UUID), and optionally type and/or target to change.';
  readonly parameters = paramsSchema;

  async execute(
    params: ProposeUpdateDailyGoalParams,
    _ctx: ToolContext<User>,
  ): Promise<ProposalPayload> {
    const payload: Record<string, unknown> = {};
    if (params.target !== undefined) {
      payload.targetValue = params.target;
    }

    return {
      kind: 'update_daily_goal',
      title: 'Cập nhật mục tiêu hằng ngày?',
      description: params.target
        ? `Đổi mục tiêu thành ${params.target}`
        : 'Cập nhật mục tiêu hằng ngày',
      endpoint: `PATCH /api/v1/daily-goals/${params.id}`,
      payload,
    };
  }
}
