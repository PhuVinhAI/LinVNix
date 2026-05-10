import { Module } from '@nestjs/common';
import { AgentService } from './application/agent.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { EchoTool } from './tools/echo.tool';

@Module({
  imports: [ConversationsModule],
  providers: [
    AgentService,
    EchoTool,
    {
      provide: 'TOOLS',
      useFactory: (echoTool: EchoTool) => [echoTool],
      inject: [EchoTool],
    },
  ],
  exports: [AgentService],
})
export class AgentModule {}
