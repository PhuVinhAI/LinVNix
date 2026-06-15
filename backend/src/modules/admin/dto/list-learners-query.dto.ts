import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export const LEARNER_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type LearnerLevel = (typeof LEARNER_LEVELS)[number];

export const LEARNER_STATUSES = [
  'all',
  'active',
  'inactive',
  'never_onboarded',
] as const;
export type LearnerStatus = (typeof LEARNER_STATUSES)[number];

export const LEARNER_SORT_FIELDS = [
  'updatedAt',
  'createdAt',
  'fullName',
  'completedLessons',
] as const;
export type LearnerSortField = (typeof LEARNER_SORT_FIELDS)[number];

export class ListLearnersQueryDto {
  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({ required: false, default: '20' })
  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @ApiProperty({ required: false, description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: LEARNER_LEVELS })
  @IsOptional()
  @IsIn(LEARNER_LEVELS as unknown as string[])
  level?: LearnerLevel;

  @ApiProperty({ required: false, enum: LEARNER_STATUSES, default: 'all' })
  @IsOptional()
  @IsIn(LEARNER_STATUSES as unknown as string[])
  status?: LearnerStatus;

  @ApiProperty({ required: false, enum: LEARNER_SORT_FIELDS, default: 'updatedAt' })
  @IsOptional()
  @IsIn(LEARNER_SORT_FIELDS as unknown as string[])
  sort?: LearnerSortField;

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
