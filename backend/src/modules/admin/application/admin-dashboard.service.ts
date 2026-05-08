import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { UserExerciseResult } from '../../exercises/domain/user-exercise-result.entity';
import { UserProgress } from '../../progress/domain/user-progress.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserExerciseResult)
    private readonly exerciseResultRepository: Repository<UserExerciseResult>,
    @InjectRepository(UserProgress)
    private readonly progressRepository: Repository<UserProgress>,
  ) {}

  async getDashboardStats() {
    // Total users
    const totalUsers = await this.userRepository.count();

    // Daily Active Users (DAU) - users who have activity today
    // Note: User entity doesn't have lastLoginAt field, so we'll count users who updated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dauCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.updatedAt >= :today', { today })
      .getCount();

    // Top courses by enrollment
    // UserProgress -> Lesson -> Unit -> Course
    const topCourses = await this.progressRepository
      .createQueryBuilder('progress')
      .innerJoin('progress.lesson', 'lesson')
      .innerJoin('lesson.unit', 'unit')
      .innerJoin('unit.course', 'course')
      .select('course.id', 'courseId')
      .addSelect('course.title', 'courseTitle')
      .addSelect('COUNT(DISTINCT progress.userId)', 'userCount')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .orderBy('"userCount"', 'DESC')
      .limit(10)
      .getRawMany();

    // Exercises with highest error rate
    const exerciseStats = await this.exerciseResultRepository
      .createQueryBuilder('result')
      .innerJoin('result.exercise', 'exercise')
      .select('exercise.id', 'exerciseId')
      .addSelect('exercise.question', 'exerciseQuestion')
      .addSelect('exercise.exerciseType', 'exerciseType')
      .addSelect('COUNT(*)', 'totalAttempts')
      .addSelect(
        'SUM(CASE WHEN result.isCorrect = false THEN 1 ELSE 0 END)',
        'incorrectCount',
      )
      .addSelect(
        'CAST(SUM(CASE WHEN result.isCorrect = false THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100',
        'errorRate',
      )
      .groupBy('exercise.id')
      .addGroupBy('exercise.question')
      .addGroupBy('exercise.exerciseType')
      .having('COUNT(*) >= 10') // Only include exercises with at least 10 attempts
      .orderBy('"errorRate"', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalUsers,
      dailyActiveUsers: dauCount,
      topCourses: topCourses.map((c) => ({
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        userCount: parseInt(c.userCount, 10),
      })),
      exercisesWithHighestErrors: exerciseStats.map((e) => ({
        exerciseId: e.exerciseId,
        question: e.exerciseQuestion,
        type: e.exerciseType,
        totalAttempts: parseInt(e.totalAttempts, 10),
        incorrectCount: parseInt(e.incorrectCount, 10),
        errorRate: parseFloat(e.errorRate).toFixed(2) + '%',
      })),
    };
  }
}
