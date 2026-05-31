import { useState } from 'react'
import { RefreshCw, Trash2, Database } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
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
import { useCacheStats, useSettingsMutation } from '../../features/settings/api/use-settings'

export function SettingsPage() {
  const { data, isLoading, error, refetch, isFetching } = useCacheStats()
  const mutations = useSettingsMutation()
  const [confirmClear, setConfirmClear] = useState(false)

  const clearCache = async () => {
    try {
      await mutations.clearCache.mutateAsync()
      toast.success('Đã xóa cache')
      setConfirmClear(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa cache')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Cài đặt</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Quản trị các thành phần vận hành của hệ thống.
        </p>
      </div>

      {/* Cache Section */}
      <section className="space-y-4 pt-2 border-t-2 border-border">
        <div className="flex items-end justify-between gap-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Cache</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý cache Redis hoặc fallback memory.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button
              variant="default"
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={() => setConfirmClear(true)}
              disabled={mutations.clearCache.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Xóa cache
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            <p className="mt-3 text-sm text-muted-foreground">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
            <p className="text-sm font-bold text-destructive">Không tải được cache</p>
            <p className="text-xs text-destructive/80 mt-1">
              {error instanceof Error ? error.message : 'Lỗi không xác định'}
            </p>
          </div>
        ) : data ? (
          <>
            {/* Metrics */}
            <div className="grid gap-3 md:grid-cols-3">
              <StatusCard
                label="Loại cache"
                value={data.type}
                accent="primary"
              />
              <StatusCard
                label="Kết nối"
                value={data.connected ? 'Đang kết nối' : 'Fallback memory'}
                accent={data.connected ? 'success' : 'warning'}
                dot
              />
              <StatusCard
                label="Keys trong memory"
                value={String(data.size ?? '—')}
                accent="muted"
              />
            </div>

            {/* Error */}
            {data.error && (
              <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
                <p className="text-sm font-bold text-destructive">Cảnh báo</p>
                <p className="text-xs text-destructive/80 mt-1">{data.error}</p>
              </div>
            )}

            {/* Info */}
            {data.info && (
              <div className="rounded-lg border-2 border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-border bg-muted/30">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cache info
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {data.info.split('\n').length} dòng
                  </span>
                </div>
                <pre className="max-h-96 overflow-auto p-4 text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                  {data.info}
                </pre>
              </div>
            )}
          </>
        ) : null}
      </section>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa cache hệ thống?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Toàn bộ cache (Redis hoặc memory fallback) sẽ bị xóa ngay lập tức. Các request đến sẽ phải tải lại dữ liệu từ database. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={clearCache}
            >
              <Trash2 className="h-4 w-4" />
              Xóa cache
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatusCard({
  label,
  value,
  accent,
  dot,
}: {
  label: string
  value: string | number
  accent: 'primary' | 'success' | 'warning' | 'muted'
  dot?: boolean
}) {
  const accentClasses = {
    primary: 'text-primary',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    muted: 'text-foreground',
  }
  const dotClasses = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    muted: 'bg-muted-foreground/50',
  }

  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className={`mt-1.5 flex items-center gap-2 text-lg font-bold ${accentClasses[accent]}`}>
        {dot && <span className={`h-2 w-2 rounded-full ${dotClasses[accent]}`} />}
        <span>{value}</span>
      </div>
    </div>
  )
}
