import type { DashboardStats } from '../domain/dashboard.types';

export interface IDashboardRepository {
  getStats(): Promise<DashboardStats>;
}
