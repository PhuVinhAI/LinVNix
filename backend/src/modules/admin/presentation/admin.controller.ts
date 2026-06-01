import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators';
import { Permission } from '../../../common/enums';
import { AdminDashboardService } from '../application/admin-dashboard.service';
import { AdminOverviewService } from '../application/admin-overview.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(PermissionsGuard)
export class AdminController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly adminOverviewService: AdminOverviewService,
  ) {}

  @Get('dashboard')
  @RequirePermissions(Permission.SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Lấy thống kê dashboard cho Admin',
    description:
      'Trả về tổng số users, DAU, top courses, và exercises có error rate cao nhất. Chỉ Admin mới truy cập được.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    schema: {
      example: {
        totalUsers: 150,
        dailyActiveUsers: 45,
        topCourses: [
          {
            courseId: 'uuid-1',
            courseTitle: 'Vietnamese for Beginners',
            userCount: 80,
          },
        ],
        exercisesWithHighestErrors: [
          {
            exerciseId: 'uuid-1',
            question: 'Translate: Hello',
            type: 'TRANSLATION',
            totalAttempts: 120,
            incorrectCount: 85,
            errorRate: '70.83%',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getDashboard() {
    return this.adminDashboardService.getDashboardStats();
  }

  @Get('dashboard/overview')
  @RequirePermissions(Permission.SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Lấy tổng quan toàn diện cho Dashboard Admin',
    description:
      'Bao gồm KPI tổng quan, chuỗi thời gian 30 ngày, phân bố theo cấp độ/loại/trạng thái, top khóa học, bài tập lỗi cao, top streak và học viên mới nhất.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive overview statistics',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getDashboardOverview() {
    return this.adminOverviewService.getOverview();
  }
}
