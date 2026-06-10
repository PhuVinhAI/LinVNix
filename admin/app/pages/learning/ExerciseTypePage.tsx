import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { WizardSteps, type WizardStep } from '../../components/admin/WizardSteps'
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
import type { Question } from '../../features/learning/types'
import { questionLabel, questionTypeMeta } from './authoring-meta'
import { learningPath } from './route-utils'

/**
 * Khu soạn của một loại câu hỏi trong Bài tập (Giai đoạn 2). Loại được chọn ở cổng —
 * chỉ ở đây mới tạo/sửa/xóa câu hỏi của loại đó; form câu hỏi khóa loại (ADR 0002).
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

  const steps: WizardStep[] = [
    {
      key: 'exercise',
      number: '2.1',
      label: 'Bài tập',
      state: 'done',
      to: exercise?.lessonId ? learningPath.lesson(exercise.lessonId) : undefined,
    },
    {
      key: 'pick-type',
      number: '2.2',
      label: `Loại: ${meta.label}`,
      state: 'done',
      to: learningPath.exercise(exerciseId),
    },
    { key: 'compose', number: '2.3', label: 'Soạn câu hỏi', state: 'current' },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: exercise?.lesson?.title ?? 'Bài học', href: exercise?.lessonId ? learningPath.lesson(exercise.lessonId) : undefined },
          { label: exercise?.title ?? 'Bài tập', href: learningPath.exercise(exerciseId) },
          { label: meta.label },
        ]}
      />

      <WizardSteps steps={steps} />

      {/* Header Khu soạn */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${meta.bg}`}>
              <meta.Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Giai đoạn 2 · Bước <span className="tabular-nums">2.3</span> · {exercise?.title ?? 'Bài tập'}
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
                Về bài tập
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
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onClick={() => navigate(learningPath.questionEdit(question.exerciseId, question.id))}
              onEdit={() => navigate(learningPath.questionEdit(question.exerciseId, question.id))}
              onDelete={() => setPendingDelete(question)}
            />
          ))}
        </div>
      )}

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
