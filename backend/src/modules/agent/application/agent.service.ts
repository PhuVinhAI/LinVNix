import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
  IAiProvider,
  AiChatRequest,
  AiChatResponse,
  AiMessage,
  AiFunctionResult,
} from '@linvnix/shared';
import { BaseTool } from '@linvnix/shared';
import { ConversationService } from '../../conversations/application/conversation.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
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
    // Inject all BaseTool subclasses; they are registered as providers in AgentModule
    @Inject('TOOLS')
    private readonly tools: BaseTool<any, any>[],
  ) {
    // Build tool map by name
    for (const tool of this.tools) {
      this.toolMap.set(tool.name, tool);
    }
  }

  async runTurn(
    conversationId: string,
    userMessage: string,
  ): Promise<AiChatResponse> {
    // 1. Load conversation history
    const conversation =
      await this.conversationService.findById(conversationId);
    const messages = conversation.messages || [];

    // 2. Render system prompt from YAML + inject lesson context if lessonId set
    let systemInstruction = conversation.systemInstruction || '';
    if (conversation.lessonId) {
      // TODO: inject lesson/vocabulary context into system prompt
      // For now, we can add a placeholder
      systemInstruction += `\nCurrent lesson ID: ${conversation.lessonId}`;
    }

    // 3. Persist user message
    await this.conversationService.addMessage(conversationId, {
      role: ConversationMessageRole.USER,
      content: userMessage,
      tokenCount: 0, // will be updated after AI call
    });

    // Build AiMessage list from history + new user message
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

    // 4. Build tool declarations
    const toolDeclarations = this.tools.map((tool) => tool.toDeclaration());

    // 5. Tool loop
    let iterations = 0;
    let finalResponse: AiChatResponse | null = null;

    while (iterations < AI_TOOL_MAX_ITERATIONS) {
      iterations++;

      // Build request
      const request: AiChatRequest = {
        messages: aiMessages,
        systemInstruction,
        tools: toolDeclarations,
      };

      // Call AI provider
      const response = await this.aiProvider.chat(request);
      finalResponse = response;

      // Persist assistant message
      const assistantTokenCount =
        response.usageMetadata?.candidatesTokenCount || 0;
      await this.conversationService.addMessage(conversationId, {
        role: ConversationMessageRole.ASSISTANT,
        content: response.text,
        tokenCount: assistantTokenCount,
      });

      // Accumulate tokens
      await this.conversationService.accumulateTokens(
        conversationId,
        response.usageMetadata?.promptTokenCount || 0,
        assistantTokenCount,
      );

      // If no function calls, we're done
      if (!response.functionCalls || response.functionCalls.length === 0) {
        break;
      }

      // Execute function calls
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

        // Validate parameters
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

        // Execute tool
        try {
          const result = await tool.execute(validatedParams);
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

      // Persist tool calls and results
      await this.conversationService.addMessage(conversationId, {
        role: ConversationMessageRole.TOOL,
        content: '', // tool messages have no content
        toolCalls: response.functionCalls,
        toolResults: functionResults,
        tokenCount: 0,
      });

      // Append function results to messages for next iteration
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
