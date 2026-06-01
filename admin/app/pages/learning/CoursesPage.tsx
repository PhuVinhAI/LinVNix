import { useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Plus, BookOpen, Layers, Pencil, Trash2, MoreVertical, Clock, Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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
import { useAdminCourses, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import { CourseGridSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import type { Course } from '../../features/learning/types'
import { learningPath } from './route-utils'
import { levelBg, levelLabel } from '../../features/learning/level-meta'
import { resolveMediaUrl } from '../../../lib/shared/media-url'

export function CoursesPage() {
  const navigate = useNavigate()
  const { data = [], isLoading, error, refetch, isFetching } = useAdminCourses()
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const filtered = data.filter((course) => {
    if (search && !course.title.toLowerCase().includes(search.toLowerCase())) return false
    if (levelFilter !== 'all' && course.level !== levelFilter) return false
    return true
  })

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteCourse.mutateAsync(pendingDelete.id)
      toast.success('Đã xóa khóa học')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

  const publishedCount = data.filter((c) => c.isPublished).length

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Học liệu</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Quản lý khóa học, chủ đề và bài học.
          </p>
        </div>
        <Button asChild>
          <Link to={learningPath.courseNew()}>
            <Plus className="h-4 w-4" />
            Thêm khóa học
          </Link>
        </Button>
      </div>

      {/* Stats strip */}
      {!isLoading && !error && data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Tổng khóa học" value={data.length} />
          <StatCard label="Đã xuất bản" value={publishedCount} tone="success" />
          <StatCard label="Bản nháp" value={data.length - publishedCount} tone="muted" />
        </div>
      )}

      {/* Filters */}
      {!isLoading && !error && data.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm khóa học..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border-2 border-border bg-card p-1">
            <FilterPill active={levelFilter === 'all'} onClick={() => setLevelFilter('all')}>
              Tất cả
            </FilterPill>
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((level) => (
              <FilterPill key={level} active={levelFilter === level} onClick={() => setLevelFilter(level)}>
                {level}
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <CourseGridSkeleton count={6} />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : data.length === 0 ? (
        <EmptyCourses />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-lg font-bold mb-1">Không tìm thấy khóa học</h3>
          <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((course) => {
              const bg = levelBg(course.level)
              const label = levelLabel(course.level, course.vietnameseLevelName)
              return (
                <div
                  key={course.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(learningPath.course(course.id))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(learningPath.course(course.id))
                  }}
                  className="group relative rounded-lg border-2 border-border bg-card overflow-hidden cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
                >
                  {/* Thumbnail area */}
                  <div className={`relative h-32 ${bg} overflow-hidden`}>
                    {course.thumbnailUrl ? (
                      <img
                        src={resolveMediaUrl(course.thumbnailUrl) ?? ''}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/20" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-black/40 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white">
                        {course.level} · {label}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div onClick={stop} onKeyDown={stop}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-md bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link to={learningPath.courseEdit(course.id)}>
                                <Pencil className="h-4 w-4" />
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setPendingDelete(course)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa khóa học
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      {course.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          Đang phát hành
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/40 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white">
                          Bản nháp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-foreground line-clamp-1 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" />
                        <span className="font-medium">{course.modules?.length ?? 0} chủ đề</span>
                      </span>
                      {course.estimatedHours && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium tabular-nums">{course.estimatedHours} giờ</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                  <AlertDialogTitle>Xóa khóa học?</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  Khóa học <span className="font-semibold text-foreground">&quot;{pendingDelete?.title}&quot;</span> và toàn bộ chủ đề, bài học liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:opacity-90"
                  onClick={confirmDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa khóa học
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'success' | 'muted' }) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'muted'
        ? 'text-muted-foreground'
        : 'text-foreground'
  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyCourses() {
  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
      <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
      <h3 className="text-lg font-bold mb-1">Chưa có khóa học nào</h3>
      <p className="text-sm text-muted-foreground mb-4">Tạo khóa học đầu tiên để bắt đầu</p>
      <Button asChild>
        <Link to={learningPath.courseNew()}>
          <Plus className="h-4 w-4" />
          Tạo khóa học đầu tiên
        </Link>
      </Button>
    </div>
  )
}
