import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DashboardRepository } from '../api/dashboard.repository'
import { apiClient } from '../../../../lib/core/infrastructure/api/client'
import type {
  DashboardAttention,
  DashboardActivity,
  DashboardLearners,
  DashboardPulse,
} from '../types'

// Mock api client - không gọi mạng thật
vi.mock('../../../../lib/core/infrastructure/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const pulseMetric = {
  today: 12,
  yesterday: 9,
  series: [
    { date: '2026-06-10', value: 9 },
    { date: '2026-06-11', value: 12 },
  ],
}

const mockPulse: DashboardPulse = {
  generatedAt: '2026-06-11T03:00:00.000Z',
  activeLearners: pulseMetric,
  questionAttempts: {
    ...pulseMetric,
    accuracyToday: 0.82,
    accuracyYesterday: 0.75,
  },
  lessonsCompleted: pulseMetric,
  newUsers: pulseMetric,
  aiSessions: pulseMetric,
  goals: { achievedToday: 5, streaksAtRisk: 3 },
  totals: {
    learners: 150,
    courses: 6,
    publishedCourses: 4,
    lessons: 120,
    questions: 480,
    vocabularies: 900,
    simulations: 75,
    conversations: 210,
  },
}

const mockAttention: DashboardAttention = {
  generatedAt: '2026-06-11T03:00:00.000Z',
  totalIssues: 2,
  highErrorQuestions: {
    count: 1,
    items: [
      {
        questionId: 'q1',
        exerciseId: 'e1',
        question: 'Dịch: Xin chào',
        type: 'translation',
        totalAttempts: 120,
        incorrectCount: 85,
        errorRate: 0.7083,
      },
    ],
  },
  emptyLessons: {
    count: 1,
    items: [
      {
        lessonId: 'l1',
        title: 'Chào hỏi cơ bản',
        lessonType: 'vocabulary',
        moduleId: 'm1',
        moduleTitle: 'Chào hỏi & Giới thiệu',
        courseTitle: 'Tiếng Việt A1',
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    ],
  },
  exercisesWithoutQuestions: { count: 0, items: [] },
  vocabulariesMissingAudio: { count: 0, items: [] },
  draftCourses: { count: 0, items: [] },
  failedGenerations: { count: 0, items: [] },
}

const mockActivity: DashboardActivity = {
  generatedAt: '2026-06-11T03:00:00.000Z',
  days: 7,
  series: [
    {
      date: '2026-06-11',
      activeLearners: 12,
      newUsers: 2,
      questionAttempts: 80,
      lessonsCompleted: 6,
      simulationsCompleted: 3,
      aiConversations: 5,
      accuracy: 0.8,
    },
  ],
  heatmap: [{ weekday: 1, hour: 20, count: 14 }],
  totals: {
    activeLearners: 40,
    newUsers: 9,
    questionAttempts: 420,
    lessonsCompleted: 30,
  },
}

const mockLearners: DashboardLearners = {
  generatedAt: '2026-06-11T03:00:00.000Z',
  today: '2026-06-11',
  funnel: {
    registered: 150,
    onboarded: 120,
    startedLearning: 95,
    completedALesson: 70,
    activeLast7Days: 45,
  },
  usersByLevel: [{ level: 'A1', count: 80 }],
  topStreaks: [
    {
      userId: 'u1',
      fullName: 'Nguyễn Văn A',
      email: 'a@example.com',
      avatarUrl: null,
      currentLevel: 'A2',
      currentStreak: 21,
      longestStreak: 30,
      lastGoalMetDate: '2026-06-11',
    },
  ],
  streaksAtRisk: {
    count: 1,
    items: [
      {
        userId: 'u2',
        fullName: 'Trần Thị B',
        email: 'b@example.com',
        avatarUrl: null,
        currentLevel: 'B1',
        currentStreak: 9,
        longestStreak: 12,
      },
    ],
  },
  recentUsers: [
    {
      userId: 'u3',
      fullName: 'Lê Văn C',
      email: 'c@example.com',
      avatarUrl: null,
      currentLevel: 'A1',
      role: 'USER',
      onboardingCompleted: false,
      createdAt: '2026-06-10T08:00:00.000Z',
    },
  ],
  topCourses: [
    {
      courseId: 'c1',
      title: 'Tiếng Việt cho người mới',
      level: 'A1',
      isPublished: true,
      learnerCount: 80,
      completedCount: 12,
      avgCompletion: 0.45,
    },
  ],
}

describe('DashboardRepository', () => {
  let repository: DashboardRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new DashboardRepository()
  })

  describe('getPulse', () => {
    it('gọi GET /admin/dashboard/pulse và bóc envelope { data }', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: mockPulse } } as any)

      const result = await repository.getPulse()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard/pulse')
      expect(result).toEqual(mockPulse)
    })

    it('chấp nhận body không bọc envelope', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPulse } as any)

      const result = await repository.getPulse()

      expect(result).toEqual(mockPulse)
    })

    it('lan truyền lỗi từ api client', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      await expect(repository.getPulse()).rejects.toThrow('Network error')
    })
  })

  describe('getAttention', () => {
    it('gọi GET /admin/dashboard/attention và bóc envelope { data }', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockAttention },
      } as any)

      const result = await repository.getAttention()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard/attention')
      expect(result).toEqual(mockAttention)
      expect(result.totalIssues).toBe(2)
    })
  })

  describe('getActivity', () => {
    it('truyền tham số days và bóc envelope { data }', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockActivity },
      } as any)

      const result = await repository.getActivity(7)

      expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard/activity', {
        params: { days: 7 },
      })
      expect(result).toEqual(mockActivity)
    })
  })

  describe('getLearners', () => {
    it('gọi GET /admin/dashboard/learners và bóc envelope { data }', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockLearners },
      } as any)

      const result = await repository.getLearners()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard/learners')
      expect(result).toEqual(mockLearners)
    })

    it('lan truyền lỗi từ api client', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Forbidden'))

      await expect(repository.getLearners()).rejects.toThrow('Forbidden')
    })
  })
})
