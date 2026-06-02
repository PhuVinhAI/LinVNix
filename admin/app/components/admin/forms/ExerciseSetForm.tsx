import { useState, type FormEvent } from 'react'
import { ClipboardList, Hash } from 'lucide-react'
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
      <FormSection icon={ClipboardList} title="Thông tin bộ bài tập" description="Tên và mô tả hiển thị với học viên">
        <FormField label="Tên bộ bài tập" required help="Tiêu đề ngắn gọn, gợi rõ nội dung luyện tập">
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Luyện tập chào hỏi cơ bản"
            required
          />
        </FormField>

        <FormField label="Mô tả bộ bài tập" help="Mục tiêu và phạm vi kiến thức được rèn luyện trong bộ bài tập">
          <Textarea
            value={values.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="VD: Tập hợp bài tập giúp học viên thực hành các mẫu câu chào hỏi, giới thiệu bản thân trong giao tiếp hàng ngày."
            className="min-h-24"
          />
        </FormField>
      </FormSection>

      <FormSection icon={Hash} title="Sắp xếp" description="Thứ tự hiển thị trong danh sách bộ bài tập của bài học">
        <FormField label="Thứ tự hiển thị" required help="Số nhỏ hiển thị trước">
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
