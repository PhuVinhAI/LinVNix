import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeftRight, ChevronDown, Plus, Trash2, UserPlus } from 'lucide-react'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { InlineEditable } from '../../components/admin/InlineEditable'
import { MediaUpload } from '../../components/admin/editors/MediaUpload'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type {
  DialogueCharacter,
  DialogueData,
  DialogueLine,
  LessonContent,
} from '../../features/learning/types'
import { materialTypeMeta } from './authoring-meta'
import {
  ComposerCard,
  NotesField,
  SectionLabel,
  StickySaveBar,
} from './authoring-ui'
import { learningPath } from './route-utils'

interface FormState {
  vietnameseText: string
  translation: string
  notes: string
  audioUrl: string
  imageUrl: string
  videoUrl: string
  dialogue: DialogueData
}

const EMPTY: FormState = {
  vietnameseText: '',
  translation: '',
  notes: '',
  audioUrl: '',
  imageUrl: '',
  videoUrl: '',
  dialogue: { characters: [], lines: [] },
}

function fromContent(c: LessonContent): FormState {
  return {
    vietnameseText: c.vietnameseText ?? '',
    translation: c.translation ?? '',
    notes: c.notes ?? '',
    audioUrl: c.audioUrl ?? '',
    imageUrl: c.imageUrl ?? '',
    videoUrl: c.videoUrl ?? '',
    dialogue: {
      characters: c.dialogueData?.characters ?? [],
      lines: c.dialogueData?.lines ?? [],
    },
  }
}

/** Soạn một mục Nội dung bài — UI thiết kế riêng theo từng loại. */
export function MaterialFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { lessonId, materialType, id } = useParams()
  const navigate = useNavigate()
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [submitting, setSubmitting] = useState(false)

  const meta = materialTypeMeta(materialType)
  const existing = mode === 'edit' ? lesson?.contents?.find((c) => c.id === id) ?? null : null
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => {
    if (existing) setForm(fromContent(existing))
  }, [existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />
  if (!meta) return <Navigate to={learningPath.lessonSection(lessonId, 'materials')} replace />

  const backPath = learningPath.materialType(lessonId, meta.value)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = (): string | null => {
    switch (meta.value) {
      case 'text':
        return form.vietnameseText.trim() ? null : 'Chưa nhập nội dung tiếng Việt'
      case 'dialogue': {
        if (form.dialogue.characters.length < 1) return 'Hội thoại cần ít nhất một nhân vật'
        if (form.dialogue.characters.some((c) => !c.name.trim())) return 'Có nhân vật chưa đặt tên'
        if (form.dialogue.characters.filter((c) => c.side === 'right').length > 1)
          return 'Chỉ một nhân vật được ở bên phải'
        if (form.dialogue.lines.length < 1) return 'Hội thoại cần ít nhất một lời thoại'
        if (form.dialogue.lines.some((l) => !l.vi.trim())) return 'Có lời thoại chưa nhập nội dung'
        return null
      }
      case 'audio':
        return form.audioUrl ? null : 'Chưa tải lên file âm thanh'
      case 'image':
        return form.imageUrl ? null : 'Chưa tải lên hình ảnh'
      case 'video':
        return form.videoUrl ? null : 'Chưa tải lên video'
      default:
        return null
    }
  }

  const save = async () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        contentType: meta.value,
        vietnameseText: form.vietnameseText,
        translation: form.translation.trim() || null,
        notes: form.notes.trim() || null,
        audioUrl: meta.value === 'audio' || meta.value === 'dialogue' ? form.audioUrl || null : null,
        imageUrl: meta.value === 'image' ? form.imageUrl || null : null,
        videoUrl: meta.value === 'video' ? form.videoUrl || null : null,
        dialogueData: meta.value === 'dialogue' ? form.dialogue : null,
      }
      if (mode === 'edit' && id) {
        await mutations.updateLessonChild.mutateAsync({ kind: 'contents', id, payload })
        toast.success('Đã cập nhật nội dung')
      } else {
        const nextOrderIndex =
          (lesson?.contents ?? []).reduce((max, c) => Math.max(max, c.orderIndex ?? -1), -1) + 1
        await mutations.createLessonChild.mutateAsync({
          kind: 'contents',
          lessonId,
          payload: { ...payload, orderIndex: nextOrderIndex },
        })
        toast.success('Đã tạo nội dung')
      }
      navigate(backPath)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-6 flex-1">
        <Breadcrumbs
          items={[
            { label: lesson?.title ?? 'Bài học', href: learningPath.lesson(lessonId) },
            { label: 'Nội dung bài', href: learningPath.lessonSection(lessonId, 'materials') },
            { label: meta.label, href: backPath },
            { label: mode === 'edit' ? 'Soạn' : 'Thêm mới' },
          ]}
        />

        <ComposerCard
          Icon={meta.Icon}
          iconClass={`${meta.bg} text-white`}
          typeLabel={meta.label}
        >
          {meta.value === 'text' && <TextBody form={form} set={set} mode={mode} />}
          {meta.value === 'dialogue' && <DialogueBody form={form} set={set} />}
          {meta.value === 'audio' && (
            <MediaBody form={form} set={set} kind="audio" urlKey="audioUrl" textLabel="Lời thoại (transcript)" />
          )}
          {meta.value === 'image' && (
            <MediaBody form={form} set={set} kind="image" urlKey="imageUrl" textLabel="Chú thích" />
          )}
          {meta.value === 'video' && (
            <MediaBody form={form} set={set} kind="video" urlKey="videoUrl" textLabel="Lời thoại (transcript)" />
          )}

          <div>
            <SectionLabel right="không hiện cho học viên">Ghi chú soạn bài</SectionLabel>
            <NotesField value={form.notes} onChange={(v) => set('notes', v)} />
          </div>
        </ComposerCard>
      </div>

      <StickySaveBar
        contextLabel={
          <>
            {mode === 'edit' ? 'Đang soạn' : 'Đang thêm'}{' '}
            <span className="font-semibold text-foreground">{meta.label}</span>
          </>
        }
        backTo={backPath}
        submitting={submitting}
        submitLabel={mode === 'edit' ? 'Cập nhật' : `Tạo ${meta.label.toLowerCase()}`}
        onSave={save}
      />
    </div>
  )
}

type SetFn = <K extends keyof FormState>(key: K, value: FormState[K]) => void

/* ── Văn bản: cảm giác soạn tài liệu ─────────────────────────────────────── */

function TextBody({ form, set, mode }: { form: FormState; set: SetFn; mode: 'create' | 'edit' }) {
  return (
    <>
      <div>
        <SectionLabel>Nội dung tiếng Việt</SectionLabel>
        <InlineEditable
          value={form.vietnameseText}
          onChange={(v) => set('vietnameseText', v)}
          placeholder="Bấm để viết đoạn văn học viên sẽ đọc..."
          className="text-xl leading-relaxed font-medium"
          ariaLabel="Nội dung tiếng Việt"
          autoFocus={mode === 'create'}
        />
      </div>
      <div>
        <SectionLabel>Bản dịch</SectionLabel>
        <InlineEditable
          value={form.translation}
          onChange={(v) => set('translation', v)}
          placeholder="Bấm để viết bản dịch..."
          className="text-base leading-relaxed text-muted-foreground"
          ariaLabel="Bản dịch"
        />
      </div>
    </>
  )
}

/* ── Âm thanh / Hình ảnh / Video: upload lớn + transcript ────────────────── */

function MediaBody({
  form,
  set,
  kind,
  urlKey,
  textLabel,
}: {
  form: FormState
  set: SetFn
  kind: 'audio' | 'image' | 'video'
  urlKey: 'audioUrl' | 'imageUrl' | 'videoUrl'
  textLabel: string
}) {
  return (
    <>
      <div>
        <SectionLabel>Tệp {kind === 'audio' ? 'âm thanh' : kind === 'image' ? 'hình ảnh' : 'video'}</SectionLabel>
        <MediaUpload kind={kind} value={form[urlKey] || null} onChange={(url) => set(urlKey, url ?? '')} />
      </div>
      <div>
        <SectionLabel>{textLabel}</SectionLabel>
        <InlineEditable
          value={form.vietnameseText}
          onChange={(v) => set('vietnameseText', v)}
          placeholder="Bấm để nhập nội dung tiếng Việt..."
          className="text-lg leading-relaxed font-medium"
          ariaLabel={textLabel}
        />
      </div>
      <div>
        <SectionLabel>Bản dịch</SectionLabel>
        <InlineEditable
          value={form.translation}
          onChange={(v) => set('translation', v)}
          placeholder="Bấm để viết bản dịch..."
          className="text-base leading-relaxed text-muted-foreground"
          ariaLabel="Bản dịch"
        />
      </div>
    </>
  )
}

/* ── Hội thoại: soạn như đoạn chat thật ──────────────────────────────────── */

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

/** Chọn người nói — tên hiện trên đầu bubble (như simulation mobile), bấm mở menu đổi. */
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

function DialogueBody({ form, set }: { form: FormState; set: SetFn }) {
  const { characters, lines } = form.dialogue
  const setDialogue = (next: Partial<DialogueData>) =>
    set('dialogue', { ...form.dialogue, ...next })

  const addCharacter = () => {
    const cid = `c${Date.now().toString(36)}${characters.length}`
    // backend chỉ cho tối đa 1 nhân vật bên phải — người thứ 2 mặc định phải, còn lại trái
    const hasRight = characters.some((c) => c.side === 'right')
    const side = characters.length > 0 && !hasRight ? 'right' : 'left'
    setDialogue({ characters: [...characters, { id: cid, name: '', side }] })
  }

  const updateCharacter = (cid: string, patch: Partial<DialogueCharacter>) =>
    setDialogue({
      characters: characters.map((c) => {
        if (c.id === cid) return { ...c, ...patch }
        // radio: một người sang phải thì người phải cũ tự về trái
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
        <SectionLabel right="audio đọc toàn bộ đoạn hội thoại (không bắt buộc)">Âm thanh hội thoại</SectionLabel>
        <MediaUpload kind="audio" value={form.audioUrl || null} onChange={(url) => set('audioUrl', url ?? '')} />
      </div>

      {/* Nhân vật */}
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

      {/* Lời thoại — hiển thị đúng như đoạn chat học viên sẽ thấy */}
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
