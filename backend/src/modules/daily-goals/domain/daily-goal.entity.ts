import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { GoalType } from '../../../common/enums';
import { User } from '../../users/domain/user.entity';

@Entity('daily_goals')
@Unique(['userId', 'goalType'])
export class DailyGoal extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: GoalType,
    name: 'goal_type',
  })
  goalType: GoalType;

  @Column({ name: 'target_value' })
  targetValue: number;
}
