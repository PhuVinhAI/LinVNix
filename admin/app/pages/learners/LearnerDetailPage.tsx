import { useNavigate, useParams } from 'react-router'
import { TrendingUp, Target, BookOpen, MessageSquare, Bot, Sparkles } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { DataTable } from '../../components/admin/DataTable'
import { useAdminLearner } from '../../features/learners/api/use-learners-admin'
import { learnerPath } from './route-utils'

const levelColors: Record<string, string> = {
  A1: 'text-emerald-600 dark:text-emerald-400',
  A2: 'text-teal-600 dark:text-teal-400',
  B1: 'text-blue-600 dark:text-blue-400',
  B2: 'text-indigo-600 dark:text-indigo-400',
  C1: 'text-purple-600 dark:text-purple-400',
  C2: 'text-rose-600 dark:text-rose-400',
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

const statusColors: Record<string, string> = {
  completed: 'text-emerald-600 dark:text-emerald-400',
  in_progress: 'text-blue-600 dark:text-blue-400',
  not_started: 'text-muted-foreground',
}

export function LearnerDetailPage() {
  const { learnerId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useAdminLearner(learnerId)

  const learner = data?.user

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Học viên', href: learnerPath.learners() }, { label: learner?.fullName ?? 'Chi tiết' }]} />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive font-semibold">
            {error instanceof Error ? error.message : 'Không tải được dữ liệu'}
          </p>
        </div>
      ) : data ? (
        <>
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-white text-xl font-bold ${hashColor(learner?.id ?? '')}`}
            >
              {getInitials(learner?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-bold text-muted-foreground">HỌC VIÊN</span>
                <span className="text-muted-foreground">·</span>
                <span className={`font-bold ${levelColors[learner?.currentLevel ?? ''] ?? 'text-muted-foreground'}`}>
                  {learner?.currentLevel ?? '—'}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium text-muted-foreground capitalize">
                  {learner?.role ?? '—'}
                </span>
                {learner?.preferredDialect && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      Giọng {learner.preferredDialect}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {learner?.fullName ?? 'Học viên'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{learner?.email}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t-2 border-border">
            <Metric label="Tiến độ" value={`${data.summary.completedProgressCount}/${data.summary.progressCount}`} />
            <Metric label="Bài tập đúng" value={`${data.summary.correctExerciseResultsCount}/${data.summary.exerciseResultsCount}`} />
            <Metric label="Từ cá nhân" value={data.summary.personalVocabularyCount} />
            <Metric
              label="Streak"
              value={`${data.summary.currentStreak} / ${data.summary.longestStreak}`}
              hint="hiện tại / dài nhất"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="progress" className="space-y-4 pt-2">
            <div className="border-b-2 border-border">
              <TabsList variant="line" className="flex h-auto p-0 gap-0 -mb-0.5 overflow-x-auto">
                <TabsTrigger
                  value="progress"
                  className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Tiến độ</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground group-data-active:text-foreground">
                    {data.progress.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="goals"
                  className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
                >
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Mục tiêu</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {data.dailyGoals.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="exercises"
                  className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Bài tập</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {data.exerciseResults.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="vocabulary"
                  className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Từ vựng</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {data.personalVocabularies.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="simulations"
                  className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Mô phỏng</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {data.simulations.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
                >
                  <Bot className="h-4 w-4" />
                  <span className="text-sm">AI</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {data.conversations.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="progress" className="mt-4">
              <DataTable data={data.progress} empty="Chưa có tiến độ" columns={[
                { key: 'unit', header: 'Hạng mục', cell: (row) => <span className="font-semibold text-foreground">{row.lesson?.title ?? row.module?.title ?? row.course?.title ?? row.unitType}</span> },
                { key: 'type', header: 'Loại', cell: (row) => <span className="text-muted-foreground capitalize">{row.unitType}</span> },
                { key: 'status', header: 'Trạng thái', cell: (row) => (
                  <span className={`font-medium capitalize ${statusColors[row.status] ?? 'text-muted-foreground'}`}>
                    {row.status.replace('_', ' ')}
                  </span>
                ) },
                { key: 'score', header: 'Điểm', cell: (row) => <span className="font-bold tabular-nums">{row.score ?? '—'}</span> },
                { key: 'time', header: 'Thời gian', cell: (row) => <span className="text-muted-foreground tabular-nums">{row.timeSpent}s</span> },
              ]} />
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              <DataTable data={data.dailyGoals} empty="Chưa có mục tiêu" columns={[
                { key: 'type', header: 'Loại', cell: (row) => <span className="font-semibold capitalize">{row.goalType}</span> },
                { key: 'target', header: 'Mục tiêu', cell: (row) => <span className="font-bold tabular-nums">{row.targetValue}</span> },
              ]} />
            </TabsContent>

            <TabsContent value="exercises" className="mt-4">
              <DataTable data={data.exerciseResults} empty="Chưa có kết quả" columns={[
                { key: 'question', header: 'Câu hỏi', cell: (row) => <span className="font-semibold line-clamp-1">{row.exercise?.question ?? '—'}</span> },
                { key: 'type', header: 'Kiểu', cell: (row) => <span className="text-muted-foreground capitalize">{row.exercise?.exerciseType ?? '—'}</span> },
                { key: 'correct', header: 'Đúng', cell: (row) => (
                  <span className={`flex items-center gap-1.5 font-medium ${row.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.isCorrect ? 'bg-emerald-500' : 'bg-destructive'}`} />
                    {row.isCorrect ? 'Đúng' : 'Sai'}
                  </span>
                ) },
                { key: 'score', header: 'Điểm', cell: (row) => <span className="font-bold tabular-nums">{row.bestScore || row.score}</span> },
                { key: 'attempts', header: 'Lần làm', cell: (row) => <span className="tabular-nums">{row.attemptCount}</span> },
              ]} />
            </TabsContent>

            <TabsContent value="vocabulary" className="mt-4">
              <DataTable data={data.personalVocabularies} empty="Chưa có từ cá nhân" columns={[
                { key: 'word', header: 'Từ', cell: (row) => <span className="font-bold text-foreground">{row.word}</span> },
                { key: 'translation', header: 'Dịch', cell: (row) => <span className="text-muted-foreground">{row.translation}</span> },
                { key: 'source', header: 'Nguồn', cell: (row) => <span className="text-xs text-muted-foreground capitalize">{row.source}</span> },
                { key: 'pos', header: 'Loại từ', cell: (row) => <span className="text-muted-foreground">{row.partOfSpeech ?? '—'}</span> },
              ]} />
            </TabsContent>

            <TabsContent value="simulations" className="mt-4">
              <DataTable
                data={data.simulations}
                empty="Chưa có phiên mô phỏng"
                onRowClick={learnerId ? (row) => navigate(learnerPath.simulation(learnerId, row.id)) : undefined}
                columns={[
                  { key: 'scenario', header: 'Tình huống', cell: (row) => <span className="font-semibold line-clamp-1">{row.scenario?.title ?? '—'}</span> },
                  { key: 'character', header: 'Nhân vật', cell: (row) => <span className="text-muted-foreground">{row.chosenCharacter?.name ?? '—'}</span> },
                  { key: 'status', header: 'Trạng thái', cell: (row) => (
                    <span className={`font-medium capitalize ${statusColors[row.status] ?? 'text-muted-foreground'}`}>
                      {row.status}
                    </span>
                  ) },
                  { key: 'score', header: 'Điểm', cell: (row) => <span className="font-bold tabular-nums">{row.totalScore ?? '—'}</span> },
                  { key: 'messages', header: 'Tin nhắn', cell: (row) => <span className="tabular-nums">{row.totalMessages}</span> },
                ]}
              />
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <DataTable
                data={data.conversations}
                empty="Chưa có hội thoại"
                onRowClick={learnerId ? (row) => navigate(learnerPath.conversation(learnerId, row.id)) : undefined}
                columns={[
                  { key: 'title', header: 'Tiêu đề', cell: (row) => <span className="font-semibold line-clamp-1">{row.title || 'Không tiêu đề'}</span> },
                  { key: 'model', header: 'Model', cell: (row) => <span className="text-xs font-mono text-muted-foreground">{row.model}</span> },
                  { key: 'scope', header: 'Ngữ cảnh', cell: (row) => <span className="text-muted-foreground line-clamp-1">{row.lesson?.title ?? row.course?.title ?? '—'}</span> },
                  { key: 'tokens', header: 'Tokens', cell: (row) => <span className="font-bold tabular-nums">{row.totalTokens}</span> },
                  { key: 'updated', header: 'Cập nhật', cell: (row) => <span className="text-muted-foreground tabular-nums">{formatDate(row.updatedAt)}</span> },
                ]}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1.5 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN')
}
