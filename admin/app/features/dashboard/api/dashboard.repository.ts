import { apiClient } from '../../../../lib/core/infrastructure/api/client'
import type {
  DashboardOverview,
  DashboardStats,
  IDashboardRepository,
} from '../types'

export class DashboardRepository implements IDashboardRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ data: DashboardStats }>('/admin/dashboard')
    return (response.data as any).data || response.data
  }

  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<{ data: DashboardOverview }>(
      '/admin/dashboard/overview',
    )
    return (response.data as any).data || response.data
  }
}

export const dashboardRepository = new DashboardRepository()
