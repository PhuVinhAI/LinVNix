import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Volume2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { VocabFlashcardSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import { useAdminExercise, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Question } from '../../features/learning/types'
import { questionLabel, questionTypeMeta } from './authoring-meta'
import { ConfirmDeleteDialog, DIFFICULTY_LABELS, ItemRow } from './authoring-ui'
import { learningPath } from './route-utils'

/**
 * Khu soạn của MỘT loại câu hỏi. Màn hình này chỉ làm một việc:
 * chọn câu hỏi của loại này để mở form soạn riêng (loại đã khóa), hoặc thêm mới.
 */
export function ExerciseTypePage() {
  const { exerciseId, questionType } = useParams()
  const navigate = useNavigate()
  const { data: exercise, isLoading, error, refetch, isFetching } = useAdminExercise(exerciseId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Question | null>(null)

  const meta = questionTypeMeta(questionType)
  if (!exerciseId) return <Navigate to={learningPath.courses()} replace />
  if (!meta) return <Navigate to={learningPath.exercise(exerciseId)} replace />

  const questions = (exercise?.questions ?? [])
    .filter((q) => (q.questionType ?? '').toLowerCase() === meta.value)
    .sort((a, b) => a.orderIndex - b.orderIndex)

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

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: exercise?.lesson?.title ?? 'Bài học', href: exercise?.lessonId ? learningPath.lesson(exercise.lessonId) : undefined },
          { label: exercise?.title ?? 'Bài tập', href: learningPath.exercise(exerciseId) },
          { label: meta.label },
        ]}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${meta.bg}`}>
            <meta.Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {exercise?.title ?? 'Bài tập'}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{meta.label}</h1>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">
                {questions.length} câu hỏi
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline">
            <Link to={learningPath.exercise(exerciseId)}>
              <ArrowLeft className="h-4 w-4" />
              Chọn loại khác
            </Link>
          </Button>
          <Button asChild>
            <Link to={learningPath.questionNew(exerciseId, meta.value)}>
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <VocabFlashcardSkeleton count={4} />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <meta.Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-lg font-bold mb-1">Chưa có câu hỏi {meta.label.toLowerCase()}</h3>
          <p className="text-sm text-muted-foreground mb-4">{meta.description}</p>
          <Button asChild>
            <Link to={learningPath.questionNew(exerciseId, meta.value)}>
              <Plus className="h-4 w-4" />
              Tạo câu hỏi đầu tiên
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-border bg-card divide-y-2 divide-border overflow-hidden">
          {questions.map((question, idx) => {
            const level = Math.min(5, Math.max(1, question.difficultyLevel || 1))
            return (
              <ItemRow
                key={question.id}
                onOpen={() => navigate(learningPath.questionEdit(question.exerciseId, question.id))}
                onDelete={() => setPendingDelete(question)}
                leading={
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                }
                title={questionLabel(question)}
                meta={
                  <span className="inline-flex items-center gap-2">
                    <span>{DIFFICULTY_LABELS[level]}</span>
                    {question.questionAudioUrl && (
                      <span className="inline-flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        audio
                      </span>
                    )}
                  </span>
                }
              />
            )
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resource="câu hỏi"
        label={questionLabel(pendingDelete)}
        extraWarning="và toàn bộ kết quả làm bài của học viên cho câu hỏi này"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
