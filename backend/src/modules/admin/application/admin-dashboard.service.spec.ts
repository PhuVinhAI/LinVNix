import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  UserStatsPort,
  CourseStatsPort,
  ExerciseStatsPort,
  USER_STATS_PORT,
  COURSE_STATS_PORT,
  EXERCISE_STATS_PORT,
  CourseStatsResult,
  ExerciseStatsResult,
} from './ports/dashboard-stats.ports';

class InMemoryUserStatsPort implements UserStatsPort {
  private totalUsers = 0;
  private dau = 0;

  setTotalUsers(count: number) {
    this.totalUsers = count;
  }

  setDAU(count: number) {
    this.dau = count;
  }

  getTotalUsers(): Promise<number> {
    return Promise.resolve(this.totalUsers);
  }

  getDAU(): Promise<number> {
    return Promise.resolve(this.dau);
  }
}

class InMemoryCourseStatsPort implements CourseStatsPort {
  private courses: CourseStatsResult[] = [];

  setTopCourses(courses: CourseStatsResult[]) {
    this.courses = courses;
  }

  getTopCoursesByEnrollment(limit: number): Promise<CourseStatsResult[]> {
    return Promise.resolve(this.courses.slice(0, limit));
  }
}

class InMemoryExerciseStatsPort implements ExerciseStatsPort {
  private exercises: ExerciseStatsResult[] = [];

  setExercises(exercises: ExerciseStatsResult[]) {
    this.exercises = exercises;
  }

  getExercisesWithHighestErrorRate(
    _minAttempts: number,
    limit: number,
  ): Promise<ExerciseStatsResult[]> {
    return Promise.resolve(this.exercises.slice(0, limit));
  }
}

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let userStatsPort: InMemoryUserStatsPort;
  let courseStatsPort: InMemoryCourseStatsPort;
  let exerciseStatsPort: InMemoryExerciseStatsPort;

  beforeEach(async () => {
    userStatsPort = new InMemoryUserStatsPort();
    courseStatsPort = new InMemoryCourseStatsPort();
    exerciseStatsPort = new InMemoryExerciseStatsPort();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        { provide: USER_STATS_PORT, useValue: userStatsPort },
        { provide: COURSE_STATS_PORT, useValue: courseStatsPort },
        { provide: EXERCISE_STATS_PORT, useValue: exerciseStatsPort },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  it('returns total users and DAU from UserStatsPort', async () => {
    userStatsPort.setTotalUsers(150);
    userStatsPort.setDAU(45);

    const result = await service.getDashboardStats();

    expect(result.totalUsers).toBe(150);
    expect(result.dailyActiveUsers).toBe(45);
  });

  it('returns top courses from CourseStatsPort', async () => {
    courseStatsPort.setTopCourses([
      { courseId: 'c1', courseTitle: 'Vietnamese A1', userCount: 80 },
      { courseId: 'c2', courseTitle: 'Vietnamese A2', userCount: 50 },
    ]);

    const result = await service.getDashboardStats();

    expect(result.topCourses).toHaveLength(2);
    expect(result.topCourses[0].courseId).toBe('c1');
    expect(result.topCourses[0].userCount).toBe(80);
  });

  it('returns exercises with highest error rate from ExerciseStatsPort', async () => {
    exerciseStatsPort.setExercises([
      {
        exerciseId: 'e1',
        question: 'Translate: Hello',
        type: 'TRANSLATION',
        totalAttempts: 120,
        incorrectCount: 85,
        errorRate: '70.83%',
      },
    ]);

    const result = await service.getDashboardStats();

    expect(result.exercisesWithHighestErrors).toHaveLength(1);
    expect(result.exercisesWithHighestErrors[0].exerciseId).toBe('e1');
    expect(result.exercisesWithHighestErrors[0].errorRate).toBe('70.83%');
  });

  it('returns empty arrays when no data exists', async () => {
    const result = await service.getDashboardStats();

    expect(result.totalUsers).toBe(0);
    expect(result.dailyActiveUsers).toBe(0);
    expect(result.topCourses).toHaveLength(0);
    expect(result.exercisesWithHighestErrors).toHaveLength(0);
  });

  it('aggregates all stats from three ports in parallel', async () => {
    userStatsPort.setTotalUsers(100);
    userStatsPort.setDAU(30);
    courseStatsPort.setTopCourses([
      { courseId: 'c1', courseTitle: 'Course 1', userCount: 10 },
    ]);
    exerciseStatsPort.setExercises([
      {
        exerciseId: 'e1',
        question: 'Q1',
        type: 'MULTIPLE_CHOICE',
        totalAttempts: 20,
        incorrectCount: 15,
        errorRate: '75.00%',
      },
    ]);

    const result = await service.getDashboardStats();

    expect(result.totalUsers).toBe(100);
    expect(result.dailyActiveUsers).toBe(30);
    expect(result.topCourses).toHaveLength(1);
    expect(result.exercisesWithHighestErrors).toHaveLength(1);
  });
});
