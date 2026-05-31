import { useState } from 'react'
import type { ReactNode } from 'react'
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
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { DataTable } from '../../components/admin/DataTable'
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
  vocabulary: 'text-emerald-600 dark:text-emerald-400',
  grammar: 'text-blue-600 dark:text-blue-400',
  reading: 'text-indigo-600 dark:text-indigo-400',
  listening: 'text-purple-600 dark:text-purple-400',
  speaking: 'text-rose-600 dark:text-rose-400',
  writing: 'text-amber-600 dark:text-amber-400',
  pronunciation: 'text-teal-600 dark:text-teal-400',
  culture: 'text-fuchsia-600 dark:text-fuchsia-400',
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

type DeleteTarget = {
  kind: string
  id: string
  label: string
  resource: string
}

export function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { data: lesson, isLoading, error } = useAdminLesson(lessonId)
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="font-bold text-muted-foreground">BÀI HỌC</span>
          <span className="text-muted-foreground">·</span>
          <span className={`font-bold ${lessonTypeColors[lesson?.lessonType ?? ''] ?? 'text-muted-foreground'}`}>
            {lessonTypeLabels[lesson?.lessonType ?? ''] ?? lesson?.lessonType ?? '—'}
          </span>
          {lesson?.estimatedDuration && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-medium tabular-nums">{lesson.estimatedDuration} phút</span>
              </span>
            </>
          )}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">#{lesson?.orderIndex ?? 0}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
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
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive font-semibold">
            {error instanceof Error ? error.message : 'Không tải được dữ liệu'}
          </p>
        </div>
      ) : lesson && lessonId ? (
        <Tabs defaultValue="contents" className="space-y-4 pt-2">
          <div className="border-b-2 border-border">
            <TabsList variant="line" className="flex h-auto p-0 gap-0 -mb-0.5 overflow-x-auto">
              <TabTrigger value="contents" icon={FileText} label="Nội dung" count={lesson.contents?.length ?? 0} />
              <TabTrigger value="vocabularies" icon={BookMarked} label="Từ vựng" count={lesson.vocabularies?.length ?? 0} />
              <TabTrigger value="grammar" icon={Lightbulb} label="Ngữ pháp" count={lesson.grammarRules?.length ?? 0} />
              <TabTrigger value="sets" icon={ClipboardList} label="Bộ bài tập" count={lesson.exerciseSets?.length ?? 0} />
            </TabsList>
          </div>

          <TabsContent value="contents" className="mt-4 space-y-4">
            <SectionHeader
              title="Nội dung"
              description="Văn bản, audio, hình ảnh, đoạn hội thoại."
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
              <DataTable
                data={lesson.contents ?? []}
                empty="Chưa có nội dung"
                columns={[
                  {
                    key: 'order',
                    header: '#',
                    cell: (row: LessonContent) => (
                      <span className="font-bold text-muted-foreground tabular-nums">
                        {row.orderIndex}
                      </span>
                    ),
                  },
                  {
                    key: 'text',
                    header: 'Tiếng Việt',
                    cell: (row) => (
                      <span className="font-medium text-foreground line-clamp-1">
                        {row.vietnameseText}
                      </span>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Kiểu',
                    cell: (row) => (
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {row.contentType}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    className: 'text-right w-12',
                    cell: (row) => (
                      <RowMenu
                        editHref={learningPath.contentEdit(lessonId, row.id)}
                        onDelete={() =>
                          setPendingDelete({
                            kind: 'contents',
                            id: row.id,
                            label: row.vietnameseText,
                            resource: 'nội dung',
                          })
                        }
                      />
                    ),
                  },
                ]}
              />
            )}
          </TabsContent>

          <TabsContent value="vocabularies" className="mt-4 space-y-4">
            <SectionHeader
              title="Từ vựng"
              description="Các từ vựng tiếng Việt cho bài học này."
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
              <DataTable
                data={lesson.vocabularies ?? []}
                empty="Chưa có từ vựng"
                columns={[
                  {
                    key: 'word',
                    header: 'Từ',
                    cell: (row: Vocabulary) => (
                      <span className="font-bold text-foreground">{row.word}</span>
                    ),
                  },
                  {
                    key: 'translation',
                    header: 'Dịch',
                    cell: (row) => (
                      <span className="text-muted-foreground">{row.translation}</span>
                    ),
                  },
                  {
                    key: 'pos',
                    header: 'Loại từ',
                    cell: (row) => (
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {row.partOfSpeech}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    className: 'text-right w-12',
                    cell: (row) => (
                      <RowMenu
                        editHref={learningPath.vocabularyEdit(lessonId, row.id)}
                        onDelete={() =>
                          setPendingDelete({
                            kind: 'vocabularies',
                            id: row.id,
                            label: row.word,
                            resource: 'từ vựng',
                          })
                        }
                      />
                    ),
                  },
                ]}
              />
            )}
          </TabsContent>

          <TabsContent value="grammar" className="mt-4 space-y-4">
            <SectionHeader
              title="Ngữ pháp"
              description="Các điểm ngữ pháp trọng tâm của bài."
              actionHref={learningPath.grammarNew(lessonId)}
              actionLabel="Thêm ngữ pháp"
            />
            {(lesson.grammarRules?.length ?? 0) === 0 ? (
              <EmptyState
                icon={Lightbulb}
                title="Chưa có ngữ pháp"
                description="Thêm điểm ngữ pháp đầu tiên cho bài học này"
                actionHref={learningPath.grammarNew(lessonId)}
                actionLabel="Tạo điểm ngữ pháp đầu tiên"
              />
            ) : (
              <DataTable
                data={lesson.grammarRules ?? []}
                empty="Chưa có ngữ pháp"
                columns={[
                  {
                    key: 'title',
                    header: 'Tên',
                    cell: (row: GrammarRule) => (
                      <span className="font-bold text-foreground line-clamp-1">{row.title}</span>
                    ),
                  },
                  {
                    key: 'structure',
                    header: 'Cấu trúc',
                    cell: (row) => (
                      <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {row.structure ?? '—'}
                      </code>
                    ),
                  },
                  {
                    key: 'difficulty',
                    header: 'Độ khó',
                    cell: (row) => (
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {row.difficultyLevel}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    className: 'text-right w-12',
                    cell: (row) => (
                      <RowMenu
                        editHref={learningPath.grammarEdit(lessonId, row.id)}
                        onDelete={() =>
                          setPendingDelete({
                            kind: 'grammar',
                            id: row.id,
                            label: row.title,
                            resource: 'điểm ngữ pháp',
                          })
                        }
                      />
                    ),
                  },
                ]}
              />
            )}
          </TabsContent>

          <TabsContent value="sets" className="mt-4 space-y-4">
            <SectionHeader
              title="Bộ bài tập"
              description="Tổ chức bài tập thành các bộ để học viên luyện tập."
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
              <DataTable
                data={lesson.exerciseSets ?? []}
                empty="Chưa có bộ bài tập"
                onRowClick={(row) => navigate(learningPath.exerciseSet(row.id))}
                columns={[
                  {
                    key: 'order',
                    header: '#',
                    cell: (row: ExerciseSet) => (
                      <span className="font-bold text-muted-foreground tabular-nums">
                        {row.orderIndex}
                      </span>
                    ),
                  },
                  {
                    key: 'title',
                    header: 'Tên',
                    cell: (row) => (
                      <span className="font-bold text-foreground line-clamp-1">{row.title}</span>
                    ),
                  },
                  {
                    key: 'count',
                    header: 'Bài tập',
                    cell: (row) => (
                      <span className="text-sm font-bold tabular-nums">
                        {row.exercises?.length ?? 0}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    className: 'text-right w-12',
                    cell: (row) => (
                      <RowMenu
                        editHref={learningPath.exerciseSetEdit(lessonId, row.id)}
                        onDelete={() =>
                          setPendingDelete({
                            kind: 'exercise-sets',
                            id: row.id,
                            label: row.title,
                            resource: 'bộ bài tập',
                          })
                        }
                      />
                    ),
                  },
                ]}
              />
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

function TabTrigger({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: string
  icon: typeof FileText
  label: string
  count: number
}) {
  return (
    <TabsTrigger
      value={value}
      className="gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-active:border-primary data-active:text-foreground data-active:font-bold transition-colors hover:text-foreground after:hidden"
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
      <span className="text-xs font-bold tabular-nums text-muted-foreground">{count}</span>
    </TabsTrigger>
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
    <div className="flex items-end justify-between gap-4">
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
  icon: typeof FileText
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

function RowMenu({ editHref, onDelete }: { editHref: string; onDelete: () => void }): ReactNode {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Tùy chọn</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link to={editHref}>
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
