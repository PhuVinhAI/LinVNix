import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, ArrowDown, Languages } from 'lucide-react'
import type { ExerciseFormProps } from './types'
import { LANGUAGE_OPTIONS, getOptionsObject } from './types'

interface DraftState {
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  translations: string[]
}

function initialFromProps(initial: ExerciseFormProps['initial']): DraftState {
  const opts = getOptionsObject(initial)
  const accepted = Array.isArray(opts.acceptedTranslations)
    ? (opts.acceptedTranslations as unknown[]).map((t) => String(t))
    : []
  const correct = (initial?.correctAnswer ?? {}) as { translation?: unknown }
  const translation = typeof correct.translation === 'string' ? correct.translation : ''
  // Make sure the canonical translation is the first entry
  const merged: string[] = []
  if (translation) merged.push(translation)
  for (const t of accepted) if (!merged.includes(t)) merged.push(t)
  return {
    sourceText: String(opts.sourceText ?? initial?.question ?? ''),
    sourceLanguage: String(opts.sourceLanguage ?? 'en'),
    targetLanguage: String(opts.targetLanguage ?? 'vi'),
    translations: merged.length ? merged : [''],
  }
}

export function TranslationForm({ initial, onChange }: ExerciseFormProps) {
  const [state, setState] = useState<DraftState>(() => initialFromProps(initial))

  useEffect(() => {
    setState(initialFromProps(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  const payload = useMemo(() => {
    const cleaned = state.translations.filter(Boolean)
    return {
      question: null,
      options: {
        type: 'translation' as const,
        sourceText: state.sourceText,
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        acceptedTranslations: cleaned,
      },
      correctAnswer: { translation: cleaned[0] ?? '' },
    }
  }, [state])

  const validate = () => {
    if (!state.sourceText.trim()) return 'Hãy nhập văn bản cần dịch'
    const cleaned = state.translations.filter((t) => t.trim())
    if (cleaned.length === 0) return 'Cần ít nhất 1 bản dịch'
    if (state.sourceLanguage === state.targetLanguage)
      return 'Ngôn ngữ nguồn và đích phải khác nhau'
    return null
  }

  useEffect(() => {
    onChange({ payload, validate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  const setTrans = (i: number, value: string) =>
    setState((prev) => {
      const next = [...prev.translations]
      next[i] = value
      return { ...prev, translations: next }
    })

  const removeTrans = (i: number) =>
    setState((prev) =>
      prev.translations.length <= 1
        ? prev
        : { ...prev, translations: prev.translations.filter((_, idx) => idx !== i) },
    )

  return (
    <div className="space-y-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
        <Languages className="h-3.5 w-3.5" />
        Bài dịch thuật
      </p>

      {/* Source section */}
      <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-2 border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Văn bản gốc
            </span>
          </div>
          <LanguagePicker
            value={state.sourceLanguage}
            onChange={(v) => setState((prev) => ({ ...prev, sourceLanguage: v }))}
            ariaLabel="Ngôn ngữ nguồn"
          />
        </div>
        <textarea
          value={state.sourceText}
          onChange={(e) =>
            setState((prev) => ({ ...prev, sourceText: e.target.value }))
          }
          rows={3}
          placeholder="Nhập văn bản cần dịch..."
          className="w-full bg-transparent px-5 py-4 text-xl font-semibold leading-relaxed outline-none resize-y"
        />
      </div>

      {/* Direction indicator */}
      <div className="flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Target section */}
      <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-2 border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Bản dịch chấp nhận
            </span>
            <span className="text-xs text-muted-foreground">
              · bản đầu tiên là đáp án chính
            </span>
          </div>
          <LanguagePicker
            value={state.targetLanguage}
            onChange={(v) => setState((prev) => ({ ...prev, targetLanguage: v }))}
            ariaLabel="Ngôn ngữ đích"
          />
        </div>
        <div className="p-4 space-y-2">
          {state.translations.map((t, i) => (
            <div
              key={i}
              className={`group flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${
                i === 0
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-border'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i === 0 ? '★' : i + 1}
              </span>
              <textarea
                value={t}
                onChange={(e) => setTrans(i, e.target.value)}
                rows={1}
                placeholder={i === 0 ? 'Bản dịch chính...' : `Biến thể ${i}`}
                className="flex-1 bg-transparent text-lg font-semibold leading-snug outline-none resize-none"
              />
              {state.translations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTrans(i)}
                  className="h-8 w-8 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label="Xóa bản dịch"
                >
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                translations: [...prev.translations, ''],
              }))
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm biến thể bản dịch
          </button>
        </div>
      </div>
    </div>
  )
}

function LanguagePicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  ariaLabel: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="rounded-lg border-2 border-input bg-card px-3 py-1.5 text-sm font-semibold outline-none focus-visible:border-primary cursor-pointer"
    >
      {LANGUAGE_OPTIONS.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
