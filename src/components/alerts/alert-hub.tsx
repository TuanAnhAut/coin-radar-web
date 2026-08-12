'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Zap, History, ShieldAlert, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { Alert, AlertRiskLevel, AlertStatus } from '@/lib/types'

const ASSET_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'stock', label: 'Chứng khoán' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'gold', label: 'Vàng' },
] as const

const RISK_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'high', label: 'Cao' },
  { key: 'medium', label: 'Vừa' },
  { key: 'low', label: 'Thấp' },
] as const

type TabStatus = 'active' | 'triggered' | 'history'

const STOCK_SYMBOLS = ['VNINDEX', 'FPT', 'VNM', 'VIC', 'HPG', 'MBB', 'VCB', 'VHM', 'TCB', 'GVR']
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA']
const GOLD_SYMBOLS = ['SJC', 'XAU']

function getAssetType(symbol: string): string | null {
  if (STOCK_SYMBOLS.includes(symbol)) return 'stock'
  if (CRYPTO_SYMBOLS.includes(symbol)) return 'crypto'
  if (GOLD_SYMBOLS.includes(symbol)) return 'gold'
  return null
}

function riskBorderClass(level: AlertRiskLevel) {
  switch (level) {
    case 'high': return 'border-l-destructive'
    case 'medium': return 'border-l-amber-500'
    case 'low': return 'border-l-emerald-500'
  }
}

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

function indicatorIcon(type?: string) {
  switch (type) {
    case 'RSI': return <BarChart3 className="h-4 w-4 text-amber-500" />
    case 'MACD': return <TrendingDown className="h-4 w-4 text-red-500" />
    case 'MA': return <TrendingUp className="h-4 w-4 text-emerald-500" />
    case 'ATR': return <Zap className="h-4 w-4 text-orange-500" />
    case 'volume': return <BarChart3 className="h-4 w-4 text-sky-500" />
    case 'price': return <TrendingUp className="h-4 w-4 text-violet-500" />
    default: return <ShieldAlert className="h-4 w-4 text-muted-foreground" />
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

function AlertCard({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border border-l-4 bg-card p-3 transition-colors hover:bg-accent/50 sm:p-4',
        riskBorderClass(alert.riskLevel)
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {alert.type === 'default' ? (
            <div className="rounded-md bg-muted p-1.5">
              {indicatorIcon(alert.indicatorType)}
            </div>
          ) : (
            <div className="rounded-md bg-primary/10 p-1.5">
              <Zap className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold sm:text-base">{alert.assetSymbol}</span>
            <span className="text-sm text-muted-foreground truncate">
              {alert.assetName}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/80 line-clamp-2">
            {alert.conditionDescription}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('text-[11px] px-1.5 py-0 sm:text-xs', riskBadgeClass(alert.riskLevel))}
            >
              {riskLabel(alert.riskLevel)}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-[11px] px-1.5 py-0 sm:text-xs', statusBadgeClass(alert.status))}
            >
              {statusLabel(alert.status)}
            </Badge>
            {alert.indicatorType && (
              <span className="text-[11px] text-muted-foreground sm:text-xs">
                {alert.indicatorType}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-[11px] text-muted-foreground sm:text-xs">
            {alert.triggeredAt
              ? relativeTime(alert.triggeredAt)
              : relativeTime(alert.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function AlertCardSkeleton() {
  return (
    <div className="rounded-lg border border-l-4 border-l-muted bg-card p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full max-w-xs" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

function EmptyState({ status }: { status: TabStatus }) {
  const { openOverlay } = useAppStore()
  const messages: Record<TabStatus, { title: string; desc: string }> = {
    active: {
      title: 'Chưa có cảnh báo nào đang bật',
      desc: 'Tạo cảnh báo đầu tiên để theo dõi thị trường',
    },
    triggered: {
      title: 'Chưa có cảnh báo nào được kích hoạt',
      desc: 'Cảnh báo sẽ xuất hiện ở đây khi điều kiện được đáp ứng',
    },
    history: {
      title: 'Chưa có lịch sử cảnh báo',
      desc: 'Lịch sử cảnh báo đã kích hoạt sẽ hiển thị ở đây',
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="rounded-full bg-muted p-6">
        <BellOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{messages[status].title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        {messages[status].desc}
      </p>
      <Button
        className="mt-4 min-h-[48px]"
        onClick={() => openOverlay('alert-templates')}
      >
        Tạo cảnh báo đầu tiên
      </Button>
    </motion.div>
  )
}

export function AlertHub() {
  const { openOverlay } = useAppStore()
  const [tab, setTab] = useState<TabStatus>('active')
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async (status: TabStatus, type?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status })
      if (type && type !== 'all') params.set('type', type)
      const res = await fetch(`/api/alerts?${params.toString()}`)
      const json = await res.json()
      setAlerts(json.data ?? [])
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts(tab, assetFilter !== 'all' ? assetFilter : undefined)
  }, [tab, assetFilter, fetchAlerts])

  const filteredAlerts = alerts.filter((a) => {
    if (riskFilter !== 'all' && a.riskLevel !== riskFilter) return false
    return true
  })

  const countByRisk = (level: string) => {
    if (level === 'all') return alerts.length
    return alerts.filter((a) => a.riskLevel === level).length
  }

  const countByAsset = (key: string) => {
    if (key === 'all') return alerts.length
    return alerts.filter((a) => getAssetType(a.assetSymbol) === key).length
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cảnh báo</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi cảnh báo thị trường
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabStatus)}>
        {/* Scrollable on mobile */}
        <TabsList className="w-full">
          <TabsTrigger value="active" className="min-h-[44px] gap-1.5 px-3 text-xs sm:text-sm">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Đang bật</span>
            <span className="sm:hidden">Bật</span>
          </TabsTrigger>
          <TabsTrigger value="triggered" className="min-h-[44px] gap-1.5 px-3 text-xs sm:text-sm">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Đã kích hoạt</span>
            <span className="sm:hidden">K.Hoạt</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-[44px] gap-1.5 px-3 text-xs sm:text-sm">
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lịch sử</span>
            <span className="sm:hidden">L.Sử</span>
          </TabsTrigger>
        </TabsList>

        {/* Filter bar - horizontal scrollable on mobile, wrap on desktop */}
        <div className="mt-3 space-y-2">
          {/* Asset type filter */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none sm:flex-wrap">
            {ASSET_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setAssetFilter(f.key)}
                className={cn(
                  'inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors sm:shrink',
                  assetFilter === f.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                )}
              >
                {f.label}
                {countByAsset(f.key) > 0 && (
                  <span className={cn(
                    'ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                    assetFilter === f.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {countByAsset(f.key)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Risk level filter */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none sm:flex-wrap">
            {RISK_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setRiskFilter(f.key)}
                className={cn(
                  'inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors sm:shrink',
                  riskFilter === f.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                )}
              >
                {f.key !== 'all' && (
                  <span className={cn(
                    'h-2 w-2 rounded-full',
                    f.key === 'high' && 'bg-destructive',
                    f.key === 'medium' && 'bg-amber-500',
                    f.key === 'low' && 'bg-emerald-500'
                  )} />
                )}
                {f.label}
                {countByRisk(f.key) > 0 && (
                  <span className={cn(
                    'ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                    riskFilter === f.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {countByRisk(f.key)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {(['active', 'triggered', 'history'] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <AlertCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <EmptyState status={status} />
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onClick={() => openOverlay('alert-detail', { id: alert.id })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
