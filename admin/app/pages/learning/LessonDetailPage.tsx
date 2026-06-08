import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import {
  Plus,
  Pencil,
  FileText,
  BookMarked,
  Lightbulb,
  ClipboardList,
  Clock,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent } from '../../components/ui/tabs'
import { AdminTabsList, AdminTabTrigger } from '../../components/admin/AdminTabs'
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
import { VocabularyEditor } from '../../components/admin/lesson-editors/VocabularyEditor'
import { ContentEditor } from '../../components/admin/lesson-editors/ContentEditor'
import { GrammarEditor } from '../../components/admin/lesson-editors/GrammarEditor'
import { DragHandle } from '../../components/admin/shared/DragHandle'
import { SortableRow } from '../../components/admin/shared/SortableRow'
import { useAdminListReorder } from '../../components/admin/hooks/use-admin-list-reorder'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Exercise, Lesson } from '../../features/learning/types'
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

type DeleteTarget = {
  kind: string
  id: string
  label: string
  resource: string
}

const LESSON_TABS = ['contents', 'vocabularies', 'grammar', 'exercises'] as const

export function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: lesson, isLoading, error, refetch, isFetching } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null)

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

  const tabParam = searchParams.get('tab') ?? ''
  const activeTab = (LESSON_TABS as readonly string[]).includes(tabParam) ? tabParam : 'contents'
  const handleTabChange = (next: string) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next === 'contents') params.delete('tab')
        else params.set('tab', next)
        return params
      },
      { replace: true },
    )
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLessonChild.mutateAsync({
        kind: pendingDelete.kind,
        id: pendingDelete.id,
      })
      toast.success(`Đã xóa ${pendingDelete.resource}`)
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <AdminTabsList>
            <AdminTabTrigger value="contents" icon={FileText} label="Nội dung" count={lesson.contents?.length ?? 0} />
            <AdminTabTrigger value="vocabularies" icon={BookMarked} label="Từ vựng" count={lesson.vocabularies?.length ?? 0} />
            <AdminTabTrigger value="grammar" icon={Lightbulb} label="Ngữ pháp" count={lesson.grammarRules?.length ?? 0} />
            <AdminTabTrigger value="exercises" icon={ClipboardList} label="Bài tập" count={lesson.exercises?.length ?? 0} />
          </AdminTabsList>

          {/* CONTENTS — inline visual editor */}
          <TabsContent value="contents" className="mt-4">
            <ContentEditor lessonId={lessonId} />
          </TabsContent>

          {/* VOCABULARIES — spreadsheet editor */}
          <TabsContent value="vocabularies" className="mt-4">
            <VocabularyEditor lessonId={lessonId} />
          </TabsContent>

          {/* GRAMMAR — expandable inline editor */}
          <TabsContent value="grammar" className="mt-4">
            <GrammarEditor lessonId={lessonId} />
          </TabsContent>

          {/* EXERCISES — clickable stat tiles */}
          <TabsContent value="exercises" className="mt-4 space-y-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-bold tracking-tight">Bài tập</h2>
                  <span className="text-sm font-bold tabular-nums text-muted-foreground">
                    {lesson.exercises?.length ?? 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Mỗi bài tập chứa nhiều câu hỏi cùng chủ đề.</p>
              </div>
              <Button asChild>
                <Link to={learningPath.exerciseNew(lessonId)}>
                  <Plus className="h-4 w-4" />
                  Thêm bài tập
                </Link>
              </Button>
            </div>
            {(lesson.exercises?.length ?? 0) === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="text-lg font-bold mb-1">Chưa có bài tập</h3>
                <p className="text-sm text-muted-foreground mb-4">Tạo bài tập đầu tiên cho bài học này</p>
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
                        onDelete={() =>
                          setPendingDelete({
                            kind: 'exercises',
                            id: row.id,
                            label: row.title,
                            resource: 'bài tập',
                          })
                        }
                        stop={stop}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
        </Tabs>
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
              <AlertDialogTitle>Xóa {pendingDelete?.resource}?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {pendingDelete?.resource && (
                <>
                  {pendingDelete.resource.charAt(0).toUpperCase() + pendingDelete.resource.slice(1)}{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{pendingDelete?.label}&quot;
                  </span>{' '}
                  sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                </>
              )}
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

const EXERCISE_TYPE_META: Record<string, { label: string; dot: string; text: string }> = {
  multiple_choice: { label: 'Trắc nghiệm', dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  fill_blank: { label: 'Điền', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  matching: { label: 'Ghép', dot: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  ordering: { label: 'Sắp xếp', dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  translation: { label: 'Dịch', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  listening: { label: 'Nghe', dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' },
  speaking: { label: 'Nói', dot: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300' },
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
                  const meta = EXERCISE_TYPE_META[type]
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 rounded-md border-2 border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? 'bg-muted-foreground'}`} />
                      <span className={meta?.text ?? 'text-muted-foreground'}>
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
