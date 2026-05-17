import { Injectable } from '@nestjs/common';
import {
  ProposeTool,
  type ProposalPayload,
  type ToolContext,
} from '@linvnix/shared';
import { z } from 'zod';
import { ExerciseType } from '../../../common/enums';
import type { User } from '../../users/domain/user.entity';

const paramsSchema = z
  .object({
    topic: z.string().min(1).max(200),
    level: z.string().min(1).max(10),
    count: z.number().int().min(1).max(30),
    lessonId: z.string().uuid().optional(),
  })
  .strip();

type ProposeGenerateCustomExerciseSetParams = z.infer<typeof paramsSchema>;

@Injectable()
export class ProposeGenerateCustomExerciseSetTool extends ProposeTool<ProposeGenerateCustomExerciseSetParams> {
  readonly name = 'propose_generate_custom_exercise_set';
  readonly displayName = 'Đang chuẩn bị bộ bài tập...';
  readonly description =
    'Proposes generating a custom exercise set on a topic. Does NOT ' +
    'generate directly — returns a proposal payload the mobile app ' +
    'renders as a confirm card. On "Có" the mobile client calls ' +
    'POST /api/v1/exercise-sets/custom. Parameters: topic (string), ' +
    'level (CEFR string like A1/B1), count (1–30), and optionally lessonId.';
  readonly parameters = paramsSchema;

  async execute(
    params: ProposeGenerateCustomExerciseSetParams,
    _ctx: ToolContext<User>,
  ): Promise<ProposalPayload> {
    return {
      kind: 'generate_custom_exercise_set',
      title: 'Tạo bộ bài tập tùy chỉnh?',
      description: `Tạo ${params.count} bài tập về "${params.topic}" (trình độ ${params.level})`,
      endpoint: 'POST /api/v1/exercise-sets/custom',
      payload: {
        ...(params.lessonId ? { lessonId: params.lessonId } : {}),
        config: {
          questionCount: params.count,
          exerciseTypes: [ExerciseType.MULTIPLE_CHOICE],
          focusArea: 'both',
        },
        userPrompt: params.topic,
      },
    };
  }
}
