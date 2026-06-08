import { useMemo, type ComponentType, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BookMarked,
  BookOpen,
  Bot,
  CircleAlert,
  Flame,
  GraduationCap,
  ListChecks,
  Library,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardOverview } from '../../hooks/useDashboard'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { AppError } from '../../../lib/shared/errors/AppError'
import type {
  DashboardOverview,
  HighErrorQuestion,
  OverviewActivityPoint,
  RecentUserRow,
  TopCourse,
  TopStreakRow,
  UserLevelCode,
} from '../../features/dashboard'

// ────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ────────────────────────────────────────────────────────────────────────────

const INDIGO = '#6366F1'
const VIOLET = '#8B5CF6'
const CYAN = '#06B6D4'
const GREEN = '#22C55E'
const AMBER = '#F59E0B'
const BLUE = '#3B82F6'
const ROSE = '#F43F5E'
const TEAL = '#14B8A6'
const SLATE = '#64748B'

const LEVEL_COLOR: Record<UserLevelCode, string> = {
  A1: GREEN,
  A2: TEAL,
  B1: BLUE,
  B2: INDIGO,
  C1: VIOLET,
  C2: ROSE,
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: BLUE,
  PAUSED: AMBER,
  COMPLETED: GREEN,
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang diễn ra',
  PAUSED: 'Tạm dừng',
  COMPLETED: 'Đã hoàn thành',
}

const EXERCISE_TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'Trắc nghiệm',
  fill_blank: 'Điền chỗ trống',
  matching: 'Ghép cặp',
  ordering: 'Sắp xếp',
  translation: 'Dịch nghĩa',
  listening: 'Nghe hiểu',
  speaking: 'Nói',
}

const EXERCISE_TYPE_COLORS = [INDIGO, VIOLET, CYAN, GREEN, AMBER, BLUE, ROSE]

const numberFormatter = new Intl.NumberFormat('vi-VN')
const dateLabelFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
})

function formatNumber(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return numberFormatter.format(value)
}

function formatPercent(ratio: number | undefined | null): string {
  if (ratio == null || Number.isNaN(ratio)) return '—'
  return `${(ratio * 100).toFixed(1)}%`
}

function formatDateShort(iso: string): string {
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  const date = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]))
  return dateLabelFormatter.format(date)
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hashColor(id: string): string {
  const palette = [INDIGO, VIOLET, CYAN, GREEN, AMBER, BLUE, ROSE, TEAL]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  }
  return palette[Math.abs(hash) % palette.length]
}

function questionTypeLabel(type: string): string {
  return EXERCISE_TYPE_LABEL[type] ?? type
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardOverview()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Bảng điều khiển
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Chào mừng trở lại, <span className="font-bold text-foreground">{user?.fullName}</span>. Tổng quan toàn bộ hoạt động của LinVNix.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Đang cập nhật...' : 'Làm mới'}
        </Button>
      </div>

      {isError ? (
        <DashboardError error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <DashboardBody data={data} loading={isLoading} />
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Body
// ────────────────────────────────────────────────────────────────────────────

function DashboardBody({
  data,
  loading,
}: {
  data?: DashboardOverview
  loading: boolean
}) {
  const kpis = data?.kpis

  return (
    <div className="space-y-6">
      {/* KPI row 1 — người dùng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Tổng người dùng"
          value={kpis?.totalUsers}
          icon={Users}
          tint={INDIGO}
          loading={loading}
          hint={
            kpis
              ? `+${formatNumber(kpis.newUsersThisMonth)} trong 30 ngày qua`
              : undefined
          }
        />
        <KpiCard
          label="Hoạt động hôm nay"
          value={kpis?.dailyActiveUsers}
          icon={Activity}
          tint={CYAN}
          loading={loading}
          hint="Người dùng tích cực 24h"
        />
        <KpiCard
          label="Người mới hôm nay"
          value={kpis?.newUsersToday}
          icon={UserPlus}
          tint={GREEN}
          loading={loading}
          hint={
            kpis ? `${formatNumber(kpis.newUsersThisWeek)} trong tuần` : undefined
          }
        />
        <KpiCard
          label="Streak hoạt động"
          value={kpis?.activeStreakUsers}
          icon={Flame}
          tint={AMBER}
          loading={loading}
          hint={
            kpis
              ? `Cao nhất từng đạt: ${formatNumber(kpis.longestStreakEver)} ngày`
              : undefined
          }
        />
      </div>

      {/* KPI row 2 — nội dung & luyện tập */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Khóa học"
          value={kpis?.totalCourses}
          icon={GraduationCap}
          tint={VIOLET}
          loading={loading}
          hint={
            kpis
              ? `${formatNumber(kpis.publishedCourses)} đã xuất bản`
              : undefined
          }
        />
        <KpiCard
          label="Bài học"
          value={kpis?.totalLessons}
          icon={BookOpen}
          tint={BLUE}
          loading={loading}
          hint="Tổng số bài học trong hệ thống"
        />
        <KpiCard
          label="Bài tập"
          value={kpis?.totalQuestions}
          icon={ListChecks}
          tint={INDIGO}
          loading={loading}
          hint={
            kpis
              ? `${formatNumber(kpis.totalQuestionAttempts)} lượt làm`
              : undefined
          }
        />
        <KpiCard
          label="Độ chính xác 7 ngày"
          value={kpis ? formatPercent(kpis.accuracyLast7Days) : undefined}
          icon={Target}
          tint={GREEN}
          loading={loading}
          hint="Tỉ lệ trả lời đúng gần đây"
          asString
        />
      </div>

      {/* KPI row 3 — AI & nội dung cá nhân */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Mô phỏng hoàn thành"
          value={kpis?.completedSimulations}
          icon={Sparkles}
          tint={ROSE}
          loading={loading}
          hint={
            kpis
              ? `${formatNumber(kpis.totalSimulations)} phiên tổng cộng`
              : undefined
          }
        />
        <KpiCard
          label="Trò chuyện AI"
          value={kpis?.totalConversations}
          icon={Bot}
          tint={TEAL}
          loading={loading}
          hint={
            kpis
              ? `${formatNumber(kpis.totalAiMessages)} tin nhắn AI`
              : undefined
          }
        />
        <KpiCard
          label="Từ vựng cá nhân"
          value={kpis?.totalPersonalVocabularies}
          icon={Library}
          tint={CYAN}
          loading={loading}
          hint="Từ học viên tự thêm"
        />
        <KpiCard
          label="Đánh dấu từ vựng"
          value={kpis?.totalBookmarks}
          icon={BookMarked}
          tint={AMBER}
          loading={loading}
          hint="Bookmark từ vựng đã lưu"
        />
      </div>

      {/* Activity chart */}
      <ActivityChartCard points={data?.activity30Days} loading={loading} />

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UsersByLevelCard
          levels={data?.distributions.usersByLevel}
          loading={loading}
        />
        <ExercisesByTypeCard
          types={data?.distributions.questionsByType}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimulationStatusCard
          buckets={data?.distributions.simulationsByStatus}
          loading={loading}
        />
        <CoursesByLevelCard
          levels={data?.distributions.coursesByLevel}
          loading={loading}
        />
      </div>

      {/* Top tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCoursesCard courses={data?.topCourses} loading={loading} />
        <HighErrorExercisesCard
          exercises={data?.questionsWithHighestErrors}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopStreaksCard streaks={data?.topStreaks} loading={loading} />
        <RecentUsersCard users={data?.recentUsers} loading={loading} />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// KPI card
// ────────────────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  tint,
  loading,
  hint,
  asString,
}: {
  label: string
  value: number | string | undefined
  icon: ComponentType<{ className?: string }>
  tint: string
  loading: boolean
  hint?: string
  asString?: boolean
}) {
  const display = loading
    ? null
    : asString
      ? (value as string | undefined) ?? '—'
      : formatNumber(value as number | undefined)

  return (
    <div className="rounded-lg border-2 border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-9 w-28 mt-3" />
          ) : (
            <p className="mt-3 text-3xl font-bold text-foreground tracking-tight tabular-nums">
              {display}
            </p>
          )}
          {hint ? (
            loading ? (
              <Skeleton className="mt-2 h-3 w-32" />
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
            )
          ) : null}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${tint}1F`, color: tint }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Activity 30 days
// ────────────────────────────────────────────────────────────────────────────

function ActivityChartCard({
  points,
  loading,
}: {
  points?: OverviewActivityPoint[]
  loading: boolean
}) {
  const chartData = useMemo(
    () =>
      (points ?? []).map((p) => ({
        ...p,
        label: formatDateShort(p.date),
      })),
    [points],
  )

  const totals = useMemo(() => {
    if (!points) return null
    return points.reduce(
      (acc, p) => ({
        registrations: acc.registrations + p.registrations,
        questionAttempts: acc.questionAttempts + p.questionAttempts,
        simulationsCompleted: acc.simulationsCompleted + p.simulationsCompleted,
      }),
      { registrations: 0, questionAttempts: 0, simulationsCompleted: 0 },
    )
  }, [points])

  return (
    <SectionCard
      title="Hoạt động 30 ngày qua"
      hint="Tăng trưởng người dùng và tương tác học tập theo ngày"
      icon={TrendingUp}
    >
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : !chartData.length ? (
        <EmptyState message="Chưa có hoạt động trong 30 ngày qua" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <ActivityTotal
              label="Người đăng ký"
              value={totals?.registrations ?? 0}
              tint={INDIGO}
            />
            <ActivityTotal
              label="Lượt làm câu hỏi"
              value={totals?.questionAttempts ?? 0}
              tint={CYAN}
            />
            <ActivityTotal
              label="Mô phỏng hoàn thành"
              value={totals?.simulationsCompleted ?? 0}
              tint={GREEN}
            />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="exerciseArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CYAN} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip nameMap={ACTIVITY_NAMES} />}
                  cursor={{ stroke: 'var(--border)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: 'var(--foreground)' }}>
                      {ACTIVITY_NAMES[value as string] ?? value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="questionAttempts"
                  stroke={CYAN}
                  strokeWidth={2}
                  fill="url(#exerciseArea)"
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke={INDIGO}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="simulationsCompleted"
                  stroke={GREEN}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </SectionCard>
  )
}

const ACTIVITY_NAMES: Record<string, string> = {
  registrations: 'Người đăng ký',
  questionAttempts: 'Lượt làm câu hỏi',
  simulationsCompleted: 'Mô phỏng hoàn thành',
}

function ActivityTotal({
  label,
  value,
  tint,
}: {
  label: string
  value: number
  tint: string
}) {
  return (
    <div className="rounded-lg border-2 border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: tint }}
        />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">
        {formatNumber(value)}
      </p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Users by level (donut)
// ────────────────────────────────────────────────────────────────────────────

function UsersByLevelCard({
  levels,
  loading,
}: {
  levels?: { level: UserLevelCode; count: number }[]
  loading: boolean
}) {
  const total = (levels ?? []).reduce((sum, l) => sum + l.count, 0)
  const hasData = total > 0
  return (
    <SectionCard
      title="Học viên theo cấp độ"
      hint="Phân bổ trình độ A1 → C2"
      icon={GraduationCap}
    >
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : !hasData ? (
        <EmptyState message="Chưa có dữ liệu phân bổ" />
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-56 w-56 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levels}
                  dataKey="count"
                  nameKey="level"
                  innerRadius="60%"
                  outerRadius="95%"
                  stroke="var(--card)"
                  strokeWidth={2}
                  paddingAngle={1}
                >
                  {(levels ?? []).map((entry) => (
                    <Cell
                      key={entry.level}
                      fill={LEVEL_COLOR[entry.level] ?? SLATE}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Học viên
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {formatNumber(total)}
              </p>
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-2">
            {(levels ?? []).map((entry) => {
              const share = total === 0 ? 0 : entry.count / total
              return (
                <div
                  key={entry.level}
                  className="flex items-center gap-3 rounded-lg border-2 border-border bg-card px-3 py-2"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: LEVEL_COLOR[entry.level] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">
                      {entry.level}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPercent(share)}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    {formatNumber(entry.count)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Exercises by type (donut)
// ────────────────────────────────────────────────────────────────────────────

function ExercisesByTypeCard({
  types,
  loading,
}: {
  types?: { type: string; count: number }[]
  loading: boolean
}) {
  const enriched = useMemo(
    () =>
      (types ?? []).map((t, i) => ({
        type: t.type,
        label: questionTypeLabel(t.type),
        count: t.count,
        color: EXERCISE_TYPE_COLORS[i % EXERCISE_TYPE_COLORS.length],
      })),
    [types],
  )
  const total = enriched.reduce((sum, t) => sum + t.count, 0)

  return (
    <SectionCard
      title="Phân loại bài tập"
      hint="Tỉ trọng từng dạng bài tập trong hệ thống"
      icon={ListChecks}
    >
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : total === 0 ? (
        <EmptyState message="Chưa có bài tập" />
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-56 w-56 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enriched}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="60%"
                  outerRadius="95%"
                  stroke="var(--card)"
                  strokeWidth={2}
                  paddingAngle={1}
                >
                  {enriched.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Bài tập
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {formatNumber(total)}
              </p>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            {enriched.map((entry) => {
              const share = total === 0 ? 0 : entry.count / total
              return (
                <div
                  key={entry.type}
                  className="flex items-center gap-3 rounded-lg border-2 border-border bg-card px-3 py-2"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {entry.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPercent(share)}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    {formatNumber(entry.count)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Simulation by status (bar)
// ────────────────────────────────────────────────────────────────────────────

function SimulationStatusCard({
  buckets,
  loading,
}: {
  buckets?: { status: string; count: number }[]
  loading: boolean
}) {
  const chartData = useMemo(
    () =>
      (buckets ?? []).map((b) => ({
        status: b.status,
        label: STATUS_LABEL[b.status] ?? b.status,
        count: b.count,
        color: STATUS_COLOR[b.status] ?? SLATE,
      })),
    [buckets],
  )
  const total = chartData.reduce((sum, c) => sum + c.count, 0)

  return (
    <SectionCard
      title="Trạng thái mô phỏng"
      hint="Phiên mô phỏng hội thoại theo trạng thái"
      icon={Sparkles}
    >
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : total === 0 ? (
        <EmptyState message="Chưa có phiên mô phỏng" />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip valueLabel="Phiên" />}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Courses by level (bar)
// ────────────────────────────────────────────────────────────────────────────

function CoursesByLevelCard({
  levels,
  loading,
}: {
  levels?: { level: UserLevelCode; count: number }[]
  loading: boolean
}) {
  const chartData = useMemo(
    () =>
      (levels ?? []).map((entry) => ({
        level: entry.level,
        count: entry.count,
        color: LEVEL_COLOR[entry.level] ?? SLATE,
      })),
    [levels],
  )
  const total = chartData.reduce((sum, c) => sum + c.count, 0)

  return (
    <SectionCard
      title="Khóa học theo cấp độ"
      hint="Số khóa học đang triển khai theo CEFR"
      icon={Library}
    >
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : total === 0 ? (
        <EmptyState message="Chưa có khóa học" />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="level"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip valueLabel="Khóa học" />}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.level} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Top courses
// ────────────────────────────────────────────────────────────────────────────

function TopCoursesCard({
  courses,
  loading,
}: {
  courses?: TopCourse[]
  loading: boolean
}) {
  const max = Math.max(1, ...(courses ?? []).map((c) => c.userCount))
  return (
    <SectionCard
      title="Top khóa học"
      hint="Xếp theo số học viên đang tham gia"
      icon={GraduationCap}
    >
      {loading ? (
        <ListSkeleton />
      ) : !courses || courses.length === 0 ? (
        <EmptyState message="Chưa có dữ liệu khóa học" />
      ) : (
        <ul className="space-y-3">
          {courses.map((course, index) => (
            <li
              key={course.courseId}
              className="rounded-lg border-2 border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground tabular-nums">
                  {index + 1}
                </div>
                <p className="flex-1 truncate text-sm font-bold text-foreground">
                  {course.courseTitle}
                </p>
                <span className="text-sm font-bold tabular-nums text-muted-foreground">
                  {formatNumber(course.userCount)}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(course.userCount / max) * 100}%`,
                    backgroundColor: INDIGO,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// High error exercises
// ────────────────────────────────────────────────────────────────────────────

function HighErrorExercisesCard({
  exercises,
  loading,
}: {
  questions?: HighErrorQuestion[]
  loading: boolean
}) {
  return (
    <SectionCard
      title="Bài tập có tỉ lệ sai cao"
      hint="Cần xem lại nội dung hoặc gợi ý"
      icon={TriangleAlert}
    >
      {loading ? (
        <ListSkeleton />
      ) : !exercises || exercises.length === 0 ? (
        <EmptyState message="Chưa có bài tập nào lệch tỉ lệ" />
      ) : (
        <ul className="space-y-2">
          {exercises.map((exercise) => (
            <li
              key={exercise.questionId}
              className="flex items-start gap-3 rounded-lg border-2 border-border bg-card px-3 py-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground line-clamp-2">
                  {exercise.question}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {questionTypeLabel(exercise.type)} ·{' '}
                  {formatNumber(exercise.incorrectCount)}/
                  {formatNumber(exercise.totalAttempts)} sai
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-destructive/10 px-2 py-1 text-xs font-bold tabular-nums text-destructive">
                {exercise.errorRate}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Top streaks
// ────────────────────────────────────────────────────────────────────────────

function TopStreaksCard({
  streaks,
  loading,
}: {
  streaks?: TopStreakRow[]
  loading: boolean
}) {
  return (
    <SectionCard
      title="Top streak hiện tại"
      hint="Học viên duy trì chuỗi học liên tục dài nhất"
      icon={Flame}
    >
      {loading ? (
        <ListSkeleton />
      ) : !streaks || streaks.length === 0 ? (
        <EmptyState message="Chưa có học viên nào đang giữ streak" />
      ) : (
        <ul className="space-y-2">
          {streaks.map((row, index) => (
            <li
              key={row.userId}
              className="flex items-center gap-3 rounded-lg border-2 border-border bg-card px-3 py-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground tabular-nums">
                {index + 1}
              </div>
              <Avatar
                fullName={row.fullName}
                avatarUrl={row.avatarUrl}
                userId={row.userId}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {row.fullName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {row.email} · {row.currentLevel}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-amber-500">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-sm font-bold tabular-nums">
                    {formatNumber(row.currentStreak)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Kỷ lục {formatNumber(row.longestStreak)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Recent users
// ────────────────────────────────────────────────────────────────────────────

function RecentUsersCard({
  users,
  loading,
}: {
  users?: RecentUserRow[]
  loading: boolean
}) {
  return (
    <SectionCard
      title="Học viên mới đăng ký"
      hint="5 học viên gia nhập gần nhất"
      icon={UserPlus}
    >
      {loading ? (
        <ListSkeleton />
      ) : !users || users.length === 0 ? (
        <EmptyState message="Chưa có học viên mới" />
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.userId}
              className="flex items-center gap-3 rounded-lg border-2 border-border bg-card px-3 py-2.5"
            >
              <Avatar
                fullName={user.fullName}
                avatarUrl={user.avatarUrl}
                userId={user.userId}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
                  style={{
                    backgroundColor: LEVEL_COLOR[user.currentLevel] ?? SLATE,
                  }}
                >
                  {user.currentLevel}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {formatRelativeDate(user.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Shared widgets
// ────────────────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  hint,
  icon: Icon,
  children,
}: {
  title: string
  hint?: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border-2 border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            {hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

function Avatar({
  fullName,
  avatarUrl,
  userId,
}: {
  fullName: string
  avatarUrl: string | null
  userId: string
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
      style={{ backgroundColor: hashColor(userId) }}
    >
      {getInitials(fullName)}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3"
        >
          <Skeleton className="h-7 w-7 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

type ChartTooltipPayloadItem = {
  name?: string | number
  value?: number | string
  color?: string
  dataKey?: string
  payload?: Record<string, unknown>
}

function ChartTooltip({
  active,
  payload,
  label,
  nameMap,
  valueLabel,
}: {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string | number
  nameMap?: Record<string, string>
  valueLabel?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border-2 border-border bg-card px-3 py-2 text-xs">
      {label !== undefined && (
        <p className="font-bold text-foreground mb-1.5">{String(label)}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const name =
            (typeof entry.name === 'string' && nameMap?.[entry.name]) ||
            (typeof entry.dataKey === 'string' && nameMap?.[entry.dataKey]) ||
            valueLabel ||
            entry.name ||
            ''
          return (
            <div
              key={`${entry.dataKey ?? index}`}
              className="flex items-center gap-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{String(name)}</span>
              <span className="ml-auto font-bold tabular-nums text-foreground">
                {formatNumber(Number(entry.value))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
}) {
  if (!active || !payload || !payload.length) return null
  const entry = payload[0]
  const payloadData = (entry.payload ?? {}) as Record<string, unknown>
  const name =
    (typeof payloadData.label === 'string' && payloadData.label) ||
    (typeof payloadData.level === 'string' && payloadData.level) ||
    (typeof entry.name === 'string' && entry.name) ||
    ''
  return (
    <div className="rounded-lg border-2 border-border bg-card px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-muted-foreground">{String(name)}</span>
        <span className="ml-2 font-bold tabular-nums text-foreground">
          {formatNumber(Number(entry.value))}
        </span>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Error
// ────────────────────────────────────────────────────────────────────────────

function DashboardError({
  error,
  onRetry,
  retrying,
}: {
  error: unknown
  onRetry: () => void
  retrying: boolean
}) {
  const status = error instanceof AppError ? error.statusCode : undefined
  const isForbidden = status === 403
  const message = isForbidden
    ? 'Tài khoản của bạn không có quyền xem thống kê hệ thống (cần quyền SYSTEM_SETTINGS). Hãy đăng nhập bằng tài khoản admin được tạo qua "bun run admin:create".'
    : error instanceof Error && error.message
      ? error.message
      : 'Không thể tải dữ liệu thống kê. Vui lòng thử lại.'

  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>
        {isForbidden ? 'Không đủ quyền truy cập' : 'Đã xảy ra lỗi'}
      </AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw className={retrying ? 'animate-spin' : undefined} />
          Thử lại
        </Button>
      </AlertDescription>
    </Alert>
  )
}
