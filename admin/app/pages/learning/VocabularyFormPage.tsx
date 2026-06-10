import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { BookMarked } from 'lucide-react'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { InlineEditable } from '../../components/admin/InlineEditable'
import { MediaUpload } from '../../components/admin/editors/MediaUpload'
import { PartOfSpeechPicker } from '../../components/admin/lesson-editors/shared/PartOfSpeechPicker'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Vocabulary } from '../../features/learning/types'
import {
  ComposerCard,
  DIFFICULTY_DOT,
  DIFFICULTY_LABELS,
  DifficultyRow,
  SectionLabel,
  StickySaveBar,
} from './authoring-ui'
import { learningPath } from './route-utils'

interface FormState {
  word: string
  translation: string
  partOfSpeech: string
  classifier: string
  exampleSentence: string
  exampleTranslation: string
  audioUrl: string
  imageUrl: string
  difficultyLevel: number
}

const EMPTY: FormState = {
  word: '',
  translation: '',
  partOfSpeech: 'phrase',
  classifier: '',
  exampleSentence: '',
  exampleTranslation: '',
  audioUrl: '',
  imageUrl: '',
  difficultyLevel: 1,
}

function fromVocabulary(v: Vocabulary): FormState {
  return {
    word: v.word ?? '',
    translation: v.translation ?? '',
    partOfSpeech: v.partOfSpeech ?? 'phrase',
    classifier: v.classifier ?? '',
    exampleSentence: v.exampleSentence ?? '',
    exampleTranslation: v.exampleTranslation ?? '',
    audioUrl: v.audioUrl ?? '',
    imageUrl: v.imageUrl ?? '',
    difficultyLevel: Math.min(5, Math.max(1, v.difficultyLevel || 1)),
  }
}

/** Soạn một Từ vựng — mọi thuộc tính là field trong cùng khung form, không thanh ngoài. */
export function VocabularyFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { lessonId, id } = useParams()
  const navigate = useNavigate()
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [submitting, setSubmitting] = useState(false)

  const existing = mode === 'edit' ? lesson?.vocabularies?.find((v) => v.id === id) ?? null : null
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => {
    if (existing) setForm(fromVocabulary(existing))
  }, [existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />

  const backPath = learningPath.lessonSection(lessonId, 'vocabulary')
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    if (!form.word.trim()) {
      toast.error('Chưa nhập từ tiếng Việt')
      return
    }
    if (!form.translation.trim()) {
      toast.error('Chưa nhập bản dịch')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        word: form.word.trim(),
        translation: form.translation.trim(),
        partOfSpeech: form.partOfSpeech,
        classifier: form.classifier.trim() || null,
        exampleSentence: form.exampleSentence.trim() || null,
        exampleTranslation: form.exampleTranslation.trim() || null,
        audioUrl: form.audioUrl || null,
        imageUrl: form.imageUrl || null,
        difficultyLevel: form.difficultyLevel,
      }
      if (mode === 'edit' && id) {
        await mutations.updateLessonChild.mutateAsync({ kind: 'vocabularies', id, payload })
        toast.success('Đã cập nhật từ vựng')
      } else {
        const nextOrderIndex =
          (lesson?.vocabularies ?? []).reduce((max, v) => Math.max(max, v.orderIndex ?? -1), -1) + 1
        await mutations.createLessonChild.mutateAsync({
          kind: 'vocabularies',
          lessonId,
          payload: { ...payload, orderIndex: nextOrderIndex },
        })
        toast.success('Đã tạo từ vựng')
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
            { label: 'Nội dung bài học', href: learningPath.lessonStageContent(lessonId) },
            { label: 'Từ vựng', href: backPath },
            { label: mode === 'edit' ? 'Soạn từ' : 'Thêm từ mới' },
          ]}
        />

        <ComposerCard
          Icon={BookMarked}
          iconClass="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
          typeLabel="Từ vựng"
          statusRight={
            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[form.difficultyLevel]}`} />
              {DIFFICULTY_LABELS[form.difficultyLevel]}
            </span>
          }
        >
          <div>
            <SectionLabel>Từ tiếng Việt</SectionLabel>
            <InlineEditable
              value={form.word}
              onChange={(v) => set('word', v)}
              placeholder="Bấm để nhập từ..."
              className="text-3xl sm:text-4xl font-bold leading-snug text-foreground py-1"
              ariaLabel="Từ tiếng Việt"
              autoFocus={mode === 'create'}
            />
          </div>

          <div>
            <SectionLabel>Bản dịch</SectionLabel>
            <InlineEditable
              value={form.translation}
              onChange={(v) => set('translation', v)}
              placeholder="Bấm để nhập nghĩa..."
              className="text-xl font-semibold text-foreground"
              ariaLabel="Bản dịch"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <SectionLabel>Từ loại</SectionLabel>
              <PartOfSpeechPicker
                value={form.partOfSpeech}
                onChange={(v) => set('partOfSpeech', v)}
                variant="grid"
              />
            </div>
            <div>
              <SectionLabel>Danh từ phân loại</SectionLabel>
              <InlineEditable
                value={form.classifier}
                onChange={(v) => set('classifier', v)}
                placeholder="con, cái, chiếc…"
                className="text-base font-semibold"
                ariaLabel="Danh từ phân loại"
                multiline={false}
              />
            </div>
          </div>

          <div>
            <SectionLabel right="câu chứa từ + bản dịch">Câu ví dụ</SectionLabel>
            <div className="rounded-2xl border-2 border-border bg-card px-4 py-3.5 space-y-1">
              <InlineEditable
                value={form.exampleSentence}
                onChange={(v) => set('exampleSentence', v)}
                placeholder="VD: Tôi xin chào bạn."
                className="text-lg font-semibold"
                ariaLabel="Câu ví dụ tiếng Việt"
              />
              <InlineEditable
                value={form.exampleTranslation}
                onChange={(v) => set('exampleTranslation', v)}
                placeholder="VD: I greet you."
                className="text-sm text-muted-foreground"
                ariaLabel="Bản dịch câu ví dụ"
              />
            </div>
          </div>

          <div>
            <SectionLabel right="bản ghi tiếng Việt của từ">Phát âm</SectionLabel>
            <MediaUpload kind="audio" value={form.audioUrl || null} onChange={(url) => set('audioUrl', url ?? '')} />
          </div>

          <div>
            <SectionLabel right="ảnh minh hoạ nghĩa của từ">Hình ảnh</SectionLabel>
            <MediaUpload kind="image" value={form.imageUrl || null} onChange={(url) => set('imageUrl', url ?? '')} />
          </div>

          <div>
            <SectionLabel>Độ khó</SectionLabel>
            <DifficultyRow value={form.difficultyLevel} onChange={(v) => set('difficultyLevel', v)} />
          </div>
        </ComposerCard>
      </div>

      <StickySaveBar
        contextLabel={
          <>
            {mode === 'edit' ? 'Đang soạn từ vựng' : 'Đang thêm từ vựng mới'} ·{' '}
            <span className="font-semibold text-foreground">{form.word || '…'}</span>
          </>
        }
        backTo={backPath}
        submitting={submitting}
        submitLabel={mode === 'edit' ? 'Cập nhật' : 'Tạo từ vựng'}
        onSave={save}
      />
    </div>
  )
}
