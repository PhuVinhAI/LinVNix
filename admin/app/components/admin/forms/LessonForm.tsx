import { useState, type FormEvent } from 'react'
import {
  BookOpen, Lightbulb, Headphones, MessageCircle, Edit3,
  Mic, Globe, FileText, GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { FormField, FormSection } from '../FormSection'
import { OrderIndexStepper } from '../editors/OrderIndexStepper'

const LESSON_TYPES: Array<{ value: string; label: string; Icon: LucideIcon; color: string }> = [
  { value: 'vocabulary', label: 'Từ vựng', Icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'grammar', label: 'Ngữ pháp', Icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'reading', label: 'Đọc', Icon: FileText, color: 'text-indigo-600 dark:text-indigo-400' },
  { value: 'listening', label: 'Nghe', Icon: Headphones, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'speaking', label: 'Nói', Icon: MessageCircle, color: 'text-rose-600 dark:text-rose-400' },
  { value: 'writing', label: 'Viết', Icon: Edit3, color: 'text-amber-600 dark:text-amber-400' },
  { value: 'pronunciation', label: 'Phát âm', Icon: Mic, color: 'text-teal-600 dark:text-teal-400' },
  { value: 'culture', label: 'Văn hóa', Icon: Globe, color: 'text-fuchsia-600 dark:text-fuchsia-400' },
]

export interface LessonFormValues {
  title: string
  description: string
  lessonType: string
  orderIndex: number
  estimatedDuration?: number | null
  isAssessment: boolean
}

export function LessonForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<LessonFormValues> | null
  onSubmit: (values: LessonFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<LessonFormValues>({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    lessonType: initialValue?.lessonType ?? 'vocabulary',
    orderIndex: initialValue?.orderIndex ?? 0,
    estimatedDuration: initialValue?.estimatedDuration ?? null,
    isAssessment: initialValue?.isAssessment ?? false,
  })

  const update = <K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({ ...values, estimatedDuration: values.estimatedDuration || null })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={BookOpen} title="Thông tin bài học" description="Tên và mô tả bài học">
        <FormField label="Tên bài học" required>
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Học cách chào hỏi"
            required
          />
        </FormField>

        <FormField label="Mô tả bài học" required>
          <Textarea
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Mô tả ngắn gọn nội dung bài học"
            className="min-h-24"
            required
          />
        </FormField>
      </FormSection>

      <FormSection title="Loại bài học" description="Chọn kỹ năng chính được rèn luyện trong bài">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LESSON_TYPES.map(({ value, label, Icon, color }) => {
            const isActive = values.lessonType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => update('lessonType', value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? color : 'text-muted-foreground'}`} />
                <span className={`text-xs font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection title="Cấu hình bài học">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Thứ tự hiển thị" required help="Số nhỏ hiển thị trước">
            <OrderIndexStepper
              value={values.orderIndex}
              onChange={(v) => update('orderIndex', v)}
              required
            />
          </FormField>

          <FormField label="Thời gian ước tính (phút)">
            <Input
              type="number"
              min="0"
              value={values.estimatedDuration ?? ''}
              onChange={(e) => update('estimatedDuration', e.target.value ? Number(e.target.value) : null)}
              placeholder="VD: 15"
            />
          </FormField>
        </div>

        <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Bài kiểm tra đánh giá</p>
            <p className="text-xs text-muted-foreground">
              Đánh dấu nếu đây là bài đánh giá tổng hợp kết thúc chủ đề
            </p>
          </div>
          <Switch
            checked={values.isAssessment}
            onCheckedChange={(checked) => update('isAssessment', checked)}
          />
        </div>
      </FormSection>
    </form>
  )
}
