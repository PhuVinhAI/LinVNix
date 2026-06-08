import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThanOrEqual, ObjectLiteral } from 'typeorm';
import {
  SimulationSessionStatus,
  UserLevel,
  Role,
} from '../../../common/enums';
import { User } from '../../users/domain/user.entity';
import { Course } from '../../courses/domain/course.entity';
import { Lesson } from '../../courses/domain/lesson.entity';
import { Question } from '../../exercises/domain/question.entity';
import { QuestionAttempt } from '../../exercises/domain/question-attempt.entity';
import { UserQuestionResult } from '../../exercises/domain/user-question-result.entity';
import { LearningProgress } from '../../progress/domain/learning-progress.entity';
import { DailyStreak } from '../../daily-goals/domain/daily-streak.entity';
import { PersonalVocabulary } from '../../personal-vocabularies/domain/personal-vocabulary.entity';
import { Bookmark } from '../../vocabularies/domain/bookmark.entity';
import { SimulationSession } from '../../simulations/domain/simulation-session.entity';
import { Conversation } from '../../conversations/domain/conversation.entity';
import { ConversationMessage } from '../../conversations/domain/conversation-message.entity';
import { AdminDashboardService } from './admin-dashboard.service';

const ALL_LEVELS: UserLevel[] = [
  UserLevel.A1,
  UserLevel.A2,
  UserLevel.B1,
  UserLevel.B2,
  UserLevel.C1,
  UserLevel.C2,
];

const ALL_SIMULATION_STATUSES: SimulationSessionStatus[] = [
  SimulationSessionStatus.ACTIVE,
  SimulationSessionStatus.PAUSED,
  SimulationSessionStatus.COMPLETED,
];

type CountRow = { key: string; count: string | number };

function startOfDayUtc(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date): string {
  return startOfDayUtc(date).toISOString().slice(0, 10);
}

function buildDateRange(days: number): string[] {
  const today = startOfDayUtc(new Date());
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    result.push(toIsoDate(d));
  }
  return result;
}

@Injectable()
export class AdminOverviewService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Question)
    private readonly exercisesRepository: Repository<Question>,
    @InjectRepository(QuestionAttempt)
    private readonly questionAttemptsRepository: Repository<QuestionAttempt>,
    @InjectRepository(UserQuestionResult)
    private readonly questionResultsRepository: Repository<UserQuestionResult>,
    @InjectRepository(LearningProgress)
    private readonly progressRepository: Repository<LearningProgress>,
    @InjectRepository(DailyStreak)
    private readonly dailyStreakRepository: Repository<DailyStreak>,
    @InjectRepository(PersonalVocabulary)
    private readonly personalVocabRepository: Repository<PersonalVocabulary>,
    @InjectRepository(Bookmark)
    private readonly bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(SimulationSession)
    private readonly simulationSessionsRepository: Repository<SimulationSession>,
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly conversationMessagesRepository: Repository<ConversationMessage>,
    @Inject(AdminDashboardService)
    private readonly dashboardService: AdminDashboardService,
  ) {}

  async getOverview() {
    const now = new Date();
    const startOfToday = startOfDayUtc(now);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setUTCDate(startOfToday.getUTCDate() - 6);
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setUTCDate(startOfToday.getUTCDate() - 29);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      legacyStats,
      newToday,
      newThisWeek,
      newThisMonth,
      totalCourses,
      publishedCourses,
      totalLessons,
      totalQuestions,
      totalQuestionAttempts,
      correctAttemptsRecent,
      attemptsRecent,
      totalSimulations,
      completedSimulations,
      totalConversations,
      totalAiMessages,
      totalPersonalVocab,
      totalBookmarks,
      streakAggregate,
      activeStreakCount,
      simulationScoreAggregate,
      usersByLevelRaw,
      usersByRoleRaw,
      coursesByLevelRaw,
      exercisesByTypeRaw,
      simulationsByStatusRaw,
      registrations30,
      attempts30,
      simulationsCompleted30,
      topStreaks,
      recentUsers,
    ] = await Promise.all([
      this.dashboardService.getDashboardStats(),
      this.usersRepository.count({
        where: { createdAt: MoreThanOrEqual(startOfToday) },
      }),
      this.usersRepository.count({
        where: { createdAt: MoreThanOrEqual(startOfWeek) },
      }),
      this.usersRepository.count({
        where: { createdAt: MoreThanOrEqual(startOfMonth) },
      }),
      this.coursesRepository.count(),
      this.coursesRepository.count({ where: { isPublished: true } }),
      this.lessonsRepository.count(),
      this.exercisesRepository.count(),
      this.questionAttemptsRepository.count(),
      this.questionAttemptsRepository.count({
        where: {
          attemptedAt: MoreThanOrEqual(sevenDaysAgo),
          isCorrect: true,
        },
      }),
      this.questionAttemptsRepository.count({
        where: { attemptedAt: MoreThanOrEqual(sevenDaysAgo) },
      }),
      this.simulationSessionsRepository.count(),
      this.simulationSessionsRepository.count({
        where: { status: SimulationSessionStatus.COMPLETED },
      }),
      this.conversationsRepository.count(),
      this.conversationMessagesRepository.count(),
      this.personalVocabRepository.count(),
      this.bookmarksRepository.count(),
      this.dailyStreakRepository
        .createQueryBuilder('streak')
        .select('AVG(streak.current_streak)', 'avgCurrent')
        .addSelect('MAX(streak.longest_streak)', 'maxLongest')
        .where('streak.deleted_at IS NULL')
        .getRawOne<{ avgCurrent: string | null; maxLongest: string | null }>(),
      this.dailyStreakRepository
        .createQueryBuilder('streak')
        .where('streak.current_streak > 0')
        .andWhere('streak.deleted_at IS NULL')
        .getCount(),
      this.simulationSessionsRepository
        .createQueryBuilder('session')
        .select('AVG(session.total_score)', 'avgScore')
        .where('session.total_score IS NOT NULL')
        .andWhere('session.status = :status', {
          status: SimulationSessionStatus.COMPLETED,
        })
        .andWhere('session.updated_at >= :since', { since: thirtyDaysAgo })
        .getRawOne<{ avgScore: string | null }>(),
      this.groupCount(this.usersRepository, 'user', 'current_level'),
      this.groupCount(this.usersRepository, 'user', 'role'),
      this.groupCount(this.coursesRepository, 'course', 'level'),
      this.groupCount(this.exercisesRepository, 'question', 'question_type'),
      this.groupCount(this.simulationSessionsRepository, 'session', 'status'),
      this.dailySeries(
        this.usersRepository,
        'user',
        'created_at',
        thirtyDaysAgo,
      ),
      this.dailySeries(
        this.questionAttemptsRepository,
        'attempt',
        'attempted_at',
        thirtyDaysAgo,
      ),
      this.dailyCompletedSimulationsSeries(thirtyDaysAgo),
      this.dailyStreakRepository
        .createQueryBuilder('streak')
        .innerJoin('streak.user', 'user')
        .where('streak.current_streak > 0')
        .andWhere('streak.deleted_at IS NULL')
        .andWhere('user.deleted_at IS NULL')
        .orderBy('streak.current_streak', 'DESC')
        .addOrderBy('streak.longest_streak', 'DESC')
        .select([
          'streak.userId AS "userId"',
          'streak.currentStreak AS "currentStreak"',
          'streak.longestStreak AS "longestStreak"',
          'user.fullName AS "fullName"',
          'user.email AS "email"',
          'user.avatarUrl AS "avatarUrl"',
          'user.currentLevel AS "currentLevel"',
        ])
        .limit(5)
        .getRawMany<{
          userId: string;
          currentStreak: number;
          longestStreak: number;
          fullName: string;
          email: string;
          avatarUrl: string | null;
          currentLevel: UserLevel;
        }>(),
      this.usersRepository.find({
        where: { deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
        take: 5,
        select: [
          'id',
          'fullName',
          'email',
          'avatarUrl',
          'currentLevel',
          'role',
          'createdAt',
        ],
      }),
    ]);

    const accuracyRecent =
      attemptsRecent === 0 ? 0 : correctAttemptsRecent / attemptsRecent;

    const dateRange = buildDateRange(30);
    const registrationsMap = mapFromSeries(registrations30);
    const attemptsMap = mapFromSeries(attempts30);
    const simulationsCompletedMap = mapFromSeries(simulationsCompleted30);

    const activity30Days = dateRange.map((date) => ({
      date,
      registrations: registrationsMap.get(date) ?? 0,
      questionAttempts: attemptsMap.get(date) ?? 0,
      simulationsCompleted: simulationsCompletedMap.get(date) ?? 0,
    }));

    return {
      kpis: {
        totalUsers: legacyStats.totalUsers,
        dailyActiveUsers: legacyStats.dailyActiveUsers,
        newUsersToday: newToday,
        newUsersThisWeek: newThisWeek,
        newUsersThisMonth: newThisMonth,
        totalCourses,
        publishedCourses,
        totalLessons,
        totalQuestions,
        totalQuestionAttempts,
        accuracyLast7Days: Number(accuracyRecent.toFixed(4)),
        totalSimulations,
        completedSimulations,
        totalConversations,
        totalAiMessages,
        totalPersonalVocabularies: totalPersonalVocab,
        totalBookmarks,
        averageCurrentStreak: Number(
          (parseFloat(streakAggregate?.avgCurrent ?? '0') || 0).toFixed(2),
        ),
        longestStreakEver: Number(streakAggregate?.maxLongest ?? 0),
        activeStreakUsers: activeStreakCount,
        averageSimulationScoreLast30Days: Number(
          (parseFloat(simulationScoreAggregate?.avgScore ?? '0') || 0).toFixed(
            2,
          ),
        ),
      },
      activity30Days,
      distributions: {
        usersByLevel: ALL_LEVELS.map((level) => ({
          level,
          count: countFor(usersByLevelRaw, level),
        })),
        usersByRole: Object.values(Role).map((role) => ({
          role,
          count: countFor(usersByRoleRaw, role),
        })),
        coursesByLevel: ALL_LEVELS.map((level) => ({
          level,
          count: countFor(coursesByLevelRaw, level),
        })),
        exercisesByType: exercisesByTypeRaw.map((row) => ({
          type: row.key,
          count: Number(row.count),
        })),
        simulationsByStatus: ALL_SIMULATION_STATUSES.map((status) => ({
          status,
          count: countFor(simulationsByStatusRaw, status),
        })),
      },
      topCourses: legacyStats.topCourses,
      exercisesWithHighestErrors: legacyStats.exercisesWithHighestErrors,
      topStreaks: topStreaks.map((row) => ({
        userId: row.userId,
        fullName: row.fullName,
        email: row.email,
        avatarUrl: row.avatarUrl,
        currentLevel: row.currentLevel,
        currentStreak: Number(row.currentStreak),
        longestStreak: Number(row.longestStreak),
      })),
      recentUsers: recentUsers.map((user) => ({
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        currentLevel: user.currentLevel,
        role: user.role,
        createdAt: user.createdAt,
      })),
    };
  }

  private async groupCount<T extends ObjectLiteral>(
    repository: Repository<T>,
    alias: string,
    columnDbName: string,
  ): Promise<CountRow[]> {
    return repository
      .createQueryBuilder(alias)
      .select(`${alias}.${columnDbName}`, 'key')
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}.deleted_at IS NULL`)
      .groupBy(`${alias}.${columnDbName}`)
      .getRawMany<CountRow>();
  }

  private async dailySeries<T extends ObjectLiteral>(
    repository: Repository<T>,
    alias: string,
    columnDbName: string,
    since: Date,
  ): Promise<CountRow[]> {
    return repository
      .createQueryBuilder(alias)
      .select(`DATE(${alias}.${columnDbName})::text`, 'key')
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}.${columnDbName} >= :since`, { since })
      .andWhere(`${alias}.deleted_at IS NULL`)
      .groupBy('key')
      .orderBy('key', 'ASC')
      .getRawMany<CountRow>();
  }

  private async dailyCompletedSimulationsSeries(
    since: Date,
  ): Promise<CountRow[]> {
    return this.simulationSessionsRepository
      .createQueryBuilder('session')
      .select('DATE(session.updated_at)::text', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('session.updated_at >= :since', { since })
      .andWhere('session.status = :status', {
        status: SimulationSessionStatus.COMPLETED,
      })
      .andWhere('session.deleted_at IS NULL')
      .groupBy('key')
      .orderBy('key', 'ASC')
      .getRawMany<CountRow>();
  }
}

function countFor(rows: CountRow[], key: string): number {
  const match = rows.find((row) => String(row.key) === key);
  return match ? Number(match.count) : 0;
}

function mapFromSeries(rows: CountRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(String(row.key), Number(row.count));
  }
  return map;
}
