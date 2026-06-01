import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  Plus, Pencil, Users, MoreVertical, Trash2, UserCheck, Eye, EyeOff,
  Clock, Sparkles, MessageCircle, Target, Quote, User, GraduationCap,
  Stethoscope, Car, BookOpen, Store, Plane, Shield, Sprout, Wrench,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { ScenarioDetailSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { useAdminScenario, useSimulationsAdminMutation } from '../../features/simulations/api/use-simulations-admin'
import type { ScenarioCharacter } from '../../features/simulations/types'
import { simulationPath } from './route-utils'

const levelMeta: Record<string, string> = {
  A1: 'bg-emerald-500',
  A2: 'bg-teal-500',
  B1: 'bg-blue-500',
  B2: 'bg-indigo-500',
  C1: 'bg-purple-500',
  C2: 'bg-rose-500',
}

const difficultyMeta: Record<string, { label: string; bg: string; color: string }> = {
  EASY: { label: 'Dễ', bg: 'bg-emerald-100 dark:bg-emerald-950/40', color: 'text-emerald-700 dark:text-emerald-300' },
  MEDIUM: { label: 'Trung bình', bg: 'bg-amber-100 dark:bg-amber-950/40', color: 'text-amber-700 dark:text-amber-300' },
  HARD: { label: 'Khó', bg: 'bg-rose-100 dark:bg-rose-950/40', color: 'text-rose-700 dark:text-rose-300' },
}

const AVATAR_ICONS: Record<string, LucideIcon> = {
  waiter: UtensilsCrossed,
  teacher: GraduationCap,
  doctor: Stethoscope,
  driver: Car,
  student: BookOpen,
  shopkeeper: Store,
  friend: User,
  family: Users,
  tourist: Plane,
  police: Shield,
  farmer: Sprout,
  engineer: Wrench,
}

export function ScenarioDetailPage() {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const { data: scenario, isLoading, error, refetch, isFetching } = useAdminScenario(scenarioId)
  const mutations = useSimulationsAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<ScenarioCharacter | null>(null)
  const [showFullPrompt, setShowFullPrompt] = useState(false)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteCharacter.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa nhân vật')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

  const playableCount = scenario?.characters?.filter((c) => c.isPlayable).length ?? 0
  const scoringCriteria = Array.isArray(scenario?.scoringCriteria) ? scenario.scoringCriteria : []
  const totalWeight = scoringCriteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
  const levelBg = levelMeta[scenario?.requiredLevel ?? ''] ?? 'bg-muted'
  const diff = difficultyMeta[scenario?.difficulty ?? ''] ?? {
    label: scenario?.difficulty ?? '—',
    bg: 'bg-muted',
    color: 'text-muted-foreground',
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: scenario?.category?.name ?? 'Danh mục', href: scenario?.categoryId ? simulationPath.category(scenario.categoryId) : undefined },
          { label: scenario?.title ?? 'Tình huống' },
        ]}
      />

      {/* Header card */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-white font-bold ${levelBg}`}
              >
                {scenario?.requiredLevel ?? '—'}
              </span>
              <span className={`inline-flex items-center rounded-md px-2 py-1 font-bold ${diff.bg} ${diff.color}`}>
                {diff.label}
              </span>
              {scenario?.isPublished ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/40 px-2 py-1 font-bold text-emerald-700 dark:text-emerald-300">
                  <Eye className="h-3 w-3" />
                  Đã xuất bản
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-bold text-muted-foreground">
                  <EyeOff className="h-3 w-3" />
                  Bản nháp
                </span>
              )}
              {scenario?.estimatedMinutes && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium tabular-nums">{scenario.estimatedMinutes} phút</span>
                </span>
              )}
              {scenario?.maxTurns && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="h-3 w-3" />
                  <span className="font-medium tabular-nums">tối đa {scenario.maxTurns} lượt</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {scenario?.title ?? 'Tình huống'}
            </h1>
            {scenario?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {scenario.description}
              </p>
            )}
          </div>
          {scenarioId && scenario && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={simulationPath.scenarioEdit(scenario.categoryId, scenarioId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <ScenarioDetailSkeleton />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : scenario ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — AI configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* System prompt */}
            <section className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b-2 border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight">Lời nhắc hệ thống cho AI</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullPrompt((v) => !v)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {showFullPrompt ? 'Thu gọn' : 'Hiện đầy đủ'}
                </button>
              </div>
              <pre
                className={`p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground ${
                  showFullPrompt ? 'max-h-none' : 'max-h-48 overflow-hidden'
                }`}
              >
                {scenario.systemPrompt || '(Chưa thiết lập)'}
              </pre>
              {!showFullPrompt && scenario.systemPrompt && scenario.systemPrompt.length > 200 && (
                <div className="px-4 pb-3 -mt-6 pt-6 bg-gradient-to-t from-card to-transparent" />
              )}
            </section>

            {/* Opening message */}
            {scenario.openingMessage && (
              <section className="rounded-xl border-2 border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-muted/30">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Quote className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight">Tin nhắn mở đầu</h2>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900 p-4">
                    <p className="text-base text-foreground italic leading-relaxed">
                      &quot;{scenario.openingMessage}&quot;
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Scoring criteria */}
            <section className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b-2 border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight">Tiêu chí chấm điểm</h2>
                </div>
                <span className="text-xs font-bold text-muted-foreground tabular-nums">
                  {scoringCriteria.length} tiêu chí
                </span>
              </div>

              {scoringCriteria.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Chưa có tiêu chí chấm điểm nào
                </div>
              ) : (
                <div className="divide-y-2 divide-border">
                  {scoringCriteria.map((criterion, i) => {
                    const percent = totalWeight > 0 ? ((Number(criterion.weight) || 0) / totalWeight) * 100 : 0
                    return (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-400">
                              {i + 1}
                            </span>
                            <h3 className="text-sm font-bold text-foreground">{criterion.name}</h3>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                              {percent.toFixed(0)}%
                            </span>
                            <span className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">
                              ×{Number(criterion.weight).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        {criterion.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                            {criterion.description}
                          </p>
                        )}
                        <div className="mt-2 ml-8 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right column — Characters */}
          <div className="space-y-6">
            <section className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b-2 border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight">Dàn nhân vật</h2>
                </div>
                {scenarioId && (
                  <Button asChild size="sm" variant="ghost" className="h-7">
                    <Link to={simulationPath.characterNew(scenarioId)}>
                      <Plus className="h-3.5 w-3.5" />
                      Thêm
                    </Link>
                  </Button>
                )}
              </div>

              <div className="p-4">
                {!scenario.characters || scenario.characters.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                    <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                    <h3 className="text-sm font-bold mb-1">Chưa có nhân vật</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Thêm nhân vật để AI nhập vai
                    </p>
                    {scenarioId && (
                      <Button asChild size="sm">
                        <Link to={simulationPath.characterNew(scenarioId)}>
                          <Plus className="h-3.5 w-3.5" />
                          Tạo nhân vật
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-md bg-muted/50 px-2.5 py-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Tổng
                        </span>
                        <span className="ml-1 text-sm font-bold tabular-nums">
                          {scenario.characters.length}
                        </span>
                      </div>
                      <div className="rounded-md bg-primary/10 px-2.5 py-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Học viên chơi
                        </span>
                        <span className="ml-1 text-sm font-bold tabular-nums text-primary">
                          {playableCount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {scenario.characters.map((character) => (
                        <CharacterCard
                          key={character.id}
                          character={character}
                          onEdit={() =>
                            navigate(simulationPath.characterEdit(character.scenarioId, character.id))
                          }
                          onDelete={() => setPendingDelete(character)}
                          stop={stop}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa nhân vật?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Nhân vật <span className="font-semibold text-foreground">&quot;{pendingDelete?.name}&quot;</span> và toàn bộ đoạn hội thoại có nhân vật này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa nhân vật
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CharacterCard({
  character,
  onEdit,
  onDelete,
  stop,
}: {
  character: ScenarioCharacter
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const AvatarIcon = character.avatarKey ? AVATAR_ICONS[character.avatarKey] ?? User : User

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEdit()
      }}
      className="group rounded-lg border-2 border-border bg-card p-3 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <AvatarIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{character.name}</h3>
              {character.isPlayable && (
                <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary shrink-0">
                  <UserCheck className="h-2.5 w-2.5 mr-0.5" />
                  Chơi
                </span>
              )}
            </div>
            <div onClick={stop} onKeyDown={stop} className="shrink-0 -mr-1 -mt-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                    <Trash2 className="h-4 w-4" />
                    Xóa nhân vật
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate">{character.role}</p>
          {character.personality && (
            <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1.5 leading-relaxed">
              {character.personality}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
