import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { ResourceForm } from '../../components/admin/ResourceForm'
import { lessonFields } from '../../features/learning/types/forms'
import { useAdminLesson, useAdminModule, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import { learningPath } from './route-utils'

export function LessonFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { moduleId, id } = useParams()
  const navigate = useNavigate()
  const { data: lesson } = useAdminLesson(id)
  const parentModuleId = moduleId ?? lesson?.moduleId
  const { data: module } = useAdminModule(parentModuleId)
  const mutations = useLearningAdminMutation()

  const submit = async (payload: Record<string, unknown>) => {
    try {
      if (mode === 'edit' && id) {
        await mutations.updateLesson.mutateAsync({ id, payload })
        toast.success('Đã cập nhật bài học')
        navigate(learningPath.lesson(id))
      } else if (moduleId) {
        await mutations.createLesson.mutateAsync({ moduleId, payload })
        toast.success('Đã tạo bài học')
        navigate(learningPath.module(moduleId))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu')
    }
  }

  const backPath = parentModuleId ? learningPath.module(parentModuleId) : learningPath.courses()

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: module?.course?.title ?? 'Khóa học', href: module?.courseId ? learningPath.course(module.courseId) : learningPath.courses() },
          { label: module?.title ?? 'Chủ đề', href: parentModuleId ? learningPath.module(parentModuleId) : undefined },
          { label: mode === 'edit' ? lesson?.title ?? 'Sửa bài học' : 'Thêm bài học' },
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
            {mode === 'edit' ? 'Sửa bài học' : 'Tạo bài học mới'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === 'edit' ? 'Cập nhật thông tin bài học' : 'Điền thông tin để tạo bài học mới'}
          </p>
        </div>
      </div>

      <ResourceForm
        id="lesson-form"
        fields={lessonFields}
        initialValue={lesson}
        onSubmit={submit}
        hideSubmit
      />

      <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-border">
        <Button asChild variant="ghost">
          <Link to={backPath}>Hủy</Link>
        </Button>
        <Button type="submit" form="lesson-form">
          <Save className="h-4 w-4" />
          {mode === 'edit' ? 'Cập nhật' : 'Tạo bài học'}
        </Button>
      </div>
    </div>
  )
}
