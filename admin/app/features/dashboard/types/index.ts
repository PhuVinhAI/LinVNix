/**
 * Dashboard types — khớp chính xác response của 4 endpoint:
 * `GET /admin/dashboard/pulse`      — nhịp đập hôm nay
 * `GET /admin/dashboard/attention`  — việc cần xử lý về nội dung
 * `GET /admin/dashboard/activity`   — xu hướng theo ngày + heatmap giờ học
 * `GET /admin/dashboard/learners`   — góc nhìn học viên & khóa học
 * Backend trả camelCase, đã được bóc khỏi envelope `{ data: T }` ở repository.
 * Mọi mốc "ngày" đều là ngày lịch Việt Nam (YYYY-MM-DD).
 */

export type UserLevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type RoleCode = 'USER' | 'ADMIN'

// ─── Pulse ───────────────────────────────────────────────────────────────────

export interface PulsePoint {
  date: string
  value: number
}

/** Một chỉ số nhịp đập: hôm nay / hôm qua / sparkline 14 ngày. */
export interface PulseMetric {
  today: number
  yesterday: number
  series: PulsePoint[]
}

export interface PulseAttemptsMetric extends PulseMetric {
  /** Tỷ lệ đúng 0–1, null khi chưa có lượt làm nào trong ngày. */
  accuracyToday: number | null
  accuracyYesterday: number | null
}

export interface PulseGoals {
  /** Số học viên đã đạt đủ Mục tiêu ngày hôm nay. */
  achievedToday: number
  /** Số học viên giữ chuỗi hôm qua nhưng hôm nay chưa học — sắp mất chuỗi. */
  streaksAtRisk: number
}

export interface SystemTotals {
  learners: number
  courses: number
  publishedCourses: number
  lessons: number
  questions: number
  vocabularies: number
  simulations: number
  conversations: number
}

export interface DashboardPulse {
  generatedAt: string
  activeLearners: PulseMetric
  questionAttempts: PulseAttemptsMetric
  lessonsCompleted: PulseMetric
  newUsers: PulseMetric
  aiSessions: PulseMetric
  goals: PulseGoals
  totals: SystemTotals
}

// ─── Attention (Cần xử lý) ───────────────────────────────────────────────────

export interface AttentionGroup<T> {
  /** Tổng số mục gặp vấn đề (items chỉ là các mục đầu). */
  count: number
  items: T[]
}

export interface HighErrorQuestionItem {
  questionId: string
  exerciseId: string
  question: string | null
  type: string
  totalAttempts: number
  incorrectCount: number
  /** Tỷ lệ sai 0–1. */
  errorRate: number
}

export interface EmptyLessonItem {
  lessonId: string
  title: string
  lessonType: string
  moduleId: string
  moduleTitle: string
  courseTitle: string
  createdAt: string
}

export interface ExerciseWithoutQuestionsItem {
  exerciseId: string
  title: string
  scopeTitle: string | null
  lessonId: string | null
  createdAt: string
}

export interface VocabularyMissingAudioItem {
  vocabularyId: string
  word: string
  translation: string
  lessonId: string
  lessonTitle: string
}

export interface DraftCourseItem {
  courseId: string
  title: string
  level: UserLevelCode
  lessonCount: number
  updatedAt: string
}

export interface FailedGenerationItem {
  exerciseId: string
  title: string
  ownerUserId: string | null
  ownerName: string | null
  ownerEmail: string | null
  updatedAt: string
}

export interface DashboardAttention {
  generatedAt: string
  totalIssues: number
  highErrorQuestions: AttentionGroup<HighErrorQuestionItem>
  emptyLessons: AttentionGroup<EmptyLessonItem>
  exercisesWithoutQuestions: AttentionGroup<ExerciseWithoutQuestionsItem>
  vocabulariesMissingAudio: AttentionGroup<VocabularyMissingAudioItem>
  draftCourses: AttentionGroup<DraftCourseItem>
  failedGenerations: AttentionGroup<FailedGenerationItem>
}

// ─── Activity (Xu hướng) ─────────────────────────────────────────────────────

export type ActivityWindow = 7 | 30 | 90

export interface ActivityPoint {
  date: string
  activeLearners: number
  newUsers: number
  questionAttempts: number
  lessonsCompleted: number
  simulationsCompleted: number
  aiConversations: number
  /** Tỷ lệ đúng 0–1 trong ngày, null khi không có lượt làm. */
  accuracy: number | null
}

/** Ô bản đồ nhiệt; weekday theo Postgres DOW: 0 = Chủ nhật … 6 = Thứ bảy. */
export interface HeatmapCell {
  weekday: number
  hour: number
  count: number
}

export interface ActivityTotals {
  activeLearners: number
  newUsers: number
  questionAttempts: number
  lessonsCompleted: number
}

export interface DashboardActivity {
  generatedAt: string
  days: number
  series: ActivityPoint[]
  heatmap: HeatmapCell[]
  totals: ActivityTotals
}

// ─── Learners (Học viên & khóa học) ──────────────────────────────────────────

export interface LearnerFunnel {
  registered: number
  onboarded: number
  startedLearning: number
  completedALesson: number
  activeLast7Days: number
}

export interface LevelBucket {
  level: UserLevelCode
  count: number
}

export interface StreakLeaderRow {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  currentLevel: UserLevelCode
  currentStreak: number
  longestStreak: number
  lastGoalMetDate: string | null
}

export interface StreakAtRiskRow {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  currentLevel: UserLevelCode
  currentStreak: number
  longestStreak: number
}

export interface RecentLearnerRow {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  currentLevel: UserLevelCode
  role: RoleCode
  onboardingCompleted: boolean
  createdAt: string
}

export interface TopCourseRow {
  courseId: string
  title: string
  level: UserLevelCode
  isPublished: boolean
  learnerCount: number
  completedCount: number
  /** Tỷ lệ hoàn thành bài học trung bình 0–1, null khi chưa đủ dữ liệu. */
  avgCompletion: number | null
}

export interface DashboardLearners {
  generatedAt: string
  today: string
  funnel: LearnerFunnel
  usersByLevel: LevelBucket[]
  topStreaks: StreakLeaderRow[]
  streaksAtRisk: AttentionGroup<StreakAtRiskRow>
  recentUsers: RecentLearnerRow[]
  topCourses: TopCourseRow[]
}

// ─── Repository contract ─────────────────────────────────────────────────────

export interface IDashboardRepository {
  getPulse(): Promise<DashboardPulse>
  getAttention(): Promise<DashboardAttention>
  getActivity(days: ActivityWindow): Promise<DashboardActivity>
  getLearners(): Promise<DashboardLearners>
}
