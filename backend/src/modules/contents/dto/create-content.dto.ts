import { IsString, IsEnum, IsNumber, IsUUID, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../common/enums';

export class CreateContentDto {
  @ApiProperty({ enum: ContentType, example: ContentType.TEXT })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ example: 'Xin chào! Tôi là Minh.' })
  @IsString()
  vietnameseText: string;

  @ApiProperty({ example: 'Hello! I am Minh.', required: false })
  @IsString()
  @IsOptional()
  translation?: string;

  @ApiProperty({ example: 'sin chao! toy la min', required: false })
  @IsString()
  @IsOptional()
  phonetic?: string;

  @ApiProperty({ example: 'https://example.com/audio.mp3', required: false })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/video.mp4', required: false })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ example: 'Ghi chú thêm', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'uuid-of-lesson' })
  @IsUUID()
  lessonId: string;
}
