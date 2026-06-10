import { ArrowLeftRight, ChevronDown, Plus, Trash2, UserPlus } from 'lucide-react'
import { InlineEditable } from '../../../components/admin/InlineEditable'
import { MediaUpload } from '../../../components/admin/editors/MediaUpload'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import type {
  DialogueCharacter,
  DialogueData,
  DialogueLine,
} from '../../../features/learning/types'
import { SectionLabel } from '../authoring-ui'

/**
 * Hội thoại — soạn như đoạn chat thật trên mobile. Tách riêng khỏi 4 loại
 * media đơn lẻ vì cấu trúc nhân vật + nhiều lời thoại không khớp payload chung.
 */

const CHAR_COLORS = [
  'bg-blue-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-cyan-500',
]

function charColor(characters: DialogueCharacter[], id: string): string {
  const idx = characters.findIndex((c) => c.id === id)
  return CHAR_COLORS[(idx >= 0 ? idx : 0) % CHAR_COLORS.length]
}

function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

function SpeakerPicker({
  characters,
  value,
  onChange,
}: {
  characters: DialogueCharacter[]
  value: string
  onChange: (characterId: string) => void
}) {
  const current = characters.find((c) => c.id === value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Người nói"
          className="group/speaker inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {current?.name || 'Chưa đặt tên'}
          <ChevronDown className="h-3 w-3 opacity-0 transition-opacity group-hover/speaker:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Người nói
        </p>
        {characters.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onSelect={() => onChange(c.id)}
            className={c.id === value ? 'bg-muted font-bold' : ''}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${charColor(characters, c.id)}`}
            >
              {initialOf(c.name)}
            </span>
            <span className="flex-1 truncate">{c.name || 'Chưa đặt tên'}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              {c.side === 'left' ? 'Trái' : 'Phải'}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DialogueMaterialForm({
  dialogue,
  audioUrl,
  onDialogueChange,
  onAudioChange,
}: {
  dialogue: DialogueData
  audioUrl: string
  onDialogueChange: (next: DialogueData) => void
  onAudioChange: (url: string) => void
}) {
  const { characters, lines } = dialogue
  const setDialogue = (next: Partial<DialogueData>) =>
    onDialogueChange({ ...dialogue, ...next })

  const addCharacter = () => {
    const cid = `c${Date.now().toString(36)}${characters.length}`
    const hasRight = characters.some((c) => c.side === 'right')
    const side = characters.length > 0 && !hasRight ? 'right' : 'left'
    setDialogue({ characters: [...characters, { id: cid, name: '', side }] })
  }

  const updateCharacter = (cid: string, patch: Partial<DialogueCharacter>) =>
    setDialogue({
      characters: characters.map((c) => {
        if (c.id === cid) return { ...c, ...patch }
        if (patch.side === 'right' && c.side === 'right') return { ...c, side: 'left' }
        return c
      }),
    })

  const removeCharacter = (cid: string) =>
    setDialogue({
      characters: characters.filter((c) => c.id !== cid),
      lines: lines.filter((l) => l.characterId !== cid),
    })

  const addLine = (characterId: string) =>
    setDialogue({ lines: [...lines, { characterId, vi: '', en: '' }] })

  const updateLine = (index: number, patch: Partial<DialogueLine>) =>
    setDialogue({ lines: lines.map((l, i) => (i === index ? { ...l, ...patch } : l)) })

  const removeLine = (index: number) =>
    setDialogue({ lines: lines.filter((_, i) => i !== index) })

  const charById = Object.fromEntries(characters.map((c) => [c.id, c]))

  return (
    <>
      <div>
        <SectionLabel right="audio đọc toàn bộ đoạn hội thoại (không bắt buộc)">
          Âm thanh hội thoại
        </SectionLabel>
        <MediaUpload kind="audio" value={audioUrl || null} onChange={(url) => onAudioChange(url ?? '')} />
      </div>

      <div>
        <SectionLabel right="chỉ một nhân vật ở bên phải — như vai người học">Nhân vật</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {characters.map((c) => (
            <div
              key={c.id}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-border bg-card pl-1.5 pr-2 py-1.5"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${charColor(characters, c.id)}`}
              >
                {initialOf(c.name)}
              </span>
              <InlineEditable
                value={c.name}
                onChange={(v) => updateCharacter(c.id, { name: v })}
                placeholder="Tên..."
                className="w-24 text-sm font-semibold !px-1.5 !py-0.5"
                ariaLabel="Tên nhân vật"
                multiline={false}
              />
              <button
                type="button"
                onClick={() => updateCharacter(c.id, { side: c.side === 'left' ? 'right' : 'left' })}
                title={c.side === 'left' ? 'Bubble bên trái — bấm để đổi' : 'Bubble bên phải — bấm để đổi'}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftRight className="h-3 w-3" />
                {c.side === 'left' ? 'Trái' : 'Phải'}
              </button>
              <button
                type="button"
                onClick={() => removeCharacter(c.id)}
                aria-label="Xóa nhân vật"
                className="h-7 w-7 rounded-full text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 mx-auto" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCharacter}
            className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Thêm nhân vật
          </button>
        </div>
      </div>

      <div>
        <SectionLabel right="hiển thị đúng như trên app học viên">Lời thoại</SectionLabel>
        {lines.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {characters.length === 0
              ? 'Thêm nhân vật trước, rồi thêm lời thoại bên dưới.'
              : 'Chưa có lời thoại — bấm nút nhân vật bên dưới để thêm lượt nói.'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {lines.map((line, index) => {
              const speaker = charById[line.characterId]
              const right = speaker?.side === 'right'
              const color = speaker ? charColor(characters, speaker.id) : 'bg-muted-foreground'
              return (
                <div key={index} className={`group flex items-start gap-2 ${right ? 'flex-row-reverse' : ''}`}>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
                    title={speaker?.name || 'Nhân vật'}
                  >
                    {initialOf(speaker?.name ?? '')}
                  </span>
                  <div className={`flex max-w-[78%] flex-col ${right ? 'items-end' : 'items-start'}`}>
                    <SpeakerPicker
                      characters={characters}
                      value={line.characterId}
                      onChange={(cid) => updateLine(index, { characterId: cid })}
                    />
                    <div
                      className={`mt-0.5 rounded-2xl border-2 px-4 py-2.5 ${
                        right
                          ? 'border-primary/30 bg-primary/5 rounded-tr-md'
                          : 'border-border bg-muted/30 rounded-tl-md'
                      }`}
                    >
                      <InlineEditable
                        value={line.vi}
                        onChange={(v) => updateLine(index, { vi: v })}
                        placeholder="Lời thoại tiếng Việt..."
                        className="text-base font-semibold !px-1.5 !py-0.5"
                        ariaLabel={`Lời thoại ${index + 1}`}
                      />
                      <InlineEditable
                        value={line.en ?? ''}
                        onChange={(v) => updateLine(index, { en: v })}
                        placeholder="Bản dịch..."
                        className="text-xs text-muted-foreground !px-1.5 !py-0.5"
                        ariaLabel={`Bản dịch lời thoại ${index + 1}`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    aria-label="Xóa lời thoại"
                    className="mt-6 h-8 w-8 shrink-0 rounded-full text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {characters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {characters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => addLine(c.id)}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${charColor(characters, c.id)}`}
                >
                  {initialOf(c.name)}
                </span>
                {c.name || 'Nhân vật'} nói
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
