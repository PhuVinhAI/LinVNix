import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, BookMarked, Lightbulb, Plus, Volume2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { GrammarRule, Lesson, Vocabulary } from '../../features/learning/types'
import { MATERIAL_TYPES, lessonSectionMeta } from './authoring-meta'
import { ConfirmDeleteDialog, GateCard, ItemRow } from './authoring-ui'
import { POS_OPTIONS } from '../../components/admin/lesson-editors/shared/PartOfSpeechPicker'
import { learningPath } from './route-utils'

const POS_LABEL = Object.fromEntries(POS_OPTIONS.map((o) => [o.value, o.label]))

/**
 * Khu soạn nội dung bài học — mỗi màn một việc duy nhất (ADR 0002):
 * - Nội dung bài: CHỌN LOẠI (văn bản/hội thoại/âm thanh/hình ảnh/video) → khu của loại.
 * - Từ vựng / Quy tắc ngữ pháp: CHỌN MỤC để mở form soạn riêng, hoặc thêm mục mới.
 */
export function LessonSectionPage() {
  const { lessonId, section } = useParams()
  const { data: lesson } = useAdminLesson(lessonId)
  const meta = lessonSectionMeta(section)

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />
  if (!meta) return <Navigate to={learningPath.lesson(lessonId)} replace />

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.module?.course?.title ?? 'Khóa học', href: lesson?.module?.courseId ? learningPath.course(lesson.module.courseId) : learningPath.courses() },
          { label: lesson?.module?.title ?? 'Chủ đề', href: lesson?.moduleId ? learningPath.module(lesson.moduleId) : undefined },
          { label: lesson?.title ?? 'Bài học', href: learningPath.lesson(lessonId) },
          { label: 'Nội dung bài học', href: learningPath.lessonStageContent(lessonId) },
          { label: meta.label },
        ]}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <meta.Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{meta.label}</h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
              {meta.value === 'materials'
                ? 'Chọn loại nội dung để vào không gian soạn riêng của loại đó.'
                : meta.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline">
            <Link to={learningPath.lessonStageContent(lessonId)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
          {meta.value === 'vocabulary' && (
            <Button asChild>
              <Link to={learningPath.vocabNew(lessonId)}>
                <Plus className="h-4 w-4" />
                Thêm từ vựng
              </Link>
            </Button>
          )}
          {meta.value === 'grammar' && (
            <Button asChild>
              <Link to={learningPath.grammarNew(lessonId)}>
                <Plus className="h-4 w-4" />
                Thêm quy tắc
              </Link>
            </Button>
          )}
        </div>
      </div>

      {meta.value === 'materials' && <MaterialTypeGates lessonId={lessonId} lesson={lesson} />}
      {meta.value === 'vocabulary' && <VocabularyList lessonId={lessonId} lesson={lesson} />}
      {meta.value === 'grammar' && <GrammarList lessonId={lessonId} lesson={lesson} />}
    </div>
  )
}

/* ── Nội dung bài: chọn LOẠI ─────────────────────────────────────────────── */

function MaterialTypeGates({ lessonId, lesson }: { lessonId: string; lesson: Lesson | undefined }) {
  const counts = (lesson?.contents ?? []).reduce<Record<string, number>>((acc, c) => {
    const key = (c.contentType ?? '').toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {MATERIAL_TYPES.map((type) => (
        <GateCard
          key={type.value}
          to={learningPath.materialType(lessonId, type.value)}
          Icon={type.Icon}
          iconClass={`${type.bg} text-white`}
          label={type.label}
          description={type.description}
          count={counts[type.value] ?? 0}
        />
      ))}
    </div>
  )
}

/* ── Từ vựng: chọn MỤC ───────────────────────────────────────────────────── */

function VocabularyList({ lessonId, lesson }: { lessonId: string; lesson: Lesson | undefined }) {
  const navigate = useNavigate()
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Vocabulary | null>(null)

  const rows = [...(lesson?.vocabularies ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLessonChild.mutateAsync({ kind: 'vocabularies', id: pendingDelete.id })
      toast.success('Đã xóa từ vựng')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  if (rows.length === 0) {
    return (
      <EmptySection
        Icon={BookMarked}
        title="Chưa có từ vựng"
        hint="Thêm từ đầu tiên cho bài học này"
        cta={
          <Button asChild>
            <Link to={learningPath.vocabNew(lessonId)}>
              <Plus className="h-4 w-4" />
              Thêm từ vựng
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <div className="rounded-xl border-2 border-border bg-card divide-y-2 divide-border overflow-hidden">
        {rows.map((row) => (
          <ItemRow
            key={row.id}
            onOpen={() => navigate(learningPath.vocabEdit(lessonId, row.id))}
            onDelete={() => setPendingDelete(row)}
            leading={
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                {row.audioUrl ? <Volume2 className="h-5 w-5" /> : <BookMarked className="h-5 w-5" />}
              </div>
            }
            title={
              <span>
                {row.word || <span className="italic text-muted-foreground">Chưa có từ</span>}
                <span className="text-muted-foreground font-normal"> — {row.translation || '…'}</span>
              </span>
            }
            meta={POS_LABEL[row.partOfSpeech] ?? row.partOfSpeech}
          />
        ))}
      </div>
      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resource="từ vựng"
        label={pendingDelete?.word ?? ''}
        onConfirm={confirmDelete}
      />
    </>
  )
}

/* ── Quy tắc ngữ pháp: chọn MỤC ──────────────────────────────────────────── */

function GrammarList({ lessonId, lesson }: { lessonId: string; lesson: Lesson | undefined }) {
  const navigate = useNavigate()
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<GrammarRule | null>(null)

  const rows = [...(lesson?.grammarRules ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLessonChild.mutateAsync({ kind: 'grammar', id: pendingDelete.id })
      toast.success('Đã xóa quy tắc ngữ pháp')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  if (rows.length === 0) {
    return (
      <EmptySection
        Icon={Lightbulb}
        title="Chưa có quy tắc ngữ pháp"
        hint="Thêm quy tắc đầu tiên cho bài học này"
        cta={
          <Button asChild>
            <Link to={learningPath.grammarNew(lessonId)}>
              <Plus className="h-4 w-4" />
              Thêm quy tắc
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <div className="rounded-xl border-2 border-border bg-card divide-y-2 divide-border overflow-hidden">
        {rows.map((row) => {
          const examples = Array.isArray(row.examples) ? row.examples : []
          return (
            <ItemRow
              key={row.id}
              onOpen={() => navigate(learningPath.grammarEdit(lessonId, row.id))}
              onDelete={() => setPendingDelete(row)}
              leading={
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                  <Lightbulb className="h-5 w-5" />
                </div>
              }
              title={row.title || <span className="italic text-muted-foreground">Chưa có tiêu đề</span>}
              meta={
                <span className="inline-flex items-center gap-2">
                  {row.structure && (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{row.structure}</code>
                  )}
                  <span>{examples.length} ví dụ</span>
                </span>
              }
            />
          )
        })}
      </div>
      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resource="quy tắc ngữ pháp"
        label={pendingDelete?.title ?? ''}
        onConfirm={confirmDelete}
      />
    </>
  )
}

function EmptySection({
  Icon,
  title,
  hint,
  cta,
}: {
  Icon: React.ComponentType<{ className?: string }>
  title: string
  hint: string
  cta: React.ReactNode
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
      <Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{hint}</p>
      {cta}
    </div>
  )
}
