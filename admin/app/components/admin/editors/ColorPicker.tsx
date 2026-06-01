import { Input } from '../../ui/input'

const PRESET_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F97316', // orange
  '#84CC16', // lime
  '#14B8A6', // teal
  '#A855F7', // purple
]

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 shrink-0 rounded-lg border-2 border-border"
          style={{ backgroundColor: value || '#6366F1' }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#6366F1"
          className="flex-1 font-mono uppercase"
          maxLength={7}
        />
      </div>
      <div className="grid grid-cols-12 gap-1.5 rounded-lg border-2 border-border bg-muted/30 p-2">
        {PRESET_COLORS.map((color) => {
          const isActive = value?.toUpperCase() === color
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`h-7 w-full rounded transition-transform hover:scale-110 ${
                isActive ? 'ring-2 ring-offset-2 ring-offset-muted ring-foreground' : ''
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          )
        })}
      </div>
    </div>
  )
}
