import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, LayoutGrid, List, BookOpen, ClipboardCheck, BookMarked, Mail } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { DataTable } from '../../components/admin/DataTable'
import { useAdminLearners } from '../../features/learners/api/use-learners-admin'
import type { Learner } from '../../features/learners/types'
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

export function LearnersPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useAdminLearners()
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const filteredData = (data ?? []).filter((learner) => {
    const matchesSearch =
      learner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === 'all' || learner.currentLevel === levelFilter
    return matchesSearch && matchesLevel
  })

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
            onClick={() => setView('grid')}
            title="Dạng thẻ"
            className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
              view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      ) : filteredData.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Chưa có học viên'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredData.map((learner) => {
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
                  <Stat
                    icon={BookOpen}
                    label="Bài học"
                    value={learner.summary?.completedLessons ?? 0}
                  />
                  <Stat
                    icon={ClipboardCheck}
                    label="Bài tập"
                    value={learner.summary?.exerciseResults ?? 0}
                  />
                  <Stat
                    icon={BookMarked}
                    label="Từ vựng"
                    value={learner.summary?.personalVocabularyCount ?? 0}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <DataTable
          data={filteredData}
          empty={searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Chưa có học viên'}
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
                return (
                  <span className={`text-sm font-bold ${meta.color}`}>{row.currentLevel}</span>
                )
              },
            },
            {
              key: 'role',
              header: 'Vai trò',
              cell: (row) => (
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {row.role}
                </span>
              ),
            },
            {
              key: 'lessons',
              header: 'Bài đã học',
              cell: (row) => (
                <span className="text-sm font-bold tabular-nums">
                  {row.summary?.completedLessons ?? 0}
                </span>
              ),
            },
            {
              key: 'exercises',
              header: 'Bài tập',
              cell: (row) => (
                <span className="text-sm font-bold tabular-nums">
                  {row.summary?.exerciseResults ?? 0}
                </span>
              ),
            },
            {
              key: 'vocab',
              header: 'Từ vựng',
              cell: (row) => (
                <span className="text-sm font-bold tabular-nums">
                  {row.summary?.personalVocabularyCount ?? 0}
                </span>
              ),
            },
          ]}
        />
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
