import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../common/enums';
import { User } from '../../users/domain/user.entity';
import { LearningProgress } from '../../progress/domain/learning-progress.entity';
import { PersonalVocabulary } from '../../personal-vocabularies/domain/personal-vocabulary.entity';
import { UserQuestionResult } from '../../exercises/domain/user-question-result.entity';
import { SimulationSession } from '../../simulations/domain/simulation-session.entity';
import { SimulationMessage } from '../../simulations/domain/simulation-message.entity';
import { Conversation } from '../../conversations/domain/conversation.entity';
import { ConversationMessage } from '../../conversations/domain/conversation-message.entity';
import {
  ListLearnersQueryDto,
  LearnerSortField,
} from '../dto/list-learners-query.dto';

interface LearnerRow {
  id: string;
  email: string;
  fullName: string;
  nativeLanguage: string;
  currentLevel: string;
  preferredDialect: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  role: string;
  notificationEnabled: boolean;
  notificationTime: string;
  provider: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedLessons: number;
  questionResults: number;
  personalVocabularyCount: number;
  simulationCount: number;
}

export interface PagedLearners {
  items: Array<
    Omit<LearnerRow, 'completedLessons' | 'questionResults' | 'personalVocabularyCount' | 'simulationCount'> & {
      summary: {
        completedLessons: number;
        questionResults: number;
        personalVocabularyCount: number;
        simulationCount: number;
      };
    }
  >;
  total: number;
  page: number;
  pageSize: number;
}

const SORT_COLUMN: Record<LearnerSortField, string> = {
  updatedAt: 'u.updated_at',
  createdAt: 'u.created_at',
  fullName: 'u.full_name',
  completedLessons: 'COALESCE(lp.n, 0)',
};

@Injectable()
export class AdminLearnersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(LearningProgress)
    private readonly progressRepository: Repository<LearningProgress>,
    @InjectRepository(UserQuestionResult)
    private readonly questionResultsRepository: Repository<UserQuestionResult>,
    @InjectRepository(PersonalVocabulary)
    private readonly personalVocabulariesRepository: Repository<PersonalVocabulary>,
    @InjectRepository(SimulationSession)
    private readonly simulationSessionsRepository: Repository<SimulationSession>,
    @InjectRepository(SimulationMessage)
    private readonly simulationMessagesRepository: Repository<SimulationMessage>,
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly conversationMessagesRepository: Repository<ConversationMessage>,
  ) {}

  async list(query: ListLearnersQueryDto): Promise<PagedLearners> {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? '20', 10) || 20));
    const sort: LearnerSortField = query.sort ?? 'updatedAt';
    const order: 'ASC' | 'DESC' = query.order ?? 'DESC';
    const status = query.status ?? 'all';

    const params: unknown[] = [];
    const push = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };

    const filters: string[] = [
      `u.role = ${push(Role.USER)}`,
      `u.deleted_at IS NULL`,
    ];

    if (query.search?.trim()) {
      const pattern = `%${query.search.trim()}%`;
      const p = push(pattern);
      filters.push(`(u.full_name ILIKE ${p} OR u.email ILIKE ${p})`);
    }
    if (query.level) {
      filters.push(`u.current_level = ${push(query.level)}`);
    }
    if (status === 'never_onboarded') {
      filters.push(`u.onboarding_completed = false`);
    } else if (status === 'inactive') {
      filters.push(
        `u.onboarding_completed = true AND COALESCE(lp.n, 0) + COALESCE(qr.n, 0) + COALESCE(pv.n, 0) + COALESCE(ss.n, 0) = 0`,
      );
    } else if (status === 'active') {
      filters.push(
        `COALESCE(lp.n, 0) + COALESCE(qr.n, 0) + COALESCE(pv.n, 0) + COALESCE(ss.n, 0) > 0`,
      );
    }

    const aggJoins = `
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS n
        FROM learning_progress
        WHERE unit_type = 'lesson' AND status = 'completed' AND deleted_at IS NULL
        GROUP BY user_id
      ) lp ON lp.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS n
        FROM user_question_results
        WHERE deleted_at IS NULL
        GROUP BY user_id
      ) qr ON qr.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS n
        FROM personal_vocabularies
        WHERE deleted_at IS NULL
        GROUP BY user_id
      ) pv ON pv.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS n
        FROM simulation_sessions
        WHERE deleted_at IS NULL
        GROUP BY user_id
      ) ss ON ss.user_id = u.id
    `;

    const whereSql = `WHERE ${filters.join(' AND ')}`;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM users u
      ${aggJoins}
      ${whereSql}
    `;

    const orderColumn = SORT_COLUMN[sort];
    const offset = (page - 1) * pageSize;
    const limitParam = push(pageSize);
    const offsetParam = push(offset);

    const itemsSql = `
      SELECT
        u.id,
        u.email,
        u.full_name AS "fullName",
        u.native_language AS "nativeLanguage",
        u.current_level AS "currentLevel",
        u.preferred_dialect AS "preferredDialect",
        u.email_verified AS "emailVerified",
        u.onboarding_completed AS "onboardingCompleted",
        u.role,
        u.notification_enabled AS "notificationEnabled",
        u.notification_time AS "notificationTime",
        u.provider,
        u.avatar_url AS "avatarUrl",
        u.created_at AS "createdAt",
        u.updated_at AS "updatedAt",
        COALESCE(lp.n, 0)::int AS "completedLessons",
        COALESCE(qr.n, 0)::int AS "questionResults",
        COALESCE(pv.n, 0)::int AS "personalVocabularyCount",
        COALESCE(ss.n, 0)::int AS "simulationCount"
      FROM users u
      ${aggJoins}
      ${whereSql}
      ORDER BY ${orderColumn} ${order}, u.id ${order}
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const manager = this.usersRepository.manager;
    const [countRows, rows] = await Promise.all([
      manager.query(countSql, params.slice(0, params.length - 2)) as Promise<
        { total: number }[]
      >,
      manager.query(itemsSql, params) as Promise<LearnerRow[]>,
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    const items = rows.map((row) => {
      const {
        completedLessons,
        questionResults,
        personalVocabularyCount,
        simulationCount,
        createdAt,
        updatedAt,
        ...rest
      } = row;
      return {
        ...rest,
        createdAt: new Date(createdAt).toISOString() as unknown as Date,
        updatedAt: new Date(updatedAt).toISOString() as unknown as Date,
        summary: {
          completedLessons: Number(completedLessons),
          questionResults: Number(questionResults),
          personalVocabularyCount: Number(personalVocabularyCount),
          simulationCount: Number(simulationCount),
        },
      };
    });

    return { items, total, page, pageSize };
  }

  async findConversation(userId: string, conversationId: string) {
    await this.ensureExists(userId);
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId, userId },
      relations: ['course', 'lesson'],
    });
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const messages = await this.conversationMessagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    const messageTokenSum = messages.reduce(
      (sum, message) => sum + (message.tokenCount ?? 0),
      0,
    );
    const totalTokens =
      conversation.totalTokens && conversation.totalTokens > 0
        ? conversation.totalTokens
        : messageTokenSum;

    return {
      conversation: {
        ...conversation,
        totalTokens,
        messageCount: messages.length,
      },
      messages,
    };
  }

  async findSimulation(userId: string, sessionId: string) {
    await this.ensureExists(userId);
    const session = await this.simulationSessionsRepository.findOne({
      where: { id: sessionId, userId },
      relations: ['scenario', 'chosenCharacter'],
    });
    if (!session) {
      throw new NotFoundException(`Simulation with ID ${sessionId} not found`);
    }

    const messages = await this.simulationMessagesRepository.find({
      where: { sessionId },
      relations: ['speakerCharacter'],
      order: { orderIndex: 'ASC' },
    });

    return {
      session: {
        ...session,
        messageCount: messages.length,
        totalMessages:
          session.totalMessages && session.totalMessages > 0
            ? session.totalMessages
            : messages.length,
      },
      messages,
    };
  }

  private async ensureExists(userId: string) {
    const count = await this.usersRepository.count({ where: { id: userId } });
    if (count === 0) {
      throw new NotFoundException(`Learner with ID ${userId} not found`);
    }
  }
}
