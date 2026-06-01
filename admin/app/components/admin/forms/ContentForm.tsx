import { useState, type FormEvent } from 'react'
import { FileText, Type, Mic, Image as ImageIcon, Video, MessagesSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'
import { OrderIndexStepper } from '../editors/OrderIndexStepper'
import { MediaUpload } from '../editors/MediaUpload'

const CONTENT_TYPES: Array<{ value: string; label: string; Icon: LucideIcon }> = [
  { value: 'text', label: 'Văn bản', Icon: Type },
  { value: 'audio', label: 'Âm thanh', Icon: Mic },
  { value: 'image', label: 'Hình ảnh', Icon: ImageIcon },
  { value: 'video', label: 'Video', Icon: Video },
  { value: 'dialogue', label: 'Hội thoại', Icon: MessagesSquare },
]

export interface ContentFormValues {
  contentType: string
  vietnameseText: string
  translation?: string | null
  phonetic?: string | null
  orderIndex: number
  audioUrl?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  notes?: string | null
}

export function ContentForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<ContentFormValues> | null
  onSubmit: (values: ContentFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<ContentFormValues>({
    contentType: initialValue?.contentType ?? 'text',
    vietnameseText: initialValue?.vietnameseText ?? '',
    translation: initialValue?.translation ?? '',
    phonetic: initialValue?.phonetic ?? '',
    orderIndex: initialValue?.orderIndex ?? 0,
    audioUrl: initialValue?.audioUrl ?? '',
    imageUrl: initialValue?.imageUrl ?? '',
    videoUrl: initialValue?.videoUrl ?? '',
    notes: initialValue?.notes ?? '',
  })

  const update = <K extends keyof ContentFormValues>(key: K, value: ContentFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...values,
      translation: values.translation || null,
      phonetic: values.phonetic || null,
      audioUrl: values.audioUrl || null,
      imageUrl: values.imageUrl || null,
      videoUrl: values.videoUrl || null,
      notes: values.notes || null,
    })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection title="Loại nội dung" description="Chọn dạng nội dung phù hợp">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CONTENT_TYPES.map(({ value, label, Icon }) => {
            const isActive = values.contentType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => update('contentType', value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection icon={FileText} title="Nội dung văn bản">
        <FormField label="Tiếng Việt" required>
          <Textarea
            value={values.vietnameseText}
            onChange={(e) => update('vietnameseText', e.target.value)}
            placeholder="Nội dung tiếng Việt..."
            className="min-h-24"
            required
          />
        </FormField>

        <FormField label="Bản dịch">
          <Textarea
            value={values.translation ?? ''}
            onChange={(e) => update('translation', e.target.value)}
            placeholder="Bản dịch sang ngôn ngữ học viên..."
            className="min-h-24"
          />
        </FormField>

        <FormField label="Phiên âm" help="Phiên âm IPA hoặc Romanization">
          <Input
            value={values.phonetic ?? ''}
            onChange={(e) => update('phonetic', e.target.value)}
            placeholder="VD: /jiŋ˧˧ tʃaːw˨˩/"
          />
        </FormField>
      </FormSection>

      {(values.contentType === 'audio' || values.contentType === 'dialogue') && (
        <FormSection icon={Mic} title="Âm thanh">
          <FormField label="File audio">
            <MediaUpload
              kind="audio"
              value={values.audioUrl ?? null}
              onChange={(url) => update('audioUrl', url)}
            />
          </FormField>
        </FormSection>
      )}

      {values.contentType === 'image' && (
        <FormSection icon={ImageIcon} title="Hình ảnh">
          <FormField label="File hình ảnh">
            <MediaUpload
              kind="image"
              value={values.imageUrl ?? null}
              onChange={(url) => update('imageUrl', url)}
            />
          </FormField>
        </FormSection>
      )}

      {values.contentType === 'video' && (
        <FormSection icon={Video} title="Video">
          <FormField label="File video">
            <MediaUpload
              kind="video"
              value={values.videoUrl ?? null}
              onChange={(url) => update('videoUrl', url)}
            />
          </FormField>
        </FormSection>
      )}

      <FormSection title="Sắp xếp và ghi chú">
        <FormField label="Thứ tự hiển thị" required>
          <OrderIndexStepper
            value={values.orderIndex}
            onChange={(v) => update('orderIndex', v)}
            required
          />
        </FormField>

        <FormField label="Ghi chú cho giáo viên">
          <Textarea
            value={values.notes ?? ''}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Ghi chú thêm cho người dạy"
            className="min-h-20"
          />
        </FormField>
      </FormSection>
    </form>
  )
}
