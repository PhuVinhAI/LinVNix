import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  Pencil, ClipboardList, Hash, Layers, Gauge, Volume2, ChevronRight, ListOrdered, Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { WizardSteps, type WizardStep } from '../../components/admin/WizardSteps'
import { useAdminListReorder } from '../../components/admin/hooks/use-admin-list-reorder'
import { DragHandle } from '../../components/admin/shared/DragHandle'
import { SortableRow } from '../../components/admin/shared/SortableRow'
import { VocabFlashcardSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import { useAdminExercise, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Exercise, Question } from '../../features/learning/types'
import { QUESTION_TYPES, questionLabel, questionTypeMeta } from './authoring-meta'
import { learningPath } from './route-utils'

/**
 * Hub Giai đoạn 2 của một Bài tập: chọn loại câu hỏi (Khu soạn) rồi mới vào tạo/quản lý
 * câu hỏi của loại đó (ADR 0002). Thứ tự toàn bài tập quản lý ở khu "Thứ tự câu hỏi".
 */
export function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: exercise, isLoading, error, refetch, isFetching } = useAdminExercise(exerciseId)
  const mutations = useLearningAdminMutation()

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

  const questions = exercise?.questions ?? []
  const typeCounts = questions.reduce<Record<string, number>>((acc, q) => {
    const key = (q.questionType ?? '').toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const sortedQuestions = [...questions].sort((a, b) => a.orderIndex - b.orderIndex)

  const avgDifficulty = questions.length > 0
    ? questions.reduce((sum, q) => sum + (q.difficultyLevel || 1), 0) / questions.length
    : 0

  const steps: WizardStep[] = [
    {
      key: 'exercise',
      number: '2.1',
      label: 'Bài tập',
      state: 'done',
      to: exercise?.lessonId ? learningPath.lesson(exercise.lessonId) : undefined,
    },
    { key: 'pick-type', number: '2.2', label: 'Chọn loại câu hỏi', state: 'current' },
    { key: 'compose', number: '2.3', label: 'Soạn câu hỏi', state: 'upcoming', locked: true },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: exercise?.lesson?.module?.course?.title ?? 'Khóa học', href: exercise?.lesson?.module?.courseId ? learningPath.course(exercise.lesson.module.courseId) : learningPath.courses() },
          { label: exercise?.lesson?.module?.title ?? 'Chủ đề', href: exercise?.lesson?.moduleId ? learningPath.module(exercise.lesson.moduleId) : undefined },
          { label: exercise?.lesson?.title ?? 'Bài học', href: exercise?.lessonId ? learningPath.lesson(exercise.lessonId) : undefined },
          { label: exercise?.title ?? 'Bài tập' },
        ]}
      />

      <WizardSteps steps={steps} />

      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">
                Giai đoạn 2 · Bài tập
              </span>
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
          <Metric icon={Layers} label="Loại đã dùng" value={Object.keys(typeCounts).length} />
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

      {isLoading ? (
        <VocabFlashcardSkeleton count={6} />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : exerciseId ? (
        <>
          {/* ── Cổng loại câu hỏi ────────────────────────────────────────── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Bước <span className="tabular-nums">2.2</span> · Chọn loại câu hỏi để soạn
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Mỗi loại có khu soạn riêng — chọn loại để mở khóa Bước 2.3 và tạo/quản lý câu hỏi của loại đó.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {QUESTION_TYPES.map((type) => {
                const count = typeCounts[type.value] ?? 0
                return (
                  <Link
                    key={type.value}
                    to={learningPath.exerciseType(exerciseId, type.value)}
                    className="group flex flex-col gap-3 rounded-xl border-2 border-border bg-card p-4 transition-colors hover:border-primary focus:outline-none focus-visible:border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${type.bg}`}>
                        <type.Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold leading-tight">{type.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{type.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                      {count > 0 ? (
                        <span className="text-sm font-bold tabular-nums">
                          {count} <span className="text-xs font-medium text-muted-foreground">câu hỏi</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Chưa có câu hỏi</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus className="h-3.5 w-3.5" />
                        Vào soạn
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* ── Thứ tự câu hỏi khi làm bài ───────────────────────────────── */}
          {sortedQuestions.length > 1 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-bold tracking-tight">Thứ tự câu hỏi khi làm bài</h2>
                <span className="text-sm font-bold tabular-nums text-muted-foreground">
                  {sortedQuestions.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground -mt-1">
                Kéo thả để sắp xếp trình tự học viên gặp các câu hỏi (xuyên suốt mọi loại).
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={sortedQuestions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="rounded-xl border-2 border-border bg-card divide-y-2 divide-border overflow-hidden">
                    {sortedQuestions.map((question, idx) => (
                      <OrderRow
                        key={question.id}
                        question={question}
                        index={idx}
                        onOpen={() => navigate(learningPath.questionEdit(question.exerciseId, question.id))}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </section>
          )}
        </>
      ) : null}
    </div>
  )
}

function OrderRow({
  question,
  index,
  onOpen,
}: {
  question: Question
  index: number
  onOpen: () => void
}) {
  const meta = questionTypeMeta(question.questionType)
  return (
    <SortableRow id={question.id}>
      {({ listeners, attributes }) => (
        <div
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onOpen()
          }}
          className="flex items-center gap-3 bg-card px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/40"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DragHandle {...listeners} {...attributes} />
          </div>
          <span className="w-7 shrink-0 text-center text-sm font-bold tabular-nums text-muted-foreground">
            {index + 1}
          </span>
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta?.dot ?? 'bg-muted-foreground'}`} />
          <span className="flex-1 min-w-0 truncate text-sm font-semibold">
            {questionLabel(question)}
          </span>
          <span className={`shrink-0 text-xs font-bold ${meta?.tone ?? 'text-muted-foreground'}`}>
            {meta?.label ?? question.questionType}
          </span>
        </div>
      )}
    </SortableRow>
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
