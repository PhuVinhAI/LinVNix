import { IsString, IsEnum, IsNumber, IsUUID, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartOfSpeech } from '../../../common/enums';

export class CreateVocabularyDto {
  @ApiProperty({ example: 'xin chào' })
  @IsString()
  word: string;

  @ApiProperty({ example: 'hello' })
  @IsString()
  translation: string;

  @ApiProperty({ example: 'sin chao', required: false })
  @IsString()
  @IsOptional()
  phonetic?: string;

  @ApiProperty({ enum: PartOfSpeech, example: PartOfSpeech.PHRASE })
  @IsEnum(PartOfSpeech)
  partOfSpeech: PartOfSpeech;

  @ApiProperty({ example: 'Xin chào, bạn khỏe không?', required: false })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiProperty({ example: 'Hello, how are you?', required: false })
  @IsString()
  @IsOptional()
  exampleTranslation?: string;

  @ApiProperty({ example: 'https://example.com/audio.mp3', required: false })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  difficultyLevel?: number;

  @ApiProperty({ example: 'uuid-of-lesson' })
  @IsUUID()
  lessonId: string;
}
