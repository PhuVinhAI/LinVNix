import { useState } from 'react'
import { RefreshCw, Trash2, Database, Server, HardDrive, Activity, Info } from 'lucide-react'
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
  const [activeSection, setActiveSection] = useState<'cache' | 'system'>('cache')

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
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
      {/* Side navigation */}
      <aside className="space-y-1">
        <div className="mb-3 px-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài đặt</h1>
          <p className="text-xs text-muted-foreground mt-1">Quản trị hệ thống</p>
        </div>
        <NavItem
          icon={Database}
          label="Bộ nhớ đệm"
          description="Cache Redis / Memory"
          active={activeSection === 'cache'}
          onClick={() => setActiveSection('cache')}
        />
        <NavItem
          icon={Server}
          label="Hệ thống"
          description="Trạng thái và thông tin"
          active={activeSection === 'system'}
          onClick={() => setActiveSection('system')}
        />
      </aside>

      {/* Main content */}
      <main className="min-w-0">
        {activeSection === 'cache' && (
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Bộ nhớ đệm</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quản lý cache Redis hoặc fallback bộ nhớ tạm.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
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
                <div className="grid gap-3 md:grid-cols-3">
                  <MetricCard
                    icon={HardDrive}
                    label="Loại bộ nhớ"
                    value={data.type}
                    tone="primary"
                  />
                  <MetricCard
                    icon={Activity}
                    label="Trạng thái kết nối"
                    value={data.connected ? 'Đang kết nối' : 'Bộ nhớ tạm'}
                    tone={data.connected ? 'success' : 'warning'}
                  />
                  <MetricCard
                    icon={Database}
                    label="Số lượng keys"
                    value={String(data.size ?? '—')}
                    tone="muted"
                  />
                </div>

                {data.error && (
                  <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
                    <p className="text-sm font-bold text-destructive">Cảnh báo</p>
                    <p className="text-xs text-destructive/80 mt-1">{data.error}</p>
                  </div>
                )}

                {data.info && (
                  <div className="rounded-lg border-2 border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Thông tin chi tiết
                        </span>
                      </div>
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
          </div>
        )}

        {activeSection === 'system' && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Hệ thống</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Thông tin trạng thái hệ thống và phiên bản.
                </p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-border bg-card overflow-hidden">
              <SystemRow label="Phiên bản ứng dụng" value="1.0.0" />
              <SystemRow label="Phiên bản API" value="v1" />
              <SystemRow label="Múi giờ" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
              <SystemRow label="Ngôn ngữ" value="Tiếng Việt" />
            </div>
          </div>
        )}
      </main>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Xóa toàn bộ bộ nhớ đệm?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Toàn bộ cache (Redis hoặc bộ nhớ tạm) sẽ bị xóa ngay lập tức. Các yêu cầu đến sẽ phải tải lại dữ liệu từ cơ sở dữ liệu. Hành động này không thể hoàn tác.
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

function NavItem({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: typeof Database
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
        active
          ? 'border-primary bg-primary/5'
          : 'border-transparent hover:border-border hover:bg-muted/50'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${active ? 'text-foreground' : 'text-foreground'}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
      </div>
    </button>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Database
  label: string
  value: string
  tone: 'primary' | 'success' | 'warning' | 'muted'
}) {
  const toneMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950',
    warning: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950',
    muted: 'text-foreground bg-muted',
  }
  const textMap = {
    primary: 'text-primary',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    muted: 'text-foreground',
  }
  return (
    <div className="rounded-lg border-2 border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${toneMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-2 text-lg font-bold ${textMap[tone]}`}>{value}</p>
    </div>
  )
}

function SystemRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b-2 border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono font-semibold text-foreground">{value}</span>
    </div>
  )
}
