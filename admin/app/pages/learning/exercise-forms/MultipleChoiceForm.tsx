import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import type { ExerciseFormProps } from './types'
import { getCorrectAnswerObject, getOptionsObject } from './types'

interface DraftState {
  question: string
  choices: string[]
  correct: string
}

function initialFromProps(initial: ExerciseFormProps['initial']): DraftState {
  const opts = getOptionsObject(initial)
  const correct = getCorrectAnswerObject(initial)
  let choices: string[] = []
  if (Array.isArray(opts.choices)) {
    choices = (opts.choices as unknown[]).map((c) => String(c))
  } else if (initial && Array.isArray(initial.options)) {
    choices = (initial.options as unknown[]).map((c) => String(c))
  }
  if (choices.length === 0) choices = ['', '']
  return {
    question: String(initial?.question ?? ''),
    choices,
    correct: String(correct.selectedChoice ?? ''),
  }
}

export function MultipleChoiceForm({ initial, onChange }: ExerciseFormProps) {
  const [state, setState] = useState<DraftState>(() => initialFromProps(initial))

  // Re-initialize when editing a different exercise
  useEffect(() => {
    setState(initialFromProps(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  const payload = useMemo(
    () => ({
      question: state.question,
      options: {
        type: 'multiple_choice' as const,
        choices: state.choices.filter(Boolean),
      },
      correctAnswer: { selectedChoice: state.correct },
    }),
    [state],
  )

  const validate = () => {
    if (!state.question.trim()) return 'Hãy nhập câu hỏi'
    const cleaned = state.choices.filter(Boolean)
    if (cleaned.length < 2) return 'Cần ít nhất 2 lựa chọn'
    if (!state.correct) return 'Hãy chọn đáp án đúng'
    if (!cleaned.includes(state.correct)) return 'Đáp án đúng không khớp với lựa chọn nào'
    return null
  }

  useEffect(() => {
    onChange({ payload, validate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  const setChoice = (i: number, text: string) => {
    setState((prev) => {
      const next = [...prev.choices]
      const old = next[i]
      next[i] = text
      const correct = prev.correct === old ? text : prev.correct
      return { ...prev, choices: next, correct }
    })
  }

  const removeChoice = (i: number) => {
    setState((prev) => {
      if (prev.choices.length <= 2) return prev
      const removed = prev.choices[i]
      const next = prev.choices.filter((_, idx) => idx !== i)
      const correct = prev.correct === removed ? '' : prev.correct
      return { ...prev, choices: next, correct }
    })
  }

  const addChoice = () =>
    setState((prev) => ({ ...prev, choices: [...prev.choices, ''] }))

  const pickCorrect = (text: string) =>
    setState((prev) => ({ ...prev, correct: text }))

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Câu hỏi
        </p>
        <InlineEditable
          value={state.question}
          onChange={(v) => setState((prev) => ({ ...prev, question: v }))}
          placeholder="Bấm để nhập câu hỏi..."
          className="text-2xl sm:text-3xl font-bold leading-snug text-foreground py-1"
          ariaLabel="Câu hỏi"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Chọn đáp án đúng
          </p>
          <p className="text-xs text-muted-foreground">
            Bấm vào ô tròn bên trái để đánh dấu đúng
          </p>
        </div>
        <div className="space-y-2.5">
          {state.choices.map((opt, i) => {
            const isCorrect = opt !== '' && state.correct === opt
            return (
              <div
                key={i}
                className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 min-h-[68px] transition-colors ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-border bg-card hover:border-foreground/30'
                }`}
              >
                <button
                  type="button"
                  onClick={() => pickCorrect(opt)}
                  disabled={!opt}
                  aria-label={isCorrect ? 'Đáp án đúng' : 'Đánh dấu là đáp án đúng'}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40'
                  }`}
                >
                  {isCorrect ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <span className="text-lg font-bold">{String.fromCharCode(65 + i)}</span>
                  )}
                </button>
                <InlineEditable
                  value={opt}
                  onChange={(v) => setChoice(i, v)}
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                  className="text-lg font-semibold flex-1"
                  ariaLabel={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                />
                <button
                  type="button"
                  onClick={() => removeChoice(i)}
                  disabled={state.choices.length <= 2}
                  aria-label="Xóa lựa chọn"
                  className="h-9 w-9 shrink-0 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive disabled:opacity-20 disabled:pointer-events-none transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={addChoice}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm lựa chọn
        </button>
      </div>
    </div>
  )
}
