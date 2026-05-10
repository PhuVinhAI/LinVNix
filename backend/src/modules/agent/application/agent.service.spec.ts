import { Test, TestingModule } from '@nestjs/testing';
import { AgentService, AI_TOOL_MAX_ITERATIONS } from './agent.service';
import { ConversationService } from '../../conversations/application/conversation.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import {
  ConversationMessageRole,
  ConversationStatus,
} from '../../../common/enums';
import { ZodError } from 'zod';

abstract class BaseTool<TParams = any, TResult = any> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly parameters: any;
  abstract execute(params: TParams): Promise<TResult>;
  toDeclaration() {
    return { name: this.name, description: this.description, parameters: {} };
  }
}

class MockTool extends BaseTool<{ input: string }, { output: string }> {
  readonly name = 'mock_tool';
  readonly description = 'A mock tool';
  readonly parameters = { parse: jest.fn() } as any;

  async execute(params: { input: string }): Promise<{ output: string }> {
    return { output: `processed: ${params.input}` };
  }
}

describe('AgentService', () => {
  let service: AgentService;
  let aiProvider: {
    chat: jest.Mock;
    chatStream: jest.Mock;
    embed: jest.Mock;
    uploadFile: jest.Mock;
    generateImage: jest.Mock;
  };
  let conversationService: jest.Mocked<ConversationService>;
  let genaiService: jest.Mocked<GenaiService>;
  let mockTool: MockTool & {
    parameters: { parse: jest.Mock };
    execute: jest.Mock;
    toDeclaration: jest.Mock;
  };

  beforeEach(async () => {
    aiProvider = {
      chat: jest.fn(),
      chatStream: jest.fn(),
      embed: jest.fn(),
      uploadFile: jest.fn(),
      generateImage: jest.fn(),
    };

    conversationService = {
      findById: jest.fn(),
      addMessage: jest.fn(),
      accumulateTokens: jest.fn(),
      create: jest.fn(),
      findByUser: jest.fn(),
      archive: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    genaiService = {
      renderPrompt: jest.fn(),
    } as any;

    mockTool = {
      name: 'mock_tool',
      description: 'A mock tool',
      parameters: { parse: jest.fn() },
      execute: jest.fn(),
      toDeclaration: jest.fn().mockReturnValue({
        name: 'mock_tool',
        description: 'A mock tool',
        parameters: {},
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: 'AI_PROVIDER', useValue: aiProvider },
        { provide: ConversationService, useValue: conversationService },
        { provide: GenaiService, useValue: genaiService },
        { provide: 'TOOLS', useValue: [mockTool] },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runTurn', () => {
    const conversationId = 'conv-1';
    const userMessage = 'Hello';

    beforeEach(() => {
      conversationService.findById.mockResolvedValue({
        id: conversationId,
        userId: 'user-1',
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a helpful assistant.',
        lessonId: undefined,
        status: ConversationStatus.ACTIVE,
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        messages: [],
      } as any);

      conversationService.addMessage.mockResolvedValue({} as any);
      conversationService.accumulateTokens.mockResolvedValue({} as any);
    });

    it('should complete with final text when no function calls', async () => {
      const response = {
        text: 'Hi there!',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      };
      aiProvider.chat.mockResolvedValue(response);

      const result = await service.runTurn(conversationId, userMessage);

      expect(aiProvider.chat).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
      expect(conversationService.addMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          role: ConversationMessageRole.USER,
          content: userMessage,
        }),
      );
      expect(conversationService.addMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          role: ConversationMessageRole.ASSISTANT,
          content: 'Hi there!',
          tokenCount: 5,
        }),
      );
      expect(conversationService.accumulateTokens).toHaveBeenCalledWith(
        conversationId,
        10,
        5,
      );
    });

    it('should handle tool loop with function calls then final text', async () => {
      const functionCall = {
        name: 'mock_tool',
        arguments: { input: 'test' },
      };
      const firstResponse = {
        text: '',
        functionCalls: [functionCall],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 0,
          totalTokenCount: 10,
        },
      };
      const secondResponse = {
        text: 'Tool executed successfully.',
        usageMetadata: {
          promptTokenCount: 20,
          candidatesTokenCount: 10,
          totalTokenCount: 30,
        },
      };

      aiProvider.chat
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      mockTool.parameters.parse.mockReturnValue({ input: 'test' });
      mockTool.execute.mockResolvedValue({ output: 'processed: test' });

      const result = await service.runTurn(conversationId, userMessage);

      expect(aiProvider.chat).toHaveBeenCalledTimes(2);
      expect(mockTool.parameters.parse).toHaveBeenCalledWith({ input: 'test' });
      expect(mockTool.execute).toHaveBeenCalledWith({ input: 'test' });
      expect(conversationService.addMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          role: ConversationMessageRole.TOOL,
          toolCalls: [functionCall],
          toolResults: [
            { name: 'mock_tool', result: { output: 'processed: test' } },
          ],
        }),
      );
      expect(result).toEqual(secondResponse);
    });

    it('should stop at max iterations guard', async () => {
      const functionCall = {
        name: 'mock_tool',
        arguments: { input: 'loop' },
      };
      const infiniteResponse = {
        text: '',
        functionCalls: [functionCall],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 0,
          totalTokenCount: 5,
        },
      };

      aiProvider.chat.mockResolvedValue(infiniteResponse);
      mockTool.parameters.parse.mockReturnValue({ input: 'loop' });
      mockTool.execute.mockResolvedValue({ output: 'processed: loop' });

      const result = await service.runTurn(conversationId, userMessage);

      expect(aiProvider.chat).toHaveBeenCalledTimes(AI_TOOL_MAX_ITERATIONS);
      expect(result).toEqual(infiniteResponse);
    });

    it('should dispatch tool by name', async () => {
      const functionCall = {
        name: 'nonexistent_tool',
        arguments: {},
      };
      const response = {
        text: '',
        functionCalls: [functionCall],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 0,
          totalTokenCount: 10,
        },
      };
      const finalResponse = {
        text: 'Tool not found handled.',
        usageMetadata: {
          promptTokenCount: 20,
          candidatesTokenCount: 10,
          totalTokenCount: 30,
        },
      };

      aiProvider.chat
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(finalResponse);

      const result = await service.runTurn(conversationId, userMessage);

      expect(conversationService.addMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          role: ConversationMessageRole.TOOL,
          toolCalls: [functionCall],
          toolResults: [
            {
              name: 'nonexistent_tool',
              result: { error: 'Tool nonexistent_tool not found' },
            },
          ],
        }),
      );
      expect(result).toEqual(finalResponse);
    });

    it('should validate tool parameters and handle ZodError', async () => {
      const functionCall = {
        name: 'mock_tool',
        arguments: { invalid: true },
      };
      const response = {
        text: '',
        functionCalls: [functionCall],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 0,
          totalTokenCount: 10,
        },
      };
      const finalResponse = {
        text: 'Validation error handled.',
        usageMetadata: {
          promptTokenCount: 20,
          candidatesTokenCount: 10,
          totalTokenCount: 30,
        },
      };

      aiProvider.chat
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(finalResponse);

      const zodError = new ZodError([]);
      mockTool.parameters.parse.mockImplementation(() => {
        throw zodError;
      });

      const result = await service.runTurn(conversationId, userMessage);

      expect(conversationService.addMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          role: ConversationMessageRole.TOOL,
          toolCalls: [functionCall],
          toolResults: [
            {
              name: 'mock_tool',
              result: { error: `Invalid parameters: ${zodError.message}` },
            },
          ],
        }),
      );
      expect(result).toEqual(finalResponse);
    });

    it('should inject lesson context into system prompt when lessonId is set', async () => {
      conversationService.findById.mockResolvedValue({
        id: conversationId,
        userId: 'user-1',
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a helpful assistant.',
        lessonId: 'lesson-123',
        status: ConversationStatus.ACTIVE,
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        messages: [],
      } as any);

      const response = {
        text: 'Lesson context injected.',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      };
      aiProvider.chat.mockResolvedValue(response);

      await service.runTurn(conversationId, userMessage);

      const chatCall = aiProvider.chat.mock.calls[0][0];
      expect(chatCall.systemInstruction).toContain('lesson-123');
    });

    it('should accumulate tokens across multiple AI calls', async () => {
      const firstResponse = {
        text: '',
        functionCalls: [
          {
            name: 'mock_tool',
            arguments: { input: 'test' },
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 0,
          totalTokenCount: 10,
        },
      };
      const secondResponse = {
        text: 'Done.',
        usageMetadata: {
          promptTokenCount: 20,
          candidatesTokenCount: 10,
          totalTokenCount: 30,
        },
      };

      aiProvider.chat
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      mockTool.parameters.parse.mockReturnValue({ input: 'test' });
      mockTool.execute.mockResolvedValue({ output: 'processed: test' });

      await service.runTurn(conversationId, userMessage);

      expect(conversationService.accumulateTokens).toHaveBeenCalledWith(
        conversationId,
        10,
        0,
      );
      expect(conversationService.accumulateTokens).toHaveBeenCalledWith(
        conversationId,
        20,
        10,
      );
    });
  });
});
