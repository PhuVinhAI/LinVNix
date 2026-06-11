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
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '../../../common/enums';
import { IsMediaUrl } from '../../../common/validators';

/* ── Dialogue (giữ nguyên cho DIALOGUE) ─────────────────────────────────── */

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

  @ApiPropertyOptional({ example: 'Hello!', nullable: true })
  @IsString()
  @IsOptional()
  en?: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/line.mp3',
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

/* ── Payload theo loại — mỗi loại có DTO riêng ──────────────────────────── */

export class TextParagraphDto {
  @ApiProperty({ example: 'Xin chào! Tôi là Minh.' })
  @IsString()
  vi: string;

  @ApiPropertyOptional({ example: 'Hello! I am Minh.', nullable: true })
  @IsString()
  @IsOptional()
  en?: string | null;
}

export class TextKeyTermDto {
  @ApiProperty({ example: 'xin chào' })
  @IsString()
  term: string;

  @ApiProperty({ example: 'hello (lịch sự)' })
  @IsString()
  meaning: string;
}

export class TextPayloadDto {
  @ApiProperty({
    example: 'Người Việt chào nhau tuỳ theo thời gian trong ngày...',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  translation?: string | null;

  @ApiPropertyOptional({ type: [TextParagraphDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextParagraphDto)
  @IsOptional()
  paragraphs?: TextParagraphDto[];

  @ApiPropertyOptional({ type: [TextKeyTermDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextKeyTermDto)
  @IsOptional()
  keyTerms?: TextKeyTermDto[];
}

const IMAGE_ASPECTS = ['1:1', '4:3', '3:4', '16:9', '9:16', 'auto'] as const;

export class ImagePayloadDto {
  @ApiProperty({ example: '/uploads/image/xx.jpg' })
  @IsMediaUrl()
  url: string;

  @ApiProperty({ example: 'Một góc Hà Nội buổi sáng.' })
  @IsString()
  caption: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  captionEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  altText?: string | null;

  @ApiPropertyOptional({ enum: IMAGE_ASPECTS, default: 'auto' })
  @IsIn(IMAGE_ASPECTS as unknown as string[])
  @IsOptional()
  aspectRatio?: (typeof IMAGE_ASPECTS)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  source?: string | null;
}

export class AudioSegmentDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  startSeconds: number;

  @ApiProperty()
  @IsString()
  vi: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  en?: string | null;
}

export class AudioPayloadDto {
  @ApiProperty({ example: '/uploads/audio/xx.mp3' })
  @IsMediaUrl()
  url: string;

  @ApiProperty({ example: 'Hội thoại buổi sáng' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 42, nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  speaker?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsMediaUrl()
  @IsOptional()
  coverImageUrl?: string | null;

  @ApiProperty({ example: 'Xin chào, hôm nay bạn thế nào?' })
  @IsString()
  transcript: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  translation?: string | null;

  @ApiPropertyOptional({ type: [AudioSegmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioSegmentDto)
  @IsOptional()
  segments?: AudioSegmentDto[];
}

const VIDEO_ASPECTS = ['16:9', '9:16', '4:3', '1:1'] as const;
const VIDEO_PROVIDERS = ['self_hosted', 'youtube'] as const;

export class VideoChapterDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  startSeconds: number;

  @ApiProperty({ example: 'Mở đầu' })
  @IsString()
  title: string;
}

export class VideoPayloadDto {
  @ApiProperty({ example: '/uploads/video/xx.mp4' })
  @IsMediaUrl()
  url: string;

  @ApiProperty({ example: 'Giới thiệu bài học' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 180, nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsMediaUrl()
  @IsOptional()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ enum: VIDEO_ASPECTS, default: '16:9' })
  @IsIn(VIDEO_ASPECTS as unknown as string[])
  @IsOptional()
  aspectRatio?: (typeof VIDEO_ASPECTS)[number];

  @ApiPropertyOptional({ enum: VIDEO_PROVIDERS, default: 'self_hosted' })
  @IsIn(VIDEO_PROVIDERS as unknown as string[])
  @IsOptional()
  provider?: (typeof VIDEO_PROVIDERS)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  transcript?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  translation?: string | null;

  @ApiPropertyOptional({ type: [VideoChapterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoChapterDto)
  @IsOptional()
  chapters?: VideoChapterDto[];
}

/* ── Create DTO — payload là object thuần, service validate theo type ──── */

export class CreateContentDto {
  @ApiProperty({ enum: ContentType, example: ContentType.TEXT })
  @IsEnum(ContentType)
  contentType: ContentType;

  /**
   * Payload theo content_type:
   * - text  → TextPayloadDto
   * - image → ImagePayloadDto
   * - audio → AudioPayloadDto
   * - video → VideoPayloadDto
   * - dialogue → bỏ qua, dùng dialogueData
   *
   * Service sẽ validate cấu trúc payload theo contentType khi save.
   */
  @ApiPropertyOptional({
    description:
      'Cấu trúc theo loại nội dung — text/image/audio/video. Không dùng cho dialogue.',
  })
  @IsOptional()
  payload?: Record<string, unknown> | null;

  @ApiProperty({ example: 1 })
  @IsNumber()
  orderIndex: number;

  @ApiPropertyOptional({ example: 'Ghi chú thêm', nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiProperty({ example: 'uuid-of-lesson' })
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional({
    type: DialogueDataDto,
    description: 'Cấu trúc hội thoại — chỉ áp dụng khi contentType = dialogue',
  })
  @ValidateNested()
  @Type(() => DialogueDataDto)
  @IsOptional()
  dialogueData?: DialogueDataDto | null;
}
