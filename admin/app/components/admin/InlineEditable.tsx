import { useEffect, useRef } from 'react'
import { cn } from '../../../lib/utils'

interface InlineEditableProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  multiline?: boolean
  ariaLabel?: string
  autoFocus?: boolean
}

export function InlineEditable({
  value,
  onChange,
  placeholder,
  className,
  multiline = true,
  ariaLabel,
  autoFocus,
}: InlineEditableProps) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    if (multiline && ref.current instanceof HTMLTextAreaElement) {
      const el = ref.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [value, multiline])

  const sharedClass = cn(
    'w-full bg-transparent outline-none placeholder:text-muted-foreground/40',
    'rounded-md transition-colors focus:bg-primary/5 hover:bg-muted/40',
    'focus:ring-2 focus:ring-primary/30 px-2.5 py-1.5',
    className,
  )

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        rows={1}
        className={cn(sharedClass, 'resize-none overflow-hidden leading-snug')}
      />
    )
  }
  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      className={sharedClass}
    />
  )
}
