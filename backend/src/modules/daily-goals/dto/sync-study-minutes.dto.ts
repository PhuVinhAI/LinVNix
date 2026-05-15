import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncStudyMinutesDto {
  @ApiProperty({
    example: 15,
    description: 'Số phút học hôm nay (accumulated từ mobile)',
  })
  @IsNumber()
  @Min(0)
  studyMinutes: number;
}
