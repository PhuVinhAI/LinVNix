import type { IDashboardRepository } from './IDashboardRepository';
import type { DashboardStats } from '../domain/dashboard.types';

export class DashboardService {
  constructor(private repository: IDashboardRepository) {}

  async getStats(): Promise<DashboardStats> {
    return this.repository.getStats();
  }
}
