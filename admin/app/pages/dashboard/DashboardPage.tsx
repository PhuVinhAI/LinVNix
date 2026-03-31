import { useAuth } from '../../hooks/useAuth';

/**
 * Dashboard Page - Main admin page
 */
export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Chào mừng trở lại, {user?.fullName}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tổng người dùng
          </h3>
          <p className="mt-2 text-3xl font-bold text-card-foreground">
            1,234
          </p>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Khóa học
          </h3>
          <p className="mt-2 text-3xl font-bold text-card-foreground">
            12
          </p>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Từ vựng
          </h3>
          <p className="mt-2 text-3xl font-bold text-card-foreground">
            5,678
          </p>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Bài tập
          </h3>
          <p className="mt-2 text-3xl font-bold text-card-foreground">
            890
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-card-foreground">
          Thống kê sẽ được hiển thị ở đây
        </h2>
        <p className="mt-2 text-muted-foreground">
          Dashboard đang được phát triển...
        </p>
      </div>
    </div>
  );
}
