import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { WizardSteps, type WizardStep } from '../../components/admin/WizardSteps'
import { ContentEditor } from '../../components/admin/lesson-editors/ContentEditor'
import { GrammarEditor } from '../../components/admin/lesson-editors/GrammarEditor'
import { VocabularyEditor } from '../../components/admin/lesson-editors/VocabularyEditor'
import { useAdminLesson } from '../../features/learning/api/use-learning-admin'
import { LESSON_SECTIONS, lessonSectionMeta } from './authoring-meta'
import { learningPath } from './route-utils'

/**
 * Khu soạn của Giai đoạn 1 — mỗi loại mục (Nội dung bài / Từ vựng / Quy tắc ngữ pháp)
 * là một bước con (1.1 → 1.3); chỉ ở đây mới tạo/sửa/xóa được mục của loại đó (ADR 0002).
 */
export function LessonSectionPage() {
  const { lessonId, section } = useParams()
  const { data: lesson } = useAdminLesson(lessonId)
  const meta = lessonSectionMeta(section)

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />
  if (!meta) return <Navigate to={learningPath.lesson(lessonId)} replace />

  const index = LESSON_SECTIONS.findIndex((s) => s.value === meta.value)
  const prev = index > 0 ? LESSON_SECTIONS[index - 1] : null
  const next = index < LESSON_SECTIONS.length - 1 ? LESSON_SECTIONS[index + 1] : null
  const count = meta.count(lesson)

  const steps: WizardStep[] = [
    ...LESSON_SECTIONS.map((s, i): WizardStep => ({
      key: s.value,
      number: `1.${i + 1}`,
      label: s.label,
      state: s.value === meta.value ? 'current' : s.count(lesson) > 0 ? 'done' : 'upcoming',
      to: s.value === meta.value ? undefined : learningPath.lessonSection(lessonId, s.value),
    })),
    {
      key: 'stage-2',
      number: '2',
      label: 'Bài tập',
      state: (lesson?.exercises?.length ?? 0) > 0 ? 'done' : 'upcoming',
      to: learningPath.lesson(lessonId),
    },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.module?.course?.title ?? 'Khóa học', href: lesson?.module?.courseId ? learningPath.course(lesson.module.courseId) : learningPath.courses() },
          { label: lesson?.module?.title ?? 'Chủ đề', href: lesson?.moduleId ? learningPath.module(lesson.moduleId) : undefined },
          { label: lesson?.title ?? 'Bài học', href: learningPath.lesson(lessonId) },
          { label: meta.label },
        ]}
      />

      <WizardSteps steps={steps} />

      {/* Header Khu soạn */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <meta.Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Giai đoạn 1 · Bước <span className="tabular-nums">1.{index + 1}</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{meta.label}</h1>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">
                  {count} mục
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
                {meta.description}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to={learningPath.lesson(lessonId)}>
              <ArrowLeft className="h-4 w-4" />
              Về bài học
            </Link>
          </Button>
        </div>
      </div>

      {/* Editor của khu này */}
      {meta.value === 'materials' && <ContentEditor lessonId={lessonId} />}
      {meta.value === 'vocabulary' && <VocabularyEditor lessonId={lessonId} />}
      {meta.value === 'grammar' && <GrammarEditor lessonId={lessonId} />}

      {/* Thanh trình tự soạn bài */}
      <div className="flex items-center justify-between gap-3 border-t-2 border-border pt-4 flex-wrap">
        {prev ? (
          <Button asChild variant="outline">
            <Link to={learningPath.lessonSection(lessonId, prev.value)}>
              <ArrowLeft className="h-4 w-4" />
              Bước 1.{index}: {prev.label}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="ghost">
            <Link to={learningPath.lesson(lessonId)}>
              <ArrowLeft className="h-4 w-4" />
              Về bài học
            </Link>
          </Button>
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link to={learningPath.lessonSection(lessonId, next.value)}>
              Bước 1.{index + 2}: {next.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to={learningPath.lesson(lessonId)}>
              <ClipboardList className="h-4 w-4" />
              Giai đoạn 2: Bài tập
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
