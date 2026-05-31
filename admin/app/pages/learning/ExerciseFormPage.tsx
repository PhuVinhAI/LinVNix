import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { ResourceForm } from '../../components/admin/ResourceForm'
import { ExercisePreview } from '../../components/learning/ExercisePreview'
import { exerciseFields } from '../../features/learning/types/forms'
import { useAdminExerciseSet, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import { learningPath } from './route-utils'

export function ExerciseFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { setId, id } = useParams()
  const navigate = useNavigate()
  const { data: set } = useAdminExerciseSet(setId)
  const exercise = set?.exercises?.find((item) => item.id === id)
  const mutations = useLearningAdminMutation()

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  const [previewData, setPreviewData] = useState({
    exerciseType: exercise?.exerciseType || 'MULTIPLE_CHOICE',
    question: exercise?.question || '',
    options: exercise?.options || [],
    correctAnswer: exercise?.correctAnswer || '',
    difficultyLevel: exercise?.difficultyLevel || 'BEGINNER',
  })

  const submit = async (payload: Record<string, unknown>) => {
    try {
      if (mode === 'edit' && id) {
        await mutations.updateExercise.mutateAsync({ id, payload })
        toast.success('Đã cập nhật bài tập')
      } else if (setId) {
        await mutations.createExercise.mutateAsync({ setId, payload })
        toast.success('Đã tạo bài tập')
      }
      if (setId) navigate(learningPath.exerciseSet(setId))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu')
    }
  }

  const backPath = setId ? learningPath.exerciseSet(setId) : learningPath.courses()

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: set?.lesson?.title ?? 'Bài học', href: set?.lessonId ? learningPath.lesson(set.lessonId) : undefined },
          { label: set?.title ?? 'Bộ bài tập', href: setId ? learningPath.exerciseSet(setId) : undefined },
          { label: mode === 'edit' ? 'Sửa bài tập' : 'Thêm bài tập' },
        ]}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 mt-0.5">
            <Link to={backPath}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === 'edit' ? 'Sửa bài tập' : 'Tạo bài tập mới'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 truncate">
              {set?.title ? `Trong bộ "${set.title}"` : 'Bộ bài tập'}
            </p>
          </div>
        </div>

        {/* Edit / Preview toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === 'edit'
                ? 'bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            Sửa
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === 'preview'
                ? 'bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Xem trước
          </button>
        </div>
      </div>

      {viewMode === 'edit' ? (
        <ResourceForm
          id="exercise-form"
          fields={exerciseFields}
          initialValue={exercise as Record<string, unknown> | undefined}
          onSubmit={submit}
          hideSubmit
          onChange={(data) => {
            setPreviewData({
              exerciseType: data.exerciseType as string || 'MULTIPLE_CHOICE',
              question: data.question as string || '',
              options: data.options as string[] || [],
              correctAnswer: data.correctAnswer as string || '',
              difficultyLevel: data.difficultyLevel as string || 'BEGINNER',
            })
          }}
        />
      ) : (
        <ExercisePreview {...previewData} />
      )}

      <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-border">
        <Button asChild variant="ghost">
          <Link to={backPath}>Hủy</Link>
        </Button>
        <Button type="submit" form="exercise-form">
          <Save className="h-4 w-4" />
          {mode === 'edit' ? 'Cập nhật' : 'Tạo bài tập'}
        </Button>
      </div>
    </div>
  )
}
