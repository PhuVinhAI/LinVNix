import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Course } from '../../courses/domain/course.entity';
import { Lesson } from '../../courses/domain/lesson.entity';
import { Question } from '../../exercises/domain/question.entity';
import { DailyStreak } from '../../daily-goals/domain/daily-streak.entity';
import { Vocabulary } from '../../vocabularies/domain/vocabulary.entity';
import { SimulationSession } from '../../simulations/domain/simulation-session.entity';
import { Conversation } from '../../conversations/domain/conversation.entity';
import {
  fillDailySeries,
  startOfVnDay,
  toPulseMetric,
  vnDateRange,
  vnDayKey,
} from './dashboard-time.util';
import {
  activeLearnersDaily,
  aiSessionsDaily,
  attemptsDaily,
  createdDaily,
  lessonsCompletedDaily,
} from './dashboard-activity.queries';

const PULSE_WINDOW_DAYS = 14;

/**
 * Nhịp đập hôm nay: mỗi chỉ số gồm hôm nay / hôm qua / sparkline 14 ngày,
 * tính theo ngày lịch Việt Nam. "Học viên hoạt động" đếm distinct user có
 * hành vi học thật (làm câu hỏi, mở bài học, mô phỏng, hội thoại AI) — thay
 * cho DAU cũ đếm theo updated_at của bảng users.
 */
@Injectable()
export class AdminPulseService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(DailyStreak)
    private readonly streaksRepository: Repository<DailyStreak>,
    @InjectRepository(Vocabulary)
    private readonly vocabulariesRepository: Repository<Vocabulary>,
    @InjectRepository(SimulationSession)
    private readonly simulationsRepository: Repository<SimulationSession>,
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
  ) {}

  async getPulse() {
    const now = new Date();
    const manager = this.usersRepository.manager;
    const since = startOfVnDay(now, PULSE_WINDOW_DAYS - 1);
    const range = vnDateRange(PULSE_WINDOW_DAYS, now);
    const today = vnDayKey(now);
    const yesterday = range[range.length - 2];

    const [
      activeLearnerRows,
      attemptRows,
      lessonsCompletedRows,
      newUserRows,
      aiSessionRows,
      goalsAchievedToday,
      streaksAtRisk,
      totals,
    ] = await Promise.all([
      activeLearnersDaily(manager, since),
      attemptsDaily(manager, since),
      lessonsCompletedDaily(manager, since),
      createdDaily(manager, 'users', since),
      aiSessionsDaily(manager, since),
      this.streaksRepository.count({ where: { lastGoalMetDate: today } }),
      this.streaksRepository
        .createQueryBuilder('streak')
        .where('streak.current_streak > 0')
        .andWhere('streak.last_goal_met_date = :yesterday', { yesterday })
        .andWhere('streak.deleted_at IS NULL')
        .getCount(),
      this.systemTotals(),
    ]);

    const attemptsSeries = fillDailySeries(
      range,
      attemptRows.map((r) => ({ day: r.day, count: r.total })),
    );
    const correctByDay = new Map(
      attemptRows.map((r) => [String(r.day), Number(r.correct)]),
    );
    const accuracyOn = (day: string): number | null => {
      const total = attemptsSeries.find((p) => p.date === day)?.value ?? 0;
      if (total === 0) return null;
      const correct = correctByDay.get(day) ?? 0;
      return Number((correct / total).toFixed(4));
    };

    return {
      generatedAt: now.toISOString(),
      activeLearners: toPulseMetric(fillDailySeries(range, activeLearnerRows)),
      questionAttempts: {
        ...toPulseMetric(attemptsSeries),
        accuracyToday: accuracyOn(today),
        accuracyYesterday: accuracyOn(yesterday),
      },
      lessonsCompleted: toPulseMetric(
        fillDailySeries(range, lessonsCompletedRows),
      ),
      newUsers: toPulseMetric(fillDailySeries(range, newUserRows)),
      aiSessions: toPulseMetric(fillDailySeries(range, aiSessionRows)),
      goals: {
        achievedToday: goalsAchievedToday,
        streaksAtRisk,
      },
      totals,
    };
  }

  private async systemTotals() {
    const [
      learners,
      courses,
      publishedCourses,
      lessons,
      questions,
      vocabularies,
      simulations,
      conversations,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.coursesRepository.count(),
      this.coursesRepository.count({ where: { isPublished: true } }),
      this.lessonsRepository.count(),
      this.questionsRepository.count(),
      this.vocabulariesRepository.count(),
      this.simulationsRepository.count(),
      this.conversationsRepository.count(),
    ]);

    return {
      learners,
      courses,
      publishedCourses,
      lessons,
      questions,
      vocabularies,
      simulations,
      conversations,
    };
  }
}
