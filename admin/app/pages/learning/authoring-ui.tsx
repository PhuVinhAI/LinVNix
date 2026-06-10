import { Link } from 'react-router'
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileAudio,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Save,
  StickyNote,
  Trash2,
  Video as VideoIcon,
  X,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { MediaUpload } from '../../components/admin/editors/MediaUpload'
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

/* Khối UI dùng chung cho chuỗi wizard soạn bài (ADR 0002) — mỗi màn hình một việc. */

export const DIFFICULTY_LABELS = ['', 'Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó']
export const DIFFICULTY_DOT = ['', 'bg-emerald-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-red-600']

/** Cổng chọn (khu / loại) — luôn dẫn sâu vào trong, không soạn tại chỗ. */
export function GateCard({
  to,
  Icon,
  iconClass = 'bg-primary/10 text-primary',
  label,
  description,
  count,
  countLabel = 'mục',
}: {
  to: string
  Icon: React.ComponentType<{ className?: string }>
  iconClass?: string
  label: string
  description?: string
  count: number
  countLabel?: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-xl border-2 border-border bg-card p-5 transition-colors hover:border-primary focus:outline-none focus-visible:border-primary"
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold leading-tight">{label}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
      </div>
      <div className="flex items-center justify-between pt-3 border-t-2 border-border">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold tabular-nums">{count}</span>
          <span className="text-xs font-medium text-muted-foreground">{countLabel}</span>
        </div>
        {count > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Đã soạn
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Trống
          </span>
        )}
      </div>
    </Link>
  )
}

/** Hàng trong danh sách chọn mục — bấm để vào form soạn riêng; menu chỉ có Sửa/Xóa. */
export function ItemRow({
  onOpen,
  onDelete,
  leading,
  title,
  meta,
}: {
  onOpen: () => void
  onDelete: () => void
  leading?: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
      className="group flex items-center gap-3 bg-card px-4 py-3 cursor-pointer transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40"
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground leading-snug truncate">{title}</div>
        {meta && <div className="text-xs text-muted-foreground mt-0.5 truncate">{meta}</div>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" />
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="shrink-0 -mr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Tùy chọn</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={onOpen}>
              <Pencil className="h-4 w-4" />
              Mở để soạn
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 className="h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  resource,
  label,
  onConfirm,
  extraWarning,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: string
  label: string
  onConfirm: () => void
  extraWarning?: string
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Xóa {resource}?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {resource.charAt(0).toUpperCase() + resource.slice(1)}{' '}
            <span className="font-semibold text-foreground">&quot;{label}&quot;</span>
            {extraWarning ? ` ${extraWarning}` : ''} sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:opacity-90"
            onClick={onConfirm}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ── Thanh công cụ pill + form một-mục (cùng ngôn ngữ với form câu hỏi) ──── */

export function PillBar({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border-2 border-border bg-card px-2 py-2">
      {children}
      {hint && (
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
}

export function PillDivider() {
  return <span className="h-6 w-px bg-border" aria-hidden />
}

export function DifficultyPill({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <span className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT[value]}`} />
          <span className="text-sm font-semibold">{DIFFICULTY_LABELS[value]}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
          Độ khó
        </p>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange(lvl)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                value === lvl ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT[lvl]}`} />
                {DIFFICULTY_LABELS[lvl]}
              </span>
              <span className="text-xs tabular-nums opacity-60">{lvl}/5</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const MEDIA_PILL_ICON = { audio: FileAudio, image: ImageIcon, video: VideoIcon } as const

export function MediaPill({
  kind,
  label,
  filledLabel,
  value,
  onChange,
}: {
  kind: 'audio' | 'image' | 'video'
  label: string
  filledLabel: string
  value: string
  onChange: (v: string) => void
}) {
  const Icon = MEDIA_PILL_ICON[kind]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
            value ? 'text-primary font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm">{value ? filledLabel : label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-3 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <MediaUpload kind={kind} value={value || null} onChange={(url) => onChange(url ?? '')} />
      </PopoverContent>
    </Popover>
  )
}

export function NotesPill({
  value,
  onChange,
  label = 'Ghi chú',
  placeholder = 'Ghi chú dành cho người soạn…',
}: {
  value: string
  onChange: (v: string) => void
  label?: string
  placeholder?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
            value ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <StickyNote className="h-4 w-4" />
          <span className="text-sm">{value ? `Có ${label.toLowerCase()}` : label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-3 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label} <span className="normal-case font-normal tracking-normal">· không hiện cho học viên</span>
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full rounded-lg border-2 border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary resize-y"
        />
      </PopoverContent>
    </Popover>
  )
}

/** Nhãn nhóm field trong thân form — cùng kiểu với form câu hỏi. */
export function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</p>
      {right && <p className="text-xs text-muted-foreground">{right}</p>}
    </div>
  )
}

/** Khung tài liệu trung tâm — header dải màu + thân rộng rãi. */
export function ComposerCard({
  Icon,
  iconClass,
  typeLabel,
  statusRight,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  typeLabel: string
  statusRight?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border-2 border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b-2 border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${iconClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {typeLabel}
            </span>
            {statusRight && (
              <>
                <span className="text-muted-foreground text-xs">·</span>
                {statusRight}
              </>
            )}
          </div>
        </div>
        <div className="px-6 py-8 sm:px-10 sm:py-12 space-y-8">{children}</div>
      </div>
    </div>
  )
}

/** Thanh lưu cố định đáy màn — form wizard lưu tường minh, không autosave. */
export function StickySaveBar({
  contextLabel,
  backTo,
  submitting,
  submitLabel,
  onSave,
}: {
  contextLabel: React.ReactNode
  backTo: string
  submitting: boolean
  submitLabel: string
  onSave: () => void
}) {
  return (
    <div className="sticky bottom-[-2.5rem] -mx-10 -mb-10 mt-10 z-30 border-t-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-10 py-3">
      <div className="mx-auto max-w-3xl flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{contextLabel}</span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to={backTo}>
              <X className="h-4 w-4" />
              Hủy
            </Link>
          </Button>
          <Button onClick={onSave} disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Đang lưu...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
