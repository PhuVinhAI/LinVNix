import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentsService } from '../application/contents.service';
import { Public } from '../../../common/decorators';

@ApiTags('Contents')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Public()
  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy nội dung theo lesson' })
  async findByLesson(@Param('lessonId') lessonId: string) {
    return this.contentsService.findByLessonId(lessonId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết nội dung' })
  async findOne(@Param('id') id: string) {
    return this.contentsService.findById(id);
  }
}
