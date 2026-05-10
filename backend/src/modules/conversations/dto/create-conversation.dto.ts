import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ example: 'gemini-2.0-flash' })
  @IsString()
  model: string;

  @ApiProperty({
    example: 'You are a Vietnamese language tutor.',
    required: false,
  })
  @IsString()
  @IsOptional()
  systemInstruction?: string;

  @ApiProperty({ example: 'uuid-of-course', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ example: 'uuid-of-lesson', required: false })
  @IsUUID()
  @IsOptional()
  lessonId?: string;
}
