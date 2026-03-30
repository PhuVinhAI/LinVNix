import { IsString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'Unit 1: Chào hỏi và giới thiệu' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Học cách chào hỏi và giới thiệu bản thân' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  courseId: string;
}
