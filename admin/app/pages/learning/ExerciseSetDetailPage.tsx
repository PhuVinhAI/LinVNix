import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  Plus, FileText, Trash2, Pencil, ClipboardList,
  CheckSquare, Edit3, Link2, ArrowDownUp, Languages, Headphones, Mic,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { VocabFlashcardSkeleton } from '../../components/admin/PageSkeletons'
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
import { ExerciseCard } from '../../components/learning/ExerciseCard'
import { useAdminExerciseSet, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Exercise } from '../../features/learning/types'
import { learningPath } from './route-utils'

const TYPE_META: Record<string, { Icon: LucideIcon; label: string; bg: string }> = {
  multiple_choice: { Icon: CheckSquare, label: 'Trắc nghiệm', bg: 'bg-blue-500' },
  fill_blank: { Icon: Edit3, label: 'Điền chỗ trống', bg: 'bg-emerald-500' },
  matching: { Icon: Link2, label: 'Ghép cặp', bg: 'bg-purple-500' },
  ordering: { Icon: ArrowDownUp, label: 'Sắp xếp', bg: 'bg-indigo-500' },
  translation: { Icon: Languages, label: 'Dịch', bg: 'bg-amber-500' },
  listening: { Icon: Headphones, label: 'Nghe', bg: 'bg-rose-500' },
  speaking: { Icon: Mic, label: 'Nói', bg: 'bg-cyan-500' },
}

export function ExerciseSetDetailPage() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const { data: set, isLoading, error, refetch, isFetching } = useAdminExerciseSet(setId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Exercise | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteExercise.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa bài tập')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const exercises = set?.exercises ?? []
  const typeCounts = exercises.reduce<Record<string, number>>((acc, ex) => {
    const key = (ex.exerciseType ?? '').toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const filteredExercises = exercises.filter((ex) => {
    if (typeFilter === 'all') return true
    return (ex.exerciseType ?? '').toLowerCase() === typeFilter
  })

  // Calculate average difficulty
  const avgDifficulty = exercises.length > 0
    ? exercises.reduce((sum, ex) => sum + (ex.difficultyLevel || 1), 0) / exercises.length
    : 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: set?.lesson?.module?.course?.title ?? 'Khóa học', href: set?.lesson?.module?.courseId ? learningPath.course(set.lesson.module.courseId) : learningPath.courses() },
          { label: set?.lesson?.module?.title ?? 'Chủ đề', href: set?.lesson?.moduleId ? learningPath.module(set.lesson.moduleId) : undefined },
          { label: set?.lesson?.title ?? 'Bài học', href: set?.lessonId ? learningPath.lesson(set.lessonId, 'sets') : undefined },
          { label: set?.title ?? 'Bộ bài tập' },
        ]}
      />

      {/* Header card */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Bộ bài tập</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground tabular-nums">#{set?.orderIndex ?? 0}</span>
              {set?.isAIGenerated && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                    AI tạo
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {set?.title ?? 'Bộ bài tập'}
            </h1>
            {set?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {set.description}
              </p>
            )}
          </div>
          {setId && set && (
            <div className="flex gap-2 shrink-0">
              <Button asChild variant="outline">
                <Link to={learningPath.exerciseSetEdit(set.lessonId ?? '', setId)}>
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Metric strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t-2 border-border">
          <Metric label="Tổng bài tập" value={exercises.length} />
          <Metric label="Loại bài tập" value={Object.keys(typeCounts).length} />
          <Metric
            label="Độ khó TB"
            value={avgDifficulty.toFixed(1)}
            suffix=" / 5"
          />
          <Metric
            label="Có audio"
            value={exercises.filter((ex) => ex.questionAudioUrl).length}
          />
        </div>
      </div>

      {/* Type filter */}
      {exercises.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Lọc theo loại:
          </span>
          <div className="flex items-center gap-1 rounded-lg border-2 border-border bg-card p-1 flex-wrap">
            <FilterPill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              Tất cả · {exercises.length}
            </FilterPill>
            {Object.entries(typeCounts).map(([type, count]) => {
              const meta = TYPE_META[type]
              if (!meta) return null
              return (
                <FilterPill
                  key={type}
                  active={typeFilter === type}
                  onClick={() => setTypeFilter(type)}
                >
                  <meta.Icon className="h-3 w-3 mr-1 inline" />
                  {meta.label} · {count}
                </FilterPill>
              )
            })}
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-bold tracking-tight">
            {typeFilter === 'all' ? 'Tất cả bài tập' : `Bài tập: ${TYPE_META[typeFilter]?.label}`}
          </h2>
          {setId && (
            <Button asChild>
              <Link to={learningPath.exerciseNew(setId)}>
                <Plus className="h-4 w-4" />
                Thêm bài tập
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <VocabFlashcardSkeleton count={6} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error)}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        ) : exercises.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có bài tập nào</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bắt đầu tạo bài tập đầu tiên cho bộ này
            </p>
            {setId && (
              <Button asChild>
                <Link to={learningPath.exerciseNew(setId)}>
                  <Plus className="h-4 w-4" />
                  Tạo bài tập đầu tiên
                </Link>
              </Button>
            )}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">Không có bài tập loại này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => navigate(learningPath.exerciseEdit(exercise.setId, exercise.id))}
                onEdit={() => navigate(learningPath.exerciseEdit(exercise.setId, exercise.id))}
                onDelete={() => setPendingDelete(exercise)}
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
              <AlertDialogTitle>Xóa bài tập?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Bài tập <span className="font-semibold text-foreground">&quot;{pendingDelete?.question}&quot;</span> và toàn bộ kết quả làm bài của học viên cho bài tập này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa bài tập
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Metric({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-lg border-2 border-border bg-muted/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}
