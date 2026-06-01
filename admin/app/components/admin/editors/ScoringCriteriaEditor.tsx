import { useState } from 'react'
import { Plus, Trash2, Target } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { NumberStepper } from './NumberStepper'

export type ScoringCriterion = { name: string; description: string; weight: number }

export function ScoringCriteriaEditor({
  value,
  onChange,
}: {
  value: ScoringCriterion[]
  onChange: (next: ScoringCriterion[]) => void
}) {
  const [items, setItems] = useState<ScoringCriterion[]>(
    value.length ? value : [{ name: '', description: '', weight: 1 }]
  )

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)

  const sync = (next: ScoringCriterion[]) => {
    setItems(next)
    onChange(next)
  }

  const updateAt = (index: number, patch: Partial<ScoringCriterion>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    sync(next)
  }

  const removeAt = (index: number) => {
    if (items.length <= 1) return
    sync(items.filter((_, i) => i !== index))
  }

  const add = () => sync([...items, { name: '', description: '', weight: 1 }])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-border bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          <span>Tổng trọng số các tiêu chí</span>
        </div>
        <span className="text-sm font-bold tabular-nums">
          {totalWeight.toFixed(1)}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const percent = totalWeight > 0 ? ((Number(item.weight) || 0) / totalWeight) * 100 : 0
          return (
            <div key={index} className="rounded-lg border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b-2 border-border bg-muted/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tiêu chí
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {percent.toFixed(0)}%
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAt(index)}
                    disabled={items.length <= 1}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-muted-foreground">Tên tiêu chí</label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateAt(index, { name: e.target.value })}
                      placeholder="VD: Phát âm chuẩn"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:shrink-0">
                    <label className="text-xs font-semibold text-muted-foreground">Trọng số</label>
                    <div className="mt-1">
                      <NumberStepper
                        value={item.weight}
                        onChange={(v) => updateAt(index, { weight: v ?? 0 })}
                        min={0}
                        ariaLabelDecrement="Giảm trọng số"
                        ariaLabelIncrement="Tăng trọng số"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Mô tả tiêu chí</label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateAt(index, { description: e.target.value })}
                    placeholder="Mô tả cách đánh giá tiêu chí này"
                    className="mt-1 min-h-16"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Thêm tiêu chí
      </button>
    </div>
  )
}
