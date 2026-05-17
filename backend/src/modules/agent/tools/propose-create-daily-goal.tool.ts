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
    type: z.enum([
      GoalType.EXERCISES,
      GoalType.STUDY_MINUTES,
      GoalType.LESSONS,
    ]),
    target: z.number().int().min(1).max(120),
  })
  .strip();

type ProposeCreateDailyGoalParams = z.infer<typeof paramsSchema>;

@Injectable()
export class ProposeCreateDailyGoalTool extends ProposeTool<ProposeCreateDailyGoalParams> {
  readonly name = 'propose_create_daily_goal';
  readonly displayName = 'Đang chuẩn bị mục tiêu mới...';
  readonly description =
    'Proposes creating a new daily goal for the learner. Does NOT create ' +
    'the goal directly — returns a proposal payload the mobile app shows ' +
    'as an inline confirm card. On the learner\'s "Có" tap the mobile ' +
    'client calls POST /api/v1/daily-goals with the payload. ' +
    'Parameters: type (EXERCISES, STUDY_MINUTES, or LESSONS) and target ' +
    '(1–120).';
  readonly parameters = paramsSchema;

  async execute(
    params: ProposeCreateDailyGoalParams,
    _ctx: ToolContext<User>,
  ): Promise<ProposalPayload> {
    return {
      kind: 'create_daily_goal',
      title: 'Tạo mục tiêu hằng ngày?',
      description: `Đặt mục tiêu ${params.target} ${params.type === GoalType.EXERCISES ? 'bài tập' : params.type === GoalType.STUDY_MINUTES ? 'phút học' : 'bài học'} mỗi ngày`,
      endpoint: 'POST /api/v1/daily-goals',
      payload: {
        goalType: params.type,
        targetValue: params.target,
      },
    };
  }
}
