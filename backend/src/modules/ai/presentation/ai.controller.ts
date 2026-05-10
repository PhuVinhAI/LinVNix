import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Sse,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Observable, Subscriber } from 'rxjs';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permission, ConversationMessageRole } from '../../../common/enums';
import { ConversationService } from '../../conversations/application/conversation.service';
import { AgentService } from '../../agent/application/agent.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import { CreateConversationDto } from '../../conversations/dto/create-conversation.dto';
import { AiChatRequestDto } from '../dto/ai-chat-request.dto';
import { ListConversationsQueryDto } from '../dto/list-conversations-query.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(PermissionsGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly agentService: AgentService,
    private readonly genaiService: GenaiService,
  ) {}

  @Post('chat')
  @RequirePermissions(Permission.AI_CHAT, Permission.AI_CHAT_STREAM)
  @ApiOperation({
    summary: 'Send a chat message',
    description:
      'Creates a message and starts an AI turn. If stream=true (default), returns conversationId for SSE. If stream=false, returns full response.',
  })
  @ApiBody({ type: AiChatRequestDto })
  @ApiResponse({ status: 201, description: 'Chat initiated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async chat(@CurrentUser() user: any, @Body() dto: AiChatRequestDto) {
    const userId = user.id;
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const createDto: CreateConversationDto = {
        model: 'gemini-2.0-flash',
        lessonId: dto.lessonId,
      };
      const conversation = await this.conversationService.create(
        userId,
        createDto,
      );
      conversationId = conversation.id;
    }

    if (dto.stream === false) {
      const result = await this.agentService.runTurn(
        conversationId,
        dto.message,
      );
      return { conversationId, ...result };
    }

    await this.conversationService.addMessage(conversationId, {
      role: ConversationMessageRole.USER,
      content: dto.message,
      tokenCount: 0,
    });

    return { conversationId };
  }

  @Get('chat/:id/stream')
  @Sse('chat/:id/stream')
  @RequirePermissions(Permission.AI_CHAT_STREAM)
  @ApiOperation({
    summary: 'Stream AI response via SSE',
    description:
      'Server-Sent Events endpoint for streaming AI chat chunks for an active conversation.',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of AI chat chunks',
    content: { 'text/event-stream': {} },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async stream(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ): Promise<Observable<MessageEvent>> {
    const conversation =
      await this.conversationService.findById(conversationId);

    if (conversation.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const messages = (conversation.messages || []).map((msg) => {
      let role: 'user' | 'assistant' | 'system';
      switch (msg.role) {
        case ConversationMessageRole.USER:
          role = 'user';
          break;
        case ConversationMessageRole.ASSISTANT:
          role = 'assistant';
          break;
        default:
          role = 'system';
      }
      return { role, content: msg.content };
    });

    let systemInstruction = conversation.systemInstruction || '';
    if (conversation.lessonId) {
      systemInstruction += `\nCurrent lesson ID: ${conversation.lessonId}`;
    }

    return new Observable<MessageEvent>((subscriber) => {
      this.processStream(
        subscriber,
        conversationId,
        messages,
        systemInstruction,
      ).catch((err) => {
        this.logger.error(
          `Stream error for conversation ${conversationId}`,
          err,
        );
        subscriber.error(err);
      });
    });
  }

  private async processStream(
    subscriber: Subscriber<MessageEvent>,
    conversationId: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    systemInstruction: string,
  ): Promise<void> {
    let fullText = '';

    try {
      const stream = this.genaiService.chatStream({
        messages,
        systemInstruction,
      });

      for await (const chunk of stream) {
        fullText += chunk.text;
        subscriber.next({ data: JSON.stringify(chunk) } as MessageEvent);
      }

      await this.conversationService.addMessage(conversationId, {
        role: ConversationMessageRole.ASSISTANT,
        content: fullText,
        tokenCount: 0,
      });

      subscriber.complete();
    } catch (err) {
      subscriber.error(err);
    }
  }

  @Post('chat/simple')
  @RequirePermissions(Permission.AI_CHAT)
  @ApiOperation({
    summary: 'Non-streaming chat',
    description:
      'Returns a complete AI response without streaming. Creates conversation if needed.',
  })
  @ApiBody({ type: AiChatRequestDto })
  @ApiResponse({ status: 201, description: 'AI chat response' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async chatSimple(@CurrentUser() user: any, @Body() dto: AiChatRequestDto) {
    const userId = user.id;
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const createDto: CreateConversationDto = {
        model: 'gemini-2.0-flash',
        lessonId: dto.lessonId,
      };
      const conversation = await this.conversationService.create(
        userId,
        createDto,
      );
      conversationId = conversation.id;
    }

    const result = await this.agentService.runTurn(conversationId, dto.message);

    return { conversationId, ...result };
  }

  @Get('conversations')
  @RequirePermissions(Permission.AI_VIEW_CONVERSATIONS)
  @ApiOperation({
    summary: 'List user conversations',
    description:
      "Returns a paginated list of the current user's conversations.",
  })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'lessonId', required: false })
  @ApiResponse({ status: 200, description: 'Paginated conversation list' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listConversations(
    @CurrentUser() user: any,
    @Query() query: ListConversationsQueryDto,
  ) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;

    return this.conversationService.findByUser(user.id, page, limit, {
      courseId: query.courseId,
      lessonId: query.lessonId,
    });
  }

  @Get('conversations/:id')
  @RequirePermissions(Permission.AI_VIEW_CONVERSATIONS)
  @ApiOperation({
    summary: 'Get conversation detail',
    description:
      'Returns a conversation with its messages. Only own conversations are accessible.',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation detail with messages',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@CurrentUser() user: any, @Param('id') id: string) {
    const conversation = await this.conversationService.findById(id);

    if (conversation.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return conversation;
  }

  @Delete('conversations/:id')
  @RequirePermissions(Permission.AI_CHAT)
  @ApiOperation({
    summary: 'Delete a conversation',
    description:
      'Soft-deletes a conversation. Only own conversations can be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(@CurrentUser() user: any, @Param('id') id: string) {
    const conversation = await this.conversationService.findById(id);

    if (conversation.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    await this.conversationService.softDelete(id);
  }
}
