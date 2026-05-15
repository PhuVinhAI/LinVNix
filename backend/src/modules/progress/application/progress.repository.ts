import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserProgress } from '../domain/user-progress.entity';
import { ProgressStatus } from '../../../common/enums';

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
      relations: ['lesson', 'lesson.module', 'lesson.module.course'],
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

  async getTopCoursesByEnrollment(
    limit: number,
  ): Promise<{ courseId: string; courseTitle: string; userCount: number }[]> {
    const results: {
      courseId: string;
      courseTitle: string;
      userCount: string;
    }[] = await this.repository
      .createQueryBuilder('progress')
      .innerJoin('progress.lesson', 'lesson')
      .innerJoin('lesson.module', 'module')
      .innerJoin('module.course', 'course')
      .select('course.id', 'courseId')
      .addSelect('course.title', 'courseTitle')
      .addSelect('COUNT(DISTINCT progress.userId)', 'userCount')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .orderBy('"userCount"', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((c) => ({
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      userCount: parseInt(c.userCount, 10),
    }));
  }

  async countCompletedByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('progress')
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.status = :status', {
        status: ProgressStatus.COMPLETED,
      })
      .andWhere('progress.completedAt >= :start', { start })
      .andWhere('progress.completedAt < :end', { end })
      .getCount();
    return result;
  }

  async findCompletedByUserInLessons(
    userId: string,
    lessonIds: string[],
  ): Promise<UserProgress[]> {
    return this.repository.find({
      where: {
        userId,
        lessonId: In(lessonIds),
        status: ProgressStatus.COMPLETED,
      },
    });
  }
}
