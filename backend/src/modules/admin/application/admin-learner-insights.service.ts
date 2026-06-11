import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserLevel } from '../../../common/enums';
import { User } from '../../users/domain/user.entity';
import { DailyStreak } from '../../daily-goals/domain/daily-streak.entity';
import { LearningProgress } from '../../progress/domain/learning-progress.entity';
import { startOfVnDay, vnDateRange, vnDayKey } from './dashboard-time.util';
import { activeLearnersTotal } from './dashboard-activity.queries';

const ALL_LEVELS: UserLevel[] = [
  UserLevel.A1,
  UserLevel.A2,
  UserLevel.B1,
  UserLevel.B2,
  UserLevel.C1,
  UserLevel.C2,
];

const LIST_LIMIT = 8;
const TOP_STREAKS_LIMIT = 5;
const TOP_COURSES_LIMIT = 6;

/**
 * Góc nhìn học viên & khóa học: phễu hành trình (đăng ký → onboarding →
 * bắt đầu học → hoàn thành bài → còn hoạt động 7 ngày), học viên sắp mất
 * chuỗi hôm nay, bảng xếp hạng chuỗi, học viên mới và mức độ hoàn thành
 * thực tế của từng khóa học.
 */
@Injectable()
export class AdminLearnerInsightsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(DailyStreak)
    private readonly streaksRepository: Repository<DailyStreak>,
    @InjectRepository(LearningProgress)
    private readonly progressRepository: Repository<LearningProgress>,
  ) {}

  async getLearnerInsights() {
    const now = new Date();
    const yesterday = vnDateRange(2, now)[0];

    const [
      funnel,
      usersByLevel,
      topStreaks,
      streaksAtRisk,
      recentUsers,
      topCourses,
    ] = await Promise.all([
      this.funnel(now),
      this.usersByLevel(),
      this.topStreaks(),
      this.streaksAtRisk(yesterday),
      this.recentUsers(),
      this.topCourses(),
    ]);

    return {
      generatedAt: now.toISOString(),
      today: vnDayKey(now),
      funnel,
      usersByLevel,
      topStreaks,
      streaksAtRisk,
      recentUsers,
      topCourses,
    };
  }

  private async funnel(now: Date) {
    const manager = this.usersRepository.manager;
    const [registered, onboarded, started, completedALesson, activeLast7Days] =
      await Promise.all([
        this.usersRepository.count(),
        this.usersRepository.count({ where: { onboardingCompleted: true } }),
        this.progressRepository
          .createQueryBuilder('p')
          .select('COUNT(DISTINCT p.user_id)', 'count')
          .where('p.deleted_at IS NULL')
          .getRawOne<{ count: string }>(),
        this.progressRepository
          .createQueryBuilder('p')
          .select('COUNT(DISTINCT p.user_id)', 'count')
          .where('p.deleted_at IS NULL')
          .andWhere("p.unit_type = 'lesson'")
          .andWhere("p.status = 'completed'")
          .getRawOne<{ count: string }>(),
        activeLearnersTotal(manager, startOfVnDay(now, 6)),
      ]);

    return {
      registered,
      onboarded,
      startedLearning: Number(started?.count ?? 0),
      completedALesson: Number(completedALesson?.count ?? 0),
      activeLast7Days,
    };
  }

  private async usersByLevel() {
    const rows = await this.usersRepository
      .createQueryBuilder('u')
      .select('u.current_level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('u.deleted_at IS NULL')
      .groupBy('u.current_level')
      .getRawMany<{ level: UserLevel; count: string }>();

    const byLevel = new Map(
      rows.map((r) => [String(r.level), Number(r.count)]),
    );
    return ALL_LEVELS.map((level) => ({
      level,
      count: byLevel.get(level) ?? 0,
    }));
  }

  private async topStreaks() {
    const rows = await this.streaksRepository
      .createQueryBuilder('streak')
      .innerJoin('streak.user', 'user')
      .where('streak.current_streak > 0')
      .andWhere('streak.deleted_at IS NULL')
      .andWhere('user.deleted_at IS NULL')
      .orderBy('streak.current_streak', 'DESC')
      .addOrderBy('streak.longest_streak', 'DESC')
      .select([
        'streak.user_id AS "userId"',
        'streak.current_streak AS "currentStreak"',
        'streak.longest_streak AS "longestStreak"',
        'streak.last_goal_met_date AS "lastGoalMetDate"',
        'user.full_name AS "fullName"',
        'user.email AS "email"',
        'user.avatar_url AS "avatarUrl"',
        'user.current_level AS "currentLevel"',
      ])
      .limit(TOP_STREAKS_LIMIT)
      .getRawMany<{
        userId: string;
        currentStreak: number;
        longestStreak: number;
        lastGoalMetDate: string | null;
        fullName: string;
        email: string;
        avatarUrl: string | null;
        currentLevel: UserLevel;
      }>();

    return rows.map((row) => ({
      userId: row.userId,
      fullName: row.fullName,
      email: row.email,
      avatarUrl: row.avatarUrl,
      currentLevel: row.currentLevel,
      currentStreak: Number(row.currentStreak),
      longestStreak: Number(row.longestStreak),
      lastGoalMetDate: row.lastGoalMetDate,
    }));
  }

  /**
   * Học viên đạt mục tiêu hôm qua nhưng hôm nay chưa — chuỗi của họ sẽ đứt
   * vào cuối ngày nếu không học. Danh sách để admin chủ động chăm sóc.
   */
  private async streaksAtRisk(yesterday: string) {
    const rows: {
      userId: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
      currentLevel: UserLevel;
      currentStreak: number;
      longestStreak: number;
      total: number;
    }[] = await this.usersRepository.query(
      `
      SELECT s.user_id AS "userId",
             u.full_name AS "fullName",
             u.email AS "email",
             u.avatar_url AS "avatarUrl",
             u.current_level AS "currentLevel",
             s.current_streak AS "currentStreak",
             s.longest_streak AS "longestStreak",
             COUNT(*) OVER()::int AS total
      FROM daily_streaks s
      JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
        AND s.current_streak > 0
        AND s.last_goal_met_date = $1
      ORDER BY s.current_streak DESC
      LIMIT ${LIST_LIMIT}
      `,
      [yesterday],
    );

    return {
      count: rows.length > 0 ? Number(rows[0].total) : 0,
      items: rows.map(({ total: _total, ...item }) => ({
        ...item,
        currentStreak: Number(item.currentStreak),
        longestStreak: Number(item.longestStreak),
      })),
    };
  }

  private async recentUsers() {
    const users = await this.usersRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: LIST_LIMIT,
      select: [
        'id',
        'fullName',
        'email',
        'avatarUrl',
        'currentLevel',
        'role',
        'onboardingCompleted',
        'createdAt',
      ],
    });

    return users.map((user) => ({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      currentLevel: user.currentLevel,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Khóa học theo số học viên ghi danh thật (có bản ghi tiến trình khóa),
   * kèm tỷ lệ hoàn thành trung bình và số học viên đã học xong.
   */
  private async topCourses() {
    const rows: {
      courseId: string;
      title: string;
      level: string;
      isPublished: boolean;
      learnerCount: number;
      completedCount: number;
      avgCompletion: number | null;
    }[] = await this.usersRepository.query(
      `
      SELECT c.id AS "courseId",
             c.title AS "title",
             c.level AS "level",
             c.is_published AS "isPublished",
             COUNT(*)::int AS "learnerCount",
             SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END)::int AS "completedCount",
             AVG(
               CASE
                 WHEN p.total_lessons_count > 0
                 THEN LEAST(COALESCE(p.completed_lessons_count, 0)::float / p.total_lessons_count::float, 1)
               END
             )::float AS "avgCompletion"
      FROM learning_progress p
      JOIN courses c ON c.id = p.course_id AND c.deleted_at IS NULL
      WHERE p.deleted_at IS NULL AND p.unit_type = 'course'
      GROUP BY c.id, c.title, c.level, c.is_published
      ORDER BY "learnerCount" DESC
      LIMIT ${TOP_COURSES_LIMIT}
      `,
    );

    return rows.map((row) => ({
      courseId: row.courseId,
      title: row.title,
      level: row.level,
      isPublished: row.isPublished,
      learnerCount: Number(row.learnerCount),
      completedCount: Number(row.completedCount),
      avgCompletion:
        row.avgCompletion == null
          ? null
          : Number(Number(row.avgCompletion).toFixed(4)),
    }));
  }
}
