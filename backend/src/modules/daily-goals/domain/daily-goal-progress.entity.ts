import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { User } from '../../users/domain/user.entity';

@Entity('daily_goal_progress')
@Unique(['userId', 'date'])
export class DailyGoalProgress extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'exercises_completed', default: 0 })
  exercisesCompleted: number;

  @Column({ name: 'study_minutes', default: 0 })
  studyMinutes: number;

  @Column({ name: 'lessons_completed', default: 0 })
  lessonsCompleted: number;
}
