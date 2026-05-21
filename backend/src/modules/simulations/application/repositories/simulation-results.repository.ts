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

  async findByUserId(
    userId: string,
    scenarioId?: string,
  ): Promise<SimulationResult[]> {
    const where: any = { userId };
    if (scenarioId) where.scenarioId = scenarioId;

    return this.repository.find({
      where,
      relations: ['scenario', 'chosenCharacter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<SimulationResult | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['scenario', 'chosenCharacter'],
    });
  }

  async getUserStats(userId: string): Promise<{
    scenariosAttempted: number;
    averageScore: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('r')
      .select('COUNT(DISTINCT r.scenarioId)', 'scenariosAttempted')
      .addSelect('COALESCE(AVG(r.totalScore), 0)', 'averageScore')
      .where('r.userId = :userId', { userId })
      .getRawOne();

    return {
      scenariosAttempted: parseInt(result?.scenariosAttempted ?? '0', 10) || 0,
      averageScore: parseFloat(result?.averageScore ?? '0') || 0,
    };
  }
}
