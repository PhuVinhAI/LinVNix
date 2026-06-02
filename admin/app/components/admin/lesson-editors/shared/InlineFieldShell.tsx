import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function InlineFieldShell({
  children,
  className,
  invalid,
}: {
  children: ReactNode
  className?: string
  invalid?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card transition-colors focus-within:border-primary',
        invalid ? 'border-destructive' : 'border-input',
        className,
      )}
    >
      {children}
    </div>
  )
}
