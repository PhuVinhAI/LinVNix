import { useNavigate, useParams } from 'react-router'
import {
  TrendingUp, Target, BookOpen, MessageSquare, Bot, Sparkles,
  Mail, Flame, Award, CheckCircle2, XCircle, Clock, Calendar,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Tabs, TabsContent } from '../../components/ui/tabs'
import { AdminTabsList, AdminTabTrigger } from '../../components/admin/AdminTabs'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { LearnerDetailSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import { useAdminLearner } from '../../features/learners/api/use-learners-admin'
import { learnerPath } from './route-utils'

const levelMeta: Record<string, { label: string; bg: string }> = {
  A1: { label: 'Mới bắt đầu', bg: 'bg-emerald-500' },
  A2: { label: 'Sơ cấp', bg: 'bg-teal-500' },
  B1: { label: 'Trung cấp', bg: 'bg-blue-500' },
  B2: { label: 'Trên trung cấp', bg: 'bg-indigo-500' },
  C1: { label: 'Cao cấp', bg: 'bg-purple-500' },
  C2: { label: 'Thông thạo', bg: 'bg-rose-500' },
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-fuchsia-500',
]

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hashColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Hoàn thành',
  in_progress: 'Đang học',
  not_started: 'Chưa bắt đầu',
  active: 'Đang diễn ra',
  ended: 'Kết thúc',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  in_progress: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  not_started: 'bg-muted text-muted-foreground',
  active: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  ended: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
}

const UNIT_TYPE_LABELS: Record<string, string> = {
  course: 'Khóa học',
  module: 'Chủ đề',
  lesson: 'Bài học',
}

export function LearnerDetailPage() {
  const { learnerId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch, isFetching } = useAdminLearner(learnerId)

  const learner = data?.user
  const meta = levelMeta[learner?.currentLevel ?? ''] ?? { label: '—', bg: 'bg-muted' }
  const progressPercent = data
    ? data.summary.progressCount > 0
      ? Math.round((data.summary.completedProgressCount / data.summary.progressCount) * 100)
      : 0
    : 0
  const accuracyPercent = data
    ? data.summary.exerciseResultsCount > 0
      ? Math.round(
          (data.summary.correctExerciseResultsCount / data.summary.exerciseResultsCount) * 100
        )
      : 0
    : 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Học viên', href: learnerPath.learners() },
          { label: learner?.fullName ?? 'Chi tiết' },
        ]}
      />

      {isLoading ? (
        <LearnerDetailSkeleton />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : data ? (
        <>
          {/* Profile hero */}
          <div className="rounded-xl border-2 border-border bg-card p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-white text-2xl font-bold ${hashColor(learner?.id ?? '')}`}
              >
                {getInitials(learner?.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold text-white ${meta.bg}`}
                  >
                    {learner?.currentLevel ?? '—'} · {meta.label}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground capitalize">
                    {learner?.role ?? '—'}
                  </span>
                  {learner?.preferredDialect && (
                    <span className="inline-flex items-center rounded-md border-2 border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Giọng {learner.preferredDialect}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {learner?.fullName ?? 'Học viên'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {learner?.email}
                </p>
                {learner?.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Tham gia: {formatDate(learner.createdAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StreakBadge
                  current={data.summary.currentStreak}
                  longest={data.summary.longestStreak}
                />
              </div>
            </div>

            {/* Progress bars */}
            <div className="mt-4 pt-4 border-t-2 border-border grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProgressBar
                label="Tiến độ học"
                hint={`${data.summary.completedProgressCount} / ${data.summary.progressCount} hạng mục`}
                percent={progressPercent}
                color="bg-primary"
              />
              <ProgressBar
                label="Độ chính xác bài tập"
                hint={`${data.summary.correctExerciseResultsCount} / ${data.summary.exerciseResultsCount} câu đúng`}
                percent={accuracyPercent}
                color="bg-emerald-500"
              />
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              icon={BookOpen}
              label="Bài tập đã làm"
              value={data.summary.exerciseResultsCount}
              tone="blue"
            />
            <MetricCard
              icon={Sparkles}
              label="Từ vựng cá nhân"
              value={data.summary.personalVocabularyCount}
              tone="purple"
            />
            <MetricCard
              icon={MessageSquare}
              label="Phiên mô phỏng"
              value={data.summary.simulationCount}
              tone="rose"
            />
            <MetricCard
              icon={Bot}
              label="Hội thoại AI"
              value={data.summary.conversationCount}
              tone="amber"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="progress" className="space-y-4">
            <AdminTabsList>
              <AdminTabTrigger value="progress" icon={TrendingUp} label="Tiến độ" count={data.progress.length} />
              <AdminTabTrigger value="exercises" icon={BookOpen} label="Bài tập" count={data.exerciseResults.length} />
              <AdminTabTrigger value="vocabulary" icon={Sparkles} label="Từ vựng" count={data.personalVocabularies.length} />
              <AdminTabTrigger value="simulations" icon={MessageSquare} label="Mô phỏng" count={data.simulations.length} />
              <AdminTabTrigger value="ai" icon={Bot} label="Hội thoại AI" count={data.conversations.length} />
              <AdminTabTrigger value="goals" icon={Target} label="Mục tiêu" count={data.dailyGoals.length} />
            </AdminTabsList>

            {/* PROGRESS — timeline-style list */}
            <TabsContent value="progress" className="mt-4 space-y-2">
              {data.progress.length === 0 ? (
                <EmptyState icon={TrendingUp} message="Chưa có tiến độ học tập" />
              ) : (
                data.progress.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {row.lesson?.title ?? row.module?.title ?? row.course?.title ?? row.unitType}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{UNIT_TYPE_LABELS[row.unitType] ?? row.unitType}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {row.timeSpent}s
                        </span>
                        {row.completedAt && (
                          <>
                            <span>·</span>
                            <span>Hoàn thành {formatDate(row.completedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {row.score != null && (
                      <span className="text-base font-bold tabular-nums text-foreground">
                        {row.score}
                      </span>
                    )}
                    <StatusPill status={row.status} />
                  </div>
                ))
              )}
            </TabsContent>

            {/* EXERCISES — correct/wrong cards */}
            <TabsContent value="exercises" className="mt-4 space-y-2">
              {data.exerciseResults.length === 0 ? (
                <EmptyState icon={BookOpen} message="Chưa có kết quả bài tập" />
              ) : (
                data.exerciseResults.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        row.isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {row.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {row.exercise?.question ?? '—'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="capitalize">
                          {row.exercise?.exerciseType?.replaceAll('_', ' ') ?? '—'}
                        </span>
                        <span>·</span>
                        <span>{row.attemptCount} lần làm</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Điểm cao nhất</p>
                      <p className="text-base font-bold tabular-nums">{row.bestScore || row.score}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* VOCABULARY — grid cards */}
            <TabsContent value="vocabulary" className="mt-4">
              {data.personalVocabularies.length === 0 ? (
                <EmptyState icon={Sparkles} message="Chưa có từ vựng cá nhân" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.personalVocabularies.map((row) => (
                    <div key={row.id} className="rounded-lg border-2 border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          {row.partOfSpeech ?? row.source ?? 'Từ'}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-foreground leading-tight mt-2">{row.word}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{row.translation}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-3">
                        Nguồn: {row.source}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SIMULATIONS — clickable cards */}
            <TabsContent value="simulations" className="mt-4 space-y-2">
              {data.simulations.length === 0 ? (
                <EmptyState icon={MessageSquare} message="Chưa có phiên mô phỏng" />
              ) : (
                data.simulations.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() =>
                      learnerId && navigate(learnerPath.simulation(learnerId, row.id))
                    }
                    className="w-full flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 text-left transition-colors hover:border-primary"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {row.scenario?.title ?? 'Tình huống'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {row.chosenCharacter?.name && (
                          <>
                            <span>Vai: {row.chosenCharacter.name}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>{row.totalMessages} tin nhắn</span>
                      </div>
                    </div>
                    {row.totalScore != null && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Điểm</p>
                        <p className="text-base font-bold tabular-nums">{row.totalScore}</p>
                      </div>
                    )}
                    <StatusPill status={row.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </TabsContent>

            {/* AI — conversation cards */}
            <TabsContent value="ai" className="mt-4 space-y-2">
              {data.conversations.length === 0 ? (
                <EmptyState icon={Bot} message="Chưa có hội thoại AI" />
              ) : (
                data.conversations.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() =>
                      learnerId && navigate(learnerPath.conversation(learnerId, row.id))
                    }
                    className="w-full flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 text-left transition-colors hover:border-primary"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {row.title || 'Hội thoại không có tiêu đề'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <code className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                          {row.model}
                        </code>
                        {(row.lesson?.title || row.course?.title) && (
                          <>
                            <span>·</span>
                            <span className="truncate">
                              {row.lesson?.title ?? row.course?.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs text-muted-foreground">Token</p>
                      <p className="text-sm font-bold tabular-nums">
                        {row.totalTokens.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0 hidden md:block">
                      {formatDate(row.updatedAt)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </TabsContent>

            {/* GOALS — chip list */}
            <TabsContent value="goals" className="mt-4">
              {data.dailyGoals.length === 0 ? (
                <EmptyState icon={Target} message="Chưa có mục tiêu hàng ngày" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.dailyGoals.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-lg border-2 border-border bg-card p-4 flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Mục tiêu / ngày
                        </p>
                        <p className="text-base font-bold text-foreground capitalize">
                          {row.goalType}
                        </p>
                      </div>
                      <p className="text-xl font-bold tabular-nums text-primary shrink-0">
                        {row.targetValue}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: number
  tone: 'blue' | 'purple' | 'rose' | 'amber'
}) {
  const toneMap = {
    blue: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    rose: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  }
  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-3">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
    </div>
  )
}

function ProgressBar({
  label,
  hint,
  percent,
  color,
}: {
  label: string
  hint: string
  percent: number
  color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  )
}

function StreakBadge({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card px-3 py-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Streak
        </p>
        <p className="text-lg font-bold tabular-nums">
          {current} <span className="text-xs font-normal text-muted-foreground">ngày</span>
        </p>
      </div>
      <div className="h-10 w-0.5 bg-border hidden sm:block" aria-hidden />
      <div className="hidden sm:block">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Award className="h-3 w-3" />
          Kỷ lục
        </p>
        <p className="text-sm font-bold tabular-nums">{longest} ngày</p>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status.replace('_', ' ')
  const color = STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${color}`}
    >
      {label}
    </span>
  )
}

function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
      <Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN')
}
