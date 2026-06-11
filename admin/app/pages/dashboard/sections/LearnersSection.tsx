import type { ReactNode } from 'react'
import { Link, generatePath } from 'react-router'
import {
  ChevronRight,
  Filter,
  Flame,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react'
import { ErrorState } from '../../../components/admin/ErrorState'
import { ROUTES } from '../../../../lib/shared/constants'
import {
  useDashboardLearners,
  type DashboardLearners,
  type LearnerFunnel,
} from '../../../features/dashboard'
import {
  AMBER,
  Avatar,
  EmptyState,
  formatNumber,
  formatPercent,
  formatRelativeDate,
  GREEN,
  INDIGO,
  LevelBadge,
  ListSkeleton,
  ROSE,
  SectionCard,
} from './dashboard-ui'

function learnerPath(userId: string): string {
  return generatePath(ROUTES.LEARNER_DETAIL, { learnerId: userId })
}

/** Góc nhìn học viên: phễu hành trình, chuỗi ngày và học viên mới. */
export function LearnersSection() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardLearners()

  if (isError) {
    return (
      <ErrorState
        title="Không tải được dữ liệu học viên"
        message={error instanceof Error ? error.message : 'Lỗi không xác định'}
        onRetry={() => refetch()}
        retrying={isFetching}
        size="sm"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <FunnelCard funnel={data?.funnel} loading={isLoading} />
      <StreaksCard data={data} loading={isLoading} />
      <RecentUsersCard data={data} loading={isLoading} />
      <LevelsCard data={data} loading={isLoading} />
    </div>
  )
}

// ─── Phễu hành trình ─────────────────────────────────────────────────────────

const FUNNEL_STEPS: {
  key: keyof LearnerFunnel
  label: string
  description: string
}[] = [
  { key: 'registered', label: 'Đã đăng ký', description: 'Tổng tài khoản học viên' },
  { key: 'onboarded', label: 'Hoàn tất onboarding', description: 'Đã đi hết phần thiết lập ban đầu' },
  { key: 'startedLearning', label: 'Bắt đầu học', description: 'Có ít nhất một bản ghi tiến trình' },
  { key: 'completedALesson', label: 'Hoàn thành 1 bài học', description: 'Đã học xong trọn vẹn ít nhất một bài' },
  { key: 'activeLast7Days', label: 'Hoạt động 7 ngày qua', description: 'Còn quay lại học trong tuần gần nhất' },
]

/**
 * Mỗi bậc hiển thị số tuyệt đối + % so với tổng đăng ký; bậc tụt sâu nhất
 * chính là điểm cần can thiệp sản phẩm.
 */
function FunnelCard({
  funnel,
  loading,
}: {
  funnel?: LearnerFunnel
  loading: boolean
}) {
  return (
    <SectionCard
      title="Phễu hành trình học viên"
      hint="Từ đăng ký tới còn học đều — phát hiện điểm rơi rụng"
      icon={Filter}
      iconTint={INDIGO}
    >
      {loading || !funnel ? (
        <ListSkeleton rows={5} />
      ) : funnel.registered === 0 ? (
        <EmptyState icon={Users} message="Chưa có học viên nào đăng ký" />
      ) : (
        <div className="space-y-2.5">
          {FUNNEL_STEPS.map((step, index) => {
            const value = funnel[step.key]
            const share = funnel.registered === 0 ? 0 : value / funnel.registered
            const prev = index === 0 ? null : funnel[FUNNEL_STEPS[index - 1].key]
            const dropped = prev != null ? prev - value : 0
            return (
              <div key={step.key} className="rounded-lg border-2 border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{step.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold tabular-nums tracking-tight">
                      {formatNumber(value)}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground tabular-nums">
                      {formatPercent(share)}
                      {dropped > 0 && (
                        <span className="text-rose-500"> · rơi {formatNumber(dropped)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(share * 100, value > 0 ? 2 : 0)}%`,
                      backgroundColor: INDIGO,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

// ─── Chuỗi ngày: bảng vàng + sắp mất chuỗi ───────────────────────────────────

function StreaksCard({
  data,
  loading,
}: {
  data?: DashboardLearners
  loading: boolean
}) {
  const atRisk = data?.streaksAtRisk
  return (
    <SectionCard
      title="Chuỗi mục tiêu"
      hint="Bảng vàng chuỗi dài nhất và học viên cần được nhắc hôm nay"
      icon={Flame}
      iconTint={AMBER}
    >
      {loading || !data ? (
        <ListSkeleton rows={5} />
      ) : (
        <div className="space-y-5">
          {atRisk && atRisk.count > 0 && (
            <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Sắp mất chuỗi hôm nay · {formatNumber(atRisk.count)} học viên
              </p>
              <div className="mt-2 space-y-1.5">
                {atRisk.items.slice(0, 4).map((row) => (
                  <UserRow
                    key={row.userId}
                    userId={row.userId}
                    fullName={row.fullName}
                    email={row.email}
                    avatarUrl={row.avatarUrl}
                    trailing={
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums whitespace-nowrap">
                        <Flame className="h-3.5 w-3.5" />
                        {formatNumber(row.currentStreak)} ngày
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Bảng vàng chuỗi đang chạy
            </p>
            {data.topStreaks.length === 0 ? (
              <div className="mt-2">
                <EmptyState icon={Trophy} message="Chưa có học viên nào giữ chuỗi" />
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                {data.topStreaks.map((row, index) => (
                  <UserRow
                    key={row.userId}
                    userId={row.userId}
                    fullName={row.fullName}
                    email={row.email}
                    avatarUrl={row.avatarUrl}
                    leading={
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                          index === 0
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </span>
                    }
                    trailing={
                      <span className="text-right">
                        <span className="block text-sm font-bold tabular-nums">
                          {formatNumber(row.currentStreak)} ngày
                        </span>
                        <span className="block text-[10px] text-muted-foreground tabular-nums">
                          kỷ lục {formatNumber(row.longestStreak)}
                        </span>
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Học viên mới ────────────────────────────────────────────────────────────

function RecentUsersCard({
  data,
  loading,
}: {
  data?: DashboardLearners
  loading: boolean
}) {
  return (
    <SectionCard
      title="Học viên mới"
      hint="Đăng ký gần nhất — theo dõi họ có vượt qua onboarding không"
      icon={UserPlus}
      iconTint={GREEN}
    >
      {loading || !data ? (
        <ListSkeleton rows={5} />
      ) : data.recentUsers.length === 0 ? (
        <EmptyState icon={UserPlus} message="Chưa có học viên nào đăng ký" />
      ) : (
        <div className="space-y-1.5">
          {data.recentUsers.map((row) => (
            <UserRow
              key={row.userId}
              userId={row.userId}
              fullName={row.fullName}
              email={row.email}
              avatarUrl={row.avatarUrl}
              level={row.currentLevel}
              trailing={
                <span className="text-right shrink-0">
                  <span
                    className={`block text-[10px] font-bold ${
                      row.onboardingCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {row.onboardingCompleted ? 'Đã onboarding' : 'Chưa onboarding'}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {formatRelativeDate(row.createdAt)}
                  </span>
                </span>
              }
            />
          ))}
        </div>
      )}
    </SectionCard>
  )
}

// ─── Phân bố trình độ ────────────────────────────────────────────────────────

function LevelsCard({
  data,
  loading,
}: {
  data?: DashboardLearners
  loading: boolean
}) {
  const total = (data?.usersByLevel ?? []).reduce((sum, b) => sum + b.count, 0)
  return (
    <SectionCard
      title="Trình độ học viên"
      hint="Phân bố A1 → C2 — định hướng ưu tiên soạn học liệu"
      icon={Users}
      iconTint={ROSE}
    >
      {loading || !data ? (
        <ListSkeleton rows={6} />
      ) : total === 0 ? (
        <EmptyState icon={Users} message="Chưa có dữ liệu trình độ" />
      ) : (
        <div className="space-y-2">
          {data.usersByLevel.map((bucket) => {
            const share = total === 0 ? 0 : bucket.count / total
            return (
              <div key={bucket.level} className="flex items-center gap-3">
                <LevelBadge level={bucket.level} />
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(share * 100, bucket.count > 0 ? 2 : 0)}%`,
                      backgroundColor: 'var(--primary)',
                    }}
                  />
                </div>
                <span className="w-14 text-right text-sm font-bold tabular-nums">
                  {formatNumber(bucket.count)}
                </span>
                <span className="w-12 text-right text-[10px] text-muted-foreground tabular-nums">
                  {formatPercent(share)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

// ─── Hàng người dùng dùng chung ──────────────────────────────────────────────

function UserRow({
  userId,
  fullName,
  email,
  avatarUrl,
  level,
  leading,
  trailing,
}: {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  level?: DashboardLearners['recentUsers'][number]['currentLevel']
  leading?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <Link
      to={learnerPath(userId)}
      className="group flex items-center gap-3 rounded-lg border-2 border-border bg-card px-3 py-2 transition-colors hover:bg-muted/40"
    >
      {leading}
      <Avatar fullName={fullName} avatarUrl={avatarUrl} userId={userId} size={8} />
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold truncate">
          <span className="truncate">{fullName}</span>
          {level && <LevelBadge level={level} />}
        </p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      {trailing}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
