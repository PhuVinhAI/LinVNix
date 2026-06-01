import { useState, type FormEvent } from 'react'
import {
  User, UserCircle2, Sparkles, Hash, Users, GraduationCap, Stethoscope,
  Car, BookOpen, Store, Plane, Shield, Sprout, Wrench, UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { FormField, FormSection } from '../FormSection'
import { OrderIndexStepper } from '../editors/OrderIndexStepper'

const AVATAR_PRESETS: Array<{ key: string; Icon: LucideIcon; label: string }> = [
  { key: 'waiter', Icon: UtensilsCrossed, label: 'Phục vụ' },
  { key: 'teacher', Icon: GraduationCap, label: 'Giáo viên' },
  { key: 'doctor', Icon: Stethoscope, label: 'Bác sĩ' },
  { key: 'driver', Icon: Car, label: 'Tài xế' },
  { key: 'student', Icon: BookOpen, label: 'Sinh viên' },
  { key: 'shopkeeper', Icon: Store, label: 'Cửa hàng' },
  { key: 'friend', Icon: User, label: 'Bạn bè' },
  { key: 'family', Icon: Users, label: 'Gia đình' },
  { key: 'tourist', Icon: Plane, label: 'Du khách' },
  { key: 'police', Icon: Shield, label: 'Công an' },
  { key: 'farmer', Icon: Sprout, label: 'Nông dân' },
  { key: 'engineer', Icon: Wrench, label: 'Kỹ sư' },
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
  const ActiveIcon = activeAvatar?.Icon ?? User

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={UserCircle2} title="Nhân vật">
        {/* Live preview card */}
        <div className="rounded-lg border-2 border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ActiveIcon className="h-6 w-6" />
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
            {AVATAR_PRESETS.map(({ key, Icon, label }) => {
              const isActive = values.avatarKey === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update('avatarKey', key)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
                    isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={`text-[10px] font-semibold line-clamp-1 ${isActive ? 'text-foreground' : ''}`}>
                    {label}
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
          <OrderIndexStepper
            value={values.orderIndex}
            onChange={(v) => update('orderIndex', v)}
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
