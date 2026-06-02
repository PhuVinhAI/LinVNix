import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function InlineTextarea({
  value,
  onCommit,
  placeholder,
  className,
  autoFocus,
  size = 'md',
  minRows = 1,
}: {
  value: string
  onCommit: (next: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  minRows?: number
}) {
  const [draft, setDraft] = useState(value)
  const lastSyncedRef = useRef(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (value !== lastSyncedRef.current) {
      setDraft(value)
      lastSyncedRef.current = value
    }
  }, [value])

  useEffect(() => {
    if (autoFocus) {
      const el = ref.current
      el?.focus()
      if (el) el.selectionStart = el.selectionEnd = el.value.length
    }
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
    <textarea
      ref={ref}
      rows={minRows}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          cancel()
          ref.current?.blur()
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          commit()
          ref.current?.blur()
        }
      }}
      className={cn(
        'w-full resize-none rounded-md border-0 bg-transparent px-2 py-1.5 outline-none transition-colors leading-relaxed field-sizing-content',
        'focus:bg-card focus:ring-2 focus:ring-primary/40',
        'hover:bg-muted/40',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        className,
      )}
    />
  )
}
