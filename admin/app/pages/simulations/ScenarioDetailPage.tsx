import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Plus, Pencil, MessageSquare, Users, MoreVertical, Trash2, UserCheck } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
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

const levelColors: Record<string, string> = {
  A1: 'text-emerald-600 dark:text-emerald-400',
  A2: 'text-teal-600 dark:text-teal-400',
  B1: 'text-blue-600 dark:text-blue-400',
  B2: 'text-indigo-600 dark:text-indigo-400',
  C1: 'text-purple-600 dark:text-purple-400',
  C2: 'text-rose-600 dark:text-rose-400',
}

// Palette for character avatars
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ScenarioDetailPage() {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const { data: scenario, isLoading, error } = useAdminScenario(scenarioId)
  const mutations = useSimulationsAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<ScenarioCharacter | null>(null)

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

  const stop = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
  }

  const playableCount = scenario?.characters?.filter(c => c.isPlayable).length ?? 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: scenario?.category?.name ?? 'Danh mục', href: scenario?.categoryId ? simulationPath.category(scenario.categoryId) : undefined },
          { label: scenario?.title ?? 'Tình huống' },
        ]}
      />

      {/* Scenario Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="font-bold text-muted-foreground">TÌNH HUỐNG</span>
          <span className="text-muted-foreground">·</span>
          <span className={`font-bold ${levelColors[scenario?.requiredLevel ?? ''] ?? 'text-muted-foreground'}`}>
            {scenario?.requiredLevel ?? '—'}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium text-muted-foreground capitalize">
            {scenario?.difficulty ?? '—'}
          </span>
          <span className="text-muted-foreground">·</span>
          {scenario?.isPublished ? (
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Public
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              Draft
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
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

        <div className="flex items-center gap-6 pt-2 border-t-2 border-border">
          <div className="flex items-center gap-2 pt-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">
              {scenario?.characters?.length ?? 0}
            </span>
            <span className="text-sm text-muted-foreground">nhân vật</span>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">
              {playableCount}
            </span>
            <span className="text-sm text-muted-foreground">playable</span>
          </div>
        </div>
      </div>

      {/* Characters Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Nhân vật</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Các nhân vật tham gia hội thoại trong tình huống.
            </p>
          </div>
          {scenarioId && (
            <Button asChild>
              <Link to={simulationPath.characterNew(scenarioId)}>
                <Plus className="h-4 w-4" />
                Thêm nhân vật
              </Link>
            </Button>
          )}
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
        ) : !scenario?.characters || scenario.characters.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có nhân vật nào</h3>
            <p className="text-sm text-muted-foreground mb-4">Tạo nhân vật đầu tiên cho tình huống này</p>
            {scenarioId && (
              <Button asChild>
                <Link to={simulationPath.characterNew(scenarioId)}>
                  <Plus className="h-4 w-4" />
                  Tạo nhân vật đầu tiên
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenario.characters.map((character, index) => (
              <div
                key={character.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(simulationPath.characterEdit(character.scenarioId, character.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(simulationPath.characterEdit(character.scenarioId, character.id))
                }}
                className="group relative rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with initials */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${avatarColors[index % avatarColors.length]}`}
                  >
                    {getInitials(character.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-foreground truncate">
                        {character.name}
                      </h3>
                      <div onClick={stop} onKeyDown={stop} className="shrink-0 -mr-1 -mt-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Tùy chọn</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link to={simulationPath.characterEdit(character.scenarioId, character.id)}>
                                <Pencil className="h-4 w-4" />
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setPendingDelete(character)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa nhân vật
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {character.role}
                      </span>
                      {character.isPlayable && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="flex items-center gap-1 text-xs font-medium text-primary">
                            <UserCheck className="h-3 w-3" />
                            Playable
                          </span>
                        </>
                      )}
                    </div>

                    {character.personality && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {character.personality}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
