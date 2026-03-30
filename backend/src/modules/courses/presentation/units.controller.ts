import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UnitsService } from '../application/units.service';
import { Public } from '../../../common/decorators';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Public()
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Lấy danh sách units theo course' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.unitsService.findByCourseId(courseId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết unit' })
  async findOne(@Param('id') id: string) {
    return this.unitsService.findById(id);
  }
}
