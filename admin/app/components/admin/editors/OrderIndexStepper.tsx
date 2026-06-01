import { Minus, Plus } from 'lucide-react'

export function OrderIndexStepper({
  value,
  onChange,
  min = 0,
  required = false,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  required?: boolean
}) {
  const clamp = (n: number) => Math.max(min, n)
  return (
    <div className="inline-flex items-stretch rounded-lg border-2 border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Giảm thứ tự"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="w-px bg-border" />
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        required={required}
        className="h-11 w-24 bg-transparent text-center text-lg font-bold tabular-nums text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="w-px bg-border" />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Tăng thứ tự"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
