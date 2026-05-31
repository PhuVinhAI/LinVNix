import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Plus, MessageSquare, Pencil, Trash2, MoreVertical } from 'lucide-react'
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
import type { ScenarioCategory } from '../../features/simulations/types'
import { simulationPath } from './route-utils'

export function ScenarioCategoriesPage() {
  const navigate = useNavigate()
  const { data = [], isLoading, error } = useAdminScenarioCategories()
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

  const stop = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Danh mục tình huống
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Tổ chức tình huống và nhân vật cho hội thoại mô phỏng.
          </p>
        </div>
        <Button asChild>
          <Link to={simulationPath.categoryNew()}>
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Link>
        </Button>
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
        <div className="rounded-lg border-2 border-border overflow-hidden">
          {data.map((category, index) => (
            <div
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(simulationPath.category(category.id))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(simulationPath.category(category.id))
              }}
              className={`group flex items-center gap-4 p-4 bg-card cursor-pointer transition-colors hover:bg-muted/40 focus:outline-none focus:bg-muted/40 ${
                index > 0 ? 'border-t-2 border-border' : ''
              }`}
            >
              {/* Color signature box */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: category.color || '#6366F1' }}
              >
                <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground truncate">
                    {category.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">#{category.orderIndex}</span>
                </div>
                {category.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {category.description}
                  </p>
                ) : category.icon ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Icon: <code className="font-mono">{category.icon}</code>
                  </p>
                ) : null}
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium tabular-nums">
                  {category.scenarios?.length ?? 0}
                </span>
                <span>tình huống</span>
              </div>

              {/* Actions */}
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
          ))}
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
