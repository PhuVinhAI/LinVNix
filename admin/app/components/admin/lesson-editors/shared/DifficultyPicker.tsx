import { cn } from '@/lib/utils'

export function DifficultyPicker({
  value,
  onChange,
  size = 'md',
  className,
}: {
  value: number
  onChange: (next: number) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const filled = Math.min(5, Math.max(0, value))
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((level) => {
        const isActive = level <= filled
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level === value ? Math.max(1, level - 1) : level)}
            aria-label={`Mức độ khó ${level}`}
            className={cn(
              'rounded-full transition-colors',
              size === 'sm' && 'h-1.5 w-3',
              size === 'md' && 'h-2 w-4',
              isActive ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted-foreground/30',
            )}
          />
        )
      })}
    </div>
  )
}
