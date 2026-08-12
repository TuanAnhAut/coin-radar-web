'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Zap,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/app-store'
import { useIsMobile } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { Alert, AlertRiskLevel, AlertStatus } from '@/lib/types'

function riskBadgeClass(level: AlertRiskLevel) {
  switch (level) {
    case 'high': return 'bg-destructive/10 text-destructive border-destructive/20'
    case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
    case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
  }
}

function riskLabel(level: AlertRiskLevel) {
  switch (level) {
    case 'high': return 'Cao'
    case 'medium': return 'Vừa'
    case 'low': return 'Thấp'
  }
}

function statusBadgeClass(status: AlertStatus) {
  switch (status) {
    case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'triggered': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    case 'disabled': return 'bg-muted text-muted-foreground'
  }
}

function statusLabel(status: AlertStatus) {
  switch (status) {
    case 'active': return 'Đang bật'
    case 'triggered': return 'Đã kích hoạt'
    case 'disabled': return 'Đã tắt'
  }
}

function riskExplanation(level: AlertRiskLevel) {
  switch (level) {
    case 'high': return 'Cảnh báo rủi ro cao. Tài sản có thể biến động mạnh. Cân nhắc chốt lời hoặc cắt lỗ.'
    case 'medium': return 'Mức rủi ro trung bình. Theo dõi thêm diễn biến và điều chỉnh chiến lược nếu cần.'
    case 'low': return 'Mức rủi ro thấp. Tình trạng nằm trong biên độ bình thường của thị trường.'
  }
}

function indicatorIcon(type?: string) {
  switch (type) {
    case 'RSI': return <BarChart3 className="h-5 w-5 text-amber-500" />
    case 'MACD': return <Activity className="h-5 w-5 text-red-500" />
    case 'MA': return <TrendingUp className="h-5 w-5 text-emerald-500" />
    case 'ATR': return <Zap className="h-5 w-5 text-orange-500" />
    case 'volume': return <BarChart3 className="h-5 w-5 text-sky-500" />
    case 'price': return <TrendingUp className="h-5 w-5 text-violet-500" />
    default: return <ShieldAlert className="h-5 w-5 text-muted-foreground" />
  }
}

function relativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHr < 24) return `${diffHr} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ProximityGauge({
  current,
  threshold,
  label,
}: {
  current: number
  threshold: number
  label: string
}) {
  let proximity = 0
  if (current && threshold) {
    const distance = Math.abs(current - threshold)
    const range = Math.max(Math.abs(threshold), 1)
    proximity = Math.max(0, Math.min(100, ((range - distance) / range) * 100))
  }

  const color =
    proximity > 80
      ? 'text-destructive'
      : proximity > 50
        ? 'text-amber-500'
        : 'text-emerald-500'

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn('text-lg font-bold font-mono', color)}>
          {current?.toFixed(1) ?? '--'}
        </span>
      </div>
      <Progress
        value={proximity}
        className={cn(
          'h-2 w-full',
          proximity > 80 && '[&>div]:bg-destructive',
          proximity > 50 && proximity <= 80 && '[&>div]:bg-amber-500',
          proximity <= 50 && '[&>div]:bg-emerald-500'
        )}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Ngưỡng: {threshold}</span>
        <span>Gần kích hoạt: {proximity.toFixed(0)}%</span>
      </div>
    </div>
  )
}

function TimelineItem({
  date,
  label,
  status,
}: {
  date: string
  label: string
  status: 'completed' | 'current' | 'pending'
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2',
            status === 'completed'
              ? 'border-emerald-500 bg-emerald-500'
              : status === 'current'
                ? 'border-amber-500 bg-amber-500'
                : 'border-muted-foreground/30 bg-background'
          )}
        >
          {status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
          {status === 'current' && <Circle className="h-2.5 w-2.5 fill-white text-white" />}
          {status === 'pending' && <Circle className="h-3 w-3 text-muted-foreground/30" />}
        </div>
        {status !== 'pending' && (
          <div className={cn(
            'w-0.5 h-8',
            status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
          )} />
        )}
      </div>
      <div className="-mt-0.5">
        <p className={cn(
          'text-sm font-medium',
          status === 'pending' && 'text-muted-foreground'
        )}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  )
}

export function AlertDetailSheet() {
  const { activeOverlay, overlayData, openOverlay, closeOverlay } = useAppStore()
  const isMobile = useIsMobile()
  const open = activeOverlay === 'alert-detail'
  const alertId = (overlayData?.id as string) ?? ''

  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open || !alertId) return
    setLoading(true)
    fetch(`/api/alerts/${alertId}`)
      .then((r) => r.json())
      .then((json) => setAlert(json.data ?? null))
      .catch(() => setAlert(null))
      .finally(() => setLoading(false))
  }, [open, alertId])

  const handleToggle = async () => {
    if (!alert) return
    setToggling(true)
    try {
      const newStatus = alert.status === 'active' ? 'disabled' : 'active'
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const json = await res.json()
        setAlert(json.data)
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!alert) return
    setDeleting(true)
    try {
      await fetch(`/api/alerts/${alert.id}`, { method: 'DELETE' })
      closeOverlay()
    } catch {
      // silently fail
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    if (!alert) return
    closeOverlay()
    setTimeout(() => {
      openOverlay('alert-builder', { assetSymbol: alert.assetSymbol })
    }, 200)
  }

  const handleCreateSimilar = () => {
    if (!alert) return
    closeOverlay()
    setTimeout(() => {
      openOverlay('alert-builder', {
        assetSymbol: alert.assetSymbol,
        template: {
          id: '',
          name: alert.condition,
          description: alert.conditionDescription,
          condition: alert.condition,
          indicatorType: alert.indicatorType ?? '',
          assetType: 'all' as const,
          riskLevel: alert.riskLevel,
        },
      })
    }, 200)
  }

  const gaugeData = useMemo(() => {
    if (!alert?.value || !alert?.threshold) return null
    return { current: alert.value, threshold: alert.threshold }
  }, [alert])

  const title = alert?.assetSymbol ?? 'Chi tiết cảnh báo'
  const desc = alert?.condition ?? ''

  const renderContent = () => (
    <div className="flex flex-col gap-5">
      {loading ? (
        <DetailSkeleton />
      ) : !alert ? (
        <p className="py-8 text-center text-muted-foreground">Không tìm thấy cảnh báo</p>
      ) : (
        <>
          {/* Condition description - proper text sizing */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed">{alert.conditionDescription}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {alert.indicatorType && (
                <Badge variant="outline" className="text-xs">
                  {alert.indicatorType}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn('text-xs', riskBadgeClass(alert.riskLevel))}
              >
                Rủi ro {riskLabel(alert.riskLevel)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {alert.type === 'default' ? 'Mẫu mặc định' : 'Tùy chỉnh'}
              </Badge>
            </div>
          </div>

          {/* Status timeline - vertical on mobile */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Trạng thái</h3>
            <div className="space-y-0">
              <TimelineItem
                date={alert.createdAt}
                label="Tạo cảnh báo"
                status="completed"
              />
              {alert.triggeredAt ? (
                <TimelineItem
                  date={alert.triggeredAt}
                  label="Đã kích hoạt"
                  status="current"
                />
              ) : (
                <TimelineItem
                  date={new Date().toISOString()}
                  label="Chờ kích hoạt"
                  status={alert.status === 'active' ? 'current' : 'pending'}
                />
              )}
            </div>
          </div>

          {/* Proximity gauge - full width */}
          {gaugeData && alert.status === 'active' && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Tiến trình điều kiện</h3>
              <ProximityGauge
                current={gaugeData.current}
                threshold={gaugeData.threshold}
                label={alert.indicatorType ? `Giá trị ${alert.indicatorType}` : 'Giá trị hiện tại'}
              />
            </div>
          )}

          {/* Triggered info */}
          {alert.status === 'triggered' && alert.triggeredAt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Đã kích hoạt
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Cảnh báo được kích hoạt vào {relativeTime(alert.triggeredAt)}.
                Hãy kiểm tra lại vị thế và chiến lược giao dịch của bạn.
              </p>
            </motion.div>
          )}

          {/* Risk assessment - text should wrap properly */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Đánh giá rủi ro
            </h3>
            <div className={cn(
              'rounded-md p-3 text-sm leading-relaxed break-words',
              alert.riskLevel === 'high' && 'bg-destructive/5 text-destructive/80',
              alert.riskLevel === 'medium' && 'bg-amber-500/5 text-amber-700 dark:text-amber-400',
              alert.riskLevel === 'low' && 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
            )}>
              {riskExplanation(alert.riskLevel)}
            </div>
          </div>

          {/* Related asset info */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-3">Thông tin tài sản</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Mã</span>
                <p className="font-semibold">{alert.assetSymbol}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tên</span>
                <p className="font-medium truncate">{alert.assetName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tạo lúc</span>
                <p className="text-xs mt-0.5">{formatDate(alert.createdAt)}</p>
              </div>
              {alert.triggeredAt && (
                <div>
                  <span className="text-muted-foreground">Kích hoạt lúc</span>
                  <p className="text-xs mt-0.5">{formatDate(alert.triggeredAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons - stacked full width on mobile, grid on desktop */}
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2">
            <Button
              variant="outline"
              className="min-h-[48px] w-full gap-1.5"
              onClick={handleEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              className="min-h-[48px] w-full gap-1.5"
              onClick={handleToggle}
              disabled={toggling}
            >
              {alert.status === 'active' ? (
                <><PowerOff className="h-3.5 w-3.5" /> Tạm tắt</>
              ) : (
                <><Power className="h-3.5 w-3.5" /> Bật lại</>
              )}
            </Button>
            <Button
              variant="outline"
              className="min-h-[48px] w-full gap-1.5"
              onClick={handleCreateSimilar}
            >
              <Copy className="h-3.5 w-3.5" />
              Tạo tương tự
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="min-h-[48px] w-full gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa cảnh báo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Cảnh báo &quot;{alert.assetSymbol} - {alert.condition}&quot; sẽ bị xóa vĩnh viễn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: Drawer from bottom */}
      <Drawer open={isMobile && open} onOpenChange={(v) => !v && closeOverlay()}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="px-4 pt-2 text-left">
            <DrawerTitle className="text-base line-clamp-1">{title}</DrawerTitle>
            <DrawerDescription className="text-xs line-clamp-1">{desc}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 px-4 pb-8 custom-scrollbar max-h-[calc(92vh-8rem)]">
            {renderContent()}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Desktop: Sheet from right */}
      <Sheet open={!isMobile && open} onOpenChange={(v) => !v && closeOverlay()}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                {alert ? indicatorIcon(alert.indicatorType) : <Skeleton className="h-5 w-5 rounded" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle className="truncate">
                    {loading ? <Skeleton className="h-5 w-32" /> : alert?.assetSymbol}
                  </SheetTitle>
                  {alert && (
                    <Badge
                      variant="outline"
                      className={cn('text-xs', statusBadgeClass(alert.status))}
                    >
                      {statusLabel(alert.status)}
                    </Badge>
                  )}
                </div>
                <SheetDescription className="mt-1">
                  {loading ? <Skeleton className="h-4 w-48 mt-1" /> : alert?.condition ?? ''}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 px-6 pb-6">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
