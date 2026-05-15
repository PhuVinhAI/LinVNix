import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DailyGoalProgressService } from '../application/daily-goal-progress.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../users/domain/user.entity';
import { SyncStudyMinutesDto } from '../dto/sync-study-minutes.dto';

@ApiTags('Daily Goals Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-goals/progress')
export class DailyGoalProgressController {
  constructor(private readonly progressService: DailyGoalProgressService) {}

  @Get('today')
  @ApiOperation({
    summary: 'Lấy tiến trình hôm nay',
    description:
      'Trả về progress hôm nay cho tất cả active goals + allGoalsMet boolean',
  })
  @ApiResponse({ status: 200, description: 'Tiến trình hôm nay' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  getTodayProgress(@CurrentUser() user: User) {
    return this.progressService.getTodayProgress(user.id);
  }

  @Patch('study-minutes')
  @ApiOperation({
    summary: 'Sync phút học từ mobile',
    description: 'Upsert studyMinutes cho hôm nay',
  })
  @ApiResponse({ status: 200, description: 'Sync thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  syncStudyMinutes(
    @CurrentUser() user: User,
    @Body() dto: SyncStudyMinutesDto,
  ) {
    return this.progressService.syncStudyMinutes(user.id, dto.studyMinutes);
  }
}
