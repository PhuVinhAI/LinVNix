import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Lightbulb, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { InlineEditable } from '../../components/admin/InlineEditable'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { GrammarRule } from '../../features/learning/types'
import {
  ComposerCard,
  DIFFICULTY_DOT,
  DIFFICULTY_LABELS,
  DifficultyPill,
  NotesPill,
  PillBar,
  PillDivider,
  SectionLabel,
  StickySaveBar,
} from './authoring-ui'
import { learningPath } from './route-utils'

type ExampleItem = { vi: string; en: string; note?: string }

interface FormState {
  title: string
  structure: string
  explanation: string
  examples: ExampleItem[]
  notes: string
  difficultyLevel: number
}

const EMPTY: FormState = {
  title: '',
  structure: '',
  explanation: '',
  examples: [],
  notes: '',
  difficultyLevel: 1,
}

function fromRule(r: GrammarRule): FormState {
  return {
    title: r.title ?? '',
    structure: r.structure ?? '',
    explanation: r.explanation ?? '',
    examples: Array.isArray(r.examples) ? r.examples : [],
    notes: r.notes ?? '',
    difficultyLevel: Math.min(5, Math.max(1, r.difficultyLevel || 1)),
  }
}

/** Soạn một Quy tắc ngữ pháp — cùng ngôn ngữ thiết kế với form câu hỏi. */
export function GrammarFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { lessonId, id } = useParams()
  const navigate = useNavigate()
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [submitting, setSubmitting] = useState(false)

  const existing = mode === 'edit' ? lesson?.grammarRules?.find((g) => g.id === id) ?? null : null
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => {
    if (existing) setForm(fromRule(existing))
  }, [existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />

  const backPath = learningPath.lessonSection(lessonId, 'grammar')
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updateExample = (index: number, patch: Partial<ExampleItem>) =>
    set('examples', form.examples.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)))

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Chưa nhập tiêu đề quy tắc')
      return
    }
    if (!form.explanation.trim()) {
      toast.error('Chưa nhập phần giải thích')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        structure: form.structure.trim() || null,
        explanation: form.explanation.trim(),
        examples: form.examples.filter((ex) => ex.vi.trim() || ex.en.trim()),
        notes: form.notes.trim() || null,
        difficultyLevel: form.difficultyLevel,
      }
      if (mode === 'edit' && id) {
        await mutations.updateLessonChild.mutateAsync({ kind: 'grammar', id, payload })
        toast.success('Đã cập nhật quy tắc')
      } else {
        const nextOrderIndex =
          (lesson?.grammarRules ?? []).reduce((max, g) => Math.max(max, g.orderIndex ?? -1), -1) + 1
        await mutations.createLessonChild.mutateAsync({
          kind: 'grammar',
          lessonId,
          payload: { ...payload, orderIndex: nextOrderIndex },
        })
        toast.success('Đã tạo quy tắc ngữ pháp')
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
            { label: 'Quy tắc ngữ pháp', href: backPath },
            { label: mode === 'edit' ? 'Soạn quy tắc' : 'Thêm quy tắc mới' },
          ]}
        />

        <PillBar
          hint={
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Bấm vào bất kỳ chữ nào để sửa
            </>
          }
        >
          <DifficultyPill value={form.difficultyLevel} onChange={(v) => set('difficultyLevel', v)} />
          <PillDivider />
          <NotesPill value={form.notes} onChange={(v) => set('notes', v)} label="Ghi chú giảng dạy" />
        </PillBar>

        <ComposerCard
          Icon={Lightbulb}
          iconClass="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
          typeLabel="Quy tắc ngữ pháp"
          statusRight={
            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[form.difficultyLevel]}`} />
              {DIFFICULTY_LABELS[form.difficultyLevel]}
            </span>
          }
        >
          <div>
            <SectionLabel>Tiêu đề quy tắc</SectionLabel>
            <InlineEditable
              value={form.title}
              onChange={(v) => set('title', v)}
              placeholder='Bấm để nhập, VD: Câu khẳng định với "là"'
              className="text-2xl sm:text-3xl font-bold leading-snug text-foreground py-1"
              ariaLabel="Tiêu đề quy tắc"
              autoFocus={mode === 'create'}
            />
          </div>

          <div>
            <SectionLabel right="công thức ngắn gọn">Cấu trúc</SectionLabel>
            <div className="rounded-2xl border-2 border-border bg-muted/30 px-4 py-3">
              <InlineEditable
                value={form.structure}
                onChange={(v) => set('structure', v)}
                placeholder="VD: S + là + N"
                className="font-mono text-lg font-semibold tracking-wide"
                ariaLabel="Cấu trúc"
                multiline={false}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Giải thích</SectionLabel>
            <InlineEditable
              value={form.explanation}
              onChange={(v) => set('explanation', v)}
              placeholder="Bấm để viết giải thích cách dùng, ngữ cảnh, lưu ý…"
              className="text-base leading-relaxed"
              ariaLabel="Giải thích"
            />
          </div>

          <div>
            <SectionLabel right="câu tiếng Việt + bản dịch + ghi chú">Ví dụ song ngữ</SectionLabel>
            <div className="space-y-2.5">
              {form.examples.map((ex, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3.5 transition-colors hover:border-foreground/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40 text-sm font-bold tabular-nums text-blue-700 dark:text-blue-300 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <InlineEditable
                      value={ex.vi}
                      onChange={(v) => updateExample(index, { vi: v })}
                      placeholder="Câu tiếng Việt, VD: Tôi là sinh viên."
                      className="text-lg font-semibold"
                      ariaLabel={`Ví dụ ${index + 1} tiếng Việt`}
                    />
                    <InlineEditable
                      value={ex.en}
                      onChange={(v) => updateExample(index, { en: v })}
                      placeholder="Bản dịch, VD: I am a student."
                      className="text-sm text-muted-foreground"
                      ariaLabel={`Ví dụ ${index + 1} bản dịch`}
                    />
                    <InlineEditable
                      value={ex.note ?? ''}
                      onChange={(v) => updateExample(index, { note: v })}
                      placeholder="Ghi chú (không bắt buộc)"
                      className="text-xs text-muted-foreground/80 italic"
                      ariaLabel={`Ví dụ ${index + 1} ghi chú`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => set('examples', form.examples.filter((_, i) => i !== index))}
                    aria-label="Xóa ví dụ"
                    className="h-9 w-9 shrink-0 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set('examples', [...form.examples, { vi: '', en: '' }])}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm ví dụ
            </button>
          </div>

          {form.notes && (
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-0.5">
                Ghi chú giảng dạy
              </p>
              <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                {form.notes}
              </p>
            </div>
          )}
        </ComposerCard>
      </div>

      <StickySaveBar
        contextLabel={
          <>
            {mode === 'edit' ? 'Đang soạn quy tắc' : 'Đang thêm quy tắc mới'} ·{' '}
            <span className="font-semibold text-foreground">{form.title || '…'}</span>
          </>
        }
        backTo={backPath}
        submitting={submitting}
        submitLabel={mode === 'edit' ? 'Cập nhật' : 'Tạo quy tắc'}
        onSave={save}
      />
    </div>
  )
}
