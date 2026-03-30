import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserExerciseResult } from '../../domain/user-exercise-result.entity';

@Injectable()
export class UserExerciseResultsRepository {
  constructor(
    @InjectRepository(UserExerciseResult)
    private readonly repository: Repository<UserExerciseResult>,
  ) {}

  async create(
    data: Partial<UserExerciseResult>,
  ): Promise<UserExerciseResult> {
    const result = this.repository.create(data);
    return this.repository.save(result);
  }

  async findByUserId(userId: string): Promise<UserExerciseResult[]> {
    return this.repository.find({
      where: { userId },
      relations: ['exercise'],
      order: { attemptedAt: 'DESC' },
    });
  }

  async findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<UserExerciseResult[]> {
    return this.repository.find({
      where: { userId, exerciseId },
      order: { attemptedAt: 'DESC' },
    });
  }

  async getStatsByUser(userId: string): Promise<{
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  }> {
    const results = await this.repository.find({ where: { userId } });
    const total = results.length;
    const correct = results.filter((r) => r.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return { total, correct, incorrect, accuracy };
  }
}
