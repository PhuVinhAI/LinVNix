import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitsRepository } from './repositories/units.repository';
import { Unit } from '../domain/unit.entity';

@Injectable()
export class UnitsService {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  async create(data: Partial<Unit>): Promise<Unit> {
    return this.unitsRepository.create(data);
  }

  async findByCourseId(courseId: string): Promise<Unit[]> {
    return this.unitsRepository.findByCourseId(courseId);
  }

  async findById(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findById(id);
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async update(id: string, data: Partial<Unit>): Promise<Unit> {
    await this.findById(id);
    return this.unitsRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.unitsRepository.delete(id);
  }
}
