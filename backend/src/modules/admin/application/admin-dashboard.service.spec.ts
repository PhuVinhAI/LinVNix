import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  UserStatsPort,
  CourseStatsPort,
  QuestionStatsPort,
  USER_STATS_PORT,
  COURSE_STATS_PORT,
  EXERCISE_STATS_PORT,
  CourseStatsResult,
  QuestionStatsResult,
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

class InMemoryQuestionStatsPort implements QuestionStatsPort {
  private questions: QuestionStatsResult[] = [];

  setQuestions(questions: QuestionStatsResult[]) {
    this.questions = questions;
  }

  getQuestionsWithHighestErrorRate(
    _minAttempts: number,
    limit: number,
  ): Promise<QuestionStatsResult[]> {
    return Promise.resolve(this.questions.slice(0, limit));
  }
}

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let userStatsPort: InMemoryUserStatsPort;
  let courseStatsPort: InMemoryCourseStatsPort;
  let exerciseStatsPort: InMemoryQuestionStatsPort;

  beforeEach(async () => {
    userStatsPort = new InMemoryUserStatsPort();
    courseStatsPort = new InMemoryCourseStatsPort();
    exerciseStatsPort = new InMemoryQuestionStatsPort();

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

  it('returns exercises with highest error rate from QuestionStatsPort', async () => {
    exerciseStatsPort.setQuestions([
      {
        questionId: 'e1',
        question: 'Translate: Hello',
        type: 'TRANSLATION',
        totalAttempts: 120,
        incorrectCount: 85,
        errorRate: '70.83%',
      },
    ]);

    const result = await service.getDashboardStats();

    expect(result.exercisesWithHighestErrors).toHaveLength(1);
    expect(result.exercisesWithHighestErrors[0].questionId).toBe('e1');
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
    exerciseStatsPort.setQuestions([
      {
        questionId: 'e1',
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
