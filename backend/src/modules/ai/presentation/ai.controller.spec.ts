import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { ConversationService } from '../../conversations/application/conversation.service';
import { AgentService } from '../../agent/application/agent.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import {
  ConversationMessageRole,
  ConversationStatus,
} from '../../../common/enums';
import { Observable } from 'rxjs';

describe('AiController', () => {
  let controller: AiController;
  let conversationService: jest.Mocked<ConversationService>;
  let agentService: jest.Mocked<AgentService>;
  let genaiService: jest.Mocked<GenaiService>;

  const mockUser = { id: 'user-1' };
  const mockConversation = {
    id: 'conv-1',
    userId: 'user-1',
    model: 'gemini-2.0-flash',
    systemInstruction: 'You are a tutor.',
    lessonId: undefined,
    status: ConversationStatus.ACTIVE,
    totalTokens: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    conversationService = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      addMessage: jest.fn(),
      accumulateTokens: jest.fn(),
      archive: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    agentService = {
      runTurn: jest.fn(),
    } as any;

    genaiService = {
      chatStream: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: ConversationService, useValue: conversationService },
        { provide: AgentService, useValue: agentService },
        { provide: GenaiService, useValue: genaiService },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /ai/chat', () => {
    it('creates a new conversation when conversationId is not provided', async () => {
      conversationService.create.mockResolvedValue(mockConversation as any);
      conversationService.addMessage.mockResolvedValue({} as any);

      const result = await controller.chat(mockUser, {
        message: 'Xin chào',
        stream: true,
      });

      expect(conversationService.create).toHaveBeenCalledWith('user-1', {
        model: 'gemini-2.0-flash',
        lessonId: undefined,
      });
      expect(result).toEqual({ conversationId: 'conv-1' });
    });

    it('uses existing conversation when conversationId is provided', async () => {
      conversationService.addMessage.mockResolvedValue({} as any);

      const result = await controller.chat(mockUser, {
        message: 'Xin chào',
        conversationId: 'conv-1',
        stream: true,
      });

      expect(conversationService.create).not.toHaveBeenCalled();
      expect(conversationService.addMessage).toHaveBeenCalledWith('conv-1', {
        role: ConversationMessageRole.USER,
        content: 'Xin chào',
        tokenCount: 0,
      });
      expect(result).toEqual({ conversationId: 'conv-1' });
    });

    it('returns full response when stream is false', async () => {
      conversationService.create.mockResolvedValue(mockConversation as any);
      agentService.runTurn.mockResolvedValue({
        text: 'Xin chào!',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      } as any);

      const result = await controller.chat(mockUser, {
        message: 'Xin chào',
        stream: false,
      });

      expect(agentService.runTurn).toHaveBeenCalledWith('conv-1', 'Xin chào');
      expect(result).toEqual({
        conversationId: 'conv-1',
        text: 'Xin chào!',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      });
    });

    it('passes lessonId when creating a new conversation', async () => {
      conversationService.create.mockResolvedValue(mockConversation as any);
      conversationService.addMessage.mockResolvedValue({} as any);

      await controller.chat(mockUser, {
        message: 'Xin chào',
        lessonId: 'lesson-1',
        stream: true,
      });

      expect(conversationService.create).toHaveBeenCalledWith('user-1', {
        model: 'gemini-2.0-flash',
        lessonId: 'lesson-1',
      });
    });
  });

  describe('GET /ai/chat/:id/stream', () => {
    it('returns an Observable for SSE streaming', async () => {
      conversationService.findById.mockResolvedValue(mockConversation as any);
      genaiService.chatStream.mockReturnValue(
        (async function* () {
          yield { text: 'Hello ' };
          yield { text: 'world' };
        })(),
      );

      const result = await controller.stream(mockUser, 'conv-1');

      expect(result).toBeInstanceOf(Observable);
    });

    it('throws ForbiddenException when user does not own the conversation', async () => {
      conversationService.findById.mockResolvedValue({
        ...mockConversation,
        userId: 'other-user',
      } as any);

      await expect(controller.stream(mockUser, 'conv-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('streams chunks as JSON-encoded MessageEvents', async () => {
      conversationService.findById.mockResolvedValue(mockConversation as any);
      genaiService.chatStream.mockReturnValue(
        (async function* () {
          yield { text: 'Hello ' };
          yield { text: 'world' };
        })(),
      );

      const observable = await controller.stream(mockUser, 'conv-1');
      const events: MessageEvent[] = await new Promise((resolve) => {
        const collected: MessageEvent[] = [];
        observable.subscribe({
          next: (event) => collected.push(event),
          complete: () => resolve(collected),
        });
      });

      expect(events).toHaveLength(2);
      expect(JSON.parse(events[0].data)).toEqual({ text: 'Hello ' });
      expect(JSON.parse(events[1].data)).toEqual({ text: 'world' });
    });

    it('persists assistant message after stream completes', async () => {
      conversationService.findById.mockResolvedValue(mockConversation as any);
      genaiService.chatStream.mockReturnValue(
        (async function* () {
          yield { text: 'Hello ' };
          yield { text: 'world' };
        })(),
      );

      const observable = await controller.stream(mockUser, 'conv-1');
      await new Promise<void>((resolve) => {
        observable.subscribe({ complete: () => resolve() });
      });

      expect(conversationService.addMessage).toHaveBeenCalledWith('conv-1', {
        role: ConversationMessageRole.ASSISTANT,
        content: 'Hello world',
        tokenCount: 0,
      });
    });
  });

  describe('POST /ai/chat/simple', () => {
    it('creates conversation and runs AI turn', async () => {
      conversationService.create.mockResolvedValue(mockConversation as any);
      agentService.runTurn.mockResolvedValue({
        text: 'Xin chào!',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      } as any);

      const result = await controller.chatSimple(mockUser, {
        message: 'Xin chào',
      });

      expect(conversationService.create).toHaveBeenCalledWith('user-1', {
        model: 'gemini-2.0-flash',
        lessonId: undefined,
      });
      expect(agentService.runTurn).toHaveBeenCalledWith('conv-1', 'Xin chào');
      expect(result).toEqual({
        conversationId: 'conv-1',
        text: 'Xin chào!',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      });
    });

    it('uses existing conversation when conversationId is provided', async () => {
      agentService.runTurn.mockResolvedValue({
        text: 'Response',
        usageMetadata: {},
      } as any);

      const result = await controller.chatSimple(mockUser, {
        message: 'Hello',
        conversationId: 'conv-1',
      });

      expect(conversationService.create).not.toHaveBeenCalled();
      expect(result.conversationId).toBe('conv-1');
    });
  });

  describe('GET /ai/conversations', () => {
    it('returns paginated conversations for the current user', async () => {
      const mockResult = {
        data: [{ id: 'conv-1' }, { id: 'conv-2' }],
        total: 2,
      };
      conversationService.findByUser.mockResolvedValue(mockResult as any);

      const result = await controller.listConversations(mockUser, {});

      expect(conversationService.findByUser).toHaveBeenCalledWith(
        'user-1',
        1,
        20,
        { courseId: undefined, lessonId: undefined },
      );
      expect(result).toEqual(mockResult);
    });

    it('passes pagination and filter params', async () => {
      conversationService.findByUser.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.listConversations(mockUser, {
        page: '2',
        limit: '10',
        courseId: 'course-1',
        lessonId: 'lesson-1',
      });

      expect(conversationService.findByUser).toHaveBeenCalledWith(
        'user-1',
        2,
        10,
        { courseId: 'course-1', lessonId: 'lesson-1' },
      );
    });
  });

  describe('GET /ai/conversations/:id', () => {
    it('returns conversation when user owns it', async () => {
      conversationService.findById.mockResolvedValue(mockConversation as any);

      const result = await controller.getConversation(mockUser, 'conv-1');

      expect(result).toEqual(mockConversation);
    });

    it('throws ForbiddenException when user does not own the conversation', async () => {
      conversationService.findById.mockResolvedValue({
        ...mockConversation,
        userId: 'other-user',
      } as any);

      await expect(
        controller.getConversation(mockUser, 'conv-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /ai/conversations/:id', () => {
    it('soft-deletes conversation when user owns it', async () => {
      conversationService.findById.mockResolvedValue(mockConversation as any);
      conversationService.softDelete.mockResolvedValue(undefined);

      await controller.deleteConversation(mockUser, 'conv-1');

      expect(conversationService.softDelete).toHaveBeenCalledWith('conv-1');
    });

    it('throws ForbiddenException when user does not own the conversation', async () => {
      conversationService.findById.mockResolvedValue({
        ...mockConversation,
        userId: 'other-user',
      } as any);

      await expect(
        controller.deleteConversation(mockUser, 'conv-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
