import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Plus, Pencil, BookOpen, Layers, MoreVertical, Trash2 } from 'lucide-react'
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
import { useAdminCourse, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Module } from '../../features/learning/types'
import { learningPath } from './route-utils'

const levelColors: Record<string, string> = {
  A1: 'text-emerald-600 dark:text-emerald-400',
  A2: 'text-teal-600 dark:text-teal-400',
  B1: 'text-blue-600 dark:text-blue-400',
  B2: 'text-indigo-600 dark:text-indigo-400',
  C1: 'text-purple-600 dark:text-purple-400',
  C2: 'text-rose-600 dark:text-rose-400',
}

export function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { data: course, isLoading, error } = useAdminCourse(courseId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Module | null>(null)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteModule.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa chủ đề')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
  }

  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Khóa học', href: learningPath.courses() },
          { label: course?.title ?? '...' },
        ]}
      />

      {/* Course Header */}
      <div className="space-y-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-bold ${levelColors[course?.level ?? ''] ?? 'text-muted-foreground'}`}>
            {course?.level ?? '—'}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">#{course?.orderIndex ?? 0}</span>
          <span className="text-muted-foreground">·</span>
          {course?.isPublished ? (
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

        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {course?.title ?? 'Khóa học'}
            </h1>
            {course?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {course.description}
              </p>
            )}
          </div>
          {courseId && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={learningPath.courseEdit(courseId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>

        {/* Inline stats */}
        <div className="flex items-center gap-6 pt-2 border-t-2 border-border">
          <div className="flex items-center gap-2 pt-4">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">
              {course?.modules?.length ?? 0}
            </span>
            <span className="text-sm text-muted-foreground">chủ đề</span>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">{totalLessons}</span>
            <span className="text-sm text-muted-foreground">bài học</span>
          </div>
          {course?.estimatedHours && (
            <div className="flex items-center gap-2 pt-4">
              <span className="text-sm font-bold text-foreground tabular-nums">
                {course.estimatedHours}h
              </span>
              <span className="text-sm text-muted-foreground">ước tính</span>
            </div>
          )}
        </div>
      </div>

      {/* Modules Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Chủ đề</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các chủ đề trong khóa học này.
            </p>
          </div>
          {courseId && (
            <Button asChild>
              <Link to={learningPath.moduleNew(courseId)}>
                <Plus className="h-4 w-4" />
                Thêm chủ đề
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
        ) : !course?.modules || course.modules.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có chủ đề nào</h3>
            <p className="text-sm text-muted-foreground mb-4">Tạo chủ đề đầu tiên cho khóa học này</p>
            {courseId && (
              <Button asChild>
                <Link to={learningPath.moduleNew(courseId)}>
                  <Plus className="h-4 w-4" />
                  Tạo chủ đề đầu tiên
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-border overflow-hidden">
            {course.modules.map((module, index) => (
              <div
                key={module.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(learningPath.module(module.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(learningPath.module(module.id))
                }}
                className={`group flex items-center gap-4 p-4 bg-card cursor-pointer transition-colors hover:bg-muted/40 focus:outline-none focus:bg-muted/40 ${
                  index > 0 ? 'border-t-2 border-border' : ''
                }`}
              >
                {/* Order */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground tabular-nums">
                  {module.orderIndex}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {module.title}
                    </h3>
                    {module.topic && (
                      <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                        {module.topic}
                      </span>
                    )}
                  </div>
                  {module.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {module.description}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="font-medium tabular-nums">{module.lessons?.length ?? 0}</span>
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
                        <Link to={learningPath.moduleEdit(module.courseId, module.id)}>
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setPendingDelete(module)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa chủ đề
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
              <AlertDialogTitle>Xóa chủ đề?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Chủ đề <span className="font-semibold text-foreground">&quot;{pendingDelete?.title}&quot;</span> và toàn bộ bài học liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa chủ đề
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
