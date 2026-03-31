import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { ProgressStatus } from '../../../common/enums';

@Entity('user_progress')
export class UserProgress extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({ nullable: true })
  score?: number;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'last_accessed_at' })
  lastAccessedAt: Date;

  @Column({ name: 'time_spent', default: 0 })
  timeSpent: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @ManyToOne('User', 'progress', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Lesson', 'userProgress', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: any;
}
