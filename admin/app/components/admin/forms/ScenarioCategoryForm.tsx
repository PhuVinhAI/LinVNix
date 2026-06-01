import { useState, type FormEvent } from 'react'
import { Palette, Hash, MessageSquare } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'
import { ColorPicker } from '../editors/ColorPicker'
import { IconPicker } from '../editors/IconPicker'
import { OrderIndexStepper } from '../editors/OrderIndexStepper'

export interface ScenarioCategoryFormValues {
  name: string
  description: string
  icon: string
  color: string
  orderIndex: number
}

export function ScenarioCategoryForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<ScenarioCategoryFormValues> | null
  onSubmit: (values: ScenarioCategoryFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<ScenarioCategoryFormValues>({
    name: initialValue?.name ?? '',
    description: initialValue?.description ?? '',
    icon: initialValue?.icon ?? 'message-square',
    color: initialValue?.color ?? '#6366F1',
    orderIndex: initialValue?.orderIndex ?? 0,
  })

  const update = <K extends keyof ScenarioCategoryFormValues>(
    key: K,
    value: ScenarioCategoryFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(values)
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={MessageSquare} title="Thông tin danh mục">
        <div className="rounded-lg border-2 border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: values.color || '#6366F1' }}
            >
              <MessageSquare className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold truncate">{values.name || 'Tên danh mục'}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {values.description || 'Mô tả danh mục'}
              </p>
            </div>
          </div>
        </div>

        <FormField label="Tên danh mục" required>
          <Input
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="VD: Quán cà phê"
            required
          />
        </FormField>

        <FormField label="Mô tả danh mục" required>
          <Textarea
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Mô tả nội dung và mục đích của danh mục"
            className="min-h-24"
            required
          />
        </FormField>
      </FormSection>

      <FormSection icon={Palette} title="Giao diện" description="Tùy chỉnh màu sắc và biểu tượng">
        <FormField label="Màu sắc" required>
          <ColorPicker value={values.color} onChange={(v) => update('color', v)} />
        </FormField>

        <FormField label="Biểu tượng" required>
          <IconPicker value={values.icon} onChange={(v) => update('icon', v)} color={values.color} />
        </FormField>
      </FormSection>

      <FormSection icon={Hash} title="Sắp xếp">
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
