import { NotFoundException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationsRepository } from './repositories/conversations.repository';
import {
  ConversationStatus,
  ConversationMessageRole,
} from '../../../common/enums';

describe('ConversationService', () => {
  let service: ConversationService;
  let repository: jest.Mocked<ConversationsRepository>;

  beforeEach(() => {
    repository = {
      createConversation: jest.fn(),
      findConversationById: jest.fn(),
      findConversationsByUser: jest.fn(),
      createMessage: jest.fn(),
      updateConversation: jest.fn(),
      softDeleteConversation: jest.fn(),
    } as any;

    service = new ConversationService(repository);
  });

  describe('create', () => {
    it('creates a conversation with required fields', async () => {
      const mockConversation = {
        id: 'conv-1',
        userId: 'user-1',
        model: 'gemini-2.0-flash',
        systemInstruction: '',
        status: ConversationStatus.ACTIVE,
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.createConversation.mockResolvedValue(mockConversation as any);

      const result = await service.create('user-1', {
        model: 'gemini-2.0-flash',
      });

      expect(repository.createConversation).toHaveBeenCalledWith({
        userId: 'user-1',
        model: 'gemini-2.0-flash',
        systemInstruction: '',
        courseId: undefined,
        lessonId: undefined,
        status: ConversationStatus.ACTIVE,
      });
      expect(result).toEqual(mockConversation);
    });

    it('creates a conversation with course and lesson context', async () => {
      const mockConversation = {
        id: 'conv-2',
        userId: 'user-1',
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a tutor.',
        courseId: 'course-1',
        lessonId: 'lesson-1',
        status: ConversationStatus.ACTIVE,
      };
      repository.createConversation.mockResolvedValue(mockConversation as any);

      const result = await service.create('user-1', {
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a tutor.',
        courseId: 'course-1',
        lessonId: 'lesson-1',
      });

      expect(repository.createConversation).toHaveBeenCalledWith({
        userId: 'user-1',
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a tutor.',
        courseId: 'course-1',
        lessonId: 'lesson-1',
        status: ConversationStatus.ACTIVE,
      });
      expect(result.courseId).toBe('course-1');
      expect(result.lessonId).toBe('lesson-1');
    });
  });

  describe('findById', () => {
    it('returns a conversation when found', async () => {
      const mockConversation = { id: 'conv-1', messages: [] };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );

      const result = await service.findById('conv-1');

      expect(result).toEqual(mockConversation);
    });

    it('throws NotFoundException when conversation not found', async () => {
      repository.findConversationById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('returns paginated conversations for a user', async () => {
      const mockConversations = {
        data: [{ id: 'conv-1' }, { id: 'conv-2' }],
        total: 2,
      };
      repository.findConversationsByUser.mockResolvedValue(
        mockConversations as any,
      );

      const result = await service.findByUser('user-1', 1, 20);

      expect(repository.findConversationsByUser).toHaveBeenCalledWith(
        'user-1',
        1,
        20,
        undefined,
      );
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('passes filters to repository', async () => {
      repository.findConversationsByUser.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findByUser('user-1', 1, 10, {
        courseId: 'course-1',
        lessonId: 'lesson-1',
      });

      expect(repository.findConversationsByUser).toHaveBeenCalledWith(
        'user-1',
        1,
        10,
        { courseId: 'course-1', lessonId: 'lesson-1' },
      );
    });
  });

  describe('addMessage', () => {
    it('adds a user message to a conversation', async () => {
      const mockConversation = { id: 'conv-1', messages: [] };
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: ConversationMessageRole.USER,
        content: 'Xin chào',
        tokenCount: 10,
      };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.createMessage.mockResolvedValue(mockMessage as any);

      const result = await service.addMessage('conv-1', {
        role: ConversationMessageRole.USER,
        content: 'Xin chào',
        tokenCount: 10,
      });

      expect(repository.createMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        role: ConversationMessageRole.USER,
        content: 'Xin chào',
        toolCalls: undefined,
        toolResults: undefined,
        tokenCount: 10,
      });
      expect(result).toEqual(mockMessage);
    });

    it('adds a tool message with tool calls and results', async () => {
      const mockConversation = { id: 'conv-1', messages: [] };
      const mockMessage = {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: ConversationMessageRole.TOOL,
        content: 'Tool result',
        toolCalls: [{ name: 'search', arguments: { query: 'hello' } }],
        toolResults: [{ name: 'search', result: { found: true } }],
        tokenCount: 50,
      };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.createMessage.mockResolvedValue(mockMessage as any);

      const result = await service.addMessage('conv-1', {
        role: ConversationMessageRole.TOOL,
        content: 'Tool result',
        toolCalls: [{ name: 'search', arguments: { query: 'hello' } }],
        toolResults: [{ name: 'search', result: { found: true } }],
        tokenCount: 50,
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolResults).toHaveLength(1);
    });

    it('defaults tokenCount to 0 when not provided', async () => {
      const mockConversation = { id: 'conv-1', messages: [] };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.createMessage.mockResolvedValue({} as any);

      await service.addMessage('conv-1', {
        role: ConversationMessageRole.ASSISTANT,
        content: 'Hello!',
      });

      expect(repository.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({ tokenCount: 0 }),
      );
    });

    it('throws NotFoundException when conversation does not exist', async () => {
      repository.findConversationById.mockResolvedValue(null);

      await expect(
        service.addMessage('nonexistent', {
          role: ConversationMessageRole.USER,
          content: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('accumulateTokens', () => {
    it('adds tokens to conversation totals', async () => {
      const mockConversation = {
        id: 'conv-1',
        totalTokens: 100,
        totalPromptTokens: 60,
        totalCompletionTokens: 40,
      };
      const mockUpdated = {
        id: 'conv-1',
        totalTokens: 250,
        totalPromptTokens: 160,
        totalCompletionTokens: 90,
      };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.updateConversation.mockResolvedValue(mockUpdated as any);

      const result = await service.accumulateTokens('conv-1', 100, 50);

      expect(repository.updateConversation).toHaveBeenCalledWith('conv-1', {
        totalTokens: 250,
        totalPromptTokens: 160,
        totalCompletionTokens: 90,
      });
      expect(result.totalTokens).toBe(250);
    });

    it('accumulates from zero', async () => {
      const mockConversation = {
        id: 'conv-1',
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
      };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.updateConversation.mockResolvedValue({} as any);

      await service.accumulateTokens('conv-1', 50, 30);

      expect(repository.updateConversation).toHaveBeenCalledWith('conv-1', {
        totalTokens: 80,
        totalPromptTokens: 50,
        totalCompletionTokens: 30,
      });
    });
  });

  describe('archive', () => {
    it('sets conversation status to archived', async () => {
      const mockConversation = {
        id: 'conv-1',
        status: ConversationStatus.ACTIVE,
      };
      const mockUpdated = { id: 'conv-1', status: ConversationStatus.ARCHIVED };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.updateConversation.mockResolvedValue(mockUpdated as any);

      const result = await service.archive('conv-1');

      expect(repository.updateConversation).toHaveBeenCalledWith('conv-1', {
        status: ConversationStatus.ARCHIVED,
      });
      expect(result.status).toBe(ConversationStatus.ARCHIVED);
    });
  });

  describe('softDelete', () => {
    it('archives then soft-deletes the conversation', async () => {
      const mockConversation = { id: 'conv-1' };
      repository.findConversationById.mockResolvedValue(
        mockConversation as any,
      );
      repository.updateConversation.mockResolvedValue({} as any);
      repository.softDeleteConversation.mockResolvedValue(undefined);

      await service.softDelete('conv-1');

      expect(repository.updateConversation).toHaveBeenCalledWith('conv-1', {
        status: ConversationStatus.ARCHIVED,
      });
      expect(repository.softDeleteConversation).toHaveBeenCalledWith('conv-1');
    });

    it('throws NotFoundException when conversation does not exist', async () => {
      repository.findConversationById.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
