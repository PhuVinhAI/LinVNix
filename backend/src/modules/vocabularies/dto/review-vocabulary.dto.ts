import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewVocabularyDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}
