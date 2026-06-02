import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function InlineTextField({
  value,
  onCommit,
  placeholder,
  className,
  autoFocus,
  monospace,
  size = 'md',
}: {
  value: string
  onCommit: (next: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  monospace?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const [draft, setDraft] = useState(value)
  const lastSyncedRef = useRef(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value !== lastSyncedRef.current) {
      setDraft(value)
      lastSyncedRef.current = value
    }
  }, [value])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const commit = () => {
    if (draft === lastSyncedRef.current) return
    lastSyncedRef.current = draft
    onCommit(draft)
  }

  const cancel = () => {
    setDraft(lastSyncedRef.current)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          cancel()
          inputRef.current?.blur()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          commit()
          inputRef.current?.blur()
        }
      }}
      className={cn(
        'w-full rounded-md border-0 bg-transparent px-2 py-1.5 outline-none transition-colors',
        'focus:bg-card focus:ring-2 focus:ring-primary/40',
        'hover:bg-muted/40',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base font-bold',
        monospace && 'font-mono',
        className,
      )}
    />
  )
}
