import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from '../domain/user-progress.entity';

@Injectable()
export class ProgressRepository {
  constructor(
    @InjectRepository(UserProgress)
    private readonly repository: Repository<UserProgress>,
  ) {}

  async create(data: Partial<UserProgress>): Promise<UserProgress> {
    const progress = this.repository.create(data);
    return this.repository.save(progress);
  }

  async findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<UserProgress | null> {
    return this.repository.findOne({
      where: { userId, lessonId },
      relations: ['lesson'],
    });
  }

  async findByUserId(userId: string): Promise<UserProgress[]> {
    return this.repository.find({
      where: { userId },
      relations: ['lesson', 'lesson.unit', 'lesson.unit.course'],
      order: { lastAccessedAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<UserProgress>): Promise<UserProgress> {
    await this.repository.update(id, data);
    const progress = await this.repository.findOne({ where: { id } });
    if (!progress) {
      throw new Error('Progress not found after update');
    }
    return progress;
  }
}
