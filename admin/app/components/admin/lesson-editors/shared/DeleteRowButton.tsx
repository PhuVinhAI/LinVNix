import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export function DeleteRowButton({
  label,
  resource,
  onDelete,
  size = 'icon',
  className,
}: {
  label: string
  resource: string
  onDelete: () => Promise<void> | void
  size?: 'icon' | 'inline'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onDelete()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Xóa ${resource}`}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
          size === 'icon' && 'h-8 w-8',
          size === 'inline' && 'gap-1 px-2 py-1 text-xs font-medium',
          className,
        )}
      >
        <Trash2 className={size === 'icon' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        {size === 'inline' && <span>Xóa</span>}
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
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
              <span className="font-semibold text-foreground">&quot;{label || '(trống)'}&quot;</span>{' '}
              sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={(e) => {
                e.preventDefault()
                confirm()
              }}
              disabled={busy}
            >
              <Trash2 className="h-4 w-4" />
              {busy ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
