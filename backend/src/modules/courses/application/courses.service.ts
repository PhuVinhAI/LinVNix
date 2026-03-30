import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './repositories/courses.repository';
import { Course } from '../domain/course.entity';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async create(data: Partial<Course>): Promise<Course> {
    return this.coursesRepository.create(data);
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.findAll();
  }

  async findById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, data: Partial<Course>): Promise<Course> {
    await this.findById(id);
    return this.coursesRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.coursesRepository.delete(id);
  }
}
