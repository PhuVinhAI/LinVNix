import {
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewItemDto {
  @ApiProperty({ description: 'ID của từ vựng' })
  @IsString()
  vocabularyId: string;

  @ApiProperty({
    description: 'Đánh giá: 1=Again (quên), 2=Hard, 3=Good, 4=Easy',
    minimum: 1,
    maximum: 4,
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  rating: number;
}

export class BatchReviewDto {
  @ApiProperty({
    description: 'Danh sách các review',
    type: [ReviewItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewItemDto)
  reviews: ReviewItemDto[];

  @ApiProperty({
    description: 'Thời điểm review (optional, dùng cho testing)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;
}
