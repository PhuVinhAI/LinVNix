import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  Save, X, Check, Plus, Trash2, Volume2, Lightbulb, Sparkles,
  CheckSquare, Edit3, Link2, ArrowDownUp, Languages, Headphones, Mic,
  GripVertical, ChevronDown, FileAudio,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { InlineEditable } from '../../components/admin/InlineEditable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { MediaUpload } from '../../components/admin/editors/MediaUpload'
import { useAdminExerciseSet, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import { learningPath } from './route-utils'

const TYPES: Array<{ value: string; label: string; Icon: LucideIcon; tone: string }> = [
  { value: 'multiple_choice', label: 'Trắc nghiệm', Icon: CheckSquare, tone: 'text-blue-600 dark:text-blue-400' },
  { value: 'fill_blank', label: 'Điền chỗ trống', Icon: Edit3, tone: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'matching', label: 'Ghép cặp', Icon: Link2, tone: 'text-purple-600 dark:text-purple-400' },
  { value: 'ordering', label: 'Sắp xếp', Icon: ArrowDownUp, tone: 'text-indigo-600 dark:text-indigo-400' },
  { value: 'translation', label: 'Dịch thuật', Icon: Languages, tone: 'text-amber-600 dark:text-amber-400' },
  { value: 'listening', label: 'Nghe hiểu', Icon: Headphones, tone: 'text-rose-600 dark:text-rose-400' },
  { value: 'speaking', label: 'Nói', Icon: Mic, tone: 'text-cyan-600 dark:text-cyan-400' },
]

const DIFFICULTY_LABELS = ['', 'Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó']
const DIFFICULTY_DOT = ['', 'bg-emerald-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-red-600']

interface State {
  exerciseType: string
  question: string
  questionAudioUrl: string
  explanation: string
  orderIndex: number
  difficultyLevel: number
  choiceOptions: string[]
  choiceCorrect: string
  fillBlankAnswers: string[]
  matchingPairs: Array<{ left: string; right: string }>
  orderingItems: string[]
  translationAnswers: string[]
}

function deriveInitial(initial: Record<string, unknown> | undefined | null): State {
  const type = String(initial?.exerciseType ?? 'multiple_choice').toLowerCase()
  const opts = (initial?.options ?? null) as Record<string, unknown> | unknown[] | null
  const correct = (initial?.correctAnswer ?? null) as Record<string, unknown> | unknown[] | string | null
  const state: State = {
    exerciseType: type,
    question: String(initial?.question ?? ''),
    questionAudioUrl: String(initial?.questionAudioUrl ?? ''),
    explanation: String(initial?.explanation ?? ''),
    orderIndex: Number(initial?.orderIndex ?? 0) || 0,
    difficultyLevel: Number(initial?.difficultyLevel ?? 1) || 1,
    choiceOptions: [],
    choiceCorrect: '',
    fillBlankAnswers: [],
    matchingPairs: [],
    orderingItems: [],
    translationAnswers: [],
  }

  if (type === 'multiple_choice') {
    if (Array.isArray(opts)) {
      state.choiceOptions = opts as string[]
    } else if (opts && typeof opts === 'object' && Array.isArray((opts as { choices?: unknown }).choices)) {
      state.choiceOptions = (opts as { choices: string[] }).choices
    } else {
      state.choiceOptions = ['', '']
    }
    if (typeof correct === 'string') {
      state.choiceCorrect = correct
    } else if (correct && typeof correct === 'object' && !Array.isArray(correct)) {
      const selected = (correct as { selectedChoice?: unknown }).selectedChoice
      state.choiceCorrect = typeof selected === 'string' ? selected : ''
    }
  } else if (type === 'fill_blank') {
    if (Array.isArray(correct)) {
      state.fillBlankAnswers = correct as string[]
    } else if (typeof correct === 'string') {
      state.fillBlankAnswers = [correct]
    } else if (correct && typeof correct === 'object') {
      const answers = (correct as { answers?: unknown }).answers
      state.fillBlankAnswers = Array.isArray(answers) ? (answers as string[]) : ['']
    } else {
      state.fillBlankAnswers = ['']
    }
  } else if (type === 'matching') {
    let pairs: Array<{ left: string; right: string }> = []
    if (Array.isArray(correct)) {
      pairs = (correct as Array<{ left?: string; right?: string }>)
        .filter((p) => p && typeof p === 'object')
        .map((p) => ({ left: String(p.left ?? ''), right: String(p.right ?? '') }))
    } else if (correct && typeof correct === 'object') {
      const matches = (correct as { matches?: unknown }).matches
      if (Array.isArray(matches)) {
        pairs = (matches as Array<{ left?: string; right?: string }>).map((p) => ({
          left: String(p.left ?? ''),
          right: String(p.right ?? ''),
        }))
      }
    }
    if (!pairs.length && opts && typeof opts === 'object' && !Array.isArray(opts)) {
      const optPairs = (opts as { pairs?: unknown }).pairs
      if (Array.isArray(optPairs)) {
        pairs = (optPairs as Array<{ left?: string; right?: string }>).map((p) => ({
          left: String(p.left ?? ''),
          right: String(p.right ?? ''),
        }))
      }
    }
    state.matchingPairs = pairs.length ? pairs : [{ left: '', right: '' }]
  } else if (type === 'ordering') {
    let items: string[] = []
    if (Array.isArray(correct)) {
      items = correct as string[]
    } else if (correct && typeof correct === 'object') {
      const ordered = (correct as { orderedItems?: unknown }).orderedItems
      if (Array.isArray(ordered)) items = ordered as string[]
    }
    if (!items.length && opts && typeof opts === 'object' && !Array.isArray(opts)) {
      const optItems = (opts as { items?: unknown }).items
      if (Array.isArray(optItems)) items = optItems as string[]
    } else if (!items.length && Array.isArray(opts)) {
      items = opts as string[]
    }
    state.orderingItems = items.length ? items : ['', '']
  } else if (type === 'translation') {
    if (Array.isArray(correct)) {
      state.translationAnswers = correct as string[]
    } else if (typeof correct === 'string') {
      state.translationAnswers = [correct]
    } else if (correct && typeof correct === 'object') {
      const t = (correct as { translation?: unknown }).translation
      const accepted =
        opts && typeof opts === 'object' && !Array.isArray(opts)
          ? (opts as { acceptedTranslations?: unknown }).acceptedTranslations
          : null
      const list: string[] = []
      if (typeof t === 'string' && t) list.push(t)
      if (Array.isArray(accepted)) list.push(...(accepted as string[]))
      state.translationAnswers = list.length ? Array.from(new Set(list)) : ['']
    } else {
      state.translationAnswers = ['']
    }
  } else if (type === 'listening' || type === 'speaking') {
    if (Array.isArray(correct)) {
      state.translationAnswers = correct as string[]
    } else if (typeof correct === 'string') {
      state.translationAnswers = [correct]
    } else if (correct && typeof correct === 'object') {
      const transcript = (correct as { transcript?: unknown }).transcript
      const keywords =
        opts && typeof opts === 'object' && !Array.isArray(opts)
          ? (opts as { keywords?: unknown }).keywords
          : null
      const list: string[] = []
      if (typeof transcript === 'string' && transcript) list.push(transcript)
      if (Array.isArray(keywords)) list.push(...(keywords as string[]))
      state.translationAnswers = list.length ? Array.from(new Set(list)) : ['']
    } else {
      state.translationAnswers = ['']
    }
  }

  return state
}

const TYPE_TO_ENUM: Record<string, string> = {
  multiple_choice: 'MULTIPLE_CHOICE',
  fill_blank: 'FILL_BLANK',
  matching: 'MATCHING',
  ordering: 'ORDERING',
  translation: 'TRANSLATION',
  listening: 'LISTENING',
  speaking: 'SPEAKING',
}

function buildPayload(state: State): Record<string, unknown> {
  const base: Record<string, unknown> = {
    exerciseType: TYPE_TO_ENUM[state.exerciseType] ?? state.exerciseType.toUpperCase(),
    question: state.question,
    questionAudioUrl: state.questionAudioUrl || null,
    explanation: state.explanation || null,
    orderIndex: state.orderIndex,
    difficultyLevel: state.difficultyLevel,
  }
  switch (state.exerciseType) {
    case 'multiple_choice': {
      const choices = state.choiceOptions.filter(Boolean)
      return {
        ...base,
        options: { type: state.exerciseType, choices },
        correctAnswer: { selectedChoice: state.choiceCorrect },
      }
    }
    case 'fill_blank': {
      const answers = state.fillBlankAnswers.filter(Boolean)
      return {
        ...base,
        options: { type: state.exerciseType, blanks: answers.length || 1 },
        correctAnswer: { answers },
      }
    }
    case 'matching': {
      const pairs = state.matchingPairs.filter((p) => p.left.trim() && p.right.trim())
      return {
        ...base,
        options: { type: state.exerciseType, pairs },
        correctAnswer: { matches: pairs },
      }
    }
    case 'ordering': {
      const items = state.orderingItems.filter(Boolean)
      return {
        ...base,
        options: { type: state.exerciseType, items },
        correctAnswer: { orderedItems: items },
      }
    }
    case 'translation': {
      const answers = state.translationAnswers.filter(Boolean)
      return {
        ...base,
        options: {
          type: state.exerciseType,
          sourceLanguage: 'vi',
          targetLanguage: 'en',
          acceptedTranslations: answers,
        },
        correctAnswer: { translation: answers[0] ?? '' },
      }
    }
    case 'listening':
    case 'speaking': {
      const answers = state.translationAnswers.filter(Boolean)
      const optionsExtras =
        state.exerciseType === 'speaking'
          ? { promptAudioUrl: state.questionAudioUrl || '' }
          : { audioUrl: state.questionAudioUrl || '' }
      return {
        ...base,
        options: {
          type: state.exerciseType,
          transcriptType: 'keywords' as const,
          keywords: answers,
          ...optionsExtras,
        },
        correctAnswer: { transcript: answers[0] ?? '' },
      }
    }
    default:
      return base
  }
}

export function ExerciseFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { setId, id } = useParams()
  const navigate = useNavigate()
  const { data: set } = useAdminExerciseSet(setId)
  const exercise = set?.exercises?.find((item) => item.id === id) ?? null
  const mutations = useLearningAdminMutation()
  const [submitting, setSubmitting] = useState(false)

  const [state, setState] = useState<State>(() => deriveInitial(exercise as Record<string, unknown> | null))

  useEffect(() => {
    if (mode === 'edit' && exercise) {
      setState(deriveInitial(exercise as Record<string, unknown>))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id])

  const typeMeta = useMemo(() => TYPES.find((t) => t.value === state.exerciseType) ?? TYPES[0], [state.exerciseType])

  const update = <K extends keyof State>(key: K, value: State[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const backPath = setId ? learningPath.exerciseSet(setId) : learningPath.courses()

  const save = async () => {
    if (!state.question.trim()) {
      toast.error('Hãy nhập câu hỏi trước khi lưu')
      return
    }
    setSubmitting(true)
    try {
      const payload = buildPayload(state)
      if (mode === 'edit' && id) {
        await mutations.updateExercise.mutateAsync({ id, payload })
        toast.success('Đã cập nhật bài tập')
      } else if (setId) {
        await mutations.createExercise.mutateAsync({ setId, payload })
        toast.success('Đã tạo bài tập')
      }
      if (setId) navigate(learningPath.exerciseSet(setId))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-6 flex-1">
      <Breadcrumbs
        items={[
          { label: set?.lesson?.title ?? 'Bài học', href: set?.lessonId ? learningPath.lesson(set.lessonId, 'sets') : undefined },
          { label: set?.title ?? 'Bộ bài tập', href: setId ? learningPath.exerciseSet(setId) : undefined },
          { label: mode === 'edit' ? 'Sửa bài tập' : 'Thêm bài tập' },
        ]}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-full border-2 border-border bg-card px-2 py-2">
        <TypePicker value={state.exerciseType} onChange={(v) => update('exerciseType', v)} />
        <Divider />
        <DifficultyPicker value={state.difficultyLevel} onChange={(v) => update('difficultyLevel', v)} />
        <Divider />
        <OrderPicker value={state.orderIndex} onChange={(v) => update('orderIndex', v)} />
        <Divider />
        <AudioPicker value={state.questionAudioUrl} onChange={(v) => update('questionAudioUrl', v)} />
        <Divider />
        <ExplanationPicker value={state.explanation} onChange={(v) => update('explanation', v)} />
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Bấm vào bất kỳ chữ nào để sửa
        </span>
      </div>

      {/* Live exercise canvas */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border-2 border-border bg-card shadow-sm overflow-hidden">
          {/* Header strip */}
          <div className="flex items-center justify-between gap-3 px-6 py-3 border-b-2 border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-muted ${typeMeta.tone}`}>
                <typeMeta.Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${typeMeta.tone}`}>{typeMeta.label}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[state.difficultyLevel]}`} />
                {DIFFICULTY_LABELS[state.difficultyLevel]}
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground tabular-nums">#{state.orderIndex || 0}</span>
          </div>

          {/* Body */}
          <div className="px-6 py-8 sm:px-10 sm:py-12 space-y-8">
            {state.questionAudioUrl && (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-muted/30 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audio câu hỏi</p>
                  <p className="text-sm truncate text-foreground">{state.questionAudioUrl}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Câu hỏi
              </p>
              <InlineEditable
                value={state.question}
                onChange={(v) => update('question', v)}
                placeholder="Bấm để nhập câu hỏi..."
                className="text-2xl sm:text-3xl font-bold leading-snug text-foreground py-1"
                ariaLabel="Câu hỏi"
              />
            </div>

            {state.exerciseType === 'multiple_choice' && (
              <ChoiceBody
                options={state.choiceOptions}
                correct={state.choiceCorrect}
                onChange={(next) => {
                  setState((prev) => ({ ...prev, choiceOptions: next.options, choiceCorrect: next.correct }))
                }}
              />
            )}

            {state.exerciseType === 'fill_blank' && (
              <FillBlankBody
                values={state.fillBlankAnswers}
                onChange={(v) => update('fillBlankAnswers', v)}
              />
            )}

            {state.exerciseType === 'matching' && (
              <MatchingBody
                pairs={state.matchingPairs}
                onChange={(v) => update('matchingPairs', v)}
              />
            )}

            {state.exerciseType === 'ordering' && (
              <OrderingBody
                items={state.orderingItems}
                onChange={(v) => update('orderingItems', v)}
              />
            )}

            {(state.exerciseType === 'translation' ||
              state.exerciseType === 'listening' ||
              state.exerciseType === 'speaking') && (
              <FreeAnswerBody
                title={
                  state.exerciseType === 'translation'
                    ? 'Bản dịch chấp nhận được'
                    : state.exerciseType === 'listening'
                      ? 'Đáp án nghe hiểu'
                      : 'Câu trả lời mong đợi'
                }
                values={state.translationAnswers}
                onChange={(v) => update('translationAnswers', v)}
              />
            )}

            {state.explanation && (
              <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-0.5">
                      Giải thích
                    </p>
                    <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                      {state.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      </div>
      {/* Sticky action bar — anchored to bottom of main scroll area */}
      <div className="sticky bottom-[-2.5rem] -mx-10 -mb-10 mt-10 z-30 border-t-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-10 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {mode === 'edit' ? 'Đang chỉnh sửa bài tập' : 'Đang tạo bài tập mới'} ·{' '}
            <span className="font-semibold text-foreground">{typeMeta.label}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to={backPath}>
                <X className="h-4 w-4" />
                Hủy
              </Link>
            </Button>
            <Button onClick={save} disabled={submitting}>
              <Save className="h-4 w-4" />
              {submitting ? 'Đang lưu...' : mode === 'edit' ? 'Cập nhật' : 'Tạo bài tập'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return <span className="h-6 w-px bg-border" aria-hidden />
}

function TypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = TYPES.find((t) => t.value === value) ?? TYPES[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <current.Icon className={`h-4 w-4 ${current.tone}`} />
          <span className="text-sm font-bold">{current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {TYPES.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onSelect={() => onChange(t.value)}
            className={value === t.value ? 'bg-muted font-bold' : ''}
          >
            <t.Icon className={`h-4 w-4 ${t.tone}`} />
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DifficultyPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <span className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT[value]}`} />
          <span className="text-sm font-semibold">{DIFFICULTY_LABELS[value]}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
          Độ khó
        </p>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange(lvl)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                value === lvl ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT[lvl]}`} />
                {DIFFICULTY_LABELS[lvl]}
              </span>
              <span className="text-xs tabular-nums opacity-60">{lvl}/5</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function OrderPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <span className="text-xs font-mono text-muted-foreground">Thứ tự</span>
          <span className="text-sm font-bold tabular-nums">#{value || 0}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Thứ tự hiển thị
        </label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="mt-2"
          min={0}
        />
      </PopoverContent>
    </Popover>
  )
}

function AudioPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
            value ? 'text-primary font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <FileAudio className="h-4 w-4" />
          <span className="text-sm">{value ? 'Có audio' : 'Audio'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-3 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Audio câu hỏi
        </label>
        <MediaUpload
          kind="audio"
          value={value || null}
          onChange={(url) => onChange(url ?? '')}
        />
      </PopoverContent>
    </Popover>
  )
}

function ExplanationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
            value ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm">{value ? 'Có giải thích' : 'Giải thích'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-3 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Giải thích hiển thị sau khi trả lời
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Vì sao đáp án này đúng..."
          rows={5}
          className="w-full rounded-lg border-2 border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary resize-y"
        />
      </PopoverContent>
    </Popover>
  )
}

function ChoiceBody({
  options,
  correct,
  onChange,
}: {
  options: string[]
  correct: string
  onChange: (next: { options: string[]; correct: string }) => void
}) {
  const items = options.length ? options : ['', '']
  const update = (next: string[], nextCorrect: string) => onChange({ options: next, correct: nextCorrect })
  const setItem = (i: number, text: string) => {
    const prevValue = items[i]
    const next = [...items]
    next[i] = text
    const c = correct === prevValue ? text : correct
    update(next, c)
  }
  const remove = (i: number) => {
    if (items.length <= 2) return
    const removed = items[i]
    const next = items.filter((_, idx) => idx !== i)
    update(next, correct === removed ? '' : correct)
  }
  const add = () => update([...items, ''], correct)
  const pick = (text: string) => update(items, text)

  return (
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
        {items.map((opt, i) => {
          const isCorrect = opt !== '' && correct === opt
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
                onClick={() => pick(opt)}
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
                onChange={(v) => setItem(i, v)}
                placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                className="text-lg font-semibold flex-1"
                ariaLabel={`Lựa chọn ${String.fromCharCode(65 + i)}`}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={items.length <= 2}
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
        onClick={add}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Thêm lựa chọn
      </button>
    </div>
  )
}

function FillBlankBody({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const items = values.length ? values : ['']
  const set = (i: number, text: string) => {
    const next = [...items]
    next[i] = text
    onChange(next)
  }
  const remove = (i: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Đáp án chấp nhận được
      </p>
      <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-4 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="group flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3.5 min-h-[60px]">
            <Check className="h-5 w-5 text-emerald-500 shrink-0" />
            <InlineEditable
              value={it}
              onChange={(v) => set(i, v)}
              placeholder="Đáp án..."
              className="text-lg font-semibold flex-1"
              multiline={false}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length <= 1}
              className="h-8 w-8 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:pointer-events-none"
              aria-label="Xóa"
            >
              <Trash2 className="h-3.5 w-3.5 mx-auto" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm biến thể đáp án
        </button>
      </div>
    </div>
  )
}

function MatchingBody({
  pairs,
  onChange,
}: {
  pairs: Array<{ left: string; right: string }>
  onChange: (v: Array<{ left: string; right: string }>) => void
}) {
  const items = pairs.length ? pairs : [{ left: '', right: '' }]
  const set = (i: number, side: 'left' | 'right', text: string) => {
    onChange(items.map((p, idx) => (idx === i ? { ...p, [side]: text } : p)))
  }
  const remove = (i: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Các cặp ghép
      </p>
      <div className="space-y-2.5">
        {items.map((pair, i) => (
          <div key={i} className="group flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-3 items-center rounded-2xl border-2 border-border bg-card px-5 py-3.5 min-h-[64px]">
              <InlineEditable
                value={pair.left}
                onChange={(v) => set(i, 'left', v)}
                placeholder="Vế trái"
                className="text-lg font-semibold"
                multiline={false}
              />
              <span className="text-muted-foreground/60 font-bold text-lg px-1">↔</span>
              <InlineEditable
                value={pair.right}
                onChange={(v) => set(i, 'right', v)}
                placeholder="Vế phải"
                className="text-lg font-semibold"
                multiline={false}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length <= 1}
              className="h-10 w-10 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:pointer-events-none"
              aria-label="Xóa cặp"
            >
              <Trash2 className="h-4 w-4 mx-auto" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { left: '', right: '' }])}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-4 w-4" />
        Thêm cặp ghép
      </button>
    </div>
  )
}

function OrderingBody({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const list = items.length ? items : ['', '']
  const set = (i: number, text: string) => {
    const next = [...list]
    next[i] = text
    onChange(next)
  }
  const remove = (i: number) => {
    if (list.length <= 2) return
    onChange(list.filter((_, idx) => idx !== i))
  }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Thứ tự đúng (kéo để đổi)
      </p>
      <div className="space-y-2.5">
        {list.map((it, i) => (
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
                disabled={i === list.length - 1}
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
              onChange={(v) => set(i, v)}
              placeholder={`Mục ${i + 1}`}
              className="text-lg font-semibold flex-1"
              multiline={false}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={list.length <= 2}
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
        onClick={() => onChange([...list, ''])}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-4 w-4" />
        Thêm mục
      </button>
    </div>
  )
}

function FreeAnswerBody({
  title,
  values,
  onChange,
}: {
  title: string
  values: string[]
  onChange: (v: string[]) => void
}) {
  const items = values.length ? values : ['']
  const set = (i: number, text: string) => {
    const next = [...items]
    next[i] = text
    onChange(next)
  }
  const remove = (i: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </p>
      <div className="space-y-2.5">
        {items.map((it, i) => (
          <div key={i} className="group flex items-start gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3.5 min-h-[64px]">
            <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-1.5" />
            <InlineEditable
              value={it}
              onChange={(v) => set(i, v)}
              placeholder="Câu trả lời..."
              className="text-lg font-semibold flex-1"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length <= 1}
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
        onClick={() => onChange([...items, ''])}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-4 w-4" />
        Thêm đáp án
      </button>
    </div>
  )
}
