import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { DataTable } from '../../components/admin/DataTable'
import { useAdminLearners } from '../../features/learners/api/use-learners-admin'
import type { Learner } from '../../features/learners/types'
import { learnerPath } from './route-utils'
import { useState } from 'react'

const levelColors: Record<string, string> = {
  A1: 'text-emerald-600 dark:text-emerald-400',
  A2: 'text-teal-600 dark:text-teal-400',
  B1: 'text-blue-600 dark:text-blue-400',
  B2: 'text-indigo-600 dark:text-indigo-400',
  C1: 'text-purple-600 dark:text-purple-400',
  C2: 'text-rose-600 dark:text-rose-400',
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

  const filteredData = data?.filter((learner) =>
    learner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Học viên</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Quản lý hồ sơ và theo dõi tiến độ học tập.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
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
                    <p className="text-sm font-bold text-foreground truncate">
                      {row.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'level',
              header: 'Level',
              cell: (row) => (
                <span className={`text-sm font-bold ${levelColors[row.currentLevel] ?? 'text-muted-foreground'}`}>
                  {row.currentLevel}
                </span>
              ),
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
