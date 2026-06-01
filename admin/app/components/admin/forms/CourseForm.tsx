import { useState, type FormEvent } from 'react'
import { BookOpen, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { FormField, FormSection } from '../FormSection'
import { LevelPicker } from '../editors/PickerControls'
import { OrderIndexStepper } from '../editors/OrderIndexStepper'
import { NumberStepper } from '../editors/NumberStepper'
import { MediaUpload } from '../editors/MediaUpload'

export interface CourseFormValues {
  title: string
  description: string
  level: string
  orderIndex: number
  estimatedHours?: number | null
  vietnameseLevelName?: string | null
  thumbnailUrl?: string | null
  isPublished: boolean
}

export function CourseForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<CourseFormValues> | null
  onSubmit: (values: CourseFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<CourseFormValues>({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    level: initialValue?.level ?? 'A1',
    orderIndex: initialValue?.orderIndex ?? 0,
    estimatedHours: initialValue?.estimatedHours ?? null,
    vietnameseLevelName: initialValue?.vietnameseLevelName ?? '',
    thumbnailUrl: initialValue?.thumbnailUrl ?? '',
    isPublished: initialValue?.isPublished ?? false,
  })

  const update = <K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...values,
      vietnameseLevelName: values.vietnameseLevelName || null,
      thumbnailUrl: values.thumbnailUrl || null,
      estimatedHours: values.estimatedHours || null,
    })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={BookOpen} title="Thông tin cơ bản" description="Tên và mô tả tổng quát của khóa học">
        <FormField label="Tên khóa học" required>
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Tiếng Việt cho người mới bắt đầu"
            required
          />
        </FormField>

        <FormField label="Mô tả khóa học" required>
          <Textarea
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Tóm tắt mục tiêu, đối tượng và nội dung của khóa học"
            className="min-h-28"
            required
          />
        </FormField>
      </FormSection>

      <FormSection title="Cấp độ và thời lượng" description="Phân loại khóa học theo cấp độ CEFR">
        <FormField label="Cấp độ" required>
          <LevelPicker value={values.level} onChange={(v) => update('level', v)} />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tên cấp độ tiếng Việt" help="Tên hiển thị thân thiện cho học viên">
            <Input
              value={values.vietnameseLevelName ?? ''}
              onChange={(e) => update('vietnameseLevelName', e.target.value)}
              placeholder="VD: Sơ cấp"
            />
          </FormField>

          <FormField label="Giờ học ước tính" help="Tổng thời lượng dự kiến để hoàn thành">
            <NumberStepper
              value={values.estimatedHours ?? null}
              onChange={(v) => update('estimatedHours', v)}
              nullable
              suffix="h"
              ariaLabelDecrement="Giảm giờ học"
              ariaLabelIncrement="Tăng giờ học"
            />
          </FormField>
        </div>

        <FormField label="Thứ tự hiển thị" required help="Số nhỏ hiển thị trước trong danh sách">
          <OrderIndexStepper
            value={values.orderIndex}
            onChange={(v) => update('orderIndex', v)}
            required
          />
        </FormField>
      </FormSection>

      <FormSection icon={ImageIcon} title="Hình ảnh đại diện" description="Ảnh thumbnail hiển thị trên danh sách khóa học">
        <FormField label="Ảnh thumbnail">
          <MediaUpload
            kind="image"
            value={values.thumbnailUrl ?? null}
            onChange={(url) => update('thumbnailUrl', url)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Trạng thái xuất bản" description="Kiểm soát hiển thị khóa học với học viên">
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
                ? 'Học viên có thể nhìn thấy và tham gia khóa học này'
                : 'Khóa học chỉ hiển thị trong khu vực quản trị'}
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
