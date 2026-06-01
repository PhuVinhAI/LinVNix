import { NumberStepper } from './NumberStepper'

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
  return (
    <NumberStepper
      value={value}
      onChange={(v) => onChange(v ?? min)}
      min={min}
      required={required}
      ariaLabelDecrement="Giảm thứ tự"
      ariaLabelIncrement="Tăng thứ tự"
    />
  )
}
