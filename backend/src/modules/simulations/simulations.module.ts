import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioCategory } from './domain/scenario-category.entity';
import { Scenario } from './domain/scenario.entity';
import { ScenarioCharacter } from './domain/scenario-character.entity';
import { SimulationSession } from './domain/simulation-session.entity';
import { SimulationMessage } from './domain/simulation-message.entity';
import { SimulationResult } from './domain/simulation-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScenarioCategory,
      Scenario,
      ScenarioCharacter,
      SimulationSession,
      SimulationMessage,
      SimulationResult,
    ]),
  ],
  providers: [],
  exports: [],
})
export class SimulationsModule {}
