import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators';
import { Permission } from '../../../common/enums';
import { AdminPulseService } from '../application/admin-pulse.service';
import { AdminAttentionService } from '../application/admin-attention.service';
import { AdminActivityService } from '../application/admin-activity.service';
import { AdminLearnerInsightsService } from '../application/admin-learner-insights.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(PermissionsGuard)
export class AdminController {
  constructor(
    private readonly pulseService: AdminPulseService,
    private readonly attentionService: AdminAttentionService,
    private readonly activityService: AdminActivityService,
    private readonly learnerInsightsService: AdminLearnerInsightsService,
  ) {}

  @Get('dashboard/pulse')
  @RequirePermissions(Permission.SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Nhịp đập hôm nay của hệ thống',
    description:
      'Mỗi chỉ số gồm hôm nay / hôm qua / sparkline 14 ngày (theo lịch Việt Nam): ' +
      'học viên hoạt động thật, lượt trả lời + độ chính xác, bài học hoàn thành, ' +
      'học viên mới, phiên AI mới, mục tiêu ngày; kèm quy mô tổng của hệ thống.',
  })
  @ApiResponse({ status: 200, description: 'Pulse metrics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getPulse() {
    return this.pulseService.getPulse();
  }

  @Get('dashboard/attention')
  @RequirePermissions(Permission.SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Danh sách việc cần xử lý về nội dung',
    description:
      'Câu hỏi tỷ lệ sai cao, bài học chưa có nội dung, bài tập chưa có câu hỏi, ' +
      'từ vựng thiếu audio, khóa học chưa xuất bản, bài tập AI sinh thất bại — ' +
      'mỗi nhóm gồm tổng số và các mục đầu kèm ID để mở thẳng màn hình soạn.',
  })
  @ApiResponse({ status: 200, description: 'Actionable content issues' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAttention() {
    return this.attentionService.getAttention();
  }

  @Get('dashboard/activity')
  @RequirePermissions(Permission.SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Xu hướng hoạt động theo ngày + giờ học cao điểm',
    description:
      'Chuỗi theo ngày (lịch Việt Nam) của học viên hoạt động, học viên mới, ' +
      'lượt trả lời, bài học hoàn thành, mô phỏng hoàn thành, hội thoại AI và ' +
      'độ chính xác; kèm bản đồ nhiệt thứ × giờ từ lượt trả lời câu hỏi.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    enum: [7, 30, 90],
    description: 'Độ rộng cửa sổ thống kê, mặc định 30 ngày',
  })
  @ApiResponse({ status: 200, description: 'Daily activity series + heatmap' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getActivity(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.activityService.getActivity(days);
  }

  @Get('dashboard/learners')
  @RequirePermissions(Permission.SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Góc nhìn học viên & khóa học cho dashboard',
    description:
      'Phễu hành trình học viên, phân bố trình độ, bảng xếp hạng chuỗi, ' +
      'học viên sắp mất chuỗi hôm nay, học viên mới và mức hoàn thành ' +
      'thực tế của từng khóa học.',
  })
  @ApiResponse({ status: 200, description: 'Learner & course insights' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getLearnerInsights() {
    return this.learnerInsightsService.getLearnerInsights();
  }
}
