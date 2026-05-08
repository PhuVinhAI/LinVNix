export interface UserStatsResult {
  totalUsers: number;
  dailyActiveUsers: number;
}

export interface CourseStatsResult {
  courseId: string;
  courseTitle: string;
  userCount: number;
}

export interface ExerciseStatsResult {
  exerciseId: string;
  question: string;
  type: string;
  totalAttempts: number;
  incorrectCount: number;
  errorRate: string;
}

export interface UserStatsPort {
  getTotalUsers(): Promise<number>;
  getDAU(): Promise<number>;
}

export interface CourseStatsPort {
  getTopCoursesByEnrollment(limit: number): Promise<CourseStatsResult[]>;
}

export interface ExerciseStatsPort {
  getExercisesWithHighestErrorRate(
    minAttempts: number,
    limit: number,
  ): Promise<ExerciseStatsResult[]>;
}

export const USER_STATS_PORT = Symbol('USER_STATS_PORT');
export const COURSE_STATS_PORT = Symbol('COURSE_STATS_PORT');
export const EXERCISE_STATS_PORT = Symbol('EXERCISE_STATS_PORT');
