import {
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Server,
  PlayCircle,
} from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import { MediaUpload } from '../../../components/admin/editors/MediaUpload'
import type {
  VideoAspectRatio,
  VideoContentPayload,
  VideoProvider,
} from '../../../features/learning/types'
import { SectionLabel } from '../authoring-ui'
import { ChipChoice, NumberInput, Repeater } from './shared'

/**
 * Soạn video bài giảng — chọn nguồn (self-hosted / YouTube), tiêu đề,
 * thumbnail, tỉ lệ, transcript song ngữ và các chương (chapters).
 */
export function VideoMaterialForm({
  payload,
  onChange,
}: {
  payload: VideoContentPayload
  onChange: (next: VideoContentPayload) => void
}) {
  const provider: VideoProvider = payload.provider ?? 'self_hosted'
  const isYoutube = provider === 'youtube'

  return (
    <>
      <div>
        <SectionLabel>Nguồn video</SectionLabel>
        <ChipChoice<VideoProvider>
          value={provider}
          onChange={(v) => onChange({ ...payload, provider: v })}
          options={[
            { value: 'self_hosted', label: 'Tự host (upload file)', Icon: Server },
            { value: 'youtube', label: 'YouTube (dán link)', Icon: PlayCircle },
          ]}
        />
      </div>

      {isYoutube ? (
        <div>
          <SectionLabel right="dán link đầy đủ — mobile sẽ tự nhúng">
            Link YouTube
          </SectionLabel>
          <InlineEditable
            value={payload.url}
            onChange={(v) => onChange({ ...payload, url: v })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="text-sm font-mono"
            ariaLabel="Link YouTube"
            multiline={false}
          />
        </div>
      ) : (
        <div>
          <SectionLabel>Tệp video</SectionLabel>
          <MediaUpload
            kind="video"
            value={payload.url || null}
            onChange={(url) => onChange({ ...payload, url: url ?? '' })}
          />
        </div>
      )}

      <div>
        <SectionLabel right="hiện trên header player">Tiêu đề</SectionLabel>
        <InlineEditable
          value={payload.title}
          onChange={(v) => onChange({ ...payload, title: v })}
          placeholder="VD: Cách phát âm thanh điệu tiếng Việt..."
          className="text-lg leading-snug font-bold"
          ariaLabel="Tiêu đề"
          multiline={false}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SectionLabel right="hiện khi chưa load video">Ảnh thumbnail</SectionLabel>
          <MediaUpload
            kind="image"
            value={payload.thumbnailUrl || null}
            onChange={(url) =>
              onChange({ ...payload, thumbnailUrl: url ?? null })
            }
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
        <SectionLabel>Tỉ lệ khung</SectionLabel>
        <ChipChoice<VideoAspectRatio>
          value={payload.aspectRatio ?? '16:9'}
          onChange={(v) => onChange({ ...payload, aspectRatio: v })}
          options={[
            { value: '16:9', label: '16 : 9 — Ngang', Icon: RectangleHorizontal },
            { value: '9:16', label: '9 : 16 — Dọc (TikTok)', Icon: RectangleVertical },
            { value: '4:3', label: '4 : 3 — Cũ', Icon: RectangleHorizontal },
            { value: '1:1', label: '1 : 1 — Vuông', Icon: Square },
          ]}
        />
      </div>

      <div>
        <SectionLabel right="bản tiếng Việt — gập / mở dưới video">
          Lời thoại (transcript)
        </SectionLabel>
        <InlineEditable
          value={payload.transcript ?? ''}
          onChange={(v) =>
            onChange({ ...payload, transcript: v.trim() ? v : null })
          }
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
        title="Chương (chapters)"
        hint="học viên thấy danh sách pill để tua từng chương"
        items={payload.chapters ?? []}
        newItem={() => ({ startSeconds: 0, title: '' })}
        onChange={(next) =>
          onChange({ ...payload, chapters: next.length ? next : undefined })
        }
        emptyText="Chưa có chương. Thêm khi video dài và muốn học viên tua nhanh."
        addLabel="Thêm chương"
        renderItem={({ value, onChange: setItem }) => (
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Bắt đầu
              </span>
              <NumberInput
                value={value.startSeconds}
                onChange={(v) => setItem({ ...value, startSeconds: v ?? 0 })}
                suffix="giây"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Tiêu đề chương
              </span>
              <InlineEditable
                value={value.title}
                onChange={(v) => setItem({ ...value, title: v })}
                placeholder="VD: Mở đầu / Phần 1 / Tổng kết..."
                className="text-base font-semibold"
                ariaLabel="Tiêu đề chương"
                multiline={false}
              />
            </div>
          </div>
        )}
      />
    </>
  )
}
