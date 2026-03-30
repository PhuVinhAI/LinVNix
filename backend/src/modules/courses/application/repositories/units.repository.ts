import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../domain/unit.entity';

@Injectable()
export class UnitsRepository {
  constructor(
    @InjectRepository(Unit)
    private readonly repository: Repository<Unit>,
  ) {}

  async create(data: Partial<Unit>): Promise<Unit> {
    const unit = this.repository.create(data);
    return this.repository.save(unit);
  }

  async findByCourseId(courseId: string): Promise<Unit[]> {
    return this.repository.find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
      relations: ['lessons'],
    });
  }

  async findById(id: string): Promise<Unit | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['lessons', 'course'],
    });
  }

  async update(id: string, data: Partial<Unit>): Promise<Unit> {
    await this.repository.update(id, data);
    const unit = await this.findById(id);
    if (!unit) {
      throw new Error('Unit not found after update');
    }
    return unit;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
