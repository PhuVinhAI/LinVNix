import { Module } from '@nestjs/common';
import { AiController } from './presentation/ai.controller';
import { ConversationsModule } from '../conversations/conversations.module';
import { AgentModule } from '../agent/agent.module';
import { GenaiModule } from '../../infrastructure/genai/genai.module';

@Module({
  imports: [GenaiModule, AgentModule, ConversationsModule],
  controllers: [AiController],
})
export class AiModule {}
