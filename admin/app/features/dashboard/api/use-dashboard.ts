import { useQuery } from '@tanstack/react-query'
import { dashboardRepository } from './dashboard.repository'
import type { ActivityWindow } from '../types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  pulse: () => [...dashboardKeys.all, 'pulse'] as const,
  attention: () => [...dashboardKeys.all, 'attention'] as const,
  activity: (days: ActivityWindow) =>
    [...dashboardKeys.all, 'activity', days] as const,
  learners: () => [...dashboardKeys.all, 'learners'] as const,
}

const COMMON_OPTIONS = {
  refetchOnWindowFocus: false,
  staleTime: 60_000,
} as const

/** Nhịp đập hôm nay — KPI so với hôm qua + sparkline 14 ngày. */
export function useDashboardPulse() {
  return useQuery({
    queryKey: dashboardKeys.pulse(),
    queryFn: () => dashboardRepository.getPulse(),
    ...COMMON_OPTIONS,
  })
}

/** Việc cần xử lý về nội dung (câu hỏi sai nhiều, bài học trống...). */
export function useDashboardAttention() {
  return useQuery({
    queryKey: dashboardKeys.attention(),
    queryFn: () => dashboardRepository.getAttention(),
    ...COMMON_OPTIONS,
  })
}

/** Xu hướng hoạt động theo cửa sổ 7/30/90 ngày + heatmap giờ học. */
export function useDashboardActivity(days: ActivityWindow) {
  return useQuery({
    queryKey: dashboardKeys.activity(days),
    queryFn: () => dashboardRepository.getActivity(days),
    ...COMMON_OPTIONS,
  })
}

/** Góc nhìn học viên & khóa học. */
export function useDashboardLearners() {
  return useQuery({
    queryKey: dashboardKeys.learners(),
    queryFn: () => dashboardRepository.getLearners(),
    ...COMMON_OPTIONS,
  })
}
