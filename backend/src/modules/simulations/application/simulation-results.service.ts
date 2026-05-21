import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SimulationResultsRepository } from './repositories/simulation-results.repository';

export interface ResultListItem {
  id: string;
  totalScore: number;
  endReason: string;
  createdAt: Date;
  scenarioTitle: string;
  chosenCharacterName: string;
}

export interface ResultDetail {
  id: string;
  userId: string;
  sessionId: string;
  scenarioId: string;
  chosenCharacterId: string;
  totalScore: number;
  criteriaScores: Array<{
    name: string;
    score: number;
    maxScore: number;
    comment: string;
  }>;
  endReason: string;
  aiSummary: string;
  totalMessages: number;
  createdAt: Date;
  updatedAt: Date;
  scenario: { id: string; title: string };
  chosenCharacter: { id: string; name: string };
}

export interface SimulationStats {
  scenariosAttempted: number;
  averageScore: number;
}

@Injectable()
export class SimulationResultsService {
  constructor(
    private readonly resultsRepository: SimulationResultsRepository,
  ) {}

  async listResults(
    userId: string,
    filter: { scenarioId?: string },
  ): Promise<ResultListItem[]> {
    const results = await this.resultsRepository.findByUserId(
      userId,
      filter.scenarioId,
    );

    return results.map((r) => ({
      id: r.id,
      totalScore: r.totalScore,
      endReason: r.endReason,
      createdAt: r.createdAt,
      scenarioTitle: (r.scenario as any)?.title ?? '',
      chosenCharacterName: (r.chosenCharacter as any)?.name ?? '',
    }));
  }

  async getResultDetail(
    userId: string,
    resultId: string,
  ): Promise<ResultDetail> {
    const result = await this.resultsRepository.findById(resultId);

    if (!result) {
      throw new NotFoundException(
        `Simulation result with ID ${resultId} not found`,
      );
    }

    if (result.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this simulation result',
      );
    }

    return result as ResultDetail;
  }

  async getStats(userId: string): Promise<SimulationStats> {
    return this.resultsRepository.getUserStats(userId);
  }
}
