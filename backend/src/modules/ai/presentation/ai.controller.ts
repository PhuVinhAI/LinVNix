import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Sse,
  MessageEvent,
  ForbiddenException,
  HttpCode,
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
import { Observable } from 'rxjs';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SkipTransform } from '../../../common/decorators/skip-transform.decorator';
import { Permission } from '../../../common/enums';
import { ConversationService } from '../../conversations/application/conversation.service';
import { AgentService } from '../../agent/application/agent.service';
import { GenaiService } from '../../../infrastructure/genai/genai.service';
import { CreateConversationDto } from '../../conversations/dto/create-conversation.dto';
import { AiChatRequestDto } from '../dto/ai-chat-request.dto';
import { AiChatStreamRequestDto } from '../dto/ai-chat-stream-request.dto';
import { ListConversationsQueryDto } from '../dto/list-conversations-query.dto';
import { SseEventEncoder } from './sse-event-encoder';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(PermissionsGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);
  private readonly sseEventEncoder = new SseEventEncoder();

  constructor(
    private readonly conversationService: ConversationService,
    private readonly agentService: AgentService,
    private readonly genaiService: GenaiService,
  ) {}

  @Post('chat/stream')
  @HttpCode(200)
  @Sse('chat/stream')
  @SkipTransform()
  @RequirePermissions(Permission.AI_CHAT)
  @ApiOperation({
    summary: 'Streaming AI chat (single SSE endpoint)',
    description:
      'Drives the full agent tool loop and streams typed SSE events ' +
      '(`tool_start`, `tool_result`, `text_chunk`, `propose`, `error`, ' +
      '`done`). Lazily creates a Conversation when `conversationId` is ' +
      'omitted and snapshots the supplied `screenContext` onto it.',
  })
  @ApiBody({ type: AiChatStreamRequestDto })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of typed agent events',
    content: { 'text/event-stream': {} },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  chatStream(
    @CurrentUser() user: any,
    @Body() dto: AiChatStreamRequestDto,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const abortController = new AbortController();
      let teardown = false;

      const pump = async () => {
        try {
          for await (const event of this.agentService.runTurnStream(
            user.id,
            dto.conversationId ?? null,
            dto.message,
            dto.screenContext,
            abortController.signal,
          )) {
            if (teardown) break;
            subscriber.next(this.sseEventEncoder.encode(event));
          }
          subscriber.complete();
        } catch (err) {
          const error = err as Error & { code?: string };
          this.logger.error(
            `Stream error for user ${user.id}: ${error.message}`,
            (error as any)?.stack,
          );
          try {
            subscriber.next(
              this.sseEventEncoder.encode({
                type: 'error',
                code: error.code ?? 'AI_SERVICE_UNAVAILABLE',
                message: error.message || 'Internal error',
              }),
            );
            subscriber.complete();
          } catch {
            subscriber.error(err);
          }
        }
      };

      pump();

      return () => {
        teardown = true;
        abortController.abort();
      };
    });
  }

  @Post('chat/simple')
  @RequirePermissions(Permission.AI_CHAT)
  @ApiOperation({
    summary: 'Non-streaming chat (tooling/dev)',
    description:
      'Returns a complete AI response without streaming. Creates ' +
      'conversation if needed. Kept for local tooling and integration ' +
      'tests — production clients use POST /ai/chat/stream.',
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
