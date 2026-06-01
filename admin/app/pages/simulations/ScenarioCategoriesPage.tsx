import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Plus, MessageSquare, Pencil, Trash2, MoreVertical, Users } from 'lucide-react'
import { getCategoryIcon } from '../../components/admin/editors/IconPicker'
import { Button } from '../../components/ui/button'
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
import { useAdminScenarioCategories, useSimulationsAdminMutation } from '../../features/simulations/api/use-simulations-admin'
import { CardGridSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import type { ScenarioCategory } from '../../features/simulations/types'
import { simulationPath } from './route-utils'

export function ScenarioCategoriesPage() {
  const navigate = useNavigate()
  const { data = [], isLoading, error, refetch, isFetching } = useAdminScenarioCategories()
  const mutations = useSimulationsAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<ScenarioCategory | null>(null)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteCategory.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa danh mục')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

  const totalScenarios = data.reduce((sum, c) => sum + (c.scenarios?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Mô phỏng hội thoại
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Tổ chức tình huống và nhân vật cho mô phỏng AI.
          </p>
        </div>
        <Button asChild>
          <Link to={simulationPath.categoryNew()}>
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Link>
        </Button>
      </div>

      {!isLoading && !error && data.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border-2 border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Danh mục
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{data.length}</p>
          </div>
          <div className="rounded-lg border-2 border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng tình huống
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{totalScenarios}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : data.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-lg font-bold mb-1">Chưa có danh mục nào</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tạo danh mục đầu tiên để tổ chức các tình huống mô phỏng
          </p>
          <Button asChild>
            <Link to={simulationPath.categoryNew()}>
              <Plus className="h-4 w-4" />
              Tạo danh mục đầu tiên
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((category) => {
            const color = category.color || '#6366F1'
            const CategoryIcon = getCategoryIcon(category.icon)
            const characterCount = category.scenarios?.reduce(
              (sum, s) => sum + (s.characters?.length ?? 0),
              0
            ) ?? 0
            return (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(simulationPath.category(category.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(simulationPath.category(category.id))
                }}
                className="group relative flex items-start gap-4 rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
              >
                {/* Color icon box */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color }}
                >
                  <CategoryIcon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground line-clamp-1 pr-8">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="font-bold tabular-nums text-foreground">
                        {category.scenarios?.length ?? 0}
                      </span>
                      tình huống
                    </span>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-bold tabular-nums text-foreground">
                        {characterCount}
                      </span>
                      nhân vật
                    </span>
                  </div>
                </div>

                {/* Dropdown */}
                <div onClick={stop} onKeyDown={stop} className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link to={simulationPath.categoryEdit(category.id)}>
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setPendingDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa danh mục
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Danh mục <span className="font-semibold text-foreground">&quot;{pendingDelete?.name}&quot;</span> và toàn bộ tình huống, nhân vật bên trong sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa danh mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
