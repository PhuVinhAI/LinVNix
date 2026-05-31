import { Link, useParams } from 'react-router'
import { Bot, ArrowLeft, Settings } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminLearner, useAdminLearnerConversation } from '../../features/learners/api/use-learners-admin'
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

export function LearnerConversationDetailPage() {
  const { learnerId, conversationId } = useParams()
  const { data: learnerData } = useAdminLearner(learnerId)
  const { data, isLoading, error } = useAdminLearnerConversation(learnerId, conversationId)

  const learner = learnerData?.user
  const conversation = data?.conversation

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Học viên', href: learnerPath.learners() },
          { label: learner?.fullName ?? 'Chi tiết', href: learnerId ? learnerPath.learner(learnerId) : undefined },
          { label: conversation?.title || 'Hội thoại AI' },
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
            <span className="font-bold text-muted-foreground">HỘI THOẠI AI</span>
            {conversation?.model && (
              <>
                <span className="text-muted-foreground">·</span>
                <code className="font-mono text-muted-foreground">{conversation.model}</code>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight truncate">
            {conversation?.title || 'Hội thoại AI'}
          </h1>
          {(conversation?.course?.title || conversation?.lesson?.title) && (
            <p className="text-sm text-muted-foreground mt-1">
              {[conversation?.course?.title, conversation?.lesson?.title].filter(Boolean).join(' › ')}
            </p>
          )}
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
            <Metric label="Tin nhắn" value={data.messages.length} />
            <Metric label="Tokens" value={conversation?.totalTokens ?? 0} />
            <MetricText label="Khóa học" value={conversation?.course?.title} />
            <MetricText label="Bài học" value={conversation?.lesson?.title} />
          </div>

          {/* Chat */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold tracking-tight">Tin nhắn</h2>

            {data.messages.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">Chưa có tin nhắn</p>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-border bg-card p-4 sm:p-6 space-y-4">
                {data.messages.map((message) => {
                  const isUser = message.role === 'user'
                  const isSystem = message.role === 'system'

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Settings className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              System
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {message.tokenCount} tokens
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  const speakerName = isUser ? learner?.fullName ?? 'Học viên' : 'AI'

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      {isUser ? (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${hashColor(learner?.id ?? 'learner')}`}
                        >
                          {getInitials(speakerName)}
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`flex-1 min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-foreground">
                            {speakerName}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {message.tokenCount} tokens
                          </span>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isUser
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted text-foreground rounded-tl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
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

function MetricText({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1.5 line-clamp-2">{value ?? '—'}</p>
    </div>
  )
}
