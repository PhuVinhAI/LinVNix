import { useQuery } from '@tanstack/react-query'
import { dashboardRepository } from '../features/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
}

/**
 * useDashboard Hook - Lấy thống kê dashboard cơ bản qua React Query.
 * Trả về state chuẩn của React Query: data, isLoading, isError, error, refetch...
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardRepository.getDashboardStats(),
  })
}

/**
 * useDashboardOverview Hook - Lấy thống kê tổng quan toàn diện cho Dashboard.
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardRepository.getOverview(),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  })
}
