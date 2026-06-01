import {
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../common/enums';
import { IsMediaUrl } from '../../../common/validators';

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
  @IsMediaUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsMediaUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/video.mp4', required: false })
  @IsMediaUrl()
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
