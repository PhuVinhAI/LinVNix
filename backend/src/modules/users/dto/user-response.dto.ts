import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserLevel } from '../../../common/enums';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  fullName: string;

  @Expose()
  @ApiProperty()
  nativeLanguage: string;

  @Expose()
  @ApiProperty({ enum: UserLevel })
  currentLevel: UserLevel;

  @Expose()
  @ApiProperty({ required: false })
  avatarUrl?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
