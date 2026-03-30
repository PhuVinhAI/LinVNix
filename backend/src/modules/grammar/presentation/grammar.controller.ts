import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GrammarService } from '../application/grammar.service';
import { Public } from '../../../common/decorators';

@ApiTags('Grammar')
@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Public()
  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy ngữ pháp theo lesson' })
  async findByLesson(@Param('lessonId') lessonId: string) {
    return this.grammarService.findByLessonId(lessonId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết ngữ pháp' })
  async findOne(@Param('id') id: string) {
    return this.grammarService.findById(id);
  }
}
