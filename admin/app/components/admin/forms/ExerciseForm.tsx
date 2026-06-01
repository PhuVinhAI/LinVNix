import { useState, type FormEvent } from 'react'
import {
  CheckSquare, Edit3, Link2, ArrowDownUp, Languages,
  Headphones, Mic, HelpCircle, Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'
import { ChoiceOptionsEditor } from '../editors/ChoiceOptionsEditor'
import { TextListEditor } from '../editors/TextListEditor'

const EXERCISE_TYPES: Array<{ value: string; label: string; Icon: LucideIcon; help: string }> = [
  { value: 'multiple_choice', label: 'Trắc nghiệm', Icon: CheckSquare, help: 'Chọn 1 đáp án đúng' },
  { value: 'fill_blank', label: 'Điền chỗ trống', Icon: Edit3, help: 'Điền từ vào câu' },
  { value: 'matching', label: 'Ghép cặp', Icon: Link2, help: 'Nối cặp tương ứng' },
  { value: 'ordering', label: 'Sắp xếp', Icon: ArrowDownUp, help: 'Sắp xếp đúng thứ tự' },
  { value: 'translation', label: 'Dịch thuật', Icon: Languages, help: 'Dịch câu' },
  { value: 'listening', label: 'Nghe hiểu', Icon: Headphones, help: 'Nghe và trả lời' },
  { value: 'speaking', label: 'Nói', Icon: Mic, help: 'Phát âm và nói' },
]

export interface ExerciseFormValues {
  exerciseType: string
  question: string
  options: unknown
  correctAnswer: unknown
  explanation?: string | null
  questionAudioUrl?: string | null
  orderIndex: number
  difficultyLevel: number
}

interface InternalState {
  exerciseType: string
  question: string
  choiceOptions: string[]
  choiceCorrect: string
  fillBlankAnswers: string[]
  matchingPairs: Array<{ left: string; right: string }>
  orderingItems: string[]
  translationAnswers: string[]
  explanation: string
  questionAudioUrl: string
  orderIndex: number
  difficultyLevel: number
}

function deriveInitial(initial?: Partial<ExerciseFormValues> | null): InternalState {
  const type = (initial?.exerciseType ?? 'multiple_choice').toLowerCase()
  const opts = (initial?.options as unknown) ?? null
  const correct = (initial?.correctAnswer as unknown) ?? null

  const state: InternalState = {
    exerciseType: type,
    question: initial?.question ?? '',
    choiceOptions: [],
    choiceCorrect: '',
    fillBlankAnswers: [],
    matchingPairs: [],
    orderingItems: [],
    translationAnswers: [],
    explanation: initial?.explanation ?? '',
    questionAudioUrl: initial?.questionAudioUrl ?? '',
    orderIndex: initial?.orderIndex ?? 0,
    difficultyLevel: initial?.difficultyLevel ?? 1,
  }

  if (type === 'multiple_choice') {
    state.choiceOptions = Array.isArray(opts) ? (opts as string[]) : []
    state.choiceCorrect = typeof correct === 'string' ? correct : ''
  } else if (type === 'fill_blank') {
    state.fillBlankAnswers = Array.isArray(correct)
      ? (correct as string[])
      : typeof correct === 'string'
        ? [correct]
        : []
  } else if (type === 'matching') {
    if (Array.isArray(correct)) {
      state.matchingPairs = (correct as Array<{ left: string; right: string }>).filter(
        (p) => typeof p === 'object' && p !== null
      )
    }
  } else if (type === 'ordering') {
    state.orderingItems = Array.isArray(correct) ? (correct as string[]) : []
  } else if (type === 'translation') {
    state.translationAnswers = Array.isArray(correct)
      ? (correct as string[])
      : typeof correct === 'string'
        ? [correct]
        : []
  }

  return state
}

function buildPayload(state: InternalState): Pick<ExerciseFormValues, 'options' | 'correctAnswer'> {
  switch (state.exerciseType) {
    case 'multiple_choice':
      return {
        options: state.choiceOptions.filter(Boolean),
        correctAnswer: state.choiceCorrect,
      }
    case 'fill_blank':
      return {
        options: null,
        correctAnswer: state.fillBlankAnswers.filter(Boolean),
      }
    case 'matching':
      return {
        options: state.matchingPairs.map((p) => p.left),
        correctAnswer: state.matchingPairs.filter((p) => p.left.trim() && p.right.trim()),
      }
    case 'ordering':
      return {
        options: state.orderingItems.filter(Boolean),
        correctAnswer: state.orderingItems.filter(Boolean),
      }
    case 'translation':
      return {
        options: null,
        correctAnswer: state.translationAnswers.filter(Boolean),
      }
    default:
      return { options: null, correctAnswer: '' }
  }
}

export function ExerciseForm({
  id,
  initialValue,
  onSubmit,
  onChange,
}: {
  id: string
  initialValue?: Partial<ExerciseFormValues> | null
  onSubmit: (values: ExerciseFormValues) => Promise<void> | void
  onChange?: (values: ExerciseFormValues) => void
}) {
  const [state, setState] = useState<InternalState>(deriveInitial(initialValue))

  const emit = (next: InternalState) => {
    const payload = buildPayload(next)
    onChange?.({
      exerciseType: next.exerciseType,
      question: next.question,
      explanation: next.explanation || null,
      questionAudioUrl: next.questionAudioUrl || null,
      orderIndex: next.orderIndex,
      difficultyLevel: next.difficultyLevel,
      ...payload,
    })
  }

  const update = <K extends keyof InternalState>(key: K, value: InternalState[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value }
      emit(next)
      return next
    })
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const payload = buildPayload(state)
    await onSubmit({
      exerciseType: state.exerciseType,
      question: state.question,
      explanation: state.explanation || null,
      questionAudioUrl: state.questionAudioUrl || null,
      orderIndex: state.orderIndex,
      difficultyLevel: state.difficultyLevel,
      ...payload,
    })
  }

  const addPair = () => {
    update('matchingPairs', [...state.matchingPairs, { left: '', right: '' }])
  }

  const updatePair = (idx: number, side: 'left' | 'right', value: string) => {
    const next = state.matchingPairs.map((p, i) => (i === idx ? { ...p, [side]: value } : p))
    update('matchingPairs', next)
  }

  const removePair = (idx: number) => {
    if (state.matchingPairs.length <= 1) return
    update('matchingPairs', state.matchingPairs.filter((_, i) => i !== idx))
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection title="Loại bài tập" description="Chọn dạng bài tập phù hợp với mục tiêu rèn luyện">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXERCISE_TYPES.map(({ value, label, Icon, help }) => {
            const isActive = state.exerciseType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => update('exerciseType', value)}
                className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-colors ${
                  isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                    {help}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection icon={HelpCircle} title="Câu hỏi">
        <FormField label="Nội dung câu hỏi" required>
          <Textarea
            value={state.question}
            onChange={(e) => update('question', e.target.value)}
            placeholder="VD: Trong tiếng Việt, 'xin chào' có nghĩa là gì?"
            className="min-h-24"
            required
          />
        </FormField>

        <FormField label="Đường dẫn audio câu hỏi" help="Cho bài tập nghe">
          <div className="flex gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-muted">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="url"
              value={state.questionAudioUrl}
              onChange={(e) => update('questionAudioUrl', e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
          </div>
        </FormField>
      </FormSection>

      {/* MULTIPLE CHOICE */}
      {state.exerciseType === 'multiple_choice' && (
        <FormSection icon={CheckSquare} title="Các lựa chọn" description="Thêm các đáp án và chọn đáp án đúng">
          <ChoiceOptionsEditor
            options={state.choiceOptions}
            correctAnswer={state.choiceCorrect}
            onChange={({ options, correctAnswer }) => {
              setState((prev) => {
                const next = { ...prev, choiceOptions: options, choiceCorrect: correctAnswer }
                emit(next)
                return next
              })
            }}
          />
        </FormSection>
      )}

      {/* FILL BLANK */}
      {state.exerciseType === 'fill_blank' && (
        <FormSection icon={Edit3} title="Đáp án điền vào chỗ trống" description="Liệt kê các đáp án chấp nhận được (thay phiên)">
          <TextListEditor
            value={state.fillBlankAnswers}
            onChange={(next) => update('fillBlankAnswers', next)}
            placeholder="Đáp án chấp nhận được"
            addLabel="Thêm biến thể đáp án"
            emptyLabel="Chưa có đáp án nào"
            minItems={1}
          />
        </FormSection>
      )}

      {/* MATCHING */}
      {state.exerciseType === 'matching' && (
        <FormSection icon={Link2} title="Các cặp ghép" description="Học viên ghép cột trái với cột phải">
          <div className="space-y-2">
            {(state.matchingPairs.length ? state.matchingPairs : [{ left: '', right: '' }]).map((pair, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-10 w-8 shrink-0 items-center justify-center text-xs font-bold text-muted-foreground tabular-nums">
                  {idx + 1}
                </span>
                <Input
                  value={pair.left}
                  onChange={(e) => updatePair(idx, 'left', e.target.value)}
                  placeholder="Vế trái (tiếng Việt)"
                  className="flex-1"
                />
                <span className="text-muted-foreground">↔</span>
                <Input
                  value={pair.right}
                  onChange={(e) => updatePair(idx, 'right', e.target.value)}
                  placeholder="Vế phải (bản dịch)"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removePair(idx)}
                  disabled={state.matchingPairs.length <= 1}
                  className="h-10 w-10 shrink-0 rounded-lg border-2 border-border bg-card text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPair}
              className="w-full rounded-lg border-2 border-dashed border-border bg-card py-2 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
            >
              + Thêm cặp ghép
            </button>
          </div>
        </FormSection>
      )}

      {/* ORDERING */}
      {state.exerciseType === 'ordering' && (
        <FormSection icon={ArrowDownUp} title="Sắp xếp đúng thứ tự" description="Nhập các mục theo thứ tự đúng — học viên sẽ sắp xếp lại">
          <TextListEditor
            value={state.orderingItems}
            onChange={(next) => update('orderingItems', next)}
            placeholder="Mục theo thứ tự đúng"
            addLabel="Thêm mục"
            emptyLabel="Chưa có mục nào"
            minItems={2}
          />
        </FormSection>
      )}

      {/* TRANSLATION */}
      {state.exerciseType === 'translation' && (
        <FormSection icon={Languages} title="Bản dịch chấp nhận được" description="Liệt kê các bản dịch hợp lệ">
          <TextListEditor
            value={state.translationAnswers}
            onChange={(next) => update('translationAnswers', next)}
            placeholder="Bản dịch hợp lệ"
            addLabel="Thêm bản dịch"
            emptyLabel="Chưa có bản dịch nào"
            minItems={1}
          />
        </FormSection>
      )}

      {/* LISTENING / SPEAKING fallback */}
      {(state.exerciseType === 'listening' || state.exerciseType === 'speaking') && (
        <FormSection title="Đáp án mong đợi">
          <TextListEditor
            value={state.translationAnswers}
            onChange={(next) => update('translationAnswers', next)}
            placeholder="Đáp án chấp nhận"
            addLabel="Thêm đáp án"
            emptyLabel="Chưa có đáp án nào"
            minItems={1}
          />
        </FormSection>
      )}

      <FormSection title="Giải thích và cấu hình">
        <FormField label="Giải thích đáp án" help="Hiển thị cho học viên sau khi trả lời">
          <Textarea
            value={state.explanation}
            onChange={(e) => update('explanation', e.target.value)}
            placeholder="Giải thích vì sao đáp án này đúng..."
            className="min-h-20"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Thứ tự hiển thị" required>
            <Input
              type="number"
              value={state.orderIndex}
              onChange={(e) => update('orderIndex', Number(e.target.value) || 0)}
              required
            />
          </FormField>

          <FormField label="Mức độ khó">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => update('difficultyLevel', level)}
                  className={`flex-1 h-10 rounded-md border-2 text-sm font-bold transition-colors ${
                    state.difficultyLevel >= level
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </FormSection>
    </form>
  )
}
