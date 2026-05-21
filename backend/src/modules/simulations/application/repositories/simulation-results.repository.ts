import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationResult } from '../../domain/simulation-result.entity';
import { SimulationEndReason } from '../../../../common/enums';

@Injectable()
export class SimulationResultsRepository {
  constructor(
    @InjectRepository(SimulationResult)
    private readonly repository: Repository<SimulationResult>,
  ) {}

  async create(data: {
    userId: string;
    sessionId: string;
    scenarioId: string;
    chosenCharacterId: string;
    totalScore: number;
    criteriaScores: SimulationResult['criteriaScores'];
    endReason: SimulationEndReason;
    aiSummary: string;
    totalMessages: number;
  }): Promise<SimulationResult> {
    const result = this.repository.create(data);
    return this.repository.save(result);
  }
}
