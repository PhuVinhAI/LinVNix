import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';

@Entity('user_exercise_results')
export class UserExerciseResult extends BaseEntity {
  @Column({ type: 'jsonb', name: 'user_answer' })
  userAnswer: any;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @Column({ name: 'attempted_at' })
  attemptedAt: Date;

  @Column({ name: 'time_taken', nullable: true })
  timeTaken?: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @ManyToOne('User', 'exerciseResults', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Exercise', 'userResults', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: any;
}
