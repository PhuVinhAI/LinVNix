import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SimulationSessionService } from './simulation-session.service';
import { SimulationSessionsRepository } from './repositories/simulation-sessions.repository';
import { ScenariosRepository } from './repositories/scenarios.repository';
import { SimulationMessagesRepository } from './repositories/simulation-messages.repository';
import { SimulationSessionStatus } from '../../../common/enums';

const makeSession = (overrides: any = {}) => ({
  id: 'session-1',
  userId: 'user-1',
  scenarioId: 'sc-1',
  chosenCharacterId: 'ch-1',
  status: SimulationSessionStatus.ACTIVE,
  totalTokens: 0,
  messages: [],
  ...overrides,
});

const makeScenario = (overrides: any = {}) => ({
  id: 'sc-1',
  isPublished: true,
  openingMessage: null,
  characters: [
    { id: 'ch-1', isPlayable: true },
    { id: 'ch-2', isPlayable: false },
  ],
  ...overrides,
});

describe('SimulationSessionService', () => {
  let service: SimulationSessionService;
  let sessionsRepo: jest.Mocked<SimulationSessionsRepository>;
  let scenariosRepo: jest.Mocked<ScenariosRepository>;
  let messagesRepo: jest.Mocked<SimulationMessagesRepository>;

  beforeEach(async () => {
    const sessionsMock = {
      findIncompleteByUser: jest.fn(),
      create: jest.fn(),
      findByIdWithMessages: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
    };
    const scenariosMock = {
      findPublished: jest.fn(),
      findById: jest.fn(),
    };
    const messagesMock = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationSessionService,
        { provide: SimulationSessionsRepository, useValue: sessionsMock },
        { provide: ScenariosRepository, useValue: scenariosMock },
        { provide: SimulationMessagesRepository, useValue: messagesMock },
      ],
    }).compile();

    service = module.get<SimulationSessionService>(SimulationSessionService);
    sessionsRepo = module.get(SimulationSessionsRepository);
    scenariosRepo = module.get(ScenariosRepository);
    messagesRepo = module.get(SimulationMessagesRepository);
  });

  // ─── createSession ────────────────────────────────────────────────────────

  describe('createSession', () => {
    it('creates session with ACTIVE status and returns session (no opening message)', async () => {
      const scenario = makeScenario({ openingMessage: null });
      scenariosRepo.findById.mockResolvedValue(scenario);
      sessionsRepo.findIncompleteByUser.mockResolvedValue(null);
      const createdSession = makeSession();
      sessionsRepo.create.mockResolvedValue(createdSession);

      const result = await service.createSession('user-1', {
        scenarioId: 'sc-1',
        chosenCharacterId: 'ch-1',
      });

      expect(sessionsRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        scenarioId: 'sc-1',
        chosenCharacterId: 'ch-1',
        status: SimulationSessionStatus.ACTIVE,
      });
      expect(result.session.status).toBe(SimulationSessionStatus.ACTIVE);
      expect(result.openingMessage).toBeNull();
      expect(messagesRepo.create).not.toHaveBeenCalled();
    });

    it('creates opening message when scenario has openingMessage', async () => {
      const scenario = makeScenario({ openingMessage: 'Chào mừng!' });
      scenariosRepo.findById.mockResolvedValue(scenario);
      sessionsRepo.findIncompleteByUser.mockResolvedValue(null);
      const createdSession = makeSession({ id: 'session-1' });
      sessionsRepo.create.mockResolvedValue(createdSession);
      const openingMsg = {
        id: 'msg-1',
        content: 'Chào mừng!',
        isLearner: false,
        speakerCharacterId: null,
        orderIndex: 0,
      };
      messagesRepo.create.mockResolvedValue(openingMsg as any);

      const result = await service.createSession('user-1', {
        scenarioId: 'sc-1',
        chosenCharacterId: 'ch-1',
      });

      expect(messagesRepo.create).toHaveBeenCalledWith({
        sessionId: 'session-1',
        speakerCharacterId: null,
        isLearner: false,
        content: 'Chào mừng!',
        orderIndex: 0,
      });
      expect(result.openingMessage).toEqual(openingMsg);
    });

    it('returns 409 Conflict when user already has an incomplete session', async () => {
      scenariosRepo.findById.mockResolvedValue(makeScenario());
      sessionsRepo.findIncompleteByUser.mockResolvedValue(makeSession());

      await expect(
        service.createSession('user-1', {
          scenarioId: 'sc-1',
          chosenCharacterId: 'ch-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('returns 409 even when existing session is PAUSED', async () => {
      scenariosRepo.findById.mockResolvedValue(makeScenario());
      sessionsRepo.findIncompleteByUser.mockResolvedValue(
        makeSession({ status: SimulationSessionStatus.PAUSED }),
      );

      await expect(
        service.createSession('user-1', {
          scenarioId: 'sc-1',
          chosenCharacterId: 'ch-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when scenario not found', async () => {
      scenariosRepo.findById.mockResolvedValue(null);

      await expect(
        service.createSession('user-1', {
          scenarioId: 'missing',
          chosenCharacterId: 'ch-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when scenario is not published', async () => {
      scenariosRepo.findById.mockResolvedValue(
        makeScenario({ isPublished: false }),
      );

      await expect(
        service.createSession('user-1', {
          scenarioId: 'sc-1',
          chosenCharacterId: 'ch-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when chosen character is not playable', async () => {
      scenariosRepo.findById.mockResolvedValue(makeScenario());
      sessionsRepo.findIncompleteByUser.mockResolvedValue(null);

      await expect(
        service.createSession('user-1', {
          scenarioId: 'sc-1',
          chosenCharacterId: 'ch-2', // isPlayable: false
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when chosen character does not belong to scenario', async () => {
      scenariosRepo.findById.mockResolvedValue(makeScenario());
      sessionsRepo.findIncompleteByUser.mockResolvedValue(null);

      await expect(
        service.createSession('user-1', {
          scenarioId: 'sc-1',
          chosenCharacterId: 'ch-999',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getSessionWithMessages ───────────────────────────────────────────────

  describe('getSessionWithMessages', () => {
    it('returns session with messages ordered by orderIndex', async () => {
      const session = makeSession({
        status: SimulationSessionStatus.ACTIVE,
        messages: [
          { id: 'msg-2', orderIndex: 2 },
          { id: 'msg-1', orderIndex: 1 },
        ],
      });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);
      sessionsRepo.updateStatus.mockResolvedValue(undefined);

      const result = await service.getSessionWithMessages(
        'user-1',
        'session-1',
      );

      expect(result.session.id).toBe('session-1');
    });

    it('transitions PAUSED session to ACTIVE on resume', async () => {
      const session = makeSession({ status: SimulationSessionStatus.PAUSED });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);
      sessionsRepo.updateStatus.mockResolvedValue(undefined);

      await service.getSessionWithMessages('user-1', 'session-1');

      expect(sessionsRepo.updateStatus).toHaveBeenCalledWith(
        'session-1',
        SimulationSessionStatus.ACTIVE,
      );
    });

    it('does NOT transition ACTIVE session (already active)', async () => {
      const session = makeSession({ status: SimulationSessionStatus.ACTIVE });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);

      await service.getSessionWithMessages('user-1', 'session-1');

      expect(sessionsRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when session not found', async () => {
      sessionsRepo.findByIdWithMessages.mockResolvedValue(null);

      await expect(
        service.getSessionWithMessages('user-1', 'missing'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when session belongs to different user', async () => {
      const session = makeSession({ userId: 'user-other' });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);

      await expect(
        service.getSessionWithMessages('user-1', 'session-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── cancelSession ────────────────────────────────────────────────────────

  describe('cancelSession', () => {
    it('soft-deletes the session', async () => {
      const session = makeSession({ status: SimulationSessionStatus.ACTIVE });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);
      sessionsRepo.softDelete.mockResolvedValue(undefined);

      await service.cancelSession('user-1', 'session-1');

      expect(sessionsRepo.softDelete).toHaveBeenCalledWith('session-1');
    });

    it('throws NotFoundException when session not found', async () => {
      sessionsRepo.findByIdWithMessages.mockResolvedValue(null);

      await expect(service.cancelSession('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when session belongs to different user', async () => {
      const session = makeSession({ userId: 'user-other' });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);

      await expect(
        service.cancelSession('user-1', 'session-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('does NOT create a SimulationResult when cancelled', async () => {
      const session = makeSession({ status: SimulationSessionStatus.ACTIVE });
      sessionsRepo.findByIdWithMessages.mockResolvedValue(session);
      sessionsRepo.softDelete.mockResolvedValue(undefined);

      await service.cancelSession('user-1', 'session-1');

      // messagesRepo.create should NOT be called (no result creation)
      expect(messagesRepo.create).not.toHaveBeenCalled();
    });
  });
});
