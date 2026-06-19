import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import { InlineEditable } from '../../components/admin/InlineEditable'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import {
  ComposerCard,
  NotesField,
  SectionLabel,
  StickySaveBar,
} from './authoring-ui'
import { learningPath } from './route-utils'

/** Soạn một mục Nội dung bài — văn bản tiếng Việt + bản dịch tiếng Anh. */
export function MaterialFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { lessonId, id } = useParams()
  const navigate = useNavigate()
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [submitting, setSubmitting] = useState(false)

  const existing = mode === 'edit' ? lesson?.contents?.find((c) => c.id === id) ?? null : null
  const [vietnameseText, setVietnameseText] = useState<string>(existing?.vietnameseText ?? '')
  const [translation, setTranslation] = useState<string>(existing?.translation ?? '')
  const [notes, setNotes] = useState<string>(existing?.notes ?? '')

  useEffect(() => {
    if (existing) {
      setVietnameseText(existing.vietnameseText ?? '')
      setTranslation(existing.translation ?? '')
      setNotes(existing.notes ?? '')
    }
  }, [existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />

  const backPath = learningPath.lessonSection(lessonId, 'materials')

  const save = async () => {
    if (!vietnameseText.trim()) {
      toast.error('Chưa nhập nội dung tiếng Việt')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        vietnameseText: vietnameseText.trim(),
        translation: translation.trim() || null,
        notes: notes.trim() || null,
      }

      if (mode === 'edit' && id) {
        await mutations.updateLessonChild.mutateAsync({ kind: 'contents', id, payload })
        toast.success('Đã cập nhật nội dung')
      } else {
        const nextOrderIndex =
          (lesson?.contents ?? []).reduce((max, c) => Math.max(max, c.orderIndex ?? -1), -1) + 1
        await mutations.createLessonChild.mutateAsync({
          kind: 'contents',
          lessonId,
          payload: { ...payload, orderIndex: nextOrderIndex },
        })
        toast.success('Đã tạo nội dung')
      }
      navigate(backPath)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-6 flex-1">
        <Breadcrumbs
          items={[
            { label: lesson?.title ?? 'Bài học', href: learningPath.lesson(lessonId) },
            { label: 'Nội dung bài', href: backPath },
            { label: mode === 'edit' ? 'Soạn' : 'Thêm mới' },
          ]}
        />

        <ComposerCard
          Icon={FileText}
          iconClass="bg-slate-600 text-white"
          typeLabel="Văn bản"
        >
          <div>
            <SectionLabel>Nội dung tiếng Việt</SectionLabel>
            <InlineEditable
              value={vietnameseText}
              onChange={setVietnameseText}
              placeholder="Bấm để viết đoạn văn học viên sẽ đọc..."
              className="text-xl leading-relaxed font-medium"
              ariaLabel="Nội dung tiếng Việt"
              autoFocus={mode === 'create'}
            />
          </div>

          <div>
            <SectionLabel>Bản dịch tiếng Anh</SectionLabel>
            <InlineEditable
              value={translation}
              onChange={setTranslation}
              placeholder="Bấm để viết bản dịch..."
              className="text-base leading-relaxed text-muted-foreground"
              ariaLabel="Bản dịch"
            />
          </div>

          <div>
            <SectionLabel right="không hiện cho học viên">Ghi chú soạn bài</SectionLabel>
            <NotesField value={notes} onChange={setNotes} />
          </div>
        </ComposerCard>
      </div>

      <StickySaveBar
        contextLabel={
          <>
            {mode === 'edit' ? 'Đang soạn' : 'Đang thêm'}{' '}
            <span className="font-semibold text-foreground">Nội dung bài</span>
          </>
        }
        backTo={backPath}
        submitting={submitting}
        submitLabel={mode === 'edit' ? 'Cập nhật' : 'Tạo nội dung'}
        onSave={save}
      />
    </div>
  )
}
