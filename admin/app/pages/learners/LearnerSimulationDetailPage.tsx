import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminLearner, useAdminLearnerSimulation } from '../../features/learners/api/use-learners-admin'
import { learnerPath } from './route-utils'

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
  abandoned: 'text-rose-600 dark:text-rose-400',
}

export function LearnerSimulationDetailPage() {
  const { learnerId, sessionId } = useParams()
  const { data: learnerData } = useAdminLearner(learnerId)
  const { data, isLoading, error } = useAdminLearnerSimulation(learnerId, sessionId)

  const learner = learnerData?.user
  const session = data?.session

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Học viên', href: learnerPath.learners() },
          { label: learner?.fullName ?? 'Chi tiết', href: learnerId ? learnerPath.learner(learnerId) : undefined },
          { label: session?.scenario?.title ?? 'Phiên mô phỏng' },
        ]}
      />

      <div className="flex items-center gap-3">
        {learnerId && (
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 mt-0.5">
            <Link to={learnerPath.learner(learnerId)}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="font-bold text-muted-foreground">PHIÊN MÔ PHỎNG</span>
            {session?.chosenCharacter?.name && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">vai {session.chosenCharacter.name}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight truncate">
            {session?.scenario?.title ?? 'Phiên mô phỏng'}
          </h1>
        </div>
      </div>

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
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border-2 border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</p>
              <p className={`text-base font-bold mt-1.5 capitalize ${statusColors[session?.status ?? ''] ?? 'text-foreground'}`}>
                {session?.status ?? '—'}
              </p>
            </div>
            <Metric label="Điểm" value={session?.totalScore ?? '—'} />
            <Metric label="Tin nhắn" value={session?.totalMessages ?? data.messages.length} />
            <Metric label="Tokens" value={session?.totalTokens ?? 0} />
          </div>

          {/* Chat */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold tracking-tight">Hội thoại</h2>

            {data.messages.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">Chưa có tin nhắn</p>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-border bg-card p-4 sm:p-6 space-y-4">
                {data.messages.map((message) => {
                  const speakerName = message.isLearner
                    ? learner?.fullName ?? 'Học viên'
                    : message.speakerCharacter?.name ?? 'Nhân vật'
                  const speakerId = message.isLearner
                    ? learner?.id ?? 'learner'
                    : message.speakerCharacter?.id ?? 'character'

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isLearner ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${hashColor(speakerId)}`}
                      >
                        {getInitials(speakerName)}
                      </div>

                      {/* Bubble */}
                      <div className={`flex-1 min-w-0 max-w-[85%] ${message.isLearner ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-foreground">
                            {speakerName}
                          </span>
                          {message.isLearner && (
                            <span className="text-xs font-medium text-primary">Bạn</span>
                          )}
                          <span className="text-xs text-muted-foreground tabular-nums">
                            #{message.orderIndex}
                          </span>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            message.isLearner
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted text-foreground rounded-tl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        {message.translation && (
                          <p className="text-xs text-muted-foreground italic mt-1.5 px-1">
                            {message.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1.5 tabular-nums">{value}</p>
    </div>
  )
}
