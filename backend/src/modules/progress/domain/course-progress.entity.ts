import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { ProgressStatus } from '../../../common/enums';

@Entity('course_progress')
@Unique(['userId', 'courseId'])
export class CourseProgress extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.IN_PROGRESS,
  })
  status: ProgressStatus;

  @Column({ nullable: true })
  score?: number;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'completed_modules_count' })
  completedModulesCount: number;

  @Column({ name: 'total_modules_count' })
  totalModulesCount: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Course', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: any;
}
