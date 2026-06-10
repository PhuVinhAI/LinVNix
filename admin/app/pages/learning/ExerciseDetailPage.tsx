import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { VocabFlashcardSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import { useAdminExercise } from '../../features/learning/api/use-learning-admin'
import { QUESTION_TYPES } from './authoring-meta'
import { GateCard } from './authoring-ui'
import { learningPath } from './route-utils'

/**
 * Trang bài tập — màn hình này chỉ làm MỘT việc: chọn loại câu hỏi.
 * Chọn xong mới vào khu soạn của loại đó (ADR 0002).
 */
export function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  const { data: exercise, isLoading, error, refetch, isFetching } = useAdminExercise(exerciseId)

  const questions = exercise?.questions ?? []
  const typeCounts = questions.reduce<Record<string, number>>((acc, q) => {
    const key = (q.questionType ?? '').toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const backPath = exercise?.lessonId
    ? learningPath.lessonStageExercises(exercise.lessonId)
    : learningPath.courses()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: exercise?.lesson?.title ?? 'Bài học', href: exercise?.lessonId ? learningPath.lesson(exercise.lessonId) : undefined },
          { label: 'Bài tập', href: exercise?.lessonId ? learningPath.lessonStageExercises(exercise.lessonId) : undefined },
          { label: exercise?.title ?? 'Bài tập' },
        ]}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {exercise?.title ?? 'Bài tập'}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Chọn loại câu hỏi</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Mỗi loại có không gian soạn riêng — chọn loại để tạo và quản lý câu hỏi của loại đó.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline">
            <Link to={backPath}>
              <ArrowLeft className="h-4 w-4" />
              Chọn bài tập khác
            </Link>
          </Button>
          {exerciseId && exercise && (
            <Button asChild variant="outline">
              <Link to={learningPath.exerciseEdit(exercise.lessonId ?? '', exerciseId)}>
                <Pencil className="h-4 w-4" />
                Sửa thông tin
              </Link>
            </Button>
          )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {QUESTION_TYPES.map((type) => (
            <GateCard
              key={type.value}
              to={learningPath.exerciseType(exerciseId, type.value)}
              Icon={type.Icon}
              iconClass={`${type.bg} text-white`}
              label={type.label}
              description={type.description}
              count={typeCounts[type.value] ?? 0}
              countLabel="câu hỏi"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
