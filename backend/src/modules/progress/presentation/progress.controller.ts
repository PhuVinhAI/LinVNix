import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from '../application/progress.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../users/domain/user.entity';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ tiến độ học của user' })
  async getUserProgress(@CurrentUser() user: User) {
    return this.progressService.getUserProgress(user.id);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy tiến độ của 1 lesson' })
  async getLessonProgress(
    @CurrentUser() user: User,
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.getLessonProgress(user.id, lessonId);
  }

  @Post('lesson/:lessonId/start')
  @ApiOperation({ summary: 'Bắt đầu học lesson' })
  async startLesson(
    @CurrentUser() user: User,
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.startLesson(user.id, lessonId);
  }

  @Post('lesson/:lessonId/complete')
  @ApiOperation({ summary: 'Hoàn thành lesson' })
  async completeLesson(
    @CurrentUser() user: User,
    @Param('lessonId') lessonId: string,
    @Body() body: { score: number },
  ) {
    return this.progressService.completeLesson(user.id, lessonId, body.score);
  }

  @Patch('lesson/:lessonId/time')
  @ApiOperation({ summary: 'Cập nhật thời gian học' })
  async updateTimeSpent(
    @CurrentUser() user: User,
    @Param('lessonId') lessonId: string,
    @Body() body: { additionalTime: number },
  ) {
    return this.progressService.updateTimeSpent(
      user.id,
      lessonId,
      body.additionalTime,
    );
  }
}
