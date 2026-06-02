import { Type, Volume2, Image as ImageIcon, Video as VideoIcon, MessagesSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const CONTENT_TYPES: Array<{ value: string; label: string; Icon: LucideIcon }> = [
  { value: 'text', label: 'Văn bản', Icon: Type },
  { value: 'audio', label: 'Âm thanh', Icon: Volume2 },
  { value: 'image', label: 'Hình ảnh', Icon: ImageIcon },
  { value: 'video', label: 'Video', Icon: VideoIcon },
  { value: 'dialogue', label: 'Hội thoại', Icon: MessagesSquare },
]

export function ContentTypePicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (next: string) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center rounded-lg border-2 border-border bg-card p-0.5', className)}>
      {CONTENT_TYPES.map(({ value: v, label, Icon }) => {
        const isActive = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            title={label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
