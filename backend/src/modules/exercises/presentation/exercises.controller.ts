import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExercisesService } from '../application/exercises.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../users/domain/user.entity';
import { Public } from '../../../common/decorators';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Public()
  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy bài tập theo lesson' })
  async findByLesson(@Param('lessonId') lessonId: string) {
    return this.exercisesService.findByLessonId(lessonId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài tập' })
  async findOne(@Param('id') id: string) {
    return this.exercisesService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  @ApiOperation({ summary: 'Nộp bài tập' })
  async submitAnswer(
    @CurrentUser() user: User,
    @Param('id') exerciseId: string,
    @Body() body: { answer: any; timeTaken?: number },
  ) {
    return this.exercisesService.submitAnswer(
      user.id,
      exerciseId,
      body.answer,
      body.timeTaken,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-results')
  @ApiOperation({ summary: 'Lấy kết quả bài tập của user' })
  async getMyResults(@CurrentUser() user: User) {
    return this.exercisesService.getUserResults(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-stats')
  @ApiOperation({ summary: 'Lấy thống kê bài tập' })
  async getMyStats(@CurrentUser() user: User) {
    return this.exercisesService.getUserStats(user.id);
  }
}
