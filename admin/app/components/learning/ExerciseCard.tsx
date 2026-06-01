import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { Exercise } from '../../features/learning/types'

const TYPE_COLORS: Record<string, string> = {
  multiple_choice: 'text-blue-600 dark:text-blue-400',
  fill_blank: 'text-emerald-600 dark:text-emerald-400',
  matching: 'text-purple-600 dark:text-purple-400',
  ordering: 'text-indigo-600 dark:text-indigo-400',
  translation: 'text-amber-600 dark:text-amber-400',
  listening: 'text-rose-600 dark:text-rose-400',
  speaking: 'text-cyan-600 dark:text-cyan-400',
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Trắc nghiệm',
  fill_blank: 'Điền chỗ trống',
  matching: 'Ghép cặp',
  ordering: 'Sắp xếp',
  translation: 'Dịch',
  listening: 'Nghe',
  speaking: 'Nói',
}

const DIFFICULTY_LABELS = ['', 'Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó']
const DIFFICULTY_COLORS = [
  '',
  'text-emerald-600 dark:text-emerald-400',
  'text-teal-600 dark:text-teal-400',
  'text-amber-600 dark:text-amber-400',
  'text-rose-600 dark:text-rose-400',
  'text-red-700 dark:text-red-400',
]
const DIFFICULTY_DOTS = ['', 'bg-emerald-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-red-600']

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}

export function ExerciseCard({ exercise, onEdit, onDelete, onClick }: ExerciseCardProps) {
  const key = (exercise.exerciseType ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[key] ?? 'text-muted-foreground'
  const typeLabel = TYPE_LABELS[key] ?? exercise.exerciseType
  const level = Math.min(5, Math.max(1, exercise.difficultyLevel || 1))
  const difficulty = {
    label: DIFFICULTY_LABELS[level],
    color: DIFFICULTY_COLORS[level],
    dot: DIFFICULTY_DOTS[level],
  }

  const handleClick = () => onClick?.()

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && e.key === 'Enter') handleClick()
      }}
      className={`group rounded-lg border-2 border-border bg-card p-4 transition-colors ${
        onClick ? 'cursor-pointer hover:border-primary focus:outline-none focus:border-primary' : ''
      }`}
    >
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs flex-wrap min-w-0">
          <span className={`font-bold ${typeColor}`}>{typeLabel}</span>
          <span className="text-muted-foreground">·</span>
          <span className={`flex items-center gap-1 font-medium ${difficulty.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${difficulty.dot}`} />
            {difficulty.label}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground tabular-nums">#{exercise.orderIndex}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 -mr-1 -mt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Tùy chọn</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 className="h-4 w-4" />
                Xóa bài tập
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-bold text-foreground line-clamp-2 leading-relaxed">
        {exercise.question}
      </p>

      {/* Options preview for multiple choice */}
      {key === 'multiple_choice' && Array.isArray(exercise.options) && (exercise.options as string[]).length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-1">
          {(exercise.options as string[]).slice(0, 4).map((opt, i) => {
            const isCorrect = exercise.correctAnswer === opt
            return (
              <div
                key={i}
                className={`text-xs rounded border-2 px-2 py-1 truncate ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-foreground font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt || '—'}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
