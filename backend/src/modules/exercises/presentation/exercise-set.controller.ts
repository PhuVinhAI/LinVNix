import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ExerciseSetService } from '../application/exercise-set.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { CurrentUser } from '../../../common/decorators';
import { RequirePermissions } from '../../../common/decorators';
import { Permission } from '../../../common/enums';
import { User } from '../../users/domain/user.entity';
import { CreateCustomSetDto } from '../dto/create-custom-set.dto';

@ApiTags('Exercise Sets')
@Controller('exercise-sets')
export class ExerciseSetController {
  constructor(private readonly exerciseSetService: ExerciseSetService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.AI_GENERATE_EXERCISE)
  @Post('custom')
  @ApiOperation({
    summary: 'Create custom practice set with AI generation',
    description:
      'Create a custom exercise set with user-defined config (questionCount, exerciseTypes, focusArea). Requires AI_GENERATE_EXERCISE permission. Custom practice unlocks after completing basic tier.',
  })
  @ApiResponse({
    status: 201,
    description: 'Custom exercise set created with AI-generated exercises',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid config or custom practice locked',
  })
  async createCustom(
    @Body() dto: CreateCustomSetDto,
    @CurrentUser() user: User,
  ) {
    return this.exerciseSetService.createCustom(
      dto.lessonId,
      {
        questionCount: dto.config.questionCount,
        exerciseTypes: dto.config.exerciseTypes,
        focusArea: dto.config.focusArea,
      },
      user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.AI_GENERATE_EXERCISE)
  @Post('lesson/:lessonId/tier/:tier/generate')
  @ApiOperation({
    summary: 'AI generate exercises for a lesson tier',
    description:
      'Generate AI exercises for a lesson tier (creates set if needed). Requires AI_GENERATE_EXERCISE permission.',
  })
  @ApiParam({ name: 'lessonId', description: 'ID của lesson' })
  @ApiParam({
    name: 'tier',
    description: 'Tier name (EASY, MEDIUM, HARD, EXPERT)',
  })
  @ApiResponse({
    status: 201,
    description: 'Exercises generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'BASIC tier or set already has exercises',
  })
  async generateForTier(
    @Param('lessonId') lessonId: string,
    @Param('tier') tier: string,
    @CurrentUser() user: User,
  ) {
    return this.exerciseSetService.generateForTier(
      lessonId,
      tier as any,
      user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('lesson/:lessonId')
  @ApiOperation({
    summary: 'Lấy exercise sets theo lesson',
    description:
      'Lấy danh sách active exercise sets theo tier với progress stats và unlockedTiers',
  })
  @ApiParam({ name: 'lessonId', description: 'ID của lesson' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách exercise sets với progress',
  })
  async findByLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: User,
  ) {
    return this.exerciseSetService.findByLessonId(lessonId, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/progress')
  @ApiOperation({
    summary: 'Lấy tiến độ chi tiết của exercise set',
    description:
      'Lấy tiến độ chi tiết bao gồm totalExercises, attempted, correct, percentCorrect, percentComplete, nextTierUnlocked',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 200,
    description: 'Tiến độ chi tiết của exercise set',
  })
  async getProgress(@Param('id') id: string, @CurrentUser() user: User) {
    return this.exerciseSetService.getSetProgress(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/resume')
  @ApiOperation({
    summary: 'Lấy thông tin resume cho exercise set',
    description:
      'Kiểm tra xem user có thể tiếp tục làm dở không. Trả về canResume, attempted, totalExercises.',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin resume',
    schema: {
      example: { canResume: true, attempted: 5, totalExercises: 10 },
    },
  })
  async getResumeInfo(@Param('id') id: string, @CurrentUser() user: User) {
    return this.exerciseSetService.getResumeInfo(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.AI_GENERATE_EXERCISE)
  @Post(':id/generate')
  @ApiOperation({
    summary: 'AI generate exercises for an empty non-basic set',
    description:
      'Generate AI exercises for an empty exercise set (non-basic tier). Requires AI_GENERATE_EXERCISE permission.',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 201,
    description: 'Exercises generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Set is basic tier or already has exercises',
  })
  async generate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.exerciseSetService.generate(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.AI_GENERATE_EXERCISE)
  @Post(':id/regenerate')
  @ApiOperation({
    summary: 'Regenerate AI exercises for an exercise set',
    description:
      'Soft-delete existing exercises and generate new ones. Requires AI_GENERATE_EXERCISE permission.',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 201,
    description: 'Exercises regenerated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Set is basic tier or not found',
  })
  async regenerate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.exerciseSetService.regenerate(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/reset')
  @ApiOperation({
    summary: 'Reset tiến độ exercise set',
    description:
      'Xoá toàn bộ kết quả làm bài của user cho exercise set này (start over)',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 200,
    description: 'Reset thành công',
  })
  async resetProgress(@Param('id') id: string, @CurrentUser() user: User) {
    await this.exerciseSetService.resetProgress(id, user.id);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/summary')
  @ApiOperation({
    summary: 'Lấy tóm tắt kết quả exercise set',
    description:
      'Trả về thống kê tổng quan, danh sách câu sai với đáp án đúng, và thông báo unlock tier mới nếu có',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 200,
    description: 'Tóm tắt kết quả',
    schema: {
      example: {
        stats: {
          totalExercises: 10,
          attempted: 10,
          correct: 8,
          percentCorrect: 80,
          percentComplete: 100,
        },
        wrongQuestions: [
          {
            exerciseId: 'uuid',
            question: 'Q?',
            correctAnswer: { value: 'A' },
            explanation: 'Exp',
          },
        ],
        nextTierUnlocked: 'EASY',
      },
    },
  })
  async getSummary(@Param('id') id: string, @CurrentUser() user: User) {
    return this.exerciseSetService.getSummary(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết exercise set',
    description: 'Lấy chi tiết exercise set với đầy đủ exercises',
  })
  @ApiParam({ name: 'id', description: 'ID của exercise set' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết exercise set với exercises',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy exercise set' })
  async findById(@Param('id') id: string) {
    return this.exerciseSetService.findById(id);
  }
}
