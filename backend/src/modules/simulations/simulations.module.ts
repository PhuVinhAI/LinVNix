import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioCategory } from './domain/scenario-category.entity';
import { Scenario } from './domain/scenario.entity';
import { ScenarioCharacter } from './domain/scenario-character.entity';
import { SimulationSession } from './domain/simulation-session.entity';
import { SimulationMessage } from './domain/simulation-message.entity';
import { SimulationResult } from './domain/simulation-result.entity';
import { ScenariosService } from './application/scenarios.service';
import { SimulationSessionService } from './application/simulation-session.service';
import { SimulationAiService } from './application/simulation-ai.service';
import { ScenariosRepository } from './application/repositories/scenarios.repository';
import { ScenarioCategoriesRepository } from './application/repositories/scenario-categories.repository';
import { SimulationSessionsRepository } from './application/repositories/simulation-sessions.repository';
import { SimulationMessagesRepository } from './application/repositories/simulation-messages.repository';
import { SimulationsController } from './presentation/simulations.controller';
import { UsersModule } from '../users/users.module';

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
    forwardRef(() => UsersModule),
  ],
  controllers: [SimulationsController],
  providers: [
    ScenariosService,
    SimulationSessionService,
    SimulationAiService,
    ScenariosRepository,
    ScenarioCategoriesRepository,
    SimulationSessionsRepository,
    SimulationMessagesRepository,
  ],
  exports: [ScenariosService, SimulationSessionService, SimulationAiService],
})
export class SimulationsModule {}
