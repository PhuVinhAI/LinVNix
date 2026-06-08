import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Mic, Check } from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import type { QuestionFormProps } from './types'
import { getOptionsObject } from './types'

interface DraftState {
  question: string
  promptText: string
  keywords: string[]
  transcriptType: 'exact' | 'keywords'
}

function initialFromProps(initial: QuestionFormProps['initial']): DraftState {
  const opts = getOptionsObject(initial)
  const correct = (initial?.correctAnswer ?? {}) as { transcript?: unknown }
  let keywords: string[] = []
  if (Array.isArray(opts.keywords)) {
    keywords = (opts.keywords as unknown[]).map((s) => String(s))
  }
  const transcript = typeof correct.transcript === 'string' ? correct.transcript : ''
  if (transcript && !keywords.includes(transcript)) keywords.unshift(transcript)
  return {
    question: String(initial?.question ?? ''),
    promptText: String(opts.promptText ?? ''),
    keywords: keywords.length ? keywords : [''],
    transcriptType:
      opts.transcriptType === 'exact' ? 'exact' : 'keywords',
  }
}

export function SpeakingForm({ initial, onChange }: QuestionFormProps) {
  const [state, setState] = useState<DraftState>(() => initialFromProps(initial))

  useEffect(() => {
    setState(initialFromProps(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  const payload = useMemo(() => {
    const cleaned = state.keywords.filter(Boolean)
    return {
      question: state.question,
      options: {
        type: 'speaking' as const,
        promptText: state.promptText || undefined,
        promptAudioUrl: '',
        transcriptType: state.transcriptType,
        keywords: cleaned,
      } as Record<string, unknown>,
      correctAnswer: { transcript: cleaned[0] ?? '' },
    }
  }, [state])

  const validate = () => {
    if (!state.question.trim()) return 'Hãy nhập câu hỏi / hướng dẫn'
    const cleaned = state.keywords.filter((s) => s.trim())
    if (cleaned.length === 0) return 'Cần ít nhất 1 đáp án/keyword'
    return null
  }

  useEffect(() => {
    onChange({ payload, validate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 inline-flex items-center gap-2">
          <Mic className="h-3.5 w-3.5" />
          Câu hỏi / Hướng dẫn
        </p>
        <InlineEditable
          value={state.question}
          onChange={(v) => setState((prev) => ({ ...prev, question: v }))}
          placeholder="Ví dụ: Phát âm lại câu sau..."
          className="text-2xl sm:text-3xl font-bold leading-snug text-foreground py-1"
          ariaLabel="Câu hỏi"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Audio mẫu được cấu hình ở thanh công cụ phía trên (nút Audio)
        </p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Văn bản mẫu (hiển thị cho học viên)
        </p>
        <textarea
          value={state.promptText}
          onChange={(e) =>
            setState((prev) => ({ ...prev, promptText: e.target.value }))
          }
          rows={2}
          placeholder="Tuỳ chọn — câu mẫu để học viên nhìn theo khi nói..."
          className="w-full rounded-2xl border-2 border-input bg-card px-4 py-3 text-base outline-none focus-visible:border-primary resize-y"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Cách chấm điểm
        </p>
        <div className="flex gap-2">
          <ModeChip
            active={state.transcriptType === 'exact'}
            onClick={() =>
              setState((prev) => ({ ...prev, transcriptType: 'exact' }))
            }
            label="So khớp chính xác"
            hint="Phát âm khớp hoàn toàn"
          />
          <ModeChip
            active={state.transcriptType === 'keywords'}
            onClick={() =>
              setState((prev) => ({ ...prev, transcriptType: 'keywords' }))
            }
            label="Theo từ khoá"
            hint="Đúng nếu lời nói chứa các từ khoá"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          {state.transcriptType === 'exact' ? 'Transcript chấp nhận' : 'Các từ khoá bắt buộc'}
        </p>
        <div className="space-y-2.5">
          {state.keywords.map((kw, i) => (
            <div
              key={i}
              className="group flex items-start gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3.5 min-h-[64px]"
            >
              <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-1.5" />
              <InlineEditable
                value={kw}
                onChange={(v) =>
                  setState((prev) => {
                    const next = [...prev.keywords]
                    next[i] = v
                    return { ...prev, keywords: next }
                  })
                }
                placeholder={
                  state.transcriptType === 'exact'
                    ? 'Transcript đầy đủ...'
                    : 'Từ khoá...'
                }
                className="text-lg font-semibold flex-1"
              />
              <button
                type="button"
                onClick={() =>
                  setState((prev) =>
                    prev.keywords.length <= 1
                      ? prev
                      : {
                          ...prev,
                          keywords: prev.keywords.filter((_, idx) => idx !== i),
                        },
                  )
                }
                disabled={state.keywords.length <= 1}
                className="h-9 w-9 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:pointer-events-none"
                aria-label="Xóa"
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setState((prev) => ({ ...prev, keywords: [...prev.keywords, ''] }))
          }
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          {state.transcriptType === 'exact' ? 'Thêm transcript' : 'Thêm từ khoá'}
        </button>
      </div>
    </div>
  )
}

function ModeChip({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
        active
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-foreground/30'
      }`}
    >
      <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
    </button>
  )
}
