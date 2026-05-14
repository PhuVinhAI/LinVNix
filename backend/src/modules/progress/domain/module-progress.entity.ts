import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { ProgressStatus } from '../../../common/enums';

@Entity('module_progress')
@Unique(['userId', 'moduleId'])
export class ModuleProgress extends BaseEntity {
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

  @Column({ name: 'completed_lessons_count' })
  completedLessonsCount: number;

  @Column({ name: 'total_lessons_count' })
  totalLessonsCount: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Module', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: any;
}
