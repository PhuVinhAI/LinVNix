import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { SimulationEndReason } from '../../../common/enums';
import { Scenario } from './scenario.entity';
import { ScenarioCharacter } from './scenario-character.entity';
import { SimulationSession } from './simulation-session.entity';

@Entity('simulation_results')
export class SimulationResult extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Index({ unique: true })
  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne('SimulationSession', 'results', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: SimulationSession;

  @Column({ name: 'scenario_id' })
  scenarioId: string;

  @ManyToOne('Scenario', 'results', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;

  @Column({ name: 'chosen_character_id' })
  chosenCharacterId: string;

  @ManyToOne('ScenarioCharacter', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'chosen_character_id' })
  chosenCharacter: ScenarioCharacter;

  @Column({ name: 'total_score', type: 'int' })
  totalScore: number;

  @Column({
    name: 'criteria_scores',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  criteriaScores: Array<{
    name: string;
    score: number;
    maxScore: number;
    comment: string;
  }>;

  @Column({
    name: 'end_reason',
    type: 'enum',
    enum: SimulationEndReason,
  })
  endReason: SimulationEndReason;

  @Column({ name: 'ai_summary', type: 'text' })
  aiSummary: string;

  @Column({ name: 'total_messages', type: 'int' })
  totalMessages: number;
}
