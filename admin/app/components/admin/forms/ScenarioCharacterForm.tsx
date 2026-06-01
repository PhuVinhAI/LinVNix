import { useState, type FormEvent } from 'react'
import { User, UserCircle2, Sparkles, Hash } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { FormField, FormSection } from '../FormSection'

const AVATAR_PRESETS: Array<{ key: string; emoji: string; label: string }> = [
  { key: 'waiter', emoji: '🧑‍🍳', label: 'Phục vụ' },
  { key: 'teacher', emoji: '🧑‍🏫', label: 'Giáo viên' },
  { key: 'doctor', emoji: '🧑‍⚕️', label: 'Bác sĩ' },
  { key: 'driver', emoji: '🚕', label: 'Tài xế' },
  { key: 'student', emoji: '🧑‍🎓', label: 'Sinh viên' },
  { key: 'shopkeeper', emoji: '🧑‍💼', label: 'Cửa hàng' },
  { key: 'friend', emoji: '🧑', label: 'Bạn bè' },
  { key: 'family', emoji: '👨‍👩‍👧', label: 'Gia đình' },
  { key: 'tourist', emoji: '🧳', label: 'Du khách' },
  { key: 'police', emoji: '👮', label: 'Công an' },
  { key: 'farmer', emoji: '🧑‍🌾', label: 'Nông dân' },
  { key: 'engineer', emoji: '🧑‍🔧', label: 'Kỹ sư' },
]

export interface ScenarioCharacterFormValues {
  name: string
  role: string
  personality: string
  speechStyle: string
  avatarKey?: string | null
  isPlayable: boolean
  orderIndex: number
}

export function ScenarioCharacterForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<ScenarioCharacterFormValues> | null
  onSubmit: (values: ScenarioCharacterFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<ScenarioCharacterFormValues>({
    name: initialValue?.name ?? '',
    role: initialValue?.role ?? '',
    personality: initialValue?.personality ?? '',
    speechStyle: initialValue?.speechStyle ?? '',
    avatarKey: initialValue?.avatarKey ?? '',
    isPlayable: initialValue?.isPlayable ?? true,
    orderIndex: initialValue?.orderIndex ?? 0,
  })

  const update = <K extends keyof ScenarioCharacterFormValues>(
    key: K,
    value: ScenarioCharacterFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({ ...values, avatarKey: values.avatarKey || null })
  }

  const activeAvatar = AVATAR_PRESETS.find((a) => a.key === values.avatarKey)

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={UserCircle2} title="Nhân vật">
        {/* Live preview card */}
        <div className="rounded-lg border-2 border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-2xl">
              {activeAvatar ? activeAvatar.emoji : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold truncate">{values.name || 'Tên nhân vật'}</p>
              <p className="text-xs text-muted-foreground truncate">{values.role || 'Vai trò'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tên nhân vật" required>
            <Input
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="VD: Cô Mai"
              required
            />
          </FormField>

          <FormField label="Vai trò" required>
            <Input
              value={values.role}
              onChange={(e) => update('role', e.target.value)}
              placeholder="VD: Nhân viên phục vụ"
              required
            />
          </FormField>
        </div>

        <FormField label="Chọn ảnh đại diện">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const isActive = values.avatarKey === preset.key
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => update('avatarKey', preset.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors ${
                    isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{preset.emoji}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground line-clamp-1">
                    {preset.label}
                  </span>
                </button>
              )
            })}
          </div>
        </FormField>
      </FormSection>

      <FormSection icon={Sparkles} title="Tính cách và phong cách">
        <FormField label="Tính cách" required help="Mô tả tính cách để AI nhập vai">
          <Textarea
            value={values.personality}
            onChange={(e) => update('personality', e.target.value)}
            placeholder="VD: Thân thiện, kiên nhẫn, hay cười, luôn sẵn sàng giúp đỡ..."
            className="min-h-24"
            required
          />
        </FormField>

        <FormField label="Phong cách nói chuyện" required help="Cách dùng từ và cấu trúc câu">
          <Textarea
            value={values.speechStyle}
            onChange={(e) => update('speechStyle', e.target.value)}
            placeholder="VD: Dùng từ ngữ đơn giản, lịch sự, hay xưng 'mình' và gọi khách là 'anh/chị'..."
            className="min-h-24"
            required
          />
        </FormField>
      </FormSection>

      <FormSection icon={Hash} title="Cấu hình">
        <FormField label="Thứ tự hiển thị" required>
          <Input
            type="number"
            value={values.orderIndex}
            onChange={(e) => update('orderIndex', Number(e.target.value) || 0)}
            required
          />
        </FormField>

        <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">
              {values.isPlayable ? 'Học viên có thể nhập vai' : 'Chỉ AI đóng vai'}
            </p>
            <p className="text-xs text-muted-foreground">
              {values.isPlayable
                ? 'Học viên được phép chọn nhân vật này khi luyện tập'
                : 'Nhân vật này chỉ do AI đảm nhận trong hội thoại'}
            </p>
          </div>
          <Switch
            checked={values.isPlayable}
            onCheckedChange={(checked) => update('isPlayable', checked)}
          />
        </div>
      </FormSection>
    </form>
  )
}
