import { useState } from 'react'
import type { ReactNode, MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  FileText,
  BookMarked,
  Lightbulb,
  ClipboardList,
  Clock,
  MoreVertical,
  Trash2,
  GraduationCap,
  Volume2,
  Image as ImageIcon,
  Video as VideoIcon,
  MessagesSquare,
  Type,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent } from '../../components/ui/tabs'
import { AdminTabsList, AdminTabTrigger } from '../../components/admin/AdminTabs'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { LessonContentSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { ExerciseSet, GrammarRule, LessonContent, Vocabulary } from '../../features/learning/types'
import { learningPath } from './route-utils'

const lessonTypeColors: Record<string, string> = {
  vocabulary: 'bg-emerald-500',
  grammar: 'bg-blue-500',
  reading: 'bg-indigo-500',
  listening: 'bg-purple-500',
  speaking: 'bg-rose-500',
  writing: 'bg-amber-500',
  pronunciation: 'bg-teal-500',
  culture: 'bg-fuchsia-500',
}

const lessonTypeLabels: Record<string, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Đọc',
  listening: 'Nghe',
  speaking: 'Nói',
  writing: 'Viết',
  pronunciation: 'Phát âm',
  culture: 'Văn hóa',
}

const contentTypeIcons: Record<string, LucideIcon> = {
  text: Type,
  audio: Volume2,
  image: ImageIcon,
  video: VideoIcon,
  dialogue: MessagesSquare,
}

const contentTypeLabels: Record<string, string> = {
  text: 'Văn bản',
  audio: 'Âm thanh',
  image: 'Hình ảnh',
  video: 'Video',
  dialogue: 'Hội thoại',
}

const posLabels: Record<string, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
  pronoun: 'Đại từ',
  preposition: 'Giới từ',
  conjunction: 'Liên từ',
  phrase: 'Cụm từ',
  interjection: 'Thán từ',
}

type DeleteTarget = {
  kind: string
  id: string
  label: string
  resource: string
}

export function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { data: lesson, isLoading, error, refetch, isFetching } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLessonChild.mutateAsync({
        kind: pendingDelete.kind,
        id: pendingDelete.id,
      })
      toast.success(`Đã xóa ${pendingDelete.resource}`)
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

  const typeBg = lessonTypeColors[lesson?.lessonType ?? ''] ?? 'bg-muted'
  const typeLabel = lessonTypeLabels[lesson?.lessonType ?? ''] ?? lesson?.lessonType ?? '—'

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.module?.course?.title ?? 'Khóa học', href: lesson?.module?.courseId ? learningPath.course(lesson.module.courseId) : learningPath.courses() },
          { label: lesson?.module?.title ?? 'Chủ đề', href: lesson?.moduleId ? learningPath.module(lesson.moduleId) : undefined },
          { label: lesson?.title ?? 'Bài học' },
        ]}
      />

      {/* Lesson Header */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-white font-bold ${typeBg}`}>
                {typeLabel}
              </span>
              {lesson?.isAssessment && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  <GraduationCap className="h-3 w-3" />
                  Bài đánh giá
                </span>
              )}
              {lesson?.estimatedDuration && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium tabular-nums">{lesson.estimatedDuration} phút</span>
                </span>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground tabular-nums">#{lesson?.orderIndex ?? 0}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {lesson?.title ?? 'Bài học'}
            </h1>
            {lesson?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                {lesson.description}
              </p>
            )}
          </div>
          {lessonId && lesson && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to={learningPath.lessonEdit(lesson.moduleId, lessonId)}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LessonContentSkeleton />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : lesson && lessonId ? (
        <Tabs defaultValue="contents" className="space-y-4">
          <AdminTabsList>
            <AdminTabTrigger value="contents" icon={FileText} label="Nội dung" count={lesson.contents?.length ?? 0} />
            <AdminTabTrigger value="vocabularies" icon={BookMarked} label="Từ vựng" count={lesson.vocabularies?.length ?? 0} />
            <AdminTabTrigger value="grammar" icon={Lightbulb} label="Ngữ pháp" count={lesson.grammarRules?.length ?? 0} />
            <AdminTabTrigger value="sets" icon={ClipboardList} label="Bộ bài tập" count={lesson.exerciseSets?.length ?? 0} />
          </AdminTabsList>

          {/* CONTENTS — media-aware rows */}
          <TabsContent value="contents" className="mt-4 space-y-4">
            <SectionHeader
              title="Nội dung bài học"
              description="Văn bản, audio, hình ảnh và đoạn hội thoại."
              actionHref={learningPath.contentNew(lessonId)}
              actionLabel="Thêm nội dung"
            />
            {(lesson.contents?.length ?? 0) === 0 ? (
              <EmptyState
                icon={FileText}
                title="Chưa có nội dung"
                description="Thêm nội dung đầu tiên cho bài học này"
                actionHref={learningPath.contentNew(lessonId)}
                actionLabel="Tạo nội dung đầu tiên"
              />
            ) : (
              <div className="space-y-2">
                {(lesson.contents ?? []).map((row) => (
                  <ContentRow
                    key={row.id}
                    row={row}
                    onEdit={() => navigate(learningPath.contentEdit(lessonId, row.id))}
                    onDelete={() =>
                      setPendingDelete({
                        kind: 'contents',
                        id: row.id,
                        label: row.vietnameseText,
                        resource: 'nội dung',
                      })
                    }
                    stop={stop}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* VOCABULARIES — flashcard grid */}
          <TabsContent value="vocabularies" className="mt-4 space-y-4">
            <SectionHeader
              title="Từ vựng tiếng Việt"
              description="Bộ từ vựng học viên cần ghi nhớ."
              actionHref={learningPath.vocabularyNew(lessonId)}
              actionLabel="Thêm từ vựng"
            />
            {(lesson.vocabularies?.length ?? 0) === 0 ? (
              <EmptyState
                icon={BookMarked}
                title="Chưa có từ vựng"
                description="Thêm từ vựng đầu tiên cho bài học này"
                actionHref={learningPath.vocabularyNew(lessonId)}
                actionLabel="Tạo từ vựng đầu tiên"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(lesson.vocabularies ?? []).map((row) => (
                  <VocabFlashcard
                    key={row.id}
                    row={row}
                    onEdit={() => navigate(learningPath.vocabularyEdit(lessonId, row.id))}
                    onDelete={() =>
                      setPendingDelete({
                        kind: 'vocabularies',
                        id: row.id,
                        label: row.word,
                        resource: 'từ vựng',
                      })
                    }
                    stop={stop}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* GRAMMAR — expandable cards */}
          <TabsContent value="grammar" className="mt-4 space-y-4">
            <SectionHeader
              title="Quy tắc ngữ pháp"
              description="Các điểm ngữ pháp trọng tâm của bài."
              actionHref={learningPath.grammarNew(lessonId)}
              actionLabel="Thêm quy tắc"
            />
            {(lesson.grammarRules?.length ?? 0) === 0 ? (
              <EmptyState
                icon={Lightbulb}
                title="Chưa có quy tắc ngữ pháp"
                description="Thêm điểm ngữ pháp đầu tiên cho bài học này"
                actionHref={learningPath.grammarNew(lessonId)}
                actionLabel="Tạo điểm ngữ pháp đầu tiên"
              />
            ) : (
              <div className="space-y-3">
                {(lesson.grammarRules ?? []).map((row) => (
                  <GrammarCard
                    key={row.id}
                    row={row}
                    onEdit={() => navigate(learningPath.grammarEdit(lessonId, row.id))}
                    onDelete={() =>
                      setPendingDelete({
                        kind: 'grammar',
                        id: row.id,
                        label: row.title,
                        resource: 'điểm ngữ pháp',
                      })
                    }
                    stop={stop}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* SETS — clickable stat tiles */}
          <TabsContent value="sets" className="mt-4 space-y-4">
            <SectionHeader
              title="Bộ bài tập"
              description="Mỗi bộ chứa nhiều bài tập cùng chủ đề."
              actionHref={learningPath.exerciseSetNew(lessonId)}
              actionLabel="Thêm bộ bài tập"
            />
            {(lesson.exerciseSets?.length ?? 0) === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Chưa có bộ bài tập"
                description="Tạo bộ bài tập đầu tiên cho bài học này"
                actionHref={learningPath.exerciseSetNew(lessonId)}
                actionLabel="Tạo bộ bài tập đầu tiên"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(lesson.exerciseSets ?? []).map((row) => (
                  <ExerciseSetTile
                    key={row.id}
                    row={row}
                    onOpen={() => navigate(learningPath.exerciseSet(row.id))}
                    onEdit={() => navigate(learningPath.exerciseSetEdit(lessonId, row.id))}
                    onDelete={() =>
                      setPendingDelete({
                        kind: 'exercise-sets',
                        id: row.id,
                        label: row.title,
                        resource: 'bộ bài tập',
                      })
                    }
                    stop={stop}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : null}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa {pendingDelete?.resource}?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {pendingDelete?.resource && (
                <>
                  {pendingDelete.resource.charAt(0).toUpperCase() + pendingDelete.resource.slice(1)}{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{pendingDelete?.label}&quot;
                  </span>{' '}
                  sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Button asChild>
        <Link to={actionHref}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
      <Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button asChild>
        <Link to={actionHref}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  )
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ===== CONTENT ROW =====
function ContentRow({
  row,
  onEdit,
  onDelete,
  stop,
}: {
  row: LessonContent
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const Icon = contentTypeIcons[row.contentType] ?? Type
  const typeLabel = contentTypeLabels[row.contentType] ?? row.contentType
  const hasMedia = row.audioUrl || row.imageUrl || row.videoUrl

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEdit()
      }}
      className="group rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {typeLabel}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground tabular-nums">#{row.orderIndex}</span>
            {hasMedia && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  Có media
                </span>
              </>
            )}
          </div>
          <p className="text-base font-bold text-foreground line-clamp-2 leading-snug">
            {row.vietnameseText}
          </p>
          {row.translation && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1 italic">{row.translation}</p>
          )}
        </div>
        <div onClick={stop} onKeyDown={stop} className="shrink-0">
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}

// ===== VOCABULARY FLASHCARD =====
function VocabFlashcard({
  row,
  onEdit,
  onDelete,
  stop,
}: {
  row: Vocabulary
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const posLabel = posLabels[row.partOfSpeech] ?? row.partOfSpeech
  const difficulty = Math.min(5, Math.max(1, row.difficultyLevel || 1))
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEdit()
      }}
      className="group rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {posLabel}
          </span>
        </div>
        <div onClick={stop} onKeyDown={stop}>
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <p className="text-xl font-bold text-foreground leading-tight mt-2">{row.word}</p>
      {row.phonetic && (
        <p className="text-xs font-mono text-muted-foreground mt-0.5">/{row.phonetic.replace(/^\/|\/$/g, '')}/</p>
      )}
      <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{row.translation}</p>
      {row.exampleSentence && (
        <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 italic border-t border-border pt-2">
          &quot;{row.exampleSentence}&quot;
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground">Độ khó:</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              className={`h-1.5 w-3 rounded-full ${
                level <= difficulty ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        {row.audioUrl && <Volume2 className="h-3 w-3 text-primary ml-auto" />}
      </div>
    </div>
  )
}

// ===== GRAMMAR CARD =====
function GrammarCard({
  row,
  onEdit,
  onDelete,
  stop,
}: {
  row: GrammarRule
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const exampleCount = Array.isArray(row.examples) ? row.examples.length : 0
  const difficulty = Math.min(5, Math.max(1, row.difficultyLevel || 1))

  return (
    <div className="rounded-lg border-2 border-border bg-card overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setExpanded((v) => !v)
        }}
        className="flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/30 focus:outline-none focus:bg-muted/30"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground">{row.title}</h3>
            {row.structure && (
              <code className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                {row.structure}
              </code>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{exampleCount} ví dụ</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <span>Độ khó:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className={`h-1.5 w-2 rounded-full ${
                      level <= difficulty ? 'bg-blue-500' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div onClick={stop} onKeyDown={stop} className="shrink-0">
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      {expanded && (
        <div className="border-t-2 border-border bg-muted/20 p-4 space-y-3">
          {row.explanation && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Giải thích
              </p>
              <p className="text-sm text-foreground leading-relaxed">{row.explanation}</p>
            </div>
          )}
          {exampleCount > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Ví dụ
              </p>
              <div className="space-y-2">
                {row.examples.slice(0, 5).map((ex, i) => (
                  <div key={i} className="rounded-md border border-border bg-card p-2.5">
                    <p className="text-sm font-semibold text-foreground">{ex.vi}</p>
                    {ex.en && <p className="text-xs text-muted-foreground italic mt-0.5">{ex.en}</p>}
                  </div>
                ))}
                {exampleCount > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{exampleCount - 5} ví dụ khác
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ===== EXERCISE SET TILE =====
function ExerciseSetTile({
  row,
  onOpen,
  onEdit,
  onDelete,
  stop,
}: {
  row: ExerciseSet
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  stop: (e: MouseEvent | KeyboardEvent) => void
}) {
  const exerciseCount = row.exercises?.length ?? 0
  const typeCounts = (row.exercises ?? []).reduce<Record<string, number>>((acc, ex) => {
    const key = ex.exerciseType?.toLowerCase() ?? ''
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
      className="group rounded-lg border-2 border-border bg-card overflow-hidden cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground tabular-nums">#{row.orderIndex}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-bold tabular-nums">{exerciseCount}</span>
          <span className="text-muted-foreground">bài tập</span>
        </div>
        <div onClick={stop} onKeyDown={stop}>
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground line-clamp-1">{row.title}</h3>
        {row.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{row.description}</p>
        )}
        {Object.keys(typeCounts).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
            {Object.entries(typeCounts).map(([type, count]) => {
              const labels: Record<string, string> = {
                multiple_choice: 'Trắc nghiệm',
                fill_blank: 'Điền',
                matching: 'Ghép',
                ordering: 'Sắp xếp',
                translation: 'Dịch',
                listening: 'Nghe',
                speaking: 'Nói',
              }
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {labels[type] ?? type}
                  <span className="font-bold tabular-nums">{count}</span>
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
