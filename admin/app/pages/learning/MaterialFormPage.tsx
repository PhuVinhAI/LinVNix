import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type {
  AudioContentPayload,
  DialogueData,
  ImageContentPayload,
  LessonContent,
  TextContentPayload,
  VideoContentPayload,
} from '../../features/learning/types'
import { materialTypeMeta } from './authoring-meta'
import {
  ComposerCard,
  NotesField,
  SectionLabel,
  StickySaveBar,
} from './authoring-ui'
import { learningPath } from './route-utils'
import { TextMaterialForm } from './material-forms/TextMaterialForm'
import { ImageMaterialForm } from './material-forms/ImageMaterialForm'
import { AudioMaterialForm } from './material-forms/AudioMaterialForm'
import { VideoMaterialForm } from './material-forms/VideoMaterialForm'
import { DialogueMaterialForm } from './material-forms/DialogueMaterialForm'

/* Mỗi loại có schema state riêng — không gộp chung như trước, để form ai có việc nấy. */

type MaterialState =
  | { type: 'text'; payload: TextContentPayload }
  | { type: 'image'; payload: ImageContentPayload }
  | { type: 'audio'; payload: AudioContentPayload }
  | { type: 'video'; payload: VideoContentPayload }
  | { type: 'dialogue'; dialogue: DialogueData; audioUrl: string }

function emptyStateFor(value: string): MaterialState | null {
  switch (value) {
    case 'text':
      return { type: 'text', payload: { body: '', translation: null } }
    case 'image':
      return {
        type: 'image',
        payload: { url: '', caption: '', captionEn: null, aspectRatio: 'auto' },
      }
    case 'audio':
      return {
        type: 'audio',
        payload: { url: '', title: '', transcript: '', translation: null },
      }
    case 'video':
      return {
        type: 'video',
        payload: {
          url: '',
          title: '',
          aspectRatio: '16:9',
          provider: 'self_hosted',
          transcript: null,
          translation: null,
        },
      }
    case 'dialogue':
      return {
        type: 'dialogue',
        dialogue: { characters: [], lines: [] },
        audioUrl: '',
      }
    default:
      return null
  }
}

function fromContent(c: LessonContent): MaterialState | null {
  switch (c.contentType) {
    case 'text':
      return {
        type: 'text',
        payload:
          (c.payload as TextContentPayload) ?? {
            body: c.vietnameseText ?? '',
            translation: c.translation ?? null,
          },
      }
    case 'image':
      return {
        type: 'image',
        payload:
          (c.payload as ImageContentPayload) ?? {
            url: '',
            caption: c.vietnameseText ?? '',
            captionEn: c.translation ?? null,
            aspectRatio: 'auto',
          },
      }
    case 'audio':
      return {
        type: 'audio',
        payload:
          (c.payload as AudioContentPayload) ?? {
            url: '',
            title: '',
            transcript: c.vietnameseText ?? '',
            translation: c.translation ?? null,
          },
      }
    case 'video':
      return {
        type: 'video',
        payload:
          (c.payload as VideoContentPayload) ?? {
            url: '',
            title: '',
            aspectRatio: '16:9',
            provider: 'self_hosted',
            transcript: c.vietnameseText ?? null,
            translation: c.translation ?? null,
          },
      }
    case 'dialogue':
      return {
        type: 'dialogue',
        dialogue: c.dialogueData ?? { characters: [], lines: [] },
        audioUrl: '',
      }
    default:
      return null
  }
}

/** Soạn một mục Nội dung bài — form riêng cho từng loại. */
export function MaterialFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { lessonId, materialType, id } = useParams()
  const navigate = useNavigate()
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [submitting, setSubmitting] = useState(false)

  const meta = materialTypeMeta(materialType)
  const existing = mode === 'edit' ? lesson?.contents?.find((c) => c.id === id) ?? null : null
  const initial = meta ? (existing ? fromContent(existing) : emptyStateFor(meta.value)) : null
  const [state, setState] = useState<MaterialState | null>(initial)
  const [notes, setNotes] = useState<string>(existing?.notes ?? '')

  useEffect(() => {
    if (existing) {
      const next = fromContent(existing)
      if (next) setState(next)
      setNotes(existing.notes ?? '')
    }
  }, [existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />
  if (!meta || !state) return <Navigate to={learningPath.lessonSection(lessonId, 'materials')} replace />

  const backPath = learningPath.materialType(lessonId, meta.value)

  const validate = (): string | null => {
    switch (state.type) {
      case 'text':
        return state.payload.body.trim() ? null : 'Chưa nhập nội dung tiếng Việt'
      case 'image':
        if (!state.payload.url) return 'Chưa tải lên hình ảnh'
        if (!state.payload.caption.trim()) return 'Chưa nhập chú thích'
        return null
      case 'audio':
        if (!state.payload.url) return 'Chưa tải lên file âm thanh'
        if (!state.payload.title.trim()) return 'Chưa nhập tiêu đề'
        if (!state.payload.transcript.trim()) return 'Chưa nhập lời thoại (transcript)'
        return null
      case 'video':
        if (!state.payload.url.trim())
          return state.payload.provider === 'youtube'
            ? 'Chưa dán link YouTube'
            : 'Chưa tải lên file video'
        if (!state.payload.title.trim()) return 'Chưa nhập tiêu đề'
        return null
      case 'dialogue': {
        const { dialogue } = state
        if (dialogue.characters.length < 1) return 'Hội thoại cần ít nhất một nhân vật'
        if (dialogue.characters.some((c) => !c.name.trim())) return 'Có nhân vật chưa đặt tên'
        if (dialogue.characters.filter((c) => c.side === 'right').length > 1)
          return 'Chỉ một nhân vật được ở bên phải'
        if (dialogue.lines.length < 1) return 'Hội thoại cần ít nhất một lời thoại'
        if (dialogue.lines.some((l) => !l.vi.trim())) return 'Có lời thoại chưa nhập nội dung'
        return null
      }
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
        contentType: state.type,
        notes: notes.trim() || null,
      }
      if (state.type === 'dialogue') {
        payload.dialogueData = state.dialogue
        // Audio đi kèm hội thoại hiện lưu trong dialogueData (mobile chưa cần).
        payload.payload = null
      } else {
        payload.payload = state.payload
        payload.dialogueData = null
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
          {state.type === 'text' && (
            <TextMaterialForm
              payload={state.payload}
              onChange={(payload) => setState({ ...state, payload })}
              autoFocus={mode === 'create'}
            />
          )}
          {state.type === 'image' && (
            <ImageMaterialForm
              payload={state.payload}
              onChange={(payload) => setState({ ...state, payload })}
            />
          )}
          {state.type === 'audio' && (
            <AudioMaterialForm
              payload={state.payload}
              onChange={(payload) => setState({ ...state, payload })}
            />
          )}
          {state.type === 'video' && (
            <VideoMaterialForm
              payload={state.payload}
              onChange={(payload) => setState({ ...state, payload })}
            />
          )}
          {state.type === 'dialogue' && (
            <DialogueMaterialForm
              dialogue={state.dialogue}
              audioUrl={state.audioUrl}
              onDialogueChange={(dialogue) => setState({ ...state, dialogue })}
              onAudioChange={(audioUrl) => setState({ ...state, audioUrl })}
            />
          )}

          <div>
            <SectionLabel right="không hiện cho học viên">Ghi chú soạn bài</SectionLabel>
            <NotesField value={notes} onChange={setNotes} />
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
