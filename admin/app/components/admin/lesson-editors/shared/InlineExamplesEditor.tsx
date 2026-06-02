import { Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { InlineTextField } from './InlineTextField'
import { InlineTextarea } from './InlineTextarea'
import { InlineFieldShell } from './InlineFieldShell'
import { InlineAddButton } from './InlineAddButton'

export type ExampleItem = { vi: string; en: string; note?: string }

export function InlineExamplesEditor({
  value,
  onChange,
}: {
  value: ExampleItem[]
  onChange: (next: ExampleItem[]) => void
}) {
  const items = value.length ? value : []

  const update = (index: number, patch: Partial<ExampleItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange(next)
  }

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const add = () => {
    onChange([...items, { vi: '', en: '' }])
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic py-2">
          Chưa có ví dụ. Thêm câu để minh họa cách dùng.
        </p>
      )}
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border-2 border-input bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-input bg-muted/30 px-3 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ví dụ {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeAt(index)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              aria-label="Xóa ví dụ"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="p-2 space-y-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground px-2">Tiếng Việt</label>
              <InlineFieldShell className="mt-0.5">
                <InlineTextField
                  value={item.vi}
                  onCommit={(v) => update(index, { vi: v })}
                  placeholder="Câu ví dụ tiếng Việt"
                  className="hover:bg-transparent focus:bg-transparent focus:ring-0"
                />
              </InlineFieldShell>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground px-2">Bản dịch</label>
              <InlineFieldShell className="mt-0.5">
                <InlineTextField
                  value={item.en}
                  onCommit={(v) => update(index, { en: v })}
                  placeholder="Bản dịch (tiếng Anh hoặc ngôn ngữ học viên)"
                  className="hover:bg-transparent focus:bg-transparent focus:ring-0"
                />
              </InlineFieldShell>
            </div>
            {item.note !== undefined ? (
              <div>
                <label className="text-xs font-semibold text-muted-foreground px-2">Ghi chú</label>
                <InlineFieldShell className="mt-0.5">
                  <InlineTextarea
                    value={item.note ?? ''}
                    onCommit={(v) => update(index, { note: v || undefined })}
                    placeholder="Ghi chú thêm cho ví dụ này"
                    minRows={1}
                    className="hover:bg-transparent focus:bg-transparent focus:ring-0"
                  />
                </InlineFieldShell>
              </div>
            ) : (
              <InlineAddButton
                variant="inline"
                onClick={() => update(index, { note: '' })}
              >
                Thêm ghi chú
              </InlineAddButton>
            )}
          </div>
        </div>
      ))}
      <InlineAddButton onClick={add}>Thêm ví dụ</InlineAddButton>
    </div>
  )
}
