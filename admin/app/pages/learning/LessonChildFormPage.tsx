import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { ContentForm } from '../../components/admin/forms/ContentForm'
import { VocabularyForm } from '../../components/admin/forms/VocabularyForm'
import { GrammarForm } from '../../components/admin/forms/GrammarForm'
import { ExerciseSetForm } from '../../components/admin/forms/ExerciseSetForm'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import { learningPath } from './route-utils'

type ChildKind = 'contents' | 'vocabularies' | 'grammar' | 'exercise-sets'

const childMeta: Record<ChildKind, { title: string }> = {
  contents: { title: 'nội dung' },
  vocabularies: { title: 'từ vựng' },
  grammar: { title: 'ngữ pháp' },
  'exercise-sets': { title: 'bộ bài tập' },
}

export function LessonChildFormPage({ kind, mode }: { kind: ChildKind; mode: 'create' | 'edit' }) {
  const { lessonId, id } = useParams()
  const navigate = useNavigate()
  const meta = childMeta[kind]
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()

  const initialValue =
    kind === 'contents'
      ? lesson?.contents?.find((item) => item.id === id)
      : kind === 'vocabularies'
        ? lesson?.vocabularies?.find((item) => item.id === id)
        : kind === 'grammar'
          ? lesson?.grammarRules?.find((item) => item.id === id)
          : lesson?.exerciseSets?.find((item) => item.id === id)

  const submit = async (payload: Record<string, unknown>) => {
    try {
      if (mode === 'edit' && id) {
        await mutations.updateLessonChild.mutateAsync({ kind, id, payload })
        toast.success('Đã cập nhật')
      } else if (lessonId) {
        await mutations.createLessonChild.mutateAsync({ kind, lessonId, payload })
        toast.success('Đã tạo mới')
      }
      if (lessonId) navigate(learningPath.lesson(lessonId))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu')
    }
  }

  const backPath = lessonId ? learningPath.lesson(lessonId) : learningPath.courses()
  const titleAction = mode === 'edit' ? 'Sửa' : 'Tạo mới'

  const handleSubmit = (values: unknown) => submit(values as Record<string, unknown>)

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.module?.course?.title ?? 'Khóa học', href: lesson?.module?.courseId ? learningPath.course(lesson.module.courseId) : learningPath.courses() },
          { label: lesson?.module?.title ?? 'Chủ đề', href: lesson?.moduleId ? learningPath.module(lesson.moduleId) : undefined },
          { label: lesson?.title ?? 'Bài học', href: lessonId ? learningPath.lesson(lessonId) : undefined },
          { label: `${titleAction} ${meta.title}` },
        ]}
      />

      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-10 w-10 mt-0.5">
          <Link to={backPath}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {titleAction} {meta.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {lesson?.title ? `Trong bài học "${lesson.title}"` : 'Điền thông tin để tiếp tục'}
          </p>
        </div>
      </div>

      {kind === 'contents' && (
        <ContentForm
          id="child-form"
          initialValue={initialValue as never}
          onSubmit={handleSubmit}
        />
      )}
      {kind === 'vocabularies' && (
        <VocabularyForm
          id="child-form"
          initialValue={initialValue as never}
          onSubmit={handleSubmit}
        />
      )}
      {kind === 'grammar' && (
        <GrammarForm
          id="child-form"
          initialValue={initialValue as never}
          onSubmit={handleSubmit}
        />
      )}
      {kind === 'exercise-sets' && (
        <ExerciseSetForm
          id="child-form"
          initialValue={initialValue as never}
          onSubmit={handleSubmit}
        />
      )}

      <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-border">
        <Button asChild variant="ghost">
          <Link to={backPath}>Hủy</Link>
        </Button>
        <Button type="submit" form="child-form">
          <Save className="h-4 w-4" />
          {mode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </div>
  )
}
