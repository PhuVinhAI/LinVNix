import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import type { ExerciseFormProps } from './types'
import { getCorrectAnswerObject, getOptionsObject } from './types'

interface DraftState {
  question: string
  items: string[]
}

function initialFromProps(initial: ExerciseFormProps['initial']): DraftState {
  const opts = getOptionsObject(initial)
  const correct = getCorrectAnswerObject(initial)
  let items: string[] = []
  if (Array.isArray(opts.items)) {
    items = (opts.items as unknown[]).map((s) => String(s))
  } else if (Array.isArray(correct.orderedItems)) {
    items = (correct.orderedItems as unknown[]).map((s) => String(s))
  }
  if (items.length === 0) items = ['', '']
  return {
    question: String(initial?.question ?? ''),
    items,
  }
}

export function OrderingForm({ initial, onChange }: ExerciseFormProps) {
  const [state, setState] = useState<DraftState>(() => initialFromProps(initial))

  useEffect(() => {
    setState(initialFromProps(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  const payload = useMemo(() => {
    const items = state.items.filter(Boolean)
    return {
      question: state.question,
      options: { type: 'ordering' as const, items },
      correctAnswer: { orderedItems: items },
    }
  }, [state])

  const validate = () => {
    if (!state.question.trim()) return 'Hãy nhập câu hỏi / hướng dẫn'
    const items = state.items.filter(Boolean)
    if (items.length < 2) return 'Cần ít nhất 2 mục để sắp xếp'
    return null
  }

  useEffect(() => {
    onChange({ payload, validate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  const setItem = (i: number, text: string) =>
    setState((prev) => {
      const next = [...prev.items]
      next[i] = text
      return { ...prev, items: next }
    })

  const remove = (i: number) =>
    setState((prev) =>
      prev.items.length <= 2
        ? prev
        : { ...prev, items: prev.items.filter((_, idx) => idx !== i) },
    )

  const move = (i: number, dir: -1 | 1) => {
    setState((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.items.length) return prev
      const next = [...prev.items]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...prev, items: next }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Câu hỏi / Hướng dẫn
        </p>
        <InlineEditable
          value={state.question}
          onChange={(v) => setState((prev) => ({ ...prev, question: v }))}
          placeholder="Ví dụ: Sắp xếp các từ thành câu hoàn chỉnh..."
          className="text-2xl sm:text-3xl font-bold leading-snug text-foreground py-1"
          ariaLabel="Câu hỏi"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Thứ tự đúng (dùng mũi tên để đổi chỗ)
        </p>
        <div className="space-y-2.5">
          {state.items.map((it, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 min-h-[64px]"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="h-5 w-5 inline-flex items-center justify-center text-xs text-muted-foreground/50 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none"
                  aria-label="Lên"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === state.items.length - 1}
                  className="h-5 w-5 inline-flex items-center justify-center text-xs text-muted-foreground/50 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none"
                  aria-label="Xuống"
                >
                  ▼
                </button>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary tabular-nums">
                {i + 1}
              </span>
              <InlineEditable
                value={it}
                onChange={(v) => setItem(i, v)}
                placeholder={`Mục ${i + 1}`}
                className="text-lg font-semibold flex-1"
                multiline={false}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={state.items.length <= 2}
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
            setState((prev) => ({ ...prev, items: [...prev.items, ''] }))
          }
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm mục
        </button>
      </div>
    </div>
  )
}
