import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
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

export function ExerciseSetDetailPage() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const { data: set, isLoading, error } = useAdminExerciseSet(setId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Exercise | null>(null)

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
  const counts = {
    multipleChoice: exercises.filter(e => e.exerciseType === 'MULTIPLE_CHOICE').length,
    fillInBlank: exercises.filter(e => e.exerciseType === 'FILL_IN_BLANK').length,
    other: exercises.filter(e => !['MULTIPLE_CHOICE', 'FILL_IN_BLANK'].includes(e.exerciseType)).length,
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: set?.lesson?.module?.course?.title ?? 'Khóa học', href: set?.lesson?.module?.courseId ? learningPath.course(set.lesson.module.courseId) : learningPath.courses() },
          { label: set?.lesson?.module?.title ?? 'Chủ đề', href: set?.lesson?.moduleId ? learningPath.module(set.lesson.moduleId) : undefined },
          { label: set?.lesson?.title ?? 'Bài học', href: set?.lessonId ? learningPath.lesson(set.lessonId) : undefined },
          { label: set?.title ?? 'Bộ bài tập' },
        ]}
      />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground">BỘ BÀI TẬP</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">#{set?.orderIndex ?? 0}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {set?.title ?? 'Bộ bài tập'}
            </h1>
            {set?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {set.description}
              </p>
            )}
          </div>
          {setId && (
            <Button asChild>
              <Link to={learningPath.exerciseNew(setId)}>
                <Plus className="h-4 w-4" />
                Thêm bài tập
              </Link>
            </Button>
          )}
        </div>

        {/* Stats inline */}
        <div className="flex items-center gap-6 flex-wrap pt-2 border-t-2 border-border">
          <Stat label="Tổng" value={exercises.length} accent="default" />
          <Stat label="Trắc nghiệm" value={counts.multipleChoice} accent="blue" />
          <Stat label="Điền chỗ trống" value={counts.fillInBlank} accent="emerald" />
          {counts.other > 0 && <Stat label="Khác" value={counts.other} accent="purple" />}
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            <p className="mt-3 text-sm text-muted-foreground">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive font-semibold">
              {error instanceof Error ? error.message : 'Không tải được dữ liệu'}
            </p>
          </div>
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {exercises.map((exercise) => (
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'default' | 'blue' | 'emerald' | 'purple'
}) {
  const accentClasses = {
    default: 'text-foreground',
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="flex items-center gap-2 pt-4">
      <span className={`text-sm font-bold tabular-nums ${accentClasses[accent]}`}>{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
