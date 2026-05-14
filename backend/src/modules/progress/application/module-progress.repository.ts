import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ModuleProgress } from '../domain/module-progress.entity';

@Injectable()
export class ModuleProgressRepository {
  constructor(
    @InjectRepository(ModuleProgress)
    private readonly repository: Repository<ModuleProgress>,
  ) {}

  async create(data: Partial<ModuleProgress>): Promise<ModuleProgress> {
    const progress = this.repository.create(data);
    return this.repository.save(progress);
  }

  async findByUserAndModule(
    userId: string,
    moduleId: string,
  ): Promise<ModuleProgress | null> {
    return this.repository.findOne({
      where: { userId, moduleId },
    });
  }

  async update(
    id: string,
    data: Partial<ModuleProgress>,
  ): Promise<ModuleProgress> {
    await this.repository.update(id, data);
    const progress = await this.repository.findOne({ where: { id } });
    if (!progress) {
      throw new Error('Module progress not found after update');
    }
    return progress;
  }

  async findCompletedByUserInModules(
    userId: string,
    moduleIds: string[],
  ): Promise<ModuleProgress[]> {
    return this.repository.find({
      where: {
        userId,
        moduleId: In(moduleIds),
        status: 'completed' as any,
      },
    });
  }
}
