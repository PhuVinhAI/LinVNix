import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import {
  fillDailySeries,
  startOfVnDay,
  vnDateRange,
} from './dashboard-time.util';
import {
  activeLearnersDaily,
  activeLearnersTotal,
  attemptsDaily,
  attemptsHeatmap,
  createdDaily,
  lessonsCompletedDaily,
  simulationsCompletedDaily,
} from './dashboard-activity.queries';

export const ACTIVITY_WINDOWS = [7, 30, 90] as const;
const DEFAULT_WINDOW = 30;

/**
 * Xu hướng hoạt động theo ngày (7/30/90 ngày, lịch Việt Nam) + bản đồ nhiệt
 * giờ học cao điểm (thứ × giờ) tính từ lượt trả lời câu hỏi.
 */
@Injectable()
export class AdminActivityService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getActivity(daysInput?: number) {
    const days = ACTIVITY_WINDOWS.includes(
      daysInput as (typeof ACTIVITY_WINDOWS)[number],
    )
      ? (daysInput as number)
      : DEFAULT_WINDOW;

    const now = new Date();
    const manager = this.usersRepository.manager;
    const since = startOfVnDay(now, days - 1);
    const range = vnDateRange(days, now);

    const [
      activeRows,
      attemptRows,
      lessonRows,
      newUserRows,
      simulationRows,
      conversationRows,
      heatmapRows,
      windowActiveLearners,
    ] = await Promise.all([
      activeLearnersDaily(manager, since),
      attemptsDaily(manager, since),
      lessonsCompletedDaily(manager, since),
      createdDaily(manager, 'users', since),
      simulationsCompletedDaily(manager, since),
      createdDaily(manager, 'conversations', since),
      attemptsHeatmap(manager, since),
      activeLearnersTotal(manager, since),
    ]);

    const active = fillDailySeries(range, activeRows);
    const attempts = fillDailySeries(
      range,
      attemptRows.map((r) => ({ day: r.day, count: r.total })),
    );
    const correctByDay = new Map(
      attemptRows.map((r) => [String(r.day), Number(r.correct)]),
    );
    const lessons = fillDailySeries(range, lessonRows);
    const newUsers = fillDailySeries(range, newUserRows);
    const simulations = fillDailySeries(range, simulationRows);
    const conversations = fillDailySeries(range, conversationRows);

    const series = range.map((date, i) => {
      const attemptCount = attempts[i].value;
      const correct = correctByDay.get(date) ?? 0;
      return {
        date,
        activeLearners: active[i].value,
        newUsers: newUsers[i].value,
        questionAttempts: attemptCount,
        lessonsCompleted: lessons[i].value,
        simulationsCompleted: simulations[i].value,
        aiConversations: conversations[i].value,
        accuracy:
          attemptCount === 0
            ? null
            : Number((correct / attemptCount).toFixed(4)),
      };
    });

    const sum = (points: { value: number }[]) =>
      points.reduce((acc, p) => acc + p.value, 0);

    return {
      generatedAt: now.toISOString(),
      days,
      series,
      heatmap: heatmapRows.map((cell) => ({
        weekday: Number(cell.weekday),
        hour: Number(cell.hour),
        count: Number(cell.count),
      })),
      totals: {
        activeLearners: windowActiveLearners,
        newUsers: sum(newUsers),
        questionAttempts: sum(attempts),
        lessonsCompleted: sum(lessons),
      },
    };
  }
}
