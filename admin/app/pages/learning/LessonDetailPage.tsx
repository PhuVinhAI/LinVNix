import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
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
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { ExerciseSet } from '../../features/learning/types'
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

const LESSON_TABS = ['contents', 'vocabularies', 'grammar', 'sets'] as const

export function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: lesson, isLoading, error, refetch, isFetching } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null)

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
            <AdminTabTrigger value="sets" icon={ClipboardList} label="Bộ bài tập" count={lesson.exerciseSets?.length ?? 0} />
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

          {/* SETS — clickable stat tiles (unchanged) */}
          <TabsContent value="sets" className="mt-4 space-y-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Bộ bài tập</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Mỗi bộ chứa nhiều bài tập cùng chủ đề.</p>
              </div>
              <Button asChild>
                <Link to={learningPath.exerciseSetNew(lessonId)}>
                  <Plus className="h-4 w-4" />
                  Thêm bộ bài tập
                </Link>
              </Button>
            </div>
            {(lesson.exerciseSets?.length ?? 0) === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="text-lg font-bold mb-1">Chưa có bộ bài tập</h3>
                <p className="text-sm text-muted-foreground mb-4">Tạo bộ bài tập đầu tiên cho bài học này</p>
                <Button asChild>
                  <Link to={learningPath.exerciseSetNew(lessonId)}>
                    <Plus className="h-4 w-4" />
                    Tạo bộ bài tập đầu tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(lesson.exerciseSets ?? []).map((row) => (
                  <ExerciseSetTile
                    key={row.id}
                    row={row}
                    onOpen={() => navigate(learningPath.exerciseSet(row.id))}
                    onEdit={() => navigate(learningPath.exerciseSetEdit(lessonId, row.id))}
                    onDelete={() =>
                      setPendingDelete({
                        kind: 'exercise-sets',
                        id: row.id,
                        label: row.title,
                        resource: 'bộ bài tập',
                      })
                    }
                    stop={stop}
                  />
                ))}
              </div>
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

function ExerciseSetTile({
  row,
  onOpen,
  onEdit,
  onDelete,
  stop,
}: {
  row: ExerciseSet
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const exerciseCount = row.exercises?.length ?? 0
  const typeCounts = (row.exercises ?? []).reduce<Record<string, number>>((acc, ex) => {
    const key = ex.exerciseType?.toLowerCase() ?? ''
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
      className="group rounded-lg border-2 border-border bg-card overflow-hidden cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground tabular-nums">#{row.orderIndex}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-bold tabular-nums">{exerciseCount}</span>
          <span className="text-muted-foreground">bài tập</span>
        </div>
        <div onClick={stop} onKeyDown={stop}>
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground line-clamp-1">{row.title}</h3>
        {row.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{row.description}</p>
        )}
        {Object.keys(typeCounts).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
            {Object.entries(typeCounts).map(([type, count]) => {
              const labels: Record<string, string> = {
                multiple_choice: 'Trắc nghiệm',
                fill_blank: 'Điền',
                matching: 'Ghép',
                ordering: 'Sắp xếp',
                translation: 'Dịch',
                listening: 'Nghe',
                speaking: 'Nói',
              }
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {labels[type] ?? type}
                  <span className="font-bold tabular-nums">{count}</span>
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
