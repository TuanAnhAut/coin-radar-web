'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Bookmark,
  Bell,
  Activity,
  ChevronRight,
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { useIsMobile } from '@/lib/hooks'
import {
  formatCurrency,
  formatNumber,
  formatVolume,
  formatPercent,
  formatDateTime,
} from '@/lib/format'
import type { AssetDetail, OHLCData } from '@/lib/types'

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y'

const PERIOD_DAYS: Record<TimePeriod, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
}

function CustomTooltip({
  active,
  payload,
  label,
  assetType,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  assetType?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">
        {formatCurrency(payload[0].value, assetType as 'stock' | 'crypto' | 'gold')}
      </p>
    </div>
  )
}

function RsiGauge({ value }: { value: number }) {
  const angle = ((value - 0) / 100) * 180 - 90
  const color = value > 70 ? 'text-loss' : value < 30 ? 'text-gain' : 'text-foreground'
  const label = value > 70 ? 'Quá mua' : value < 30 ? 'Quá bán' : 'Trung tính'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-16 w-full max-w-36 items-end justify-center overflow-hidden rounded-t-lg bg-muted/50">
        <div className="absolute inset-x-0 bottom-0 flex">
          <div className="h-full flex-1 bg-gain/20" />
          <div className="h-full flex-1" />
          <div className="h-full flex-1 bg-loss/20" />
        </div>
        <div
          className="absolute bottom-0 left-1/2 h-14 w-0.5 origin-bottom -translate-x-1/2 rounded-full bg-foreground transition-transform duration-500"
          style={{ transform: `rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-foreground" />
        <span className="absolute bottom-1 left-1 text-[10px] text-muted-foreground">0</span>
        <span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground">100</span>
      </div>
      <span className={cn('text-lg font-bold', color)}>{value.toFixed(1)}</span>
      <span className={cn('text-xs font-medium', color)}>{label}</span>
    </div>
  )
}

export function AssetDetailSheet() {
  const { activeOverlay, overlayData, closeOverlay, openOverlay } = useAppStore()
  const isMobile = useIsMobile()
  const symbol = (overlayData?.symbol as string) ?? ''
  const isOpen = activeOverlay === 'asset-detail' && !!symbol

  const [detail, setDetail] = useState<AssetDetail | null>(null)
  const [period, setPeriod] = useState<TimePeriod>('1M')
  const fetchIdRef = useRef(0)

  const loading = detail === null && isOpen

  useEffect(() => {
    if (!isOpen || !symbol) return
    const id = ++fetchIdRef.current
    fetch(`/api/assets/${symbol}`)
      .then((r) => r.json())
      .then((res) => {
        if (fetchIdRef.current === id) setDetail(res.data ?? null)
      })
      .catch(() => {
        if (fetchIdRef.current === id) setDetail(null)
      })
  }, [isOpen, symbol])

  const filteredHistory = useMemo(() => {
    if (!detail) return []
    const days = PERIOD_DAYS[period]
    if (days >= detail.priceHistory.length) return detail.priceHistory
    return detail.priceHistory.slice(-days)
  }, [detail, period])

  const chartData = useMemo(() => {
    return filteredHistory.map((d: OHLCData) => ({
      date: d.date.slice(5),
      close: d.close,
    }))
  }, [filteredHistory])

  const isPositive = (detail?.change24h ?? 0) >= 0
  const gradientId = `gradient-${symbol}`

  const price52wRange = useMemo(() => {
    if (!detail) return 0
    return detail.high52w - detail.low52w
  }, [detail])

  const price52wPosition = useMemo(() => {
    if (!detail || price52wRange === 0) return 0
    return ((detail.price - detail.low52w) / price52wRange) * 100
  }, [detail, price52wRange])

  const handleClose = () => {
    setDetail(null)
    setPeriod('1M')
    closeOverlay()
  }

  const title = detail?.name ?? symbol
  const desc = 'Chi tiết tài sản'

  const renderContent = () => (
    <div className="flex flex-col gap-4">
      {/* Section 1: Header */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      ) : detail ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-xl font-bold md:text-2xl">{detail.symbol}</h3>
            <Badge variant="secondary" className="text-xs">
              {detail.type === 'stock' ? 'CK' : detail.type === 'crypto' ? 'Crypto' : 'Vàng'}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-3 text-sm">{detail.name}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold md:text-3xl">{formatCurrency(detail.price, detail.type)}</span>
            <span className={cn('text-lg font-semibold md:text-xl', isPositive ? 'text-gain' : 'text-loss')}>
              {formatPercent(detail.changePercent)}
            </span>
          </div>
          <p className={cn('text-sm', isPositive ? 'text-gain' : 'text-loss')}>
            {isPositive ? '+' : ''}
            {formatNumber(Math.abs(detail.change24h))}{' '}
            {detail.type === 'gold' ? 'VNĐ' : detail.type === 'crypto' ? 'USD' : 'VNĐ'} (24h)
          </p>
        </motion.div>
      ) : null}

      <Separator />

      {/* Section 2: Chart */}
      {loading ? (
        <Skeleton className="h-56 w-full rounded-lg" />
      ) : detail && chartData.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Time period buttons - scrollable row on mobile */}
          <div className="mb-3 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 scrollbar-none">
            {(['1D', '1W', '1M', '3M', '1Y'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'min-h-[36px] shrink-0 rounded-md px-3 text-xs font-medium transition-colors',
                  period === p ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Chart - min 200px on mobile */}
          <div className="h-56 min-h-[200px] rounded-lg border bg-card p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => formatNumber(v)}
                  width={55}
                />
                <Tooltip content={<CustomTooltip assetType={detail.type} />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : null}

      <Separator />

      {/* Section 3: Key Stats - stack vertically on mobile, grid on desktop */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : detail ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="size-4" />
            Chỉ báo kỹ thuật
          </h4>

          <div className="rounded-lg border p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">RSI (14)</p>
            <RsiGauge value={detail.technicalIndicators.rsi} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              label="MACD"
              value={detail.technicalIndicators.macd.macd.toFixed(2)}
              sub={`Signal: ${detail.technicalIndicators.macd.signal.toFixed(2)}`}
              extra={
                <span className={cn('text-xs', detail.technicalIndicators.macd.histogram >= 0 ? 'text-gain' : 'text-loss')}>
                  Hist: {detail.technicalIndicators.macd.histogram.toFixed(2)}
                </span>
              }
            />
            <StatCard
              label="MA20"
              value={formatNumber(detail.technicalIndicators.ma20)}
              sub={detail.price >= detail.technicalIndicators.ma20 ? 'Giá trên MA20' : 'Giá dưới MA20'}
              subColor={detail.price >= detail.technicalIndicators.ma20 ? 'text-gain' : 'text-loss'}
            />
            <StatCard
              label="MA50"
              value={formatNumber(detail.technicalIndicators.ma50)}
              sub={detail.price >= detail.technicalIndicators.ma50 ? 'Giá trên MA50' : 'Giá dưới MA50'}
              subColor={detail.price >= detail.technicalIndicators.ma50 ? 'text-gain' : 'text-loss'}
            />
            <StatCard label="ATR" value={formatNumber(detail.technicalIndicators.atr)} sub="Biên độ dao động TB" />
            <StatCard label="KL TB 20 ngày" value={formatVolume(detail.technicalIndicators.volumeAvg20)} />
            <StatCard label="KL TB 30 ngày" value={formatVolume(detail.avgVolume30d)} />
          </div>

          {/* 52-Week Range - full width on mobile */}
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium">52 tuần</p>
            <div className="flex items-center justify-between text-xs">
              <span>{formatNumber(detail.low52w)}</span>
              <span className="text-xs font-semibold md:text-sm">{formatCurrency(detail.price, detail.type)}</span>
              <span>{formatNumber(detail.high52w)}</span>
            </div>
            <div className="relative mt-2 h-2 rounded-full bg-muted">
              <div className="absolute inset-0 rounded-full bg-gain/20" />
              <div
                className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-background bg-foreground"
                style={{ left: `${Math.max(0, Math.min(100, price52wPosition))}%` }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}

      <Separator />

      {/* Section 4: Action Buttons - stacked full width on mobile, row on desktop */}
      {detail && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="min-h-[48px] w-full sm:flex-1" onClick={() => openOverlay('watchlist')}>
            <Bookmark className="mr-2 size-4" />
            Thêm vào watchlist
          </Button>
          <Button
            className="min-h-[48px] w-full sm:flex-1"
            onClick={() =>
              openOverlay('alert-builder', {
                assetSymbol: detail.symbol,
                assetName: detail.name,
              })
            }
          >
            <Bell className="mr-2 size-4" />
            Tạo cảnh báo
          </Button>
        </motion.div>
      )}

      <Separator />

      {/* Section 5: Related News - simplified list on mobile */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : detail && detail.relatedNews.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <h4 className="text-sm font-semibold">Tin tức liên quan</h4>
          {detail.relatedNews.map((news) => (
            <button
              key={news.id}
              onClick={() => openOverlay('news-detail', { id: news.id })}
              className="flex min-h-[44px] w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
            >
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight line-clamp-1">{news.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs line-clamp-1 md:line-clamp-2">{news.summary}</p>
                <p className="text-muted-foreground hidden text-xs md:block">{formatDateTime(news.publishedAt)}</p>
              </div>
            </button>
          ))}
        </motion.div>
      ) : null}
    </div>
  )

  return (
    <>
      {/* Mobile: Drawer from bottom */}
      <Drawer open={isMobile && isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="px-4 pt-2 text-left">
            <DrawerTitle className="text-base">{title}</DrawerTitle>
            <DrawerDescription className="text-xs">{desc}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 px-4 pb-8 custom-scrollbar max-h-[calc(92vh-8rem)]">
            {renderContent()}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Desktop: Sheet from right */}
      <Sheet open={!isMobile && isOpen} onOpenChange={handleClose}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{desc}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4 md:p-6 pb-24">
              {renderContent()}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

function StatCard({ label, value, sub, subColor, extra }: { label: string; value: string; sub?: string; subColor?: string; extra?: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
      {sub && <p className={cn('text-xs', subColor ?? 'text-muted-foreground')}>{sub}</p>}
      {extra}
    </div>
  )
}
