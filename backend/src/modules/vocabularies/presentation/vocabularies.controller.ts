import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VocabulariesService } from '../application/vocabularies.service';
import { UserVocabulariesService } from '../application/user-vocabularies.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../users/domain/user.entity';
import { Public } from '../../../common/decorators';

@ApiTags('Vocabularies')
@Controller('vocabularies')
export class VocabulariesController {
  constructor(
    private readonly vocabulariesService: VocabulariesService,
    private readonly userVocabulariesService: UserVocabulariesService,
  ) {}

  @Public()
  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy từ vựng theo lesson' })
  async findByLesson(@Param('lessonId') lessonId: string) {
    return this.vocabulariesService.findByLessonId(lessonId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':vocabularyId/learn')
  @ApiOperation({ summary: 'Thêm từ vựng vào danh sách học' })
  async addToLearning(
    @CurrentUser() user: User,
    @Param('vocabularyId') vocabularyId: string,
  ) {
    return this.userVocabulariesService.addVocabulary(user.id, vocabularyId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':vocabularyId/review')
  @ApiOperation({ summary: 'Ôn tập từ vựng' })
  async reviewVocabulary(
    @CurrentUser() user: User,
    @Param('vocabularyId') vocabularyId: string,
    @Body() body: { isCorrect: boolean },
  ) {
    return this.userVocabulariesService.reviewVocabulary(
      user.id,
      vocabularyId,
      body.isCorrect,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-vocabularies')
  @ApiOperation({ summary: 'Lấy danh sách từ vựng đã học' })
  async getMyVocabularies(@CurrentUser() user: User) {
    return this.userVocabulariesService.getUserVocabularies(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('due-review')
  @ApiOperation({ summary: 'Lấy từ vựng cần ôn tập' })
  async getDueForReview(@CurrentUser() user: User) {
    return this.userVocabulariesService.getDueForReview(user.id);
  }
}
