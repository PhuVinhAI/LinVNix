import { Plus, Trash2, type LucideIcon } from 'lucide-react'
import { SectionLabel } from '../authoring-ui'
import { InlineEditable } from '../../../components/admin/InlineEditable'

/* Khối UI chung cho các form material — repeater, chip toggle, helper field. */

export interface RepeaterItemRenderProps<T> {
  value: T
  onChange: (next: T) => void
  index: number
}

/**
 * Khối lặp lại — paragraphs / keyTerms / segments / chapters dùng chung.
 * Mỗi item là một thẻ nhỏ, có icon kéo nhẹ + nút xóa; header ngoài cùng có
 * nút Thêm. Empty state là khung gạch nét đứt.
 */
export function Repeater<T>({
  title,
  hint,
  items,
  newItem,
  onChange,
  renderItem,
  emptyText,
  addLabel,
}: {
  title: React.ReactNode
  hint?: React.ReactNode
  items: T[]
  newItem: () => T
  onChange: (next: T[]) => void
  renderItem: (props: RepeaterItemRenderProps<T>) => React.ReactNode
  emptyText: string
  addLabel: string
}) {
  const updateAt = (idx: number, value: T) => {
    onChange(items.map((it, i) => (i === idx ? value : it)))
  }
  const removeAt = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }
  const add = () => onChange([...items, newItem()])

  return (
    <div>
      <SectionLabel right={hint}>{title}</SectionLabel>
      {items.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-2 rounded-2xl border-2 border-border bg-card px-3 py-3"
            >
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground tabular-nums">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                {renderItem({ value: item, onChange: (v) => updateAt(idx, v), index: idx })}
              </div>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                aria-label="Xóa mục"
                className="mt-1 h-8 w-8 shrink-0 rounded-full text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  )
}

/** Bộ chọn dạng pill — 1 hàng, chọn được nhiều mảng giá trị bằng nhau. */
export function ChipChoice<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (next: T) => void
  options: Array<{ value: T; label: string; Icon?: LucideIcon }>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        const Icon = opt.Icon
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Input số đơn giản — không mũi tên, có placeholder, suffix tuỳ chọn. */
export function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  min = 0,
}: {
  value: number | null | undefined
  onChange: (next: number | null) => void
  placeholder?: string
  suffix?: string
  min?: number
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-3 py-2 focus-within:border-primary">
      <input
        type="number"
        value={value ?? ''}
        min={min}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value
          if (v === '') {
            onChange(null)
            return
          }
          const n = Number(v)
          if (Number.isFinite(n)) onChange(n)
        }}
        className="w-24 bg-transparent text-sm font-semibold outline-none tabular-nums"
      />
      {suffix && (
        <span className="text-xs font-semibold text-muted-foreground">{suffix}</span>
      )}
    </div>
  )
}

/** Khung text editable lớn — body/transcript. */
export function LongTextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  ariaLabel: string
}) {
  return (
    <InlineEditable
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="text-lg leading-relaxed font-medium"
      ariaLabel={ariaLabel}
    />
  )
}

/** Khung text editable trung bình — caption, title. */
export function MediumTextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  ariaLabel: string
}) {
  return (
    <InlineEditable
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="text-base leading-relaxed font-semibold"
      ariaLabel={ariaLabel}
      multiline={false}
    />
  )
}
