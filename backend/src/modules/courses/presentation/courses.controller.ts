import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from '../application/courses.service';
import { Public } from '../../../common/decorators';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả khóa học' })
  async findAll() {
    return this.coursesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết khóa học' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Tạo khóa học mới (Admin)' })
  async create(@Body() createData: any) {
    return this.coursesService.create(createData);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật khóa học (Admin)' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.coursesService.update(id, updateData);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khóa học (Admin)' })
  async delete(@Param('id') id: string) {
    await this.coursesService.delete(id);
    return { message: 'Course deleted successfully' };
  }
}
