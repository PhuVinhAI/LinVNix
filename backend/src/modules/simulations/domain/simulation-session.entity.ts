import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { SimulationSessionStatus } from '../../../common/enums';
import { Scenario } from './scenario.entity';
import { ScenarioCharacter } from './scenario-character.entity';

@Entity('simulation_sessions')
export class SimulationSession extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'scenario_id' })
  scenarioId: string;

  @ManyToOne('Scenario', 'sessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;

  @Column({ name: 'chosen_character_id' })
  chosenCharacterId: string;

  @ManyToOne('ScenarioCharacter', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'chosen_character_id' })
  chosenCharacter: ScenarioCharacter;

  @Column({
    type: 'enum',
    enum: SimulationSessionStatus,
    default: SimulationSessionStatus.ACTIVE,
  })
  status: SimulationSessionStatus;

  @Column({ name: 'total_tokens', default: 0 })
  totalTokens: number;

  @OneToMany('SimulationMessage', 'session')
  messages: any[];

  @OneToMany('SimulationResult', 'session')
  results: any[];
}
