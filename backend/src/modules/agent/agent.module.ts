import { Module } from '@nestjs/common';
import { AgentService } from './application/agent.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from '../users/users.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';
import { EchoTool } from './tools/echo.tool';
import { GetUserSummaryTool } from './tools/get-user-summary.tool';

@Module({
  imports: [ConversationsModule, UsersModule, DailyGoalsModule],
  providers: [
    AgentService,
    EchoTool,
    GetUserSummaryTool,
    {
      provide: 'TOOLS',
      useFactory: (
        echoTool: EchoTool,
        getUserSummaryTool: GetUserSummaryTool,
      ) => [echoTool, getUserSummaryTool],
      inject: [EchoTool, GetUserSummaryTool],
    },
  ],
  exports: [AgentService],
})
export class AgentModule {}
