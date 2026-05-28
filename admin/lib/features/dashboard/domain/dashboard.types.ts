export interface TopCourse {
  courseId: string;
  courseTitle: string;
  userCount: number;
}

export interface ErrorExercise {
  exerciseId: string;
  question: string;
  type: string;
  totalAttempts: number;
  incorrectCount: number;
  errorRate: string;
}

export interface DashboardStats {
  totalUsers: number;
  dailyActiveUsers: number;
  topCourses: TopCourse[];
  exercisesWithHighestErrors: ErrorExercise[];
}
