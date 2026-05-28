import { apiClient } from '../../../core/infrastructure/api/client';
import type { IDashboardRepository } from '../application/IDashboardRepository';
import type { DashboardStats } from '../domain/dashboard.types';

export class DashboardRepository implements IDashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard');
    return response.data;
  }
}

export const dashboardRepository = new DashboardRepository();
