import { useState, type FormEvent } from 'react'
import { BookMarked, Volume2, Image as ImageIcon } from 'lucide-react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { FormField, FormSection } from '../FormSection'

const PART_OF_SPEECH: Array<{ value: string; label: string }> = [
  { value: 'noun', label: 'Danh từ' },
  { value: 'verb', label: 'Động từ' },
  { value: 'adjective', label: 'Tính từ' },
  { value: 'adverb', label: 'Trạng từ' },
  { value: 'pronoun', label: 'Đại từ' },
  { value: 'preposition', label: 'Giới từ' },
  { value: 'conjunction', label: 'Liên từ' },
  { value: 'phrase', label: 'Cụm từ' },
  { value: 'interjection', label: 'Thán từ' },
]

export interface VocabularyFormValues {
  word: string
  translation: string
  partOfSpeech: string
  phonetic?: string | null
  classifier?: string | null
  difficultyLevel: number
  exampleSentence?: string | null
  exampleTranslation?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
}

export function VocabularyForm({
  id,
  initialValue,
  onSubmit,
}: {
  id: string
  initialValue?: Partial<VocabularyFormValues> | null
  onSubmit: (values: VocabularyFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<VocabularyFormValues>({
    word: initialValue?.word ?? '',
    translation: initialValue?.translation ?? '',
    partOfSpeech: initialValue?.partOfSpeech ?? 'phrase',
    phonetic: initialValue?.phonetic ?? '',
    classifier: initialValue?.classifier ?? '',
    difficultyLevel: initialValue?.difficultyLevel ?? 1,
    exampleSentence: initialValue?.exampleSentence ?? '',
    exampleTranslation: initialValue?.exampleTranslation ?? '',
    audioUrl: initialValue?.audioUrl ?? '',
    imageUrl: initialValue?.imageUrl ?? '',
  })

  const update = <K extends keyof VocabularyFormValues>(key: K, value: VocabularyFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...values,
      phonetic: values.phonetic || null,
      classifier: values.classifier || null,
      exampleSentence: values.exampleSentence || null,
      exampleTranslation: values.exampleTranslation || null,
      audioUrl: values.audioUrl || null,
      imageUrl: values.imageUrl || null,
    })
  }

  return (
    <form id={id} onSubmit={submit} className="space-y-8">
      <FormSection icon={BookMarked} title="Thông tin từ vựng" description="Từ tiếng Việt và bản dịch">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Từ tiếng Việt" required>
            <Input
              value={values.word}
              onChange={(e) => update('word', e.target.value)}
              placeholder="VD: xin chào"
              required
              className="text-base font-bold"
            />
          </FormField>

          <FormField label="Bản dịch" required>
            <Input
              value={values.translation}
              onChange={(e) => update('translation', e.target.value)}
              placeholder="VD: hello"
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Phiên âm">
            <Input
              value={values.phonetic ?? ''}
              onChange={(e) => update('phonetic', e.target.value)}
              placeholder="VD: /sin˧˧ tʃaːw˨˩/"
            />
          </FormField>

          <FormField label="Loại từ" required>
            <div className="grid grid-cols-3 gap-1.5">
              {PART_OF_SPEECH.map((pos) => {
                const isActive = values.partOfSpeech === pos.value
                return (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => update('partOfSpeech', pos.value)}
                    className={`rounded-md border-2 px-2 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {pos.label}
                  </button>
                )
              })}
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Loại từ phân loại" help="Dành cho danh từ tiếng Việt (con, cái, chiếc...)">
            <Input
              value={values.classifier ?? ''}
              onChange={(e) => update('classifier', e.target.value)}
              placeholder="VD: con, cái, chiếc"
            />
          </FormField>

          <FormField label="Mức độ khó" help="Từ 1 (dễ) đến 5 (khó)">
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
        </div>
      </FormSection>

      <FormSection title="Câu ví dụ">
        <FormField label="Câu tiếng Việt">
          <Textarea
            value={values.exampleSentence ?? ''}
            onChange={(e) => update('exampleSentence', e.target.value)}
            placeholder="VD: Tôi xin chào bạn."
            className="min-h-20"
          />
        </FormField>

        <FormField label="Bản dịch câu ví dụ">
          <Textarea
            value={values.exampleTranslation ?? ''}
            onChange={(e) => update('exampleTranslation', e.target.value)}
            placeholder="VD: I greet you."
            className="min-h-20"
          />
        </FormField>
      </FormSection>

      <FormSection title="Phương tiện">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Đường dẫn audio">
            <div className="flex gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-muted">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="url"
                value={values.audioUrl ?? ''}
                onChange={(e) => update('audioUrl', e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
            </div>
          </FormField>

          <FormField label="Đường dẫn hình ảnh">
            <div className="flex gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="url"
                value={values.imageUrl ?? ''}
                onChange={(e) => update('imageUrl', e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
            </div>
          </FormField>
        </div>
      </FormSection>
    </form>
  )
}
