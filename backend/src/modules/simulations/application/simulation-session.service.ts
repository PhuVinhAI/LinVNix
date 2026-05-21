import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SimulationSessionsRepository } from './repositories/simulation-sessions.repository';
import { ScenariosRepository } from './repositories/scenarios.repository';
import { SimulationMessagesRepository } from './repositories/simulation-messages.repository';
import { SimulationSession } from '../domain/simulation-session.entity';
import { SimulationMessage } from '../domain/simulation-message.entity';
import { SimulationSessionStatus } from '../../../common/enums';

export interface CreateSessionDto {
  scenarioId: string;
  chosenCharacterId: string;
}

export interface CreateSessionResult {
  session: SimulationSession;
  openingMessage: SimulationMessage | null;
}

export interface SessionWithMessages {
  session: SimulationSession;
  messages: SimulationMessage[];
}

@Injectable()
export class SimulationSessionService {
  constructor(
    private readonly sessionsRepository: SimulationSessionsRepository,
    private readonly scenariosRepository: ScenariosRepository,
    private readonly messagesRepository: SimulationMessagesRepository,
  ) {}

  async createSession(
    userId: string,
    dto: CreateSessionDto,
  ): Promise<CreateSessionResult> {
    // 1. Validate scenario exists and is published
    const scenario = await this.scenariosRepository.findById(dto.scenarioId);
    if (!scenario || !scenario.isPublished) {
      throw new NotFoundException(
        `Scenario with ID ${dto.scenarioId} not found or not published`,
      );
    }

    // 2. Validate character belongs to scenario and is playable
    const character = scenario.characters?.find(
      (c) => c.id === dto.chosenCharacterId,
    );
    if (!character || !character.isPlayable) {
      throw new NotFoundException(
        `Character with ID ${dto.chosenCharacterId} not found or not playable`,
      );
    }

    // 3. Enforce 1-session constraint
    const existingSession =
      await this.sessionsRepository.findIncompleteByUser(userId);
    if (existingSession) {
      throw new ConflictException(
        'You already have an active or paused session. Finish or cancel it before starting a new one.',
      );
    }

    // 4. Create session
    const session = await this.sessionsRepository.create({
      userId,
      scenarioId: dto.scenarioId,
      chosenCharacterId: dto.chosenCharacterId,
      status: SimulationSessionStatus.ACTIVE,
    });

    // 5. Create opening message if scenario has one
    let openingMessage: SimulationMessage | null = null;
    if (scenario.openingMessage) {
      openingMessage = await this.messagesRepository.create({
        sessionId: session.id,
        speakerCharacterId: null,
        isLearner: false,
        content: scenario.openingMessage,
        orderIndex: 0,
      });
    }

    return { session, openingMessage };
  }

  async getSessionWithMessages(
    userId: string,
    sessionId: string,
  ): Promise<SessionWithMessages> {
    const session =
      await this.sessionsRepository.findByIdWithMessages(sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    // Resume: PAUSED → ACTIVE
    if (session.status === SimulationSessionStatus.PAUSED) {
      await this.sessionsRepository.updateStatus(
        sessionId,
        SimulationSessionStatus.ACTIVE,
      );
      session.status = SimulationSessionStatus.ACTIVE;
    }

    return {
      session,
      messages: session.messages ?? [],
    };
  }

  async cancelSession(userId: string, sessionId: string): Promise<void> {
    const session =
      await this.sessionsRepository.findByIdWithMessages(sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    // Soft-delete: no SimulationResult is created
    await this.sessionsRepository.softDelete(sessionId);
  }
}
