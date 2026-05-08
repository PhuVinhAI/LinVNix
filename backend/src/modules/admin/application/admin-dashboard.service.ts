import { Injectable, Inject } from '@nestjs/common';
import type {
  UserStatsPort,
  CourseStatsPort,
  ExerciseStatsPort,
} from './ports/dashboard-stats.ports';
import {
  USER_STATS_PORT,
  COURSE_STATS_PORT,
  EXERCISE_STATS_PORT,
} from './ports/dashboard-stats.ports';

@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject(USER_STATS_PORT)
    private readonly userStatsPort: UserStatsPort,
    @Inject(COURSE_STATS_PORT)
    private readonly courseStatsPort: CourseStatsPort,
    @Inject(EXERCISE_STATS_PORT)
    private readonly exerciseStatsPort: ExerciseStatsPort,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      dailyActiveUsers,
      topCourses,
      exercisesWithHighestErrors,
    ] = await Promise.all([
      this.userStatsPort.getTotalUsers(),
      this.userStatsPort.getDAU(),
      this.courseStatsPort.getTopCoursesByEnrollment(10),
      this.exerciseStatsPort.getExercisesWithHighestErrorRate(10, 10),
    ]);

    return {
      totalUsers,
      dailyActiveUsers,
      topCourses,
      exercisesWithHighestErrors,
    };
  }
}
