import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Plus, Pencil, MessageSquare, Users, MoreVertical, Trash2 } from 'lucide-react'
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
import { useAdminScenarioCategory, useSimulationsAdminMutation } from '../../features/simulations/api/use-simulations-admin'
import type { Scenario } from '../../features/simulations/types'
import { simulationPath } from './route-utils'

const levelColors: Record<string, string> = {
  A1: 'text-emerald-600 dark:text-emerald-400',
  A2: 'text-teal-600 dark:text-teal-400',
  B1: 'text-blue-600 dark:text-blue-400',
  B2: 'text-indigo-600 dark:text-indigo-400',
  C1: 'text-purple-600 dark:text-purple-400',
  C2: 'text-rose-600 dark:text-rose-400',
}

export function ScenarioCategoryDetailPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { data: category, isLoading, error } = useAdminScenarioCategory(categoryId)
  const mutations = useSimulationsAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Scenario | null>(null)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteScenario.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa tình huống')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
  }

  const totalCharacters = category?.scenarios?.reduce((sum, s) => sum + (s.characters?.length ?? 0), 0) ?? 0
  const categoryColor = category?.color || '#6366F1'

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Danh mục', href: simulationPath.categories() },
          { label: category?.name ?? 'Danh mục' },
        ]}
      />

      {/* Category Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: categoryColor }}
            >
              <MessageSquare className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-bold text-muted-foreground">DANH MỤC</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">#{category?.orderIndex ?? 0}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {category?.name ?? 'Danh mục tình huống'}
              </h1>
              {category?.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          {categoryId && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={simulationPath.categoryEdit(categoryId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-6 pt-2 border-t-2 border-border">
          <div className="flex items-center gap-2 pt-4">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">
              {category?.scenarios?.length ?? 0}
            </span>
            <span className="text-sm text-muted-foreground">tình huống</span>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">{totalCharacters}</span>
            <span className="text-sm text-muted-foreground">nhân vật</span>
          </div>
        </div>
      </div>

      {/* Scenarios Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Tình huống</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Các tình huống hội thoại trong danh mục này.
            </p>
          </div>
          {categoryId && (
            <Button asChild>
              <Link to={simulationPath.scenarioNew(categoryId)}>
                <Plus className="h-4 w-4" />
                Thêm tình huống
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
        ) : !category?.scenarios || category.scenarios.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có tình huống nào</h3>
            <p className="text-sm text-muted-foreground mb-4">Tạo tình huống đầu tiên cho danh mục này</p>
            {categoryId && (
              <Button asChild>
                <Link to={simulationPath.scenarioNew(categoryId)}>
                  <Plus className="h-4 w-4" />
                  Tạo tình huống đầu tiên
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-border overflow-hidden">
            {category.scenarios.map((scenario, index) => (
              <div
                key={scenario.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(simulationPath.scenario(scenario.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(simulationPath.scenario(scenario.id))
                }}
                className={`group flex items-center gap-4 p-4 bg-card cursor-pointer transition-colors hover:bg-muted/40 focus:outline-none focus:bg-muted/40 ${
                  index > 0 ? 'border-t-2 border-border' : ''
                }`}
              >
                {/* Color indicator inheriting category color */}
                <div
                  className="h-9 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {scenario.title}
                    </h3>
                    <span className={`text-xs font-bold ${levelColors[scenario.requiredLevel] ?? 'text-muted-foreground'}`}>
                      {scenario.requiredLevel}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-medium text-muted-foreground capitalize">
                      {scenario.difficulty}
                    </span>
                    {scenario.isPublished ? (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Đã xuất bản
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          Bản nháp
                        </span>
                      </>
                    )}
                  </div>
                  {scenario.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {scenario.description}
                    </p>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium tabular-nums">
                    {scenario.characters?.length ?? 0}
                  </span>
                </div>

                <div onClick={stop} onKeyDown={stop} className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Tùy chọn</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link to={simulationPath.scenarioEdit(scenario.categoryId, scenario.id)}>
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setPendingDelete(scenario)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa tình huống
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <AlertDialogTitle>Xóa tình huống?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Tình huống <span className="font-semibold text-foreground">&quot;{pendingDelete?.title}&quot;</span> cùng các nhân vật và đoạn hội thoại liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa tình huống
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
