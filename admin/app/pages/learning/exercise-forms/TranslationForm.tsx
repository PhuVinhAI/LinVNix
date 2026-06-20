import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, ArrowDown, Languages } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import type { QuestionFormProps } from './types'
import { LANGUAGE_OPTIONS, getOptionsObject } from './types'

interface DraftState {
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  translations: string[]
}

function normaliseLang(value: string, fallback: string): string {
  const map: Record<string, string> = {
    vi: 'vi', vietnamese: 'vi',
    en: 'en', english: 'en',
    fr: 'fr', french: 'fr',
    ja: 'ja', japanese: 'ja',
    ko: 'ko', korean: 'ko',
    zh: 'zh', chinese: 'zh',
  }
  return map[value.toLowerCase()] ?? fallback
}

function initialFromProps(initial: QuestionFormProps['initial']): DraftState {
  const opts = getOptionsObject(initial)
  const accepted = Array.isArray(opts.acceptedTranslations)
    ? (opts.acceptedTranslations as unknown[]).map((t) => String(t))
    : []
  const correct = (initial?.correctAnswer ?? {}) as { translation?: unknown }
  const translation = typeof correct.translation === 'string' ? correct.translation : ''
  const merged: string[] = []
  if (translation) merged.push(translation)
  for (const t of accepted) if (!merged.includes(t)) merged.push(t)
  return {
    sourceText: String(opts.sourceText ?? initial?.question ?? ''),
    sourceLanguage: normaliseLang(String(opts.sourceLanguage ?? 'en'), 'en'),
    targetLanguage: normaliseLang(String(opts.targetLanguage ?? 'vi'), 'vi'),
    translations: merged.length ? merged : [''],
  }
}

export function TranslationForm({ initial, onChange }: QuestionFormProps) {
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
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Languages className="h-4 w-4" />
        Dịch {state.sourceLanguage.toUpperCase()} → {state.targetLanguage.toUpperCase()}
      </div>

      {/* Source */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground">Ngôn ngữ gốc</label>
            <Select
              value={state.sourceLanguage}
              onValueChange={(v) => setState((prev) => ({ ...prev, sourceLanguage: v }))}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {LANGUAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Ngôn ngữ đích</label>
            <Select
              value={state.targetLanguage}
              onValueChange={(v) => setState((prev) => ({ ...prev, targetLanguage: v }))}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {LANGUAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">
            Văn bản gốc
            <span className="text-destructive ml-0.5">*</span>
          </label>
          <Textarea
            value={state.sourceText}
            onChange={(e) => setState((prev) => ({ ...prev, sourceText: e.target.value }))}
            rows={3}
            placeholder="Nhập văn bản cần dịch..."
            className="mt-1.5 min-h-24 text-lg font-semibold"
          />
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Target */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">
            Bản dịch chấp nhận
            <span className="text-destructive ml-0.5">*</span>
          </label>
          <p className="text-xs text-muted-foreground">bản đầu tiên là đáp án chính</p>
        </div>
        <div className="space-y-2.5">
          {state.translations.map((t, i) => (
            <div
              key={i}
              className={`group flex items-center gap-3 rounded-lg border-2 px-4 min-h-[52px] ${
                i === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i === 0 ? '★' : i + 1}
              </span>
              <Input
                value={t}
                onChange={(e) => setTrans(i, e.target.value)}
                placeholder={i === 0 ? 'Bản dịch chính...' : `Biến thể ${i}`}
                className="flex-1 font-semibold"
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
        </div>
        <button
          type="button"
          onClick={() =>
            setState((prev) => ({
              ...prev,
              translations: [...prev.translations, ''],
            }))
          }
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm biến thể bản dịch
        </button>
      </div>
    </div>
  )
}
