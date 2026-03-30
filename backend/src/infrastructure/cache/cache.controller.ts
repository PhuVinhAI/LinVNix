import { Controller, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

@ApiTags('Cache')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê cache' })
  async getStats() {
    return this.cacheService.getStats();
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Xóa toàn bộ cache' })
  async clearCache() {
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }
}
