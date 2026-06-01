import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'

export function TextListEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  addLabel = 'Thêm mục',
  emptyLabel = 'Chưa có mục nào',
  minItems = 0,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  addLabel?: string
  emptyLabel?: string
  minItems?: number
}) {
  const [items, setItems] = useState<string[]>(value.length ? value : Array(minItems).fill(''))

  const sync = (next: string[]) => {
    setItems(next)
    onChange(next)
  }

  const updateAt = (index: number, text: string) => {
    const next = [...items]
    next[index] = text
    sync(next)
  }

  const removeAt = (index: number) => {
    if (items.length <= minItems) return
    sync(items.filter((_, i) => i !== index))
  }

  const add = () => sync([...items, ''])

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-muted/30 text-xs font-bold text-muted-foreground tabular-nums">
                {index + 1}
              </div>
              <Input
                value={item}
                onChange={(e) => updateAt(index, e.target.value)}
                placeholder={`${placeholder} #${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAt(index)}
                disabled={items.length <= minItems}
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="w-full justify-center border-dashed"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  )
}
