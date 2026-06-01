import { useState, type FormEvent } from 'react'
import { MessageSquare, Sparkles, Target, Settings, Eye, EyeOff } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { FormField, FormSection } from '../FormSection'
import { LevelPicker, DifficultyPicker } from '../editors/PickerControls'
import { ScoringCriteriaEditor, type ScoringCriterion } from '../editors/ScoringCriteriaEditor'

export interface ScenarioFormValues {
  title: string
  description: string
  systemPrompt: string
  openingMessage?: string | null
  requiredLevel: string
  difficulty: string
  scoringCriteria: ScoringCriterion[]
  maxTurns?: number | null
  estimatedMinutes: number
  isPublished: boolean
}

export function ScenarioForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<ScenarioFormValues> | null
  onSubmit: (values: ScenarioFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<ScenarioFormValues>({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    systemPrompt: initialValue?.systemPrompt ?? '',
    openingMessage: initialValue?.openingMessage ?? '',
    requiredLevel: initialValue?.requiredLevel ?? 'A1',
    difficulty: initialValue?.difficulty ?? 'EASY',
    scoringCriteria: Array.isArray(initialValue?.scoringCriteria) ? initialValue.scoringCriteria : [],
    maxTurns: initialValue?.maxTurns ?? null,
    estimatedMinutes: initialValue?.estimatedMinutes ?? 10,
    isPublished: initialValue?.isPublished ?? true,
  })

  const update = <K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...values,
      openingMessage: values.openingMessage || null,
      maxTurns: values.maxTurns || null,
      scoringCriteria: values.scoringCriteria.filter((c) => c.name.trim()),
    })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={MessageSquare} title="Thông tin tình huống">
        <FormField label="Tên tình huống" required>
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Gọi món tại quán cà phê"
            required
          />
        </FormField>

        <FormField label="Mô tả tình huống" required>
          <Textarea
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Mô tả bối cảnh và mục tiêu của tình huống"
            className="min-h-24"
            required
          />
        </FormField>
      </FormSection>

      <FormSection icon={Sparkles} title="Cấu hình AI" description="Chỉ thị cho AI đóng vai trong hội thoại">
        <FormField label="Lời nhắc hệ thống cho AI" required help="Hướng dẫn AI cách phản hồi học viên">
          <Textarea
            value={values.systemPrompt}
            onChange={(e) => update('systemPrompt', e.target.value)}
            placeholder="VD: Bạn là nhân viên phục vụ trong quán cà phê Việt Nam, hãy thân thiện và sử dụng từ vựng đơn giản..."
            className="min-h-40 font-mono text-xs"
            required
          />
        </FormField>

        <FormField label="Tin nhắn mở đầu" help="Câu chào của AI khi bắt đầu hội thoại">
          <Textarea
            value={values.openingMessage ?? ''}
            onChange={(e) => update('openingMessage', e.target.value)}
            placeholder="VD: Xin chào, anh/chị muốn dùng gì ạ?"
            className="min-h-20"
          />
        </FormField>
      </FormSection>

      <FormSection title="Cấp độ và độ khó">
        <FormField label="Cấp độ yêu cầu" required>
          <LevelPicker value={values.requiredLevel} onChange={(v) => update('requiredLevel', v)} />
        </FormField>

        <FormField label="Độ khó" required>
          <DifficultyPicker value={values.difficulty} onChange={(v) => update('difficulty', v)} />
        </FormField>
      </FormSection>

      <FormSection icon={Target} title="Tiêu chí chấm điểm" description="Các tiêu chí AI sử dụng để đánh giá học viên">
        <ScoringCriteriaEditor
          value={values.scoringCriteria}
          onChange={(next) => update('scoringCriteria', next)}
        />
      </FormSection>

      <FormSection icon={Settings} title="Cấu hình phiên hội thoại">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Số lượt tối đa" help="Để trống nếu không giới hạn">
            <Input
              type="number"
              min="1"
              value={values.maxTurns ?? ''}
              onChange={(e) => update('maxTurns', e.target.value ? Number(e.target.value) : null)}
              placeholder="VD: 10"
            />
          </FormField>

          <FormField label="Thời gian ước tính (phút)" required>
            <Input
              type="number"
              min="1"
              value={values.estimatedMinutes}
              onChange={(e) => update('estimatedMinutes', Number(e.target.value) || 1)}
              required
            />
          </FormField>
        </div>

        <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {values.isPublished ? (
              <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">
              {values.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
            </p>
            <p className="text-xs text-muted-foreground">
              {values.isPublished
                ? 'Học viên có thể nhìn thấy và luyện tập tình huống này'
                : 'Tình huống chỉ hiển thị trong khu vực quản trị'}
            </p>
          </div>
          <Switch
            checked={values.isPublished}
            onCheckedChange={(checked) => update('isPublished', checked)}
          />
        </div>
      </FormSection>
    </form>
  )
}
