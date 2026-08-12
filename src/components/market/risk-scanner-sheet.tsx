'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert,
  Shield,
  ShieldCheck,
  Bell,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { ScanResponse, ScanResult } from '@/lib/types'

const SEVERITY_CONFIG = {
  high: {
    label: 'Rủi ro cao',
    icon: ShieldAlert,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  medium: {
    label: 'Rủi ro trung bình',
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  low: {
    label: 'Rủi ro thấp',
    icon: ShieldCheck,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
} as const

type Severity = 'high' | 'medium' | 'low'

function ResultCard({ result, index }: { result: ScanResult; index: number }) {
  const { openOverlay } = useAppStore()
  const config = SEVERITY_CONFIG[result.severity]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={cn('rounded-lg border p-4', config.border, config.bg)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <button
              className="font-semibold hover:underline"
              onClick={() => openOverlay('asset-detail', { symbol: result.assetSymbol })}
            >
              {result.assetSymbol}
            </button>
            <span className="text-muted-foreground text-sm">{result.assetName}</span>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge className={cn('text-xs', config.badge)} variant="secondary">
              {result.anomalyLabel}
            </Badge>
            <Badge className={cn('flex items-center gap-1 text-xs', config.badge)} variant="outline">
              <Icon className="size-3" />
              {config.label}
            </Badge>
          </div>

          <p className="text-muted-foreground mb-2 text-sm leading-relaxed">{result.anomalyDescription}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              Giá trị hiện tại:{' '}
              <span className="font-medium text-foreground">
                {typeof result.currentValue === 'number' && result.currentValue > 1000000
                  ? formatCurrency(result.currentValue, result.assetType)
                  : new Intl.NumberFormat('vi-VN').format(result.currentValue)}
              </span>
            </span>
            <span>
              Phạm vi BT: <span className="font-medium text-foreground">{result.normalRange}</span>
            </span>
            <span>{formatDateTime(result.detectedAt)}</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => openOverlay('alert-builder', { assetSymbol: result.assetSymbol, assetName: result.assetName })}
        >
          <Bell className="size-3" />
        </Button>
      </div>
    </motion.div>
  )
}

export function RiskScannerSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()
  const isOpen = activeOverlay === 'scanner'

  const [data, setData] = useState<ScanResponse | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const fetchIdRef = useRef(0)

  const loading = data === null && isOpen

  useEffect(() => {
    if (!isOpen) return
    const id = ++fetchIdRef.current
    fetch('/api/scanner')
      .then((r) => r.json())
      .then((res) => {
        if (fetchIdRef.current === id) setData(res.data ?? null)
      })
      .catch(() => {
        if (fetchIdRef.current === id) setData(null)
      })
  }, [isOpen])

  const grouped = data?.results.reduce<Record<Severity, ScanResult[]>>(
    (acc, r) => {
      acc[r.severity].push(r)
      return acc
    },
    { high: [], medium: [], low: [] }
  )

  const handleRefresh = () => {
    setRefreshing(true)
    fetch('/api/scanner')
      .then((r) => r.json())
      .then((res) => setData(res.data ?? null))
      .finally(() => setRefreshing(false))
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeOverlay}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Quét rủi ro toàn diện</SheetTitle>
          <SheetDescription>Kết quả quét rủi ro thị trường</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4 pb-24">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-500" />
                  <h3 className="text-lg font-bold">Quét rủi ro toàn diện</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
                </Button>
              </div>
              {data && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Cập nhật: {formatDateTime(data.scannedAt)} • {data.totalAnomalies} bất thường
                </p>
              )}
            </div>

            {/* Summary Cards */}
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            ) : data ? (
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard
                  icon={ShieldAlert}
                  label="Cao"
                  count={data.highRisk}
                  color="text-red-600 dark:text-red-400"
                  bg="bg-red-50 dark:bg-red-950/30"
                  border="border-red-200 dark:border-red-800"
                />
                <SummaryCard
                  icon={Shield}
                  label="Trung bình"
                  count={data.mediumRisk}
                  color="text-amber-600 dark:text-amber-400"
                  bg="bg-amber-50 dark:bg-amber-950/30"
                  border="border-amber-200 dark:border-amber-800"
                />
                <SummaryCard
                  icon={ShieldCheck}
                  label="Thấp"
                  count={data.lowRisk}
                  color="text-emerald-600 dark:text-emerald-400"
                  bg="bg-emerald-50 dark:bg-emerald-950/30"
                  border="border-emerald-200 dark:border-emerald-800"
                />
              </div>
            ) : null}

            <Separator />

            {/* Results */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            ) : !grouped || data?.totalAnomalies === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShieldCheck className="text-muted-foreground mb-3 size-12" />
                <p className="font-medium">Không phát hiện bất thường</p>
                <p className="text-muted-foreground text-sm">Thị trường đang ổn định</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.keys(SEVERITY_CONFIG) as Severity[]).map((sev) => {
                  const items = grouped[sev]
                  if (!items || items.length === 0) return null
                  const config = SEVERITY_CONFIG[sev]
                  const Icon = config.icon
                  return (
                    <div key={sev} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('size-4', config.color)} />
                        <h4 className={cn('text-sm font-semibold', config.color)}>{config.label}</h4>
                        <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map((r, i) => (
                          <ResultCard key={`${r.assetSymbol}-${r.anomalyType}`} result={r} index={i} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  count,
  color,
  bg,
  border,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  count: number
  color: string
  bg: string
  border: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('rounded-lg border p-3 text-center', bg, border)}
    >
      <Icon className={cn('mx-auto mb-1 size-5', color)} />
      <p className={cn('text-2xl font-bold', color)}>{count}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </motion.div>
  )
}
