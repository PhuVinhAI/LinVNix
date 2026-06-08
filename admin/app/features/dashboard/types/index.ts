/**
 * Dashboard types — khớp chính xác response của `GET /admin/dashboard` và
 * `GET /admin/dashboard/overview`. Backend trả camelCase, đã được bóc khỏi
 * envelope `{ data: T }` ở repository.
 */

export interface TopCourse {
  courseId: string
  courseTitle: string
  userCount: number
}

export interface HighErrorExercise {
  questionId: string
  question: string
  type: string
  totalAttempts: number
  incorrectCount: number
  errorRate: string
}

export interface DashboardStats {
  totalUsers: number
  dailyActiveUsers: number
  topCourses: TopCourse[]
  exercisesWithHighestErrors: HighErrorQuestion[]
}

export type UserLevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type SimulationStatusCode = 'ACTIVE' | 'PAUSED' | 'COMPLETED'

export type RoleCode = 'USER' | 'ADMIN'

export interface OverviewKpis {
  totalUsers: number
  dailyActiveUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  totalCourses: number
  publishedCourses: number
  totalLessons: number
  totalQuestions: number
  totalQuestionAttempts: number
  accuracyLast7Days: number
  totalSimulations: number
  completedSimulations: number
  totalConversations: number
  totalAiMessages: number
  totalPersonalVocabularies: number
  totalBookmarks: number
  averageCurrentStreak: number
  longestStreakEver: number
  activeStreakUsers: number
  averageSimulationScoreLast30Days: number
}

export interface OverviewActivityPoint {
  date: string
  registrations: number
  questionAttempts: number
  simulationsCompleted: number
}

export interface LevelBucket {
  level: UserLevelCode
  count: number
}

export interface RoleBucket {
  role: RoleCode
  count: number
}

export interface QuestionTypeBucket {
  type: string
  count: number
}

export interface SimulationStatusBucket {
  status: SimulationStatusCode
  count: number
}

export interface OverviewDistributions {
  usersByLevel: LevelBucket[]
  usersByRole: RoleBucket[]
  coursesByLevel: LevelBucket[]
  exercisesByType: QuestionTypeBucket[]
  simulationsByStatus: SimulationStatusBucket[]
}

export interface TopStreakRow {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  currentLevel: UserLevelCode
  currentStreak: number
  longestStreak: number
}

export interface RecentUserRow {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  currentLevel: UserLevelCode
  role: RoleCode
  createdAt: string
}

export interface DashboardOverview {
  kpis: OverviewKpis
  activity30Days: OverviewActivityPoint[]
  distributions: OverviewDistributions
  topCourses: TopCourse[]
  exercisesWithHighestErrors: HighErrorQuestion[]
  topStreaks: TopStreakRow[]
  recentUsers: RecentUserRow[]
}

export interface IDashboardRepository {
  getDashboardStats(): Promise<DashboardStats>
  getOverview(): Promise<DashboardOverview>
}
