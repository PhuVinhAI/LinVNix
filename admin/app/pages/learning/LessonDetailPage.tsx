import { Link, useParams } from 'react-router'
import { BookOpen, Check, ChevronRight, ClipboardList, Clock, Pencil } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { LessonContentSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import { useAdminLesson } from '../../features/learning/api/use-learning-admin'
import { stageOneTotal } from './authoring-meta'
import { learningPath } from './route-utils'

const lessonTypeColors: Record<string, string> = {
  vocabulary: 'bg-emerald-500',
  grammar: 'bg-blue-500',
  reading: 'bg-indigo-500',
  listening: 'bg-purple-500',
  speaking: 'bg-rose-500',
  writing: 'bg-amber-500',
  pronunciation: 'bg-teal-500',
  culture: 'bg-fuchsia-500',
}

const lessonTypeLabels: Record<string, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Đọc',
  listening: 'Nghe',
  speaking: 'Nói',
  writing: 'Viết',
  pronunciation: 'Phát âm',
  culture: 'Văn hóa',
}

/**
 * Cổng vào Giai đoạn soạn bài (ADR 0002). Màn hình này chỉ làm MỘT việc:
 * chọn giai đoạn. Soạn gì cũng phải đi sâu vào trong.
 */
export function LessonDetailPage() {
  const { lessonId } = useParams()
  const { data: lesson, isLoading, error, refetch, isFetching } = useAdminLesson(lessonId)

  const contentTotal = stageOneTotal(lesson)
  const exerciseTotal = lesson?.exercises?.length ?? 0
  const questionTotal = (lesson?.exercises ?? []).reduce(
    (sum, e) => sum + (e.questions?.length ?? 0),
    0,
  )

  const typeBg = lessonTypeColors[lesson?.lessonType ?? ''] ?? 'bg-muted'
  const typeLabel = lessonTypeLabels[lesson?.lessonType ?? ''] ?? lesson?.lessonType ?? '—'

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.module?.course?.title ?? 'Khóa học', href: lesson?.module?.courseId ? learningPath.course(lesson.module.courseId) : learningPath.courses() },
          { label: lesson?.module?.title ?? 'Chủ đề', href: lesson?.moduleId ? learningPath.module(lesson.moduleId) : undefined },
          { label: lesson?.title ?? 'Bài học' },
        ]}
      />

      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-white font-bold ${typeBg}`}>
                {typeLabel}
              </span>
              {lesson?.estimatedDuration && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium tabular-nums">{lesson.estimatedDuration} phút</span>
                </span>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground tabular-nums">#{lesson?.orderIndex ?? 0}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {lesson?.title ?? 'Bài học'}
            </h1>
            {lesson?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {lesson.description}
              </p>
            )}
          </div>
          {lessonId && lesson && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={learningPath.lessonEdit(lesson.moduleId, lessonId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LessonContentSkeleton />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : lesson && lessonId ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Soạn bài học</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Soạn nội dung bài học trước, sau đó tạo bài tập để học viên luyện tập.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StageGate
              to={learningPath.lessonStageContent(lessonId)}
              Icon={BookOpen}
              title="Nội dung bài học"
              description="Phần kiến thức học viên tiếp thu: nội dung bài, từ vựng, quy tắc ngữ pháp."
              done={contentTotal > 0}
              stat={`${contentTotal} mục`}
            />
            <StageGate
              to={learningPath.lessonStageExercises(lessonId)}
              Icon={ClipboardList}
              title="Bài tập"
              description="Câu hỏi luyện tập trên nền kiến thức đã soạn."
              done={exerciseTotal > 0}
              stat={`${exerciseTotal} bài tập · ${questionTotal} câu hỏi`}
              warn={contentTotal === 0 ? 'Nên soạn nội dung trước' : undefined}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function StageGate({
  to,
  Icon,
  title,
  description,
  done,
  stat,
  warn,
}: {
  to: string
  Icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  done: boolean
  stat: string
  warn?: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-6 transition-colors hover:border-primary focus:outline-none focus-visible:border-primary"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <ChevronRight className="h-6 w-6 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t-2 border-border">
        <span className="text-sm font-bold tabular-nums">{stat}</span>
        {done ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Đã soạn
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            {warn ?? 'Chưa soạn'}
          </span>
        )}
      </div>
    </Link>
  )
}
