import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Plus, Pencil, BookOpen, Clock, MoreVertical, Trash2 } from 'lucide-react'
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
import { useAdminModule, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Lesson } from '../../features/learning/types'
import { learningPath } from './route-utils'

const lessonTypeColors: Record<string, string> = {
  vocabulary: 'text-emerald-600 dark:text-emerald-400',
  grammar: 'text-blue-600 dark:text-blue-400',
  reading: 'text-indigo-600 dark:text-indigo-400',
  listening: 'text-purple-600 dark:text-purple-400',
  speaking: 'text-rose-600 dark:text-rose-400',
  writing: 'text-amber-600 dark:text-amber-400',
  pronunciation: 'text-teal-600 dark:text-teal-400',
  culture: 'text-fuchsia-600 dark:text-fuchsia-400',
}

const lessonTypeLabels: Record<string, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Đọc',
  listening: 'Nghe',
  speaking: 'Nói',
  writing: 'Viết',
  pronunciation: 'Phát âm',
  culture: 'Văn hóa',
}

export function ModuleDetailPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { data: module, isLoading, error } = useAdminModule(moduleId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Lesson | null>(null)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLesson.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa bài học')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
  }

  const totalMinutes = module?.lessons?.reduce((sum, l) => sum + (l.estimatedDuration ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: module?.course?.title ?? 'Khóa học', href: module?.courseId ? learningPath.course(module.courseId) : learningPath.courses() },
          { label: module?.title ?? 'Chủ đề' },
        ]}
      />

      {/* Module Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground">CHỦ ĐỀ</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">#{module?.orderIndex ?? 0}</span>
          {module?.topic && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-foreground">{module.topic}</span>
            </>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {module?.title ?? 'Chủ đề'}
            </h1>
            {module?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {module.description}
              </p>
            )}
          </div>
          {moduleId && module && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={learningPath.moduleEdit(module.courseId, moduleId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-6 pt-2 border-t-2 border-border">
          <div className="flex items-center gap-2 pt-4">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">
              {module?.lessons?.length ?? 0}
            </span>
            <span className="text-sm text-muted-foreground">bài học</span>
          </div>
          {totalMinutes > 0 && (
            <div className="flex items-center gap-2 pt-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground tabular-nums">
                {totalMinutes}
              </span>
              <span className="text-sm text-muted-foreground">phút</span>
            </div>
          )}
        </div>
      </div>

      {/* Lessons Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Bài học</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các bài học trong chủ đề này.
            </p>
          </div>
          {moduleId && (
            <Button asChild>
              <Link to={learningPath.lessonNew(moduleId)}>
                <Plus className="h-4 w-4" />
                Thêm bài học
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
        ) : !module?.lessons || module.lessons.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có bài học nào</h3>
            <p className="text-sm text-muted-foreground mb-4">Tạo bài học đầu tiên cho chủ đề này</p>
            {moduleId && (
              <Button asChild>
                <Link to={learningPath.lessonNew(moduleId)}>
                  <Plus className="h-4 w-4" />
                  Tạo bài học đầu tiên
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-border overflow-hidden">
            {module.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(learningPath.lesson(lesson.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(learningPath.lesson(lesson.id))
                }}
                className={`group flex items-center gap-4 p-4 bg-card cursor-pointer transition-colors hover:bg-muted/40 focus:outline-none focus:bg-muted/40 ${
                  index > 0 ? 'border-t-2 border-border' : ''
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground tabular-nums">
                  {lesson.orderIndex}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {lesson.title}
                    </h3>
                    <span
                      className={`text-xs font-bold ${lessonTypeColors[lesson.lessonType] ?? 'text-muted-foreground'}`}
                    >
                      {lessonTypeLabels[lesson.lessonType] ?? lesson.lessonType}
                    </span>
                    {lesson.estimatedDuration && (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium tabular-nums">{lesson.estimatedDuration}p</span>
                        </span>
                      </>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {lesson.description}
                    </p>
                  )}
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
                        <Link to={learningPath.lessonEdit(lesson.moduleId, lesson.id)}>
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setPendingDelete(lesson)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa bài học
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
              <AlertDialogTitle>Xóa bài học?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Bài học <span className="font-semibold text-foreground">&quot;{pendingDelete?.title}&quot;</span> cùng nội dung, từ vựng và bài tập bên trong sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa bài học
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
