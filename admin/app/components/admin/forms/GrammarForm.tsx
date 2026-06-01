import { useState, type FormEvent } from 'react'
import { Lightbulb, ListChecks } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'
import { GrammarExamplesEditor, type GrammarExample } from '../editors/GrammarExamplesEditor'

export interface GrammarFormValues {
  title: string
  structure?: string | null
  explanation: string
  examples: GrammarExample[]
  notes?: string | null
  difficultyLevel: number
}

export function GrammarForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<GrammarFormValues> | null
  onSubmit: (values: GrammarFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<GrammarFormValues>({
    title: initialValue?.title ?? '',
    structure: initialValue?.structure ?? '',
    explanation: initialValue?.explanation ?? '',
    examples: Array.isArray(initialValue?.examples) ? initialValue.examples : [],
    notes: initialValue?.notes ?? '',
    difficultyLevel: initialValue?.difficultyLevel ?? 1,
  })

  const update = <K extends keyof GrammarFormValues>(key: K, value: GrammarFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...values,
      structure: values.structure || null,
      notes: values.notes || null,
      examples: values.examples.filter((ex) => ex.vi.trim() || ex.en.trim()),
    })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={Lightbulb} title="Quy tắc ngữ pháp">
        <FormField label="Tên quy tắc" required>
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Sử dụng 'là' trong câu khẳng định"
            required
          />
        </FormField>

        <FormField label="Cấu trúc" help="Công thức mô tả mẫu câu">
          <Input
            value={values.structure ?? ''}
            onChange={(e) => update('structure', e.target.value)}
            placeholder="VD: S + là + N"
            className="font-mono"
          />
        </FormField>

        <FormField label="Giải thích chi tiết" required>
          <Textarea
            value={values.explanation}
            onChange={(e) => update('explanation', e.target.value)}
            placeholder="Giải thích cách dùng, lưu ý và trường hợp đặc biệt..."
            className="min-h-32"
            required
          />
        </FormField>

        <FormField label="Mức độ khó">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => update('difficultyLevel', level)}
                className={`flex-1 h-10 rounded-md border-2 text-sm font-bold transition-colors ${
                  values.difficultyLevel >= level
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </FormField>
      </FormSection>

      <FormSection icon={ListChecks} title="Ví dụ minh họa" description="Thêm các câu ví dụ thực tế">
        <GrammarExamplesEditor
          value={values.examples}
          onChange={(next) => update('examples', next)}
        />
      </FormSection>

      <FormSection title="Ghi chú">
        <FormField label="Ghi chú cho giáo viên">
          <Textarea
            value={values.notes ?? ''}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Lưu ý khi giảng dạy, điểm nhấn..."
            className="min-h-20"
          />
        </FormField>
      </FormSection>
    </form>
  )
}
