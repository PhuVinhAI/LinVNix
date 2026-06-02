import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  FileText,
  Plus,
  Volume2,
  Image as ImageIcon,
  Video as VideoIcon,
  MessagesSquare,
  Languages,
  Type,
  Trash2,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { MediaUpload } from '@/app/components/admin/editors/MediaUpload'
import { useLessonChildInline } from './hooks/use-lesson-child-inline'
import { InlineTextarea } from './shared/InlineTextarea'
import { InlineTextField } from './shared/InlineTextField'
import { InlineFieldShell } from './shared/InlineFieldShell'
import { InlineAddButton } from './shared/InlineAddButton'
import { SaveStateIndicator } from './shared/SaveStateIndicator'
import { ContentTypePicker } from './shared/ContentTypePicker'
import { DragHandle } from './shared/DragHandle'
import { SortableRow } from './shared/SortableRow'
import { DeleteRowButton } from './shared/DeleteRowButton'
import type { LessonContent } from '@/app/features/learning/types'
import { cn } from '@/lib/utils'

const NEW_DEFAULTS = {
  contentType: 'text',
  vietnameseText: '',
  translation: '',
} as const

export function ContentEditor({ lessonId }: { lessonId: string }) {
  const inline = useLessonChildInline<LessonContent>({ kind: 'contents', lessonId })
  const [focusId, setFocusId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortedRows = [...inline.rows].sort((a, b) => a.orderIndex - b.orderIndex)

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    inline.reorder(String(active.id), String(over.id))
  }

  const addRow = async (contentType: string = 'text') => {
    const id = await inline.createDraft({ ...NEW_DEFAULTS, contentType })
    setFocusId(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Nội dung bài học</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Văn bản, âm thanh, hình ảnh và đoạn hội thoại. Tự lưu khi rời ô.
          </p>
        </div>
        <Button onClick={() => addRow('text')}>
          <Plus className="h-4 w-4" />
          Thêm nội dung
        </Button>
      </div>

      {sortedRows.length === 0 ? (
        <EmptyState onPick={addRow} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedRows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortedRows.map((row, idx) => (
                <ContentCard
                  key={row.id}
                  row={row}
                  index={idx}
                  autoFocus={focusId === row.id}
                  onAutoFocused={() => setFocusId(null)}
                  onPatch={(p) => inline.patch(row.id, p)}
                  onDelete={() => inline.remove(row.id)}
                  saveState={inline.saveStateOf(row.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {sortedRows.length > 0 && (
        <AddNewMenu onPick={addRow} />
      )}
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (type: string) => void }) {
  const types = [
    { value: 'text', label: 'Văn bản', icon: Type, hint: 'Câu, đoạn văn ngắn' },
    { value: 'dialogue', label: 'Hội thoại', icon: MessagesSquare, hint: 'Đoạn đối thoại nhiều vai' },
    { value: 'audio', label: 'Âm thanh', icon: Volume2, hint: 'File nghe + lời thoại' },
    { value: 'image', label: 'Hình ảnh', icon: ImageIcon, hint: 'Ảnh + chú thích' },
    { value: 'video', label: 'Video', icon: VideoIcon, hint: 'Video + lời thoại' },
  ]
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center space-y-6">
      <div>
        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <h3 className="text-lg font-bold mb-1">Chưa có nội dung</h3>
        <p className="text-sm text-muted-foreground">Chọn loại nội dung đầu tiên để bắt đầu</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto">
        {types.map(({ value, label, icon: Icon, hint }) => (
          <button
            key={value}
            type="button"
            onClick={() => onPick(value)}
            className="rounded-lg border-2 border-border bg-card p-3 text-center hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
            <div className="text-sm font-bold text-foreground">{label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function AddNewMenu({ onPick }: { onPick: (type: string) => void }) {
  const [open, setOpen] = useState(false)
  const types = [
    { value: 'text', label: 'Văn bản', icon: Type },
    { value: 'dialogue', label: 'Hội thoại', icon: MessagesSquare },
    { value: 'audio', label: 'Âm thanh', icon: Volume2 },
    { value: 'image', label: 'Hình ảnh', icon: ImageIcon },
    { value: 'video', label: 'Video', icon: VideoIcon },
  ]
  if (!open) {
    return <InlineAddButton onClick={() => setOpen(true)}>Thêm nội dung</InlineAddButton>
  }
  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-2 flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
        Chọn loại:
      </span>
      {types.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            onPick(value)
            setOpen(false)
          }}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="ml-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Hủy
      </button>
    </div>
  )
}

function ContentCard({
  row,
  index,
  autoFocus,
  onAutoFocused,
  onPatch,
  onDelete,
  saveState,
}: {
  row: LessonContent
  index: number
  autoFocus: boolean
  onAutoFocused: () => void
  onPatch: (p: Partial<LessonContent>) => void
  onDelete: () => Promise<void>
  saveState: ReturnType<ReturnType<typeof useLessonChildInline>['saveStateOf']>
}) {
  const focusedRef = useRef(false)

  useEffect(() => {
    if (autoFocus && !focusedRef.current) {
      focusedRef.current = true
      queueMicrotask(onAutoFocused)
    }
    if (!autoFocus) focusedRef.current = false
  }, [autoFocus, onAutoFocused])

  return (
    <SortableRow id={row.id} as="div">
      {({ listeners, attributes, isDragging }) => (
        <div
          className={cn(
            'rounded-xl border-2 border-border bg-card overflow-hidden transition-all',
            isDragging && 'shadow-lg',
          )}
        >
          {/* Card header */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <DragHandle {...listeners} {...attributes} />
              <span className="text-xs font-bold text-muted-foreground tabular-nums">#{index + 1}</span>
              <ContentTypePicker
                value={row.contentType}
                onChange={(v) => onPatch({ contentType: v })}
              />
            </div>
            <div className="flex items-center gap-2">
              <SaveStateIndicator state={saveState} />
              <DeleteRowButton label={row.vietnameseText} resource="nội dung" onDelete={onDelete} />
            </div>
          </div>

          {/* Per-type body */}
          {row.contentType === 'text' && (
            <TextBody row={row} onPatch={onPatch} autoFocus={autoFocus} />
          )}
          {row.contentType === 'dialogue' && (
            <DialogueBody row={row} onPatch={onPatch} autoFocus={autoFocus} />
          )}
          {row.contentType === 'audio' && (
            <AudioBody row={row} onPatch={onPatch} autoFocus={autoFocus} />
          )}
          {row.contentType === 'image' && (
            <ImageBody row={row} onPatch={onPatch} autoFocus={autoFocus} />
          )}
          {row.contentType === 'video' && (
            <VideoBody row={row} onPatch={onPatch} autoFocus={autoFocus} />
          )}
        </div>
      )}
    </SortableRow>
  )
}

// ===== TYPE: TEXT =====
function TextBody({
  row,
  onPatch,
  autoFocus,
}: {
  row: LessonContent
  onPatch: (p: Partial<LessonContent>) => void
  autoFocus: boolean
}) {
  const [showPhonetic, setShowPhonetic] = useState(!!row.phonetic)
  const [showNotes, setShowNotes] = useState(!!row.notes)

  return (
    <div className="p-4 space-y-3">
      <FieldLabel icon={<Type className="h-3.5 w-3.5" />}>Tiếng Việt</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.vietnameseText}
          onCommit={(v) => onPatch({ vietnameseText: v })}
          placeholder="Nội dung tiếng Việt..."
          size="lg"
          minRows={2}
          autoFocus={autoFocus}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>

      <FieldLabel icon={<Languages className="h-3.5 w-3.5" />}>Bản dịch</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.translation ?? ''}
          onCommit={(v) => onPatch({ translation: v || null })}
          placeholder="Bản dịch sang ngôn ngữ học viên..."
          minRows={1}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>

      {showPhonetic ? (
        <>
          <FieldLabel icon={<Volume2 className="h-3.5 w-3.5" />}>Phiên âm</FieldLabel>
          <InlineFieldShell>
            <InlineTextField
              value={row.phonetic ?? ''}
              onCommit={(v) => {
                onPatch({ phonetic: v || null })
                if (!v) setShowPhonetic(false)
              }}
              placeholder="/jiŋ˧˧ tʃaːw˨˩/"
              monospace
              className="hover:bg-transparent focus:bg-transparent focus:ring-0"
            />
          </InlineFieldShell>
        </>
      ) : (
        <InlineAddButton variant="inline" onClick={() => setShowPhonetic(true)}>
          Thêm phiên âm
        </InlineAddButton>
      )}

      {showNotes ? (
        <>
          <FieldLabel>Ghi chú cho giáo viên</FieldLabel>
          <InlineFieldShell>
            <InlineTextarea
              value={row.notes ?? ''}
              onCommit={(v) => {
                onPatch({ notes: v || null })
                if (!v) setShowNotes(false)
              }}
              placeholder="Ghi chú thêm cho người dạy"
              minRows={1}
              className="hover:bg-transparent focus:bg-transparent focus:ring-0"
            />
          </InlineFieldShell>
        </>
      ) : (
        <InlineAddButton variant="inline" onClick={() => setShowNotes(true)}>
          Thêm ghi chú
        </InlineAddButton>
      )}
    </div>
  )
}

// ===== TYPE: DIALOGUE =====
type DialogueLine = { speaker: string; vi: string; en: string }

function parseDialogue(text: string, translation: string | null | undefined): DialogueLine[] {
  const viLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const enLines = (translation ?? '').split(/\r?\n/).map((l) => l.trim())
  return viLines.map((line, i) => {
    const match = line.match(/^([^:：]+)[:：]\s*(.*)$/)
    const speaker = match ? match[1].trim() : ''
    const vi = match ? match[2].trim() : line
    const enRaw = enLines[i] ?? ''
    const enMatch = enRaw.match(/^([^:：]+)[:：]\s*(.*)$/)
    const en = enMatch ? enMatch[2].trim() : enRaw
    return { speaker, vi, en }
  })
}

function serializeDialogue(lines: DialogueLine[]) {
  const meaningful = lines.filter((l) => l.vi.trim() || l.en.trim())
  const vi = meaningful
    .map((l) => (l.speaker ? `${l.speaker}: ${l.vi}` : l.vi))
    .join('\n')
  const en = meaningful
    .map((l) => (l.speaker ? `${l.speaker}: ${l.en}` : l.en))
    .join('\n')
  return { vi, en }
}

function dialogueSignature(lines: DialogueLine[]) {
  return lines
    .filter((l) => l.vi.trim() || l.en.trim())
    .map((l) => `${l.speaker}|${l.vi}|${l.en}`)
    .join('\n')
}

function DialogueBody({
  row,
  onPatch,
  autoFocus,
}: {
  row: LessonContent
  onPatch: (p: Partial<LessonContent>) => void
  autoFocus: boolean
}) {
  // Local source of truth — keeps blank trailing lines and unsaved input
  const [lines, setLines] = useState<DialogueLine[]>(() => {
    const parsed = parseDialogue(row.vietnameseText, row.translation)
    return parsed.length ? parsed : [{ speaker: '', vi: '', en: '' }]
  })

  // Re-sync from props ONLY when the server data diverges from what we last committed
  // (handles external refetch / undo cases without nuking in-progress empty rows)
  const lastSignatureRef = useRef(dialogueSignature(lines))
  useEffect(() => {
    const incomingSig = dialogueSignature(parseDialogue(row.vietnameseText, row.translation))
    if (incomingSig !== lastSignatureRef.current) {
      const parsed = parseDialogue(row.vietnameseText, row.translation)
      setLines(parsed.length ? parsed : [{ speaker: '', vi: '', en: '' }])
      lastSignatureRef.current = incomingSig
    }
  }, [row.vietnameseText, row.translation])

  const [showAudio, setShowAudio] = useState(!!row.audioUrl)

  const speakerOrder = useMemo(() => {
    const seen: string[] = []
    for (const l of lines) {
      const s = l.speaker.trim()
      if (s && !seen.includes(s)) seen.push(s)
    }
    return seen
  }, [lines])

  const sideOf = (speaker: string): 'left' | 'right' | 'center' => {
    const s = speaker.trim()
    if (!s) return 'center'
    const idx = speakerOrder.indexOf(s)
    if (idx === 0) return 'left'
    if (idx === 1) return 'right'
    return 'center'
  }

  const apply = (next: DialogueLine[]) => {
    setLines(next)
    const { vi, en } = serializeDialogue(next)
    lastSignatureRef.current = dialogueSignature(next)
    onPatch({ vietnameseText: vi, translation: en || null })
  }

  const updateLine = (i: number, patch: Partial<DialogueLine>) =>
    apply(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  const removeLine = (i: number) => {
    if (lines.length <= 1) return
    apply(lines.filter((_, idx) => idx !== i))
  }

  const addLine = (preferredSpeaker?: string) => {
    const lastSpeaker = lines[lines.length - 1]?.speaker ?? ''
    let inferred = preferredSpeaker ?? ''
    if (!inferred) {
      if (speakerOrder.length >= 2) {
        inferred = lastSpeaker === speakerOrder[0] ? speakerOrder[1] : speakerOrder[0]
      } else if (speakerOrder.length === 1) {
        inferred = lastSpeaker === speakerOrder[0] ? '' : speakerOrder[0]
      }
    }
    apply([...lines, { speaker: inferred, vi: '', en: '' }])
  }

  return (
    <div className="p-4 space-y-4">
      {showAudio && (
        <FieldRow icon={<Volume2 className="h-3.5 w-3.5" />} label="File âm thanh cho cả đoạn">
          <MediaUpload
            kind="audio"
            value={row.audioUrl ?? null}
            onChange={(url) => {
              onPatch({ audioUrl: url })
              if (!url) setShowAudio(false)
            }}
          />
        </FieldRow>
      )}

      {/* Speaker legend */}
      {speakerOrder.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold uppercase tracking-wider text-muted-foreground">Nhân vật:</span>
          {speakerOrder.slice(0, 2).map((sp, i) => (
            <span
              key={sp}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold',
                i === 0
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
              )}
            >
              <SpeakerAvatar name={sp} variant={i === 0 ? 'left' : 'right'} size="sm" />
              {sp}
              <span className="text-muted-foreground font-medium">· {i === 0 ? 'bên trái' : 'bên phải'}</span>
            </span>
          ))}
          {speakerOrder.slice(2).map((sp) => (
            <span
              key={sp}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-bold text-muted-foreground"
            >
              <SpeakerAvatar name={sp} variant="center" size="sm" />
              {sp}
            </span>
          ))}
        </div>
      )}

      {/* Chat thread */}
      <div className="rounded-xl border-2 border-input bg-[radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)] [background-size:16px_16px] p-4 space-y-3">
        {lines.map((line, i) => (
          <DialogueBubble
            key={i}
            line={line}
            side={sideOf(line.speaker)}
            speakerOrder={speakerOrder}
            canDelete={lines.length > 1}
            autoFocus={autoFocus && i === 0 && !line.speaker && !line.vi}
            onUpdate={(patch) => updateLine(i, patch)}
            onDelete={() => removeLine(i)}
          />
        ))}
      </div>

      {/* Add buttons */}
      <div className="space-y-2">
        {speakerOrder.length >= 2 ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => addLine(speakerOrder[0])}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-500/5 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm lượt {speakerOrder[0]}
            </button>
            <button
              type="button"
              onClick={() => addLine(speakerOrder[1])}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm lượt {speakerOrder[1]}
            </button>
          </div>
        ) : (
          <InlineAddButton onClick={() => addLine()}>Thêm lượt thoại</InlineAddButton>
        )}
      </div>

      {!showAudio && (
        <InlineAddButton variant="inline" onClick={() => setShowAudio(true)} icon={<Volume2 className="h-3 w-3" />}>
          Thêm file âm thanh
        </InlineAddButton>
      )}
    </div>
  )
}

function DialogueBubble({
  line,
  side,
  speakerOrder,
  canDelete,
  autoFocus,
  onUpdate,
  onDelete,
}: {
  line: DialogueLine
  side: 'left' | 'right' | 'center'
  speakerOrder: string[]
  canDelete: boolean
  autoFocus: boolean
  onUpdate: (patch: Partial<DialogueLine>) => void
  onDelete: () => void
}) {
  const alignRow = side === 'right' ? 'justify-end' : side === 'left' ? 'justify-start' : 'justify-center'

  const bubbleColor =
    side === 'left'
      ? 'border-blue-500/30 bg-blue-500/[0.06]'
      : side === 'right'
      ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
      : 'border-input bg-card'

  const radius =
    side === 'left'
      ? 'rounded-2xl rounded-tl-sm'
      : side === 'right'
      ? 'rounded-2xl rounded-tr-sm'
      : 'rounded-2xl'

  const labelColor =
    side === 'left'
      ? 'text-blue-700 dark:text-blue-300'
      : side === 'right'
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-muted-foreground'

  const bubble = (
    <div className={cn('flex flex-col gap-0.5 max-w-[85%] group/bubble min-w-0 flex-1', side === 'right' && 'items-end')}>
      <div className={cn('flex items-center gap-2 px-1', side === 'right' && 'flex-row-reverse')}>
        <SpeakerLabelInput
          value={line.speaker}
          suggestions={speakerOrder}
          onChange={(v) => onUpdate({ speaker: v })}
          colorClass={labelColor}
          align={side}
        />
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-6 w-6 text-muted-foreground/0 group-hover/bubble:text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Xóa lượt"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className={cn('border-2 px-3.5 py-2 space-y-0.5 w-full', radius, bubbleColor)}>
        <InlineTextarea
          value={line.vi}
          onCommit={(v) => onUpdate({ vi: v })}
          placeholder="Câu thoại tiếng Việt..."
          minRows={1}
          autoFocus={autoFocus}
          className="border-0 bg-transparent px-0 py-0 hover:bg-transparent focus:bg-transparent focus:ring-0 text-foreground"
        />
        {(line.en || line.vi) && (
          <InlineTextarea
            value={line.en}
            onCommit={(v) => onUpdate({ en: v })}
            placeholder="Bản dịch..."
            minRows={1}
            size="sm"
            className="border-0 bg-transparent px-0 py-0 hover:bg-transparent focus:bg-transparent focus:ring-0 text-muted-foreground italic"
          />
        )}
      </div>
    </div>
  )

  const avatar = (
    <SpeakerAvatar
      name={line.speaker}
      variant={side}
      size="md"
      className={cn('shrink-0', side === 'center' && 'opacity-60')}
    />
  )

  return (
    <div className={cn('flex items-end gap-2', alignRow)}>
      {side === 'left' && avatar}
      {bubble}
      {side === 'right' && avatar}
    </div>
  )
}

function SpeakerAvatar({
  name,
  variant,
  size = 'md',
  className,
}: {
  name: string
  variant: 'left' | 'right' | 'center'
  size?: 'sm' | 'md'
  className?: string
}) {
  const initial = (name.trim()[0] || '?').toUpperCase()
  const color =
    variant === 'left'
      ? 'bg-blue-500 text-white'
      : variant === 'right'
      ? 'bg-emerald-500 text-white'
      : 'bg-muted text-muted-foreground'
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold',
        size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-8 w-8 text-sm',
        color,
        className,
      )}
    >
      {initial}
    </div>
  )
}

function SpeakerLabelInput({
  value,
  suggestions,
  onChange,
  colorClass,
  align,
}: {
  value: string
  suggestions: string[]
  onChange: (next: string) => void
  colorClass: string
  align: 'left' | 'right' | 'center'
}) {
  const [draft, setDraft] = useState(value)
  const lastRef = useRef(value)
  useEffect(() => {
    if (value !== lastRef.current) {
      setDraft(value)
      lastRef.current = value
    }
  }, [value])

  const commit = () => {
    if (draft === lastRef.current) return
    lastRef.current = draft
    onChange(draft)
  }

  const others = suggestions.filter((s) => s !== value).slice(0, 2)

  return (
    <div className={cn('inline-flex items-center gap-1', align === 'right' && 'flex-row-reverse')}>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
            ;(e.target as HTMLInputElement).blur()
          }
          if (e.key === 'Escape') {
            setDraft(lastRef.current)
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        placeholder="Tên vai"
        size={Math.max(draft.length || 6, 6)}
        className={cn(
          'rounded-md border border-transparent bg-transparent px-1 py-0 text-xs font-bold outline-none focus:border-input focus:bg-card',
          colorClass,
        )}
      />
      {others.length > 0 && (
        <div className="inline-flex items-center gap-0.5 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
          {others.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              title={`Đổi vai sang ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== TYPE: AUDIO =====
function AudioBody({
  row,
  onPatch,
  autoFocus,
}: {
  row: LessonContent
  onPatch: (p: Partial<LessonContent>) => void
  autoFocus: boolean
}) {
  return (
    <div className="p-4 space-y-3">
      <FieldLabel icon={<Volume2 className="h-3.5 w-3.5" />}>File phát âm</FieldLabel>
      <MediaUpload
        kind="audio"
        value={row.audioUrl ?? null}
        onChange={(url) => onPatch({ audioUrl: url })}
      />

      <FieldLabel icon={<Type className="h-3.5 w-3.5" />}>Lời thoại / phiên âm</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.vietnameseText}
          onCommit={(v) => onPatch({ vietnameseText: v })}
          placeholder="Nội dung tiếng Việt phát ra trong audio..."
          size="lg"
          minRows={2}
          autoFocus={autoFocus}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>

      <FieldLabel icon={<Languages className="h-3.5 w-3.5" />}>Bản dịch</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.translation ?? ''}
          onCommit={(v) => onPatch({ translation: v || null })}
          placeholder="Bản dịch lời thoại..."
          minRows={1}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>
    </div>
  )
}

// ===== TYPE: IMAGE =====
function ImageBody({
  row,
  onPatch,
  autoFocus,
}: {
  row: LessonContent
  onPatch: (p: Partial<LessonContent>) => void
  autoFocus: boolean
}) {
  return (
    <div className="p-4 space-y-3">
      <FieldLabel icon={<ImageIcon className="h-3.5 w-3.5" />}>Hình ảnh</FieldLabel>
      <MediaUpload
        kind="image"
        value={row.imageUrl ?? null}
        onChange={(url) => onPatch({ imageUrl: url })}
      />

      <FieldLabel icon={<Type className="h-3.5 w-3.5" />}>Chú thích tiếng Việt</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.vietnameseText}
          onCommit={(v) => onPatch({ vietnameseText: v })}
          placeholder="Mô tả hình ảnh bằng tiếng Việt..."
          size="lg"
          minRows={2}
          autoFocus={autoFocus}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>

      <FieldLabel icon={<Languages className="h-3.5 w-3.5" />}>Bản dịch</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.translation ?? ''}
          onCommit={(v) => onPatch({ translation: v || null })}
          placeholder="Bản dịch chú thích..."
          minRows={1}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>
    </div>
  )
}

// ===== TYPE: VIDEO =====
function VideoBody({
  row,
  onPatch,
  autoFocus,
}: {
  row: LessonContent
  onPatch: (p: Partial<LessonContent>) => void
  autoFocus: boolean
}) {
  return (
    <div className="p-4 space-y-3">
      <FieldLabel icon={<VideoIcon className="h-3.5 w-3.5" />}>Video</FieldLabel>
      <MediaUpload
        kind="video"
        value={row.videoUrl ?? null}
        onChange={(url) => onPatch({ videoUrl: url })}
      />

      <FieldLabel icon={<Type className="h-3.5 w-3.5" />}>Lời thoại / phụ đề</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.vietnameseText}
          onCommit={(v) => onPatch({ vietnameseText: v })}
          placeholder="Lời thoại tiếng Việt trong video..."
          size="lg"
          minRows={2}
          autoFocus={autoFocus}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>

      <FieldLabel icon={<Languages className="h-3.5 w-3.5" />}>Bản dịch</FieldLabel>
      <InlineFieldShell>
        <InlineTextarea
          value={row.translation ?? ''}
          onCommit={(v) => onPatch({ translation: v || null })}
          placeholder="Bản dịch lời thoại..."
          minRows={1}
          className="hover:bg-transparent focus:bg-transparent focus:ring-0"
        />
      </InlineFieldShell>
    </div>
  )
}

// ===== shared local helpers =====
function FieldLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
      {icon}
      {children}
    </label>
  )
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
