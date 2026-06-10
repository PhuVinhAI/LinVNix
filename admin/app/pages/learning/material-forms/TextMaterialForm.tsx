import { Sparkles } from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import type { TextContentPayload } from '../../../features/learning/types'
import { SectionLabel } from '../authoring-ui'
import { LongTextField, Repeater } from './shared'

/**
 * Soạn bài đọc — văn bản tiếng Việt + bản dịch + (tuỳ chọn) các đoạn tách
 * sẵn cho mobile xuống dòng đẹp, và highlight các từ chìa khoá ngay trong bài.
 */
export function TextMaterialForm({
  payload,
  onChange,
  autoFocus,
}: {
  payload: TextContentPayload
  onChange: (next: TextContentPayload) => void
  autoFocus?: boolean
}) {
  return (
    <>
      <div>
        <SectionLabel>Nội dung tiếng Việt</SectionLabel>
        <InlineEditable
          value={payload.body}
          onChange={(v) => onChange({ ...payload, body: v })}
          placeholder="Bấm để viết đoạn văn học viên sẽ đọc..."
          className="text-xl leading-relaxed font-medium"
          ariaLabel="Nội dung tiếng Việt"
          autoFocus={autoFocus}
        />
      </div>

      <div>
        <SectionLabel>Bản dịch tiếng Anh</SectionLabel>
        <InlineEditable
          value={payload.translation ?? ''}
          onChange={(v) =>
            onChange({ ...payload, translation: v.trim() ? v : null })
          }
          placeholder="Bấm để viết bản dịch..."
          className="text-base leading-relaxed text-muted-foreground"
          ariaLabel="Bản dịch"
        />
      </div>

      <Repeater
        title="Tách đoạn (tuỳ chọn)"
        hint="dùng khi muốn xuống dòng đẹp trên mobile"
        items={payload.paragraphs ?? []}
        newItem={() => ({ vi: '', en: null })}
        onChange={(next) =>
          onChange({ ...payload, paragraphs: next.length ? next : undefined })
        }
        emptyText="Mặc định mobile tự tách theo dòng trống. Thêm đoạn để kiểm soát ngắt dòng."
        addLabel="Thêm đoạn"
        renderItem={({ value, onChange: setItem }) => (
          <div className="space-y-1.5">
            <LongTextField
              value={value.vi}
              onChange={(v) => setItem({ ...value, vi: v })}
              placeholder="Nội dung tiếng Việt của đoạn..."
              ariaLabel="Đoạn tiếng Việt"
            />
            <InlineEditable
              value={value.en ?? ''}
              onChange={(v) => setItem({ ...value, en: v.trim() ? v : null })}
              placeholder="Bản dịch đoạn..."
              className="text-sm leading-relaxed text-muted-foreground"
              ariaLabel="Bản dịch đoạn"
            />
          </div>
        )}
      />

      <Repeater
        title={
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Từ chìa khoá (tuỳ chọn)
          </span>
        }
        hint="hiện chip giải nghĩa nhanh ngay trong bài đọc"
        items={payload.keyTerms ?? []}
        newItem={() => ({ term: '', meaning: '' })}
        onChange={(next) =>
          onChange({ ...payload, keyTerms: next.length ? next : undefined })
        }
        emptyText="Chưa có từ chìa khoá. Thêm để học viên xem nghĩa nhanh mà không phải ra trang từ vựng."
        addLabel="Thêm từ chìa khoá"
        renderItem={({ value, onChange: setItem }) => (
          <div className="flex gap-2 items-start">
            <InlineEditable
              value={value.term}
              onChange={(v) => setItem({ ...value, term: v })}
              placeholder="từ / cụm từ"
              className="text-base font-bold flex-1"
              ariaLabel="Từ chìa khoá"
              multiline={false}
            />
            <span className="mt-2 text-muted-foreground">·</span>
            <InlineEditable
              value={value.meaning}
              onChange={(v) => setItem({ ...value, meaning: v })}
              placeholder="nghĩa ngắn gọn"
              className="text-sm flex-1"
              ariaLabel="Nghĩa"
              multiline={false}
            />
          </div>
        )}
      />
    </>
  )
}
