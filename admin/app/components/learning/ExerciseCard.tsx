import { Pencil, Trash2, MoreVertical, Clock, Award } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { Exercise } from '../../features/learning/types'

const TYPE_COLORS: Record<string, string> = {
  MULTIPLE_CHOICE: 'text-blue-600 dark:text-blue-400',
  FILL_IN_BLANK: 'text-emerald-600 dark:text-emerald-400',
  MATCHING: 'text-purple-600 dark:text-purple-400',
  TRANSLATION: 'text-amber-600 dark:text-amber-400',
  LISTENING: 'text-rose-600 dark:text-rose-400',
  SPEAKING: 'text-cyan-600 dark:text-cyan-400',
}

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  FILL_IN_BLANK: 'Điền chỗ trống',
  MATCHING: 'Ghép cặp',
  TRANSLATION: 'Dịch',
  LISTENING: 'Nghe',
  SPEAKING: 'Nói',
}

const DIFFICULTY: Record<string, { label: string; color: string; dot: string }> = {
  BEGINNER: {
    label: 'Dễ',
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  INTERMEDIATE: {
    label: 'Trung bình',
    color: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  ADVANCED: {
    label: 'Khó',
    color: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
}

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}

export function ExerciseCard({ exercise, onEdit, onDelete, onClick }: ExerciseCardProps) {
  const typeColor = TYPE_COLORS[exercise.exerciseType] ?? 'text-muted-foreground'
  const typeLabel = TYPE_LABELS[exercise.exerciseType] ?? exercise.exerciseType
  const difficulty = DIFFICULTY[exercise.difficultyLevel] ?? DIFFICULTY.BEGINNER

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
      <p className="text-sm font-bold text-foreground line-clamp-2 leading-relaxed mb-3">
        {exercise.question}
      </p>

      {/* Footer meta */}
      {(exercise.points || exercise.timeLimit) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {exercise.points != null && (
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="font-medium tabular-nums">{exercise.points}</span>
              <span>điểm</span>
            </span>
          )}
          {exercise.timeLimit != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="font-medium tabular-nums">{exercise.timeLimit}s</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
