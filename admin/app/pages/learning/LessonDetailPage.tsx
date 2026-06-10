import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import {
  Plus,
  Pencil,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  MoreVertical,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { LessonContentSkeleton } from '../../components/admin/PageSkeletons'
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
import { DragHandle } from '../../components/admin/shared/DragHandle'
import { SortableRow } from '../../components/admin/shared/SortableRow'
import { useAdminListReorder } from '../../components/admin/hooks/use-admin-list-reorder'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Exercise, Lesson } from '../../features/learning/types'
import { LESSON_SECTIONS, questionTypeMeta, stageOneTotal } from './authoring-meta'
import { learningPath } from './route-utils'

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

export function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: lesson, isLoading, error, refetch, isFetching } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Exercise | null>(null)

  const lessonKey = ['admin-learning', 'lesson', lessonId] as const
  const exercisesReorder = useAdminListReorder<Exercise>({
    getItems: () => qc.getQueryData<Lesson>(lessonKey)?.exercises ?? [],
    setItems: (next) =>
      qc.setQueryData<Lesson>(lessonKey, (prev) =>
        prev ? { ...prev, exercises: next } : prev,
      ),
    reorder: (items) => mutations.reorderExercises.mutateAsync(items),
    onError: () => toast.error('Không thể sắp xếp lại bài tập'),
  })

  const sortedExercises = [...(lesson?.exercises ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  )
  const contentTotal = stageOneTotal(lesson)
  const questionTotal = sortedExercises.reduce((sum, e) => sum + (e.questions?.length ?? 0), 0)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLessonChild.mutateAsync({
        kind: 'exercises',
        id: pendingDelete.id,
      })
      toast.success('Đã xóa bài tập')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

  const typeBg = lessonTypeColors[lesson?.lessonType ?? ''] ?? 'bg-muted'
  const typeLabel = lessonTypeLabels[lesson?.lessonType ?? ''] ?? lesson?.lessonType ?? '—'

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.module?.course?.title ?? 'Khóa học', href: lesson?.module?.courseId ? learningPath.course(lesson.module.courseId) : learningPath.courses() },
          { label: lesson?.module?.title ?? 'Chủ đề', href: lesson?.moduleId ? learningPath.module(lesson.moduleId) : undefined },
          { label: lesson?.title ?? 'Bài học' },
        ]}
      />

      {/* Lesson Header */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-white font-bold ${typeBg}`}>
                {typeLabel}
              </span>
              {lesson?.estimatedDuration && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium tabular-nums">{lesson.estimatedDuration} phút</span>
                </span>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground tabular-nums">#{lesson?.orderIndex ?? 0}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {lesson?.title ?? 'Bài học'}
            </h1>
            {lesson?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {lesson.description}
              </p>
            )}
          </div>
          {lessonId && lesson && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={learningPath.lessonEdit(lesson.moduleId, lessonId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LessonContentSkeleton />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : lesson && lessonId ? (
        <>
          {/* ── GIAI ĐOẠN 1 · Nội dung bài học ───────────────────────────── */}
          <section className="space-y-4">
            <StageHeader
              number={1}
              title="Nội dung bài học"
              subtitle="Soạn phần kiến thức học viên tiếp thu trước khi luyện tập. Chọn một khu vực để vào soạn."
              right={
                contentTotal > 0 ? (
                  <StagePill tone="done">
                    <Check className="h-3.5 w-3.5" />
                    {contentTotal} mục
                  </StagePill>
                ) : (
                  <StagePill tone="todo">Chưa soạn</StagePill>
                )
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LESSON_SECTIONS.map((section, idx) => (
                <SectionGateCard
                  key={section.value}
                  to={learningPath.lessonSection(lessonId, section.value)}
                  step={`1.${idx + 1}`}
                  Icon={section.Icon}
                  label={section.label}
                  hint={section.hint}
                  count={section.count(lesson)}
                />
              ))}
            </div>
          </section>

          {/* ── GIAI ĐOẠN 2 · Bài tập ────────────────────────────────────── */}
          <section className="space-y-4 pt-2">
            <StageHeader
              number={2}
              title="Bài tập"
              subtitle="Trình tự: Bước 2.1 tạo bài tập → Bước 2.2 chọn loại câu hỏi → Bước 2.3 soạn câu hỏi. Bấm vào một bài tập để đi tiếp."
              right={
                <>
                  {sortedExercises.length > 0 ? (
                    <StagePill tone="done">
                      <Check className="h-3.5 w-3.5" />
                      {sortedExercises.length} bài tập · {questionTotal} câu hỏi
                    </StagePill>
                  ) : (
                    <StagePill tone="todo">Chưa có bài tập</StagePill>
                  )}
                  <Button asChild>
                    <Link to={learningPath.exerciseNew(lessonId)}>
                      <Plus className="h-4 w-4" />
                      Thêm bài tập
                    </Link>
                  </Button>
                </>
              }
            />

            {contentTotal === 0 && (
              <div className="flex items-start gap-3 rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                <TriangleAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    Giai đoạn 1 chưa có nội dung
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
                    Theo trình tự sư phạm, nên soạn nội dung bài học trước rồi mới tạo bài tập luyện tập.
                  </p>
                </div>
              </div>
            )}

            {sortedExercises.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="text-lg font-bold mb-1">Chưa có bài tập</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tạo bài tập, sau đó chọn loại câu hỏi để soạn bên trong
                </p>
                <Button asChild>
                  <Link to={learningPath.exerciseNew(lessonId)}>
                    <Plus className="h-4 w-4" />
                    Tạo bài tập đầu tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={exercisesReorder.sensors}
                collisionDetection={closestCenter}
                onDragEnd={exercisesReorder.handleDragEnd}
              >
                <SortableContext items={sortedExercises.map((s) => s.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedExercises.map((row) => (
                      <ExerciseTile
                        key={row.id}
                        row={row}
                        onOpen={() => navigate(learningPath.exercise(row.id))}
                        onEdit={() => navigate(learningPath.exerciseEdit(lessonId, row.id))}
                        onDelete={() => setPendingDelete(row)}
                        stop={stop}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </>
      ) : null}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa bài tập?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Bài tập{' '}
              <span className="font-semibold text-foreground">
                &quot;{pendingDelete?.title}&quot;
              </span>{' '}
              cùng toàn bộ câu hỏi bên trong sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StageHeader({
  number,
  title,
  subtitle,
  right,
}: {
  number: number
  title: string
  subtitle: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold tabular-nums">
          {number}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Giai đoạn {number}
          </p>
          <h2 className="text-lg font-bold tracking-tight leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">{subtitle}</p>
        </div>
      </div>
      {right && <div className="flex items-center gap-2 shrink-0 flex-wrap">{right}</div>}
    </div>
  )
}

function StagePill({ tone, children }: { tone: 'done' | 'todo'; children: React.ReactNode }) {
  const cls =
    tone === 'done'
      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
      : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${cls}`}>
      {children}
    </span>
  )
}

function SectionGateCard({
  to,
  step,
  Icon,
  label,
  hint,
  count,
}: {
  to: string
  step: string
  Icon: React.ComponentType<{ className?: string }>
  label: string
  hint: string
  count: number
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-xl border-2 border-border bg-card p-5 transition-colors hover:border-primary focus:outline-none focus-visible:border-primary"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Bước <span className="tabular-nums">{step}</span>
        </p>
        <h3 className="text-base font-bold leading-tight mt-0.5">{label}</h3>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t-2 border-border">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold tabular-nums">{count}</span>
          <span className="text-xs font-medium text-muted-foreground">mục</span>
        </div>
        {count > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Đã soạn
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            Chưa soạn
          </span>
        )}
      </div>
    </Link>
  )
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
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
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ExerciseTile({
  row,
  onOpen,
  onEdit,
  onDelete,
  stop,
}: {
  row: Exercise
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const exerciseCount = row.questions?.length ?? 0
  const typeCounts = (row.questions ?? []).reduce<Record<string, number>>((acc, ex) => {
    const key = ex.questionType?.toLowerCase() ?? ''
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <SortableRow id={row.id}>
      {({ listeners, attributes }) => (
        <div
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onOpen()
          }}
          className="group flex flex-col gap-3 rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
        >
          <div className="flex items-start gap-3">
            <div onClick={stop} onKeyDown={stop} className="shrink-0 mt-1">
              <DragHandle {...listeners} {...attributes} />
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-foreground leading-tight line-clamp-1">
                  {row.title}
                </h3>
                {row.isAIGenerated && (
                  <span className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-950/40 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    AI tạo
                  </span>
                )}
              </div>
              {row.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {row.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic mt-1">Chưa có mô tả</p>
              )}
            </div>
            <div onClick={stop} onKeyDown={stop} className="shrink-0 -mr-1 -mt-1">
              <RowMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-border">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums text-foreground">
                {exerciseCount}
              </span>
              <span className="text-xs text-muted-foreground font-medium">câu hỏi</span>
            </div>
            {Object.keys(typeCounts).length > 0 ? (
              <div className="flex flex-wrap items-center gap-1 justify-end">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const meta = questionTypeMeta(type)
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 rounded-md border-2 border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? 'bg-muted-foreground'}`} />
                      <span className={meta?.tone ?? 'text-muted-foreground'}>
                        {meta?.label ?? type}
                      </span>
                      <span className="font-bold tabular-nums text-foreground">{count}</span>
                    </span>
                  )
                })}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Chưa có câu hỏi</span>
            )}
          </div>
        </div>
      )}
    </SortableRow>
  )
}
