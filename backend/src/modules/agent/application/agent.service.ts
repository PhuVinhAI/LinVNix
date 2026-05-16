import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
  IAiProvider,
  AiChatRequest,
  AiChatResponse,
  AiMessage,
  AiFunctionResult,
  ToolContext,
} from '@linvnix/shared';
import { BaseTool } from '@linvnix/shared';
import { ConversationService } from '../../conversations/application/conversation.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import { UsersService } from '../../users/application/users.service';
import { ConversationMessageRole } from '../../../common/enums';
import { ZodError } from 'zod';

export const AI_TOOL_MAX_ITERATIONS = 10;

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly toolMap: Map<string, BaseTool<any, any>> = new Map();

  constructor(
    @Inject('AI_PROVIDER')
    private readonly aiProvider: IAiProvider,
    private readonly conversationService: ConversationService,
    private readonly genaiService: GenaiService,
    private readonly usersService: UsersService,
    // Inject all BaseTool subclasses; they are registered as providers in AgentModule
    @Inject('TOOLS')
    private readonly tools: BaseTool<any, any>[],
  ) {
    for (const tool of this.tools) {
      this.toolMap.set(tool.name, tool);
    }
  }

  async runTurn(
    conversationId: string,
    userMessage: string,
  ): Promise<AiChatResponse> {
    const conversation =
      await this.conversationService.findById(conversationId);
    const messages = conversation.messages || [];

    // Owner is hydrated once per turn; tools read user-scoped settings via ctx.user.
    const user = await this.usersService.findById(conversation.userId);
    const ctx: ToolContext = {
      userId: conversation.userId,
      conversationId,
      screenContext: conversation.screenContext ?? {},
      user,
    };

    let systemInstruction = conversation.systemInstruction || '';
    if (conversation.lessonId) {
      // TODO: inject lesson/vocabulary context into system prompt
      systemInstruction += `\nCurrent lesson ID: ${conversation.lessonId}`;
    }

    await this.conversationService.addMessage(conversationId, {
      role: ConversationMessageRole.USER,
      content: userMessage,
      tokenCount: 0,
    });

    const aiMessages: AiMessage[] = [
      ...messages.map((msg) => {
        let role: 'user' | 'assistant' | 'system' | 'function';
        switch (msg.role) {
          case ConversationMessageRole.USER:
            role = 'user';
            break;
          case ConversationMessageRole.ASSISTANT:
            role = 'assistant';
            break;
          case ConversationMessageRole.TOOL:
            role = 'function';
            break;
          default:
            role = 'system';
        }
        return { role, content: msg.content };
      }),
      { role: 'user', content: userMessage },
    ];

    const toolDeclarations = this.tools.map((tool) => tool.toDeclaration());

    let iterations = 0;
    let finalResponse: AiChatResponse | null = null;

    while (iterations < AI_TOOL_MAX_ITERATIONS) {
      iterations++;

      const request: AiChatRequest = {
        messages: aiMessages,
        systemInstruction,
        tools: toolDeclarations,
      };

      const response = await this.aiProvider.chat(request);
      finalResponse = response;

      const assistantTokenCount =
        response.usageMetadata?.candidatesTokenCount || 0;
      await this.conversationService.addMessage(conversationId, {
        role: ConversationMessageRole.ASSISTANT,
        content: response.text,
        tokenCount: assistantTokenCount,
      });

      await this.conversationService.accumulateTokens(
        conversationId,
        response.usageMetadata?.promptTokenCount || 0,
        assistantTokenCount,
      );

      if (!response.functionCalls || response.functionCalls.length === 0) {
        break;
      }

      const functionResults: AiFunctionResult[] = [];
      for (const fc of response.functionCalls) {
        const tool = this.toolMap.get(fc.name);
        if (!tool) {
          this.logger.warn(`Tool ${fc.name} not found`);
          functionResults.push({
            name: fc.name,
            result: { error: `Tool ${fc.name} not found` },
          });
          continue;
        }

        let validatedParams: any;
        try {
          validatedParams = tool.parameters.parse(fc.arguments);
        } catch (error) {
          if (error instanceof ZodError) {
            this.logger.warn(
              `Invalid parameters for tool ${fc.name}: ${error.message}`,
            );
            functionResults.push({
              name: fc.name,
              result: { error: `Invalid parameters: ${error.message}` },
            });
            continue;
          }
          throw error;
        }

        try {
          const result = await tool.execute(validatedParams, ctx);
          functionResults.push({
            name: fc.name,
            result,
          });
        } catch (error) {
          this.logger.error(`Tool ${fc.name} execution failed: ${error}`);
          functionResults.push({
            name: fc.name,
            result: { error: `Tool execution failed: ${error.message}` },
          });
        }
      }

      await this.conversationService.addMessage(conversationId, {
        role: ConversationMessageRole.TOOL,
        content: '',
        toolCalls: response.functionCalls,
        toolResults: functionResults,
        tokenCount: 0,
      });

      aiMessages.push(
        ...response.functionCalls.map((fc) => ({
          role: 'assistant' as const,
          content: '',
          functionCall: fc,
        })),
        ...functionResults.map((fr) => ({
          role: 'function' as const,
          content: '',
          functionResult: fr,
        })),
      );
    }

    if (iterations >= AI_TOOL_MAX_ITERATIONS) {
      this.logger.warn(
        `Tool loop reached max iterations (${AI_TOOL_MAX_ITERATIONS})`,
      );
    }

    return finalResponse!;
  }
}
