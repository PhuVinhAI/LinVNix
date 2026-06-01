import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  Plus, Pencil, BookOpen, Layers, MoreVertical, Trash2, Clock, ChevronRight,
  Eye, EyeOff, GraduationCap,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { ModuleListSkeleton } from '../../components/admin/PageSkeletons'
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
import { useAdminCourse, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Module } from '../../features/learning/types'
import { learningPath } from './route-utils'
import { levelBg, levelLabel } from '../../features/learning/level-meta'

export function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { data: course, isLoading, error, refetch, isFetching } = useAdminCourse(courseId)
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

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0
  const totalAssessments = course?.modules?.reduce(
    (sum, m) => sum + (m.lessons?.filter((l) => l.isAssessment).length ?? 0),
    0
  ) ?? 0
  const bg = levelBg(course?.level)
  const label = levelLabel(course?.level, course?.vietnameseLevelName)

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Khóa học', href: learningPath.courses() },
          { label: course?.title ?? '...' },
        ]}
      />

      {/* Hero banner */}
      <div className="rounded-xl border-2 border-border overflow-hidden bg-card">
        <div className={`relative h-40 ${bg}`}>
          {course?.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          )}
          {!course?.thumbnailUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-white/15" strokeWidth={1.2} />
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
              {course?.level ?? '—'} · {label}
            </span>
            {course?.isPublished ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                <Eye className="h-3 w-3" />
                Đã xuất bản
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
                <EyeOff className="h-3 w-3" />
                Bản nháp
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {course?.title ?? 'Khóa học'}
              </h1>
              {course?.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t-2 border-border">
            <HeroStat icon={Layers} label="Chủ đề" value={course?.modules?.length ?? 0} />
            <HeroStat icon={BookOpen} label="Bài học" value={totalLessons} />
            <HeroStat icon={GraduationCap} label="Bài đánh giá" value={totalAssessments} />
            <HeroStat
              icon={Clock}
              label="Giờ ước tính"
              value={course?.estimatedHours ?? 0}
              suffix="h"
            />
          </div>
        </div>
      </div>

      {/* Modules tree */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Chủ đề học tập</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cây phân cấp các chủ đề và bài học trong khóa học.
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
          <ModuleListSkeleton count={4} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error)}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
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
          <div className="space-y-3">
            {course.modules.map((module) => (
              <ModuleRow
                key={module.id}
                module={module}
                onOpen={() => navigate(learningPath.module(module.id))}
                onEdit={() => navigate(learningPath.moduleEdit(module.courseId, module.id))}
                onDelete={() => setPendingDelete(module)}
                stop={stop}
              />
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

const lessonTypeColors: Record<string, string> = {
  vocabulary: 'bg-emerald-500',
  grammar: 'bg-blue-500',
  reading: 'bg-indigo-500',
  listening: 'bg-purple-500',
  speaking: 'bg-rose-500',
  writing: 'bg-amber-500',
  pronunciation: 'bg-teal-500',
  culture: 'bg-fuchsia-500',
}

function ModuleRow({
  module,
  onOpen,
  onEdit,
  onDelete,
  stop,
}: {
  module: Module
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const lessonCount = module.lessons?.length ?? 0
  return (
    <div className="rounded-lg border-2 border-border bg-card overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onOpen()
        }}
        className="group flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/40 focus:outline-none focus:bg-muted/40"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary tabular-nums">
          {module.orderIndex}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground truncate">{module.title}</h3>
            {module.topic && (
              <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                {module.topic}
              </span>
            )}
          </div>
          {module.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{module.description}</p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <BookOpen className="h-3.5 w-3.5" />
          <span className="font-bold tabular-nums text-foreground">{lessonCount}</span>
          <span>bài</span>
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 className="h-4 w-4" />
                Xóa chủ đề
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && lessonCount > 0 && (
        <div className="border-t-2 border-border bg-muted/20">
          {module.lessons?.map((lesson, idx) => (
            <Link
              key={lesson.id}
              to={learningPath.lesson(lesson.id)}
              className={`flex items-center gap-3 px-4 py-2.5 hover:bg-card transition-colors ${
                idx > 0 ? 'border-t border-border/50' : ''
              }`}
            >
              <div className="w-12 flex justify-center">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    lessonTypeColors[lesson.lessonType] ?? 'bg-muted-foreground'
                  }`}
                >
                  {lesson.orderIndex}
                </span>
              </div>
              <span className="flex-1 text-sm font-semibold truncate">{lesson.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {lessonTypeLabels[lesson.lessonType] ?? lesson.lessonType}
              </span>
              {lesson.estimatedDuration && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  <span className="tabular-nums">{lesson.estimatedDuration}p</span>
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {expanded && lessonCount === 0 && (
        <div className="border-t-2 border-border bg-muted/20 px-4 py-3 text-center text-xs text-muted-foreground">
          Chủ đề này chưa có bài học nào
        </div>
      )}
    </div>
  )
}

function HeroStat({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof BookOpen
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">
          {label}
        </p>
        <p className="text-base font-bold tabular-nums leading-tight">
          {value}
          {suffix}
        </p>
      </div>
    </div>
  )
}
