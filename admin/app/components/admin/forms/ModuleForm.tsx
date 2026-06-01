import { useState, type FormEvent } from 'react'
import { Layers, Hash } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'

export interface ModuleFormValues {
  title: string
  description: string
  topic?: string | null
  orderIndex: number
  estimatedHours?: number | null
}

export function ModuleForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<ModuleFormValues> | null
  onSubmit: (values: ModuleFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<ModuleFormValues>({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    topic: initialValue?.topic ?? '',
    orderIndex: initialValue?.orderIndex ?? 0,
    estimatedHours: initialValue?.estimatedHours ?? null,
  })

  const update = <K extends keyof ModuleFormValues>(key: K, value: ModuleFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...values,
      topic: values.topic || null,
      estimatedHours: values.estimatedHours || null,
    })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={Layers} title="Thông tin chủ đề" description="Tên và mô tả chủ đề học tập">
        <FormField label="Tên chủ đề" required>
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Chào hỏi và giới thiệu"
            required
          />
        </FormField>

        <FormField label="Mô tả chủ đề" required>
          <Textarea
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Mô tả nội dung và mục tiêu của chủ đề"
            className="min-h-28"
            required
          />
        </FormField>

        <FormField label="Từ khóa chủ đề" help="Phân loại nội bộ, không hiển thị với học viên">
          <Input
            value={values.topic ?? ''}
            onChange={(e) => update('topic', e.target.value)}
            placeholder="VD: greetings, daily-conversation"
          />
        </FormField>
      </FormSection>

      <FormSection icon={Hash} title="Sắp xếp và thời lượng">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Thứ tự hiển thị" required help="Số nhỏ hiển thị trước">
            <Input
              type="number"
              value={values.orderIndex}
              onChange={(e) => update('orderIndex', Number(e.target.value) || 0)}
              required
            />
          </FormField>

          <FormField label="Giờ học ước tính">
            <Input
              type="number"
              min="0"
              value={values.estimatedHours ?? ''}
              onChange={(e) => update('estimatedHours', e.target.value ? Number(e.target.value) : null)}
              placeholder="VD: 5"
            />
          </FormField>
        </div>
      </FormSection>
    </form>
  )
}
