import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DashboardService } from '../../features/dashboard/application/dashboard.service';
import { dashboardRepository } from '../../features/dashboard/infrastructure/DashboardRepository';
import type { DashboardStats } from '../../features/dashboard/domain/dashboard.types';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  clearError: () => void;
}

const dashboardService = new DashboardService(dashboardRepository);

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      stats: null,
      isLoading: false,
      error: null,

      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await dashboardService.getStats();
          set({ stats, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Không thể tải dữ liệu dashboard', isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'DashboardStore' }
  )
);
