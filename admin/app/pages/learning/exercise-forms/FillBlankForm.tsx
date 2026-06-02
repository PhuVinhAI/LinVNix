import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import type { ExerciseFormProps } from './types'
import { getOptionsObject } from './types'

type Part =
  | { kind: 'text'; value: string }
  | { kind: 'blank'; answers: string[] }

interface DraftState {
  parts: Part[]
}

const BLANK_MARKER = /_{3,}/g

function partsFromSentence(sentence: string, accepted: string[][]): Part[] {
  if (!sentence) return [{ kind: 'text', value: '' }]
  const parts: Part[] = []
  let cursor = 0
  let blankIndex = 0
  for (const match of sentence.matchAll(BLANK_MARKER)) {
    if (match.index === undefined) continue
    if (match.index > cursor) {
      parts.push({ kind: 'text', value: sentence.slice(cursor, match.index) })
    }
    parts.push({
      kind: 'blank',
      answers: accepted[blankIndex] ?? [''],
    })
    cursor = match.index + match[0].length
    blankIndex++
  }
  if (cursor < sentence.length) {
    parts.push({ kind: 'text', value: sentence.slice(cursor) })
  }
  // Normalise: ensure first and last are text segments so the user can always
  // type at either end of the sentence.
  if (parts.length === 0 || parts[0].kind === 'blank') {
    parts.unshift({ kind: 'text', value: '' })
  }
  if (parts[parts.length - 1].kind === 'blank') {
    parts.push({ kind: 'text', value: '' })
  }
  return parts
}

function initialFromProps(initial: ExerciseFormProps['initial']): DraftState {
  const opts = getOptionsObject(initial)
  const sentence = String(opts.sentence ?? initial?.question ?? '')
  const accepted = Array.isArray(opts.acceptedAnswers)
    ? (opts.acceptedAnswers as unknown[]).map((g) =>
        Array.isArray(g) ? (g as unknown[]).map((s) => String(s)) : [String(g)],
      )
    : []
  return { parts: partsFromSentence(sentence, accepted) }
}

export function FillBlankForm({ initial, onChange }: ExerciseFormProps) {
  const [state, setState] = useState<DraftState>(() => initialFromProps(initial))

  useEffect(() => {
    setState(initialFromProps(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  const blanks = useMemo(
    () => state.parts.filter((p): p is Extract<Part, { kind: 'blank' }> => p.kind === 'blank'),
    [state.parts],
  )

  const payload = useMemo(() => {
    const sentence = state.parts
      .map((p) => (p.kind === 'text' ? p.value : '___'))
      .join('')
    const acceptedAnswers = blanks.map((b) => b.answers.filter(Boolean))
    const answers = blanks.map((b) => b.answers[0] ?? '')
    return {
      question: null,
      options: {
        type: 'fill_blank' as const,
        sentence,
        blanks: blanks.length,
        acceptedAnswers,
      },
      correctAnswer: { answers },
    }
  }, [state.parts, blanks])

  const validate = () => {
    const sentence = payload.options.sentence.trim()
    if (!sentence) return 'Hãy nhập câu có chỗ trống'
    if (blanks.length === 0) return 'Cần ít nhất 1 chỗ trống'
    if (blanks.some((b) => !b.answers.some((a) => a.trim())))
      return 'Mỗi chỗ trống cần ít nhất 1 đáp án'
    return null
  }

  useEffect(() => {
    onChange({ payload, validate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  const setTextAt = (i: number, value: string) =>
    setState((prev) => {
      const next = [...prev.parts]
      next[i] = { kind: 'text', value }
      return { parts: next }
    })

  const setBlankAnswersAt = (i: number, answers: string[]) =>
    setState((prev) => {
      const next = [...prev.parts]
      next[i] = { kind: 'blank', answers: answers.length ? answers : [''] }
      return { parts: next }
    })

  const removeBlankAt = (i: number) =>
    setState((prev) => {
      const next = [...prev.parts]
      // Replace blank with empty text, then merge adjacent text segments.
      next[i] = { kind: 'text', value: '' }
      const merged: Part[] = []
      for (const part of next) {
        const last = merged[merged.length - 1]
        if (last && last.kind === 'text' && part.kind === 'text') {
          merged[merged.length - 1] = {
            kind: 'text',
            value: last.value + part.value,
          }
        } else {
          merged.push(part)
        }
      }
      return { parts: merged.length ? merged : [{ kind: 'text', value: '' }] }
    })

  const appendBlank = () =>
    setState((prev) => {
      const last = prev.parts[prev.parts.length - 1]
      const needsLeadingText = !last || last.kind === 'blank'
      const next: Part[] = [...prev.parts]
      if (needsLeadingText) next.push({ kind: 'text', value: ' ' })
      next.push({ kind: 'blank', answers: [''] })
      next.push({ kind: 'text', value: ' ' })
      return { parts: next }
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Câu có chỗ trống
        </p>
        <p className="text-xs text-muted-foreground">
          Gõ câu thường rồi bấm <span className="font-bold">+ Thêm chỗ trống</span> để chèn ô đáp án
        </p>
      </div>

      <div className="rounded-2xl border-2 border-border bg-card px-5 py-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-2xl font-semibold leading-relaxed text-foreground">
          {state.parts.map((part, i) =>
            part.kind === 'text' ? (
              <TextSegment
                key={`t-${i}`}
                value={part.value}
                onChange={(v) => setTextAt(i, v)}
                placeholder={i === 0 ? 'Bắt đầu nhập câu...' : ''}
              />
            ) : (
              <BlankChip
                key={`b-${i}`}
                index={blanks.findIndex((b) => b === part)}
                answers={part.answers}
                onChange={(a) => setBlankAnswersAt(i, a)}
                onRemove={() => removeBlankAt(i)}
              />
            ),
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={appendBlank}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Thêm chỗ trống
      </button>
    </div>
  )
}

function TextSegment({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <span className="min-w-[24px] inline-flex">
      <InlineEditable
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={false}
        className="text-2xl font-semibold leading-relaxed"
      />
    </span>
  )
}

function BlankChip({
  index,
  answers,
  onChange,
  onRemove,
}: {
  index: number
  answers: string[]
  onChange: (a: string[]) => void
  onRemove: () => void
}) {
  const display = answers[0]?.trim() || '___'
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 text-base font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold tabular-nums">
            {index + 1}
          </span>
          <span>{display}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-1 -mr-1 h-5 w-5 rounded-full text-emerald-700/60 hover:bg-emerald-700/10 hover:text-emerald-700 dark:text-emerald-300/70 dark:hover:bg-emerald-300/10 dark:hover:text-emerald-200"
            aria-label="Xóa chỗ trống"
          >
            <X className="h-3.5 w-3.5 mx-auto" />
          </button>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Đáp án chấp nhận
          </span>
          <span className="text-xs text-muted-foreground">Chỗ trống #{index + 1}</span>
        </div>
        <AnswerEditor answers={answers} onChange={onChange} />
      </PopoverContent>
    </Popover>
  )
}

function AnswerEditor({
  answers,
  onChange,
}: {
  answers: string[]
  onChange: (a: string[]) => void
}) {
  const items = answers.length ? answers : ['']
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={it}
            onChange={(e) => {
              const next = [...items]
              next[i] = e.target.value
              onChange(next)
            }}
            placeholder={i === 0 ? 'Đáp án chính' : `Biến thể ${i + 1}`}
            autoFocus={i === 0 && it === ''}
            className="flex-1 rounded-lg border-2 border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="h-8 w-8 rounded-md text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Xóa biến thể"
            >
              <Trash2 className="h-3.5 w-3.5 mx-auto" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="h-3 w-3" />
        Thêm biến thể
      </button>
    </div>
  )
}
