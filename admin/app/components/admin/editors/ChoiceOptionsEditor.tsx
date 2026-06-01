import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'

export function ChoiceOptionsEditor({
  options,
  correctAnswer,
  onChange,
}: {
  options: string[]
  correctAnswer: string
  onChange: (next: { options: string[]; correctAnswer: string }) => void
}) {
  const [items, setItems] = useState<string[]>(options.length ? options : ['', ''])
  const [correct, setCorrect] = useState<string>(correctAnswer)

  const sync = (nextItems: string[], nextCorrect: string) => {
    setItems(nextItems)
    setCorrect(nextCorrect)
    onChange({ options: nextItems, correctAnswer: nextCorrect })
  }

  const updateAt = (index: number, text: string) => {
    const oldValue = items[index]
    const next = [...items]
    next[index] = text
    const newCorrect = correct === oldValue ? text : correct
    sync(next, newCorrect)
  }

  const removeAt = (index: number) => {
    if (items.length <= 2) return
    const removed = items[index]
    const next = items.filter((_, i) => i !== index)
    const newCorrect = correct === removed ? '' : correct
    sync(next, newCorrect)
  }

  const add = () => sync([...items, ''], correct)

  const setAsCorrect = (text: string) => sync(items, text)

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-border bg-muted/30 px-4 py-2.5">
        <p className="text-xs font-semibold text-muted-foreground">
          Nhấn vào nút <Check className="inline h-3 w-3 mx-0.5" /> bên trái để chọn đáp án đúng
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => {
          const isCorrect = correct === item && item !== ''
          return (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-lg border-2 p-2 transition-colors ${
                isCorrect ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-card'
              }`}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAsCorrect(item)}
                disabled={!item}
                className={`h-10 w-10 shrink-0 rounded-full border-2 ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-emerald-500 hover:text-emerald-500'
                }`}
              >
                {isCorrect ? <Check className="h-5 w-5" strokeWidth={3} /> : (
                  <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                )}
              </Button>
              <Input
                value={item}
                onChange={(e) => updateAt(index, e.target.value)}
                placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                className="flex-1 border-0 bg-transparent focus-visible:border-0 focus-visible:bg-card"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAt(index)}
                disabled={items.length <= 2}
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="w-full justify-center border-dashed"
      >
        <Plus className="h-4 w-4" />
        Thêm lựa chọn
      </Button>
    </div>
  )
}
