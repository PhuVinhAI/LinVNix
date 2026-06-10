import { RectangleHorizontal, Square, RectangleVertical, Maximize } from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import { MediaUpload } from '../../../components/admin/editors/MediaUpload'
import type {
  ImageAspectRatio,
  ImageContentPayload,
} from '../../../features/learning/types'
import { SectionLabel } from '../authoring-ui'
import { ChipChoice } from './shared'

/**
 * Soạn hình minh hoạ — upload ảnh + chú thích song ngữ + chọn tỉ lệ hiển thị
 * (mobile dùng để render container đúng kích thước, tránh letterboxing/black bar).
 */
export function ImageMaterialForm({
  payload,
  onChange,
}: {
  payload: ImageContentPayload
  onChange: (next: ImageContentPayload) => void
}) {
  return (
    <>
      <div>
        <SectionLabel>Hình ảnh</SectionLabel>
        <MediaUpload
          kind="image"
          value={payload.url || null}
          onChange={(url) => onChange({ ...payload, url: url ?? '' })}
        />
      </div>

      <div>
        <SectionLabel right="hiển thị to dưới ảnh">Chú thích tiếng Việt</SectionLabel>
        <InlineEditable
          value={payload.caption}
          onChange={(v) => onChange({ ...payload, caption: v })}
          placeholder="Bấm để viết chú thích..."
          className="text-lg leading-relaxed font-semibold"
          ariaLabel="Chú thích tiếng Việt"
        />
      </div>

      <div>
        <SectionLabel>Bản dịch chú thích</SectionLabel>
        <InlineEditable
          value={payload.captionEn ?? ''}
          onChange={(v) =>
            onChange({ ...payload, captionEn: v.trim() ? v : null })
          }
          placeholder="Bấm để viết bản dịch chú thích..."
          className="text-base leading-relaxed text-muted-foreground"
          ariaLabel="Bản dịch chú thích"
        />
      </div>

      <div>
        <SectionLabel right="mobile dùng để bố cục đúng tỉ lệ">Tỉ lệ hiển thị</SectionLabel>
        <ChipChoice<ImageAspectRatio>
          value={payload.aspectRatio ?? 'auto'}
          onChange={(v) => onChange({ ...payload, aspectRatio: v })}
          options={[
            { value: 'auto', label: 'Tự động', Icon: Maximize },
            { value: '16:9', label: '16 : 9 — Ngang rộng', Icon: RectangleHorizontal },
            { value: '4:3', label: '4 : 3 — Ngang vừa', Icon: RectangleHorizontal },
            { value: '1:1', label: '1 : 1 — Vuông', Icon: Square },
            { value: '3:4', label: '3 : 4 — Dọc vừa', Icon: RectangleVertical },
            { value: '9:16', label: '9 : 16 — Dọc rộng', Icon: RectangleVertical },
          ]}
        />
      </div>

      <div>
        <SectionLabel right="cho học viên dùng đọc màn hình">Mô tả thay thế (alt)</SectionLabel>
        <InlineEditable
          value={payload.altText ?? ''}
          onChange={(v) =>
            onChange({ ...payload, altText: v.trim() ? v : null })
          }
          placeholder="Mô tả ngắn nội dung ảnh (mặc định lấy chú thích)..."
          className="text-sm leading-relaxed text-muted-foreground"
          ariaLabel="Mô tả ảnh"
          multiline={false}
        />
      </div>

      <div>
        <SectionLabel right="ghi tên tác giả / trang nguồn">Nguồn ảnh (tuỳ chọn)</SectionLabel>
        <InlineEditable
          value={payload.source ?? ''}
          onChange={(v) =>
            onChange({ ...payload, source: v.trim() ? v : null })
          }
          placeholder="Ảnh: ..."
          className="text-sm leading-relaxed text-muted-foreground italic"
          ariaLabel="Nguồn ảnh"
          multiline={false}
        />
      </div>
    </>
  )
}
