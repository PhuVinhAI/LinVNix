import { InlineEditable } from '../../../components/admin/InlineEditable'
import { MediaUpload } from '../../../components/admin/editors/MediaUpload'
import type { AudioContentPayload } from '../../../features/learning/types'
import { SectionLabel } from '../authoring-ui'
import { NumberInput, Repeater } from './shared'

/**
 * Soạn đoạn âm thanh — upload audio + tiêu đề + người nói + ảnh cover
 * + transcript song ngữ + (tuỳ chọn) cắt segment theo mốc thời gian.
 */
export function AudioMaterialForm({
  payload,
  onChange,
}: {
  payload: AudioContentPayload
  onChange: (next: AudioContentPayload) => void
}) {
  return (
    <>
      <div>
        <SectionLabel>Tệp âm thanh</SectionLabel>
        <MediaUpload
          kind="audio"
          value={payload.url || null}
          onChange={(url) => onChange({ ...payload, url: url ?? '' })}
        />
      </div>

      <div>
        <SectionLabel right="hiện trên player">Tiêu đề</SectionLabel>
        <InlineEditable
          value={payload.title}
          onChange={(v) => onChange({ ...payload, title: v })}
          placeholder="VD: Hội thoại buổi sáng tại quán cà phê..."
          className="text-lg leading-snug font-bold"
          ariaLabel="Tiêu đề"
          multiline={false}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SectionLabel>Người nói (tuỳ chọn)</SectionLabel>
          <InlineEditable
            value={payload.speaker ?? ''}
            onChange={(v) =>
              onChange({ ...payload, speaker: v.trim() ? v : null })
            }
            placeholder="VD: Cô Lan, người Hà Nội..."
            className="text-base font-semibold"
            ariaLabel="Người nói"
            multiline={false}
          />
        </div>
        <div>
          <SectionLabel right="mặc định lấy từ file">Thời lượng</SectionLabel>
          <NumberInput
            value={payload.durationSeconds}
            onChange={(v) => onChange({ ...payload, durationSeconds: v })}
            placeholder="0"
            suffix="giây"
          />
        </div>
      </div>

      <div>
        <SectionLabel right="hiện to phía sau player (như podcast art)">
          Ảnh cover (tuỳ chọn)
        </SectionLabel>
        <MediaUpload
          kind="image"
          value={payload.coverImageUrl || null}
          onChange={(url) =>
            onChange({ ...payload, coverImageUrl: url ?? null })
          }
        />
      </div>

      <div>
        <SectionLabel right="bản tiếng Việt — học viên xem theo audio">
          Lời thoại (transcript)
        </SectionLabel>
        <InlineEditable
          value={payload.transcript}
          onChange={(v) => onChange({ ...payload, transcript: v })}
          placeholder="Bấm để nhập lời thoại tiếng Việt..."
          className="text-base leading-relaxed font-medium"
          ariaLabel="Lời thoại"
        />
      </div>

      <div>
        <SectionLabel>Bản dịch lời thoại</SectionLabel>
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
        title="Cắt segment theo thời gian (tuỳ chọn)"
        hint="dùng để tua tới từng câu trên mobile"
        items={payload.segments ?? []}
        newItem={() => ({ startSeconds: 0, vi: '', en: null })}
        onChange={(next) =>
          onChange({ ...payload, segments: next.length ? next : undefined })
        }
        emptyText="Không cần cũng được — mobile sẽ phát toàn bộ. Thêm khi muốn học viên tua chính xác."
        addLabel="Thêm segment"
        renderItem={({ value, onChange: setItem }) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Bắt đầu
              </span>
              <NumberInput
                value={value.startSeconds}
                onChange={(v) => setItem({ ...value, startSeconds: v ?? 0 })}
                suffix="giây"
              />
            </div>
            <InlineEditable
              value={value.vi}
              onChange={(v) => setItem({ ...value, vi: v })}
              placeholder="Lời thoại tiếng Việt..."
              className="text-base font-medium"
              ariaLabel="Lời thoại tiếng Việt"
            />
            <InlineEditable
              value={value.en ?? ''}
              onChange={(v) => setItem({ ...value, en: v.trim() ? v : null })}
              placeholder="Bản dịch..."
              className="text-sm text-muted-foreground"
              ariaLabel="Bản dịch"
            />
          </div>
        )}
      />
    </>
  )
}
