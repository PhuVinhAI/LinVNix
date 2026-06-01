import { useState, type FormEvent } from 'react'
import { ClipboardList } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'
import { OrderIndexStepper } from '../editors/OrderIndexStepper'

export interface ExerciseSetFormValues {
  title: string
  description?: string | null
  orderIndex: number
}

export function ExerciseSetForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<ExerciseSetFormValues> | null
  onSubmit: (values: ExerciseSetFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<ExerciseSetFormValues>({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    orderIndex: initialValue?.orderIndex ?? 0,
  })

  const update = <K extends keyof ExerciseSetFormValues>(key: K, value: ExerciseSetFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({ ...values, description: values.description || null })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={ClipboardList} title="Bộ bài tập" description="Tập hợp các bài tập liên quan">
        <FormField label="Tên bộ bài tập" required>
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Luyện tập chào hỏi cơ bản"
            required
          />
        </FormField>

        <FormField label="Mô tả">
          <Textarea
            value={values.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Mục tiêu và nội dung bộ bài tập"
            className="min-h-24"
          />
        </FormField>

        <FormField label="Thứ tự hiển thị" required>
          <OrderIndexStepper
            value={values.orderIndex}
            onChange={(v) => update('orderIndex', v)}
            required
          />
        </FormField>
      </FormSection>
    </form>
  )
}
