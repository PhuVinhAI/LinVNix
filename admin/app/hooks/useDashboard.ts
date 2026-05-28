import { useDashboardStore } from '../../lib/state/stores/dashboard.store';

export function useDashboard() {
  const { stats, isLoading, error, fetchStats, clearError } = useDashboardStore();
  return { stats, isLoading, error, fetchStats, clearError };
}
