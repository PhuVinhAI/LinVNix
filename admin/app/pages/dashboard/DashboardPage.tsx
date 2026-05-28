import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading, error, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Chào mừng trở lại, {user?.fullName}!</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng người dùng" value={stats?.totalUsers} loading={isLoading} />
        <StatCard label="DAU" value={stats?.dailyActiveUsers} loading={isLoading} />
        <StatCard label="Top khóa học" value={stats?.topCourses.length} loading={isLoading} />
        <StatCard label="Bài tập lỗi cao" value={stats?.exercisesWithHighestErrors.length} loading={isLoading} />
      </div>

      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Top khóa học</h2>
            <ul className="space-y-2">
              {stats.topCourses.map((c) => (
                <li key={c.courseId} className="flex justify-between text-sm">
                  <span className="text-card-foreground">{c.courseTitle}</span>
                  <span className="text-muted-foreground">{c.userCount} học viên</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Bài tập lỗi cao nhất</h2>
            <ul className="space-y-2">
              {stats.exercisesWithHighestErrors.map((e) => (
                <li key={e.exerciseId} className="flex justify-between text-sm">
                  <span className="text-card-foreground truncate max-w-[70%]">{e.question}</span>
                  <span className="text-destructive font-medium">{e.errorRate}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <p className="mt-2 text-3xl font-bold text-card-foreground">
        {loading ? <span className="animate-pulse text-muted-foreground">—</span> : (value ?? '—')}
      </p>
    </div>
  );
}
