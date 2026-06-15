import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Search, LayoutGrid, List, BookOpen, ClipboardCheck, BookMarked, Mail } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { DataTable } from '../../components/admin/DataTable'
import { CardGridSkeleton } from '../../components/admin/PageSkeletons'
import { ErrorState, errorMessage } from '../../components/admin/ErrorState'
import { Pagination } from '../../components/admin/Pagination'
import { useAdminLearners } from '../../features/learners/api/use-learners-admin'
import type { Learner, LearnerLevel, LearnerStatus } from '../../features/learners/types'
import { learnerPath } from './route-utils'

const levelMeta: Record<string, { color: string; bg: string; label: string }> = {
  A1: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500', label: 'Mới bắt đầu' },
  A2: { color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-500', label: 'Sơ cấp' },
  B1: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-500', label: 'Trung cấp' },
  B2: { color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-500', label: 'Trên trung cấp' },
  C1: { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-500', label: 'Cao cấp' },
  C2: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-500', label: 'Thông thạo' },
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-fuchsia-500',
]

const LEVELS: LearnerLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const STATUS_OPTIONS: { value: LearnerStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang học' },
  { value: 'inactive', label: 'Đã onboard, chưa học' },
  { value: 'never_onboarded', label: 'Chưa onboard' },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hashColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function LearnersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '24', 10) || 24))
  const search = searchParams.get('search') ?? ''
  const levelParam = (searchParams.get('level') ?? '') as LearnerLevel | ''
  const statusParam = (searchParams.get('status') ?? 'all') as LearnerStatus
  const view = (searchParams.get('view') ?? 'grid') as 'grid' | 'list'

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounced(searchInput, 350)

  useEffect(() => {
    if (debouncedSearch === search) return
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    next.set('page', '1')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, search, searchParams, setSearchParams])

  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      level: levelParam || undefined,
      status: statusParam,
    }),
    [page, pageSize, debouncedSearch, levelParam, statusParam],
  )

  const { data, isLoading, error, refetch, isFetching } = useAdminLearners(params)

  const updateParams = (mutate: (sp: URLSearchParams) => void, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    if (resetPage) next.set('page', '1')
    setSearchParams(next, { replace: true })
  }

  const items: Learner[] = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Học viên</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Quản lý hồ sơ và theo dõi tiến độ học tập.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border-2 border-border bg-card p-1">
          <button
            type="button"
            onClick={() => updateParams((sp) => sp.set('view', 'grid'), false)}
            title="Dạng thẻ"
            className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
              view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => updateParams((sp) => sp.set('view', 'list'), false)}
            title="Dạng bảng"
            className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
              view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border-2 border-border bg-card p-1">
          <FilterPill
            active={!levelParam}
            onClick={() => updateParams((sp) => sp.delete('level'))}
          >
            Mọi cấp
          </FilterPill>
          {LEVELS.map((level) => (
            <FilterPill
              key={level}
              active={levelParam === level}
              onClick={() =>
                updateParams((sp) => {
                  if (levelParam === level) sp.delete('level')
                  else sp.set('level', level)
                })
              }
            >
              {level}
            </FilterPill>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border-2 border-border bg-card p-1">
          {STATUS_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.value}
              active={statusParam === opt.value}
              onClick={() =>
                updateParams((sp) => {
                  if (opt.value === 'all') sp.delete('status')
                  else sp.set('status', opt.value)
                })
              }
            >
              {opt.label}
            </FilterPill>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : (
        <>
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch ? `Không tìm thấy "${debouncedSearch}"` : 'Chưa có học viên'}
                </p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((learner) => {
                  const meta = levelMeta[learner.currentLevel] ?? {
                    color: 'text-muted-foreground',
                    bg: 'bg-muted',
                    label: '—',
                  }
                  return (
                    <div
                      key={learner.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(learnerPath.learner(learner.id))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(learnerPath.learner(learner.id))
                      }}
                      className="group rounded-lg border-2 border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary focus:outline-none focus:border-primary"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-base font-bold ${hashColor(learner.id)}`}>
                          {getInitials(learner.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{learner.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3 shrink-0" />
                            {learner.email}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${meta.bg} text-white shrink-0`}>
                          {learner.currentLevel}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t-2 border-border">
                        <Stat icon={BookOpen} label="Bài học" value={learner.summary?.completedLessons ?? 0} />
                        <Stat icon={ClipboardCheck} label="Bài tập" value={learner.summary?.questionResults ?? 0} />
                        <Stat icon={BookMarked} label="Từ vựng" value={learner.summary?.personalVocabularyCount ?? 0} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <DataTable
                data={items}
                empty={debouncedSearch ? `Không tìm thấy "${debouncedSearch}"` : 'Chưa có học viên'}
                onRowClick={(row) => navigate(learnerPath.learner(row.id))}
                columns={[
                  {
                    key: 'name',
                    header: 'Học viên',
                    cell: (row: Learner) => (
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${hashColor(row.id)}`}>
                          {getInitials(row.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{row.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'level',
                    header: 'Cấp độ',
                    cell: (row) => {
                      const meta = levelMeta[row.currentLevel] ?? { color: 'text-muted-foreground', bg: '', label: '—' }
                      return <span className={`text-sm font-bold ${meta.color}`}>{row.currentLevel}</span>
                    },
                  },
                  {
                    key: 'lessons',
                    header: 'Bài đã học',
                    cell: (row) => (
                      <span className="text-sm font-bold tabular-nums">{row.summary?.completedLessons ?? 0}</span>
                    ),
                  },
                  {
                    key: 'exercises',
                    header: 'Bài tập',
                    cell: (row) => (
                      <span className="text-sm font-bold tabular-nums">{row.summary?.questionResults ?? 0}</span>
                    ),
                  },
                  {
                    key: 'vocab',
                    header: 'Từ vựng',
                    cell: (row) => (
                      <span className="text-sm font-bold tabular-nums">{row.summary?.personalVocabularyCount ?? 0}</span>
                    ),
                  },
                  {
                    key: 'sims',
                    header: 'Mô phỏng',
                    cell: (row) => (
                      <span className="text-sm font-bold tabular-nums">{row.summary?.simulationCount ?? 0}</span>
                    ),
                  },
                ]}
              />
            )}
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(p) =>
              updateParams((sp) => sp.set('page', String(p)), false)
            }
            onPageSizeChange={(s) =>
              updateParams((sp) => {
                sp.set('pageSize', String(s))
                sp.set('page', '1')
              }, false)
            }
            pageSizeOptions={[24, 48, 96]}
          />
        </>
      )}
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

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  )
}
