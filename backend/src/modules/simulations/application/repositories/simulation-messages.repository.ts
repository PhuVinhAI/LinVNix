import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationMessage } from '../../domain/simulation-message.entity';

@Injectable()
export class SimulationMessagesRepository {
  constructor(
    @InjectRepository(SimulationMessage)
    private readonly repository: Repository<SimulationMessage>,
  ) {}

  async create(data: {
    sessionId: string;
    speakerCharacterId: string | null;
    isLearner: boolean;
    content: string;
    orderIndex: number;
    feedback?: SimulationMessage['feedback'];
  }): Promise<SimulationMessage> {
    const message = this.repository.create(data);
    return this.repository.save(message);
  }
}
