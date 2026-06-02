import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'block' | 'inline'

export function InlineAddButton({
  variant = 'block',
  icon,
  children,
  className,
  ...props
}: {
  variant?: Variant
  icon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex items-center gap-2 font-semibold transition-colors',
        variant === 'block' &&
          'w-full justify-center py-3 rounded-lg border-2 border-dashed border-border bg-muted/20 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-primary/40',
        variant === 'inline' &&
          'px-2 py-1 text-xs text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {icon ?? <Plus className={variant === 'inline' ? 'h-3 w-3' : 'h-4 w-4'} />}
      {children}
    </button>
  )
}
