import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LessonsService } from '../application/lessons.service';
import { Public } from '../../../common/decorators';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Public()
  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Lấy danh sách lessons theo unit' })
  async findByUnit(@Param('unitId') unitId: string) {
    return this.lessonsService.findByUnitId(unitId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lesson với nội dung đầy đủ' })
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }
}
