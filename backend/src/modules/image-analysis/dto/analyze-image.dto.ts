import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export class ImageAnalysisImageDto {
  @ApiProperty({
    description: 'Base64-encoded image data without a data URL prefix.',
    example: 'iVBORw0KGgoAAAANSUhEUgAA...',
  })
  @IsString()
  @IsNotEmpty()
  base64: string;

  @ApiProperty({
    description: 'Image MIME type.',
    enum: SUPPORTED_IMAGE_MIME_TYPES,
    example: 'image/png',
  })
  @IsString()
  @IsIn(SUPPORTED_IMAGE_MIME_TYPES)
  mimeType: string;
}

export class AnalyzeImageDto {
  @ApiProperty({
    type: [ImageAnalysisImageDto],
    description: 'Exactly one image for this V1 slice.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImageAnalysisImageDto)
  images: ImageAnalysisImageDto[];

  @ApiProperty({
    description: "Learner's question about the image.",
    example: 'What does this sign say?',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
