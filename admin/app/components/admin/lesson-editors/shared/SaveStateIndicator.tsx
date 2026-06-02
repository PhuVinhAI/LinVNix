import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SaveState } from '../hooks/use-lesson-child-inline'

export function SaveStateIndicator({
  state,
  onRetry,
  className,
}: {
  state: SaveState
  onRetry?: () => void
  className?: string
}) {
  if (state === 'idle') return null

  if (state === 'saving') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium text-muted-foreground',
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang lưu
      </span>
    )
  }

  if (state === 'saved') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-opacity',
          className,
        )}
      >
        <Check className="h-3 w-3" />
        Đã lưu
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onRetry}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline',
        className,
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      Lỗi · thử lại
    </button>
  )
}
