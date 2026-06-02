import {
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../common/enums';
import { IsMediaUrl } from '../../../common/validators';

export class DialogueCharacterDto {
  @ApiProperty({ example: 'c1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Nam' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['left', 'right'], example: 'left' })
  @IsIn(['left', 'right'])
  side: 'left' | 'right';
}

export class DialogueLineDto {
  @ApiProperty({ example: 'c1' })
  @IsString()
  characterId: string;

  @ApiProperty({ example: 'Xin chào!' })
  @IsString()
  vi: string;

  @ApiProperty({ example: 'Hello!', required: false, nullable: true })
  @IsString()
  @IsOptional()
  en?: string | null;

  @ApiProperty({
    example: 'https://example.com/line.mp3',
    required: false,
    nullable: true,
  })
  @IsMediaUrl()
  @IsOptional()
  audio?: string | null;
}

export class DialogueDataDto {
  @ApiProperty({ type: [DialogueCharacterDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DialogueCharacterDto)
  characters: DialogueCharacterDto[];

  @ApiProperty({ type: [DialogueLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DialogueLineDto)
  lines: DialogueLineDto[];
}

export class CreateContentDto {
  @ApiProperty({ enum: ContentType, example: ContentType.TEXT })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ example: 'Xin chào! Tôi là Minh.', required: false })
  @IsString()
  @IsOptional()
  vietnameseText?: string;

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

  @ApiProperty({
    type: DialogueDataDto,
    required: false,
    description: 'Cấu trúc hội thoại (chỉ áp dụng khi contentType = dialogue)',
  })
  @ValidateNested()
  @Type(() => DialogueDataDto)
  @IsOptional()
  dialogueData?: DialogueDataDto | null;
}
