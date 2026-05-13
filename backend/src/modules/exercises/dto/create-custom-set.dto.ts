import {
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  Min,
  Max,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseType } from '../../../common/enums';
import { Type } from 'class-transformer';

class CustomSetConfigDto {
  @ApiProperty({ example: 10, description: 'Number of questions (1-30)' })
  @IsNumber()
  @Min(1)
  @Max(30)
  questionCount: number;

  @ApiProperty({
    enum: ExerciseType,
    isArray: true,
    example: [ExerciseType.MULTIPLE_CHOICE, ExerciseType.MATCHING],
    description: 'Exercise types to include (at least 1)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ExerciseType, { each: true })
  exerciseTypes: ExerciseType[];

  @ApiProperty({
    example: 'both',
    description: 'Focus area: vocabulary, grammar, or both',
  })
  @IsString()
  @IsEnum({ vocabulary: 'vocabulary', grammar: 'grammar', both: 'both' })
  focusArea: 'vocabulary' | 'grammar' | 'both';
}

export class CreateCustomSetDto {
  @ApiProperty({ example: 'uuid-of-lesson' })
  @IsUUID()
  lessonId: string;

  @ApiProperty({ type: CustomSetConfigDto })
  @ValidateNested()
  @Type(() => CustomSetConfigDto)
  config: CustomSetConfigDto;
}
