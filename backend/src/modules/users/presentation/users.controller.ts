import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../application/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../domain/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: Partial<User>,
  ) {
    return this.usersService.update(user.id, updateData);
  }
}
