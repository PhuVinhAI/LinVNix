import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import {
  Plus, FileText, Trash2, Pencil, ClipboardList, Hash, Layers, Gauge, Volume2,
  CheckSquare, Edit3, Link2, ArrowDownUp, Languages, Headphones, Mic,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminListReorder } from '../../components/admin/hooks/use-admin-list-reorder'
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
import { QuestionCard } from '../../components/learning/QuestionCard'
import { useAdminExercise, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Exercise, Question } from '../../features/learning/types'
import { learningPath } from './route-utils'

const TYPE_META: Record<string, { Icon: LucideIcon; label: string; bg: string; dot: string; text: string }> = {
  multiple_choice: { Icon: CheckSquare, label: 'Trắc nghiệm', bg: 'bg-blue-500', dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  fill_blank: { Icon: Edit3, label: 'Điền chỗ trống', bg: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  matching: { Icon: Link2, label: 'Ghép cặp', bg: 'bg-purple-500', dot: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  ordering: { Icon: ArrowDownUp, label: 'Sắp xếp', bg: 'bg-indigo-500', dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  translation: { Icon: Languages, label: 'Dịch', bg: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  listening: { Icon: Headphones, label: 'Nghe', bg: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' },
  speaking: { Icon: Mic, label: 'Nói', bg: 'bg-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300' },
}

export function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: exercise, isLoading, error, refetch, isFetching } = useAdminExercise(exerciseId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Question | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const exerciseKey = ['admin-learning', 'exercise', exerciseId] as const
  const { sensors, handleDragEnd } = useAdminListReorder<Question>({
    getItems: () => qc.getQueryData<Exercise>(exerciseKey)?.questions ?? [],
    setItems: (next) =>
      qc.setQueryData<Exercise>(exerciseKey, (prev) =>
        prev ? { ...prev, questions: next } : prev,
      ),
    reorder: (items) => mutations.reorderQuestions.mutateAsync(items),
    onError: () => toast.error('Không thể sắp xếp lại câu hỏi'),
  })

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteQuestion.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa câu hỏi')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const questions = exercise?.questions ?? []
  const typeCounts = questions.reduce<Record<string, number>>((acc, q) => {
    const key = (q.questionType ?? '').toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const sortedQuestions = [...questions].sort((a, b) => a.orderIndex - b.orderIndex)
  const filteredQuestions = sortedQuestions.filter((q) => {
    if (typeFilter === 'all') return true
    return (q.questionType ?? '').toLowerCase() === typeFilter
  })
  const canReorder = typeFilter === 'all'

  const avgDifficulty = questions.length > 0
    ? questions.reduce((sum, q) => sum + (q.difficultyLevel || 1), 0) / questions.length
    : 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: exercise?.lesson?.module?.course?.title ?? 'Khóa học', href: exercise?.lesson?.module?.courseId ? learningPath.course(exercise.lesson.module.courseId) : learningPath.courses() },
          { label: exercise?.lesson?.module?.title ?? 'Chủ đề', href: exercise?.lesson?.moduleId ? learningPath.module(exercise.lesson.moduleId) : undefined },
          { label: exercise?.lesson?.title ?? 'Bài học', href: exercise?.lessonId ? learningPath.lesson(exercise.lessonId, 'exercises') : undefined },
          { label: exercise?.title ?? 'Bài tập' },
        ]}
      />

      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Bài tập</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground tabular-nums">#{exercise?.orderIndex ?? 0}</span>
              {exercise?.isAIGenerated && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                    AI tạo
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {exercise?.title ?? 'Bài tập'}
            </h1>
            {exercise?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {exercise.description}
              </p>
            )}
          </div>
          {exerciseId && exercise && (
            <div className="flex gap-2 shrink-0">
              <Button asChild variant="outline">
                <Link to={learningPath.exerciseEdit(exercise.lessonId ?? '', exerciseId)}>
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t-2 border-border">
          <Metric icon={Hash} label="Tổng câu hỏi" value={questions.length} />
          <Metric icon={Layers} label="Loại câu hỏi" value={Object.keys(typeCounts).length} />
          <Metric
            icon={Gauge}
            label="Độ khó TB"
            value={avgDifficulty.toFixed(1)}
            suffix=" / 5"
          />
          <Metric
            icon={Volume2}
            label="Có audio"
            value={questions.filter((q) => q.questionAudioUrl).length}
          />
        </div>
      </div>

      {questions.length > 0 && (
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border-2 border-border bg-card p-1 flex-wrap w-fit">
          <FilterPill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            <span>Tất cả</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
              typeFilter === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground'
            }`}>
              {questions.length}
            </span>
          </FilterPill>
          {Object.entries(typeCounts).map(([type, count]) => {
            const meta = TYPE_META[type]
            if (!meta) return null
            const active = typeFilter === type
            return (
              <FilterPill key={type} active={active} onClick={() => setTypeFilter(type)}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                <span>{meta.label}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  {count}
                </span>
              </FilterPill>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold tracking-tight">
              {typeFilter === 'all' ? 'Tất cả câu hỏi' : `Câu hỏi: ${TYPE_META[typeFilter]?.label}`}
            </h2>
            <span className="text-sm font-bold tabular-nums text-muted-foreground">
              {filteredQuestions.length}
            </span>
          </div>
          {exerciseId && (
            <Button asChild>
              <Link to={learningPath.questionNew(exerciseId)}>
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
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
        ) : questions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có câu hỏi nào</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bắt đầu tạo câu hỏi đầu tiên cho bài tập này
            </p>
            {exerciseId && (
              <Button asChild>
                <Link to={learningPath.questionNew(exerciseId)}>
                  <Plus className="h-4 w-4" />
                  Tạo câu hỏi đầu tiên
                </Link>
              </Button>
            )}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">Không có câu hỏi loại này</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={filteredQuestions.map((q) => q.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    sortable={canReorder}
                    onClick={() => navigate(learningPath.questionEdit(question.exerciseId, question.id))}
                    onEdit={() => navigate(learningPath.questionEdit(question.exerciseId, question.id))}
                    onDelete={() => setPendingDelete(question)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Câu hỏi <span className="font-semibold text-foreground">&quot;{questionLabel(pendingDelete)}&quot;</span> và toàn bộ kết quả làm bài của học viên cho câu hỏi này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa câu hỏi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Metric({ icon: Icon, label, value, suffix }: { icon: LucideIcon; label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-lg border-2 border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}

function questionLabel(question: Question | null): string {
  if (!question) return ''
  if (question.question && question.question.trim()) return question.question
  const opts = question.options as Record<string, unknown> | null | undefined
  if (opts) {
    if (typeof opts.sentence === 'string' && opts.sentence) return opts.sentence
    if (typeof opts.sourceText === 'string' && opts.sourceText) return opts.sourceText
    if (Array.isArray(opts.pairs) && opts.pairs.length > 0) {
      const first = opts.pairs[0] as { left?: string; right?: string }
      return `${first.left ?? ''} ↔ ${first.right ?? ''}`
    }
  }
  return question.questionType ?? 'Câu hỏi'
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}
