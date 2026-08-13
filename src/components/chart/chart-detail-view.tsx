'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  Crosshair,
  Minus,
  Move,
  GitBranch,
  Square,
  Type,
  Bell,
  Trash2,
  ChevronDown,
  ChevronUp,
  LineChart,
  BarChart3,
  Activity,
  Layers,
  Eye,
  EyeOff,
  Ruler,
  Plus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useAppStore } from '@/store/app-store'
import { ChartCanvas } from '@/components/chart/chart-canvas'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format'
import { getAlertFromDrawing } from '@/lib/chart-utils'
import { cn } from '@/lib/utils'
import type { OHLCData, AssetDetail, TechnicalIndicators } from '@/lib/types'
import type { DrawingTool, ChartDrawing, IndicatorConfig } from '@/lib/chart-types'

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

const PERIOD_LABELS: Record<TimePeriod, string> = {
  '1D': '1 Ngày',
  '1W': '1 Tuần',
  '1M': '1 Tháng',
  '3M': '3 Tháng',
  '1Y': '1 Năm',
  ALL: 'Tất cả',
}

const PERIOD_DAYS: Record<TimePeriod, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  ALL: 9999,
}

// Default indicator configs
const DEFAULT_INDICATORS: IndicatorConfig[] = [
  { type: 'ma20', enabled: true, color: 'oklch(0.75 0.15 80)' },
  { type: 'ma50', enabled: true, color: 'oklch(0.7 0.2 310)' },
  { type: 'ma100', enabled: false, color: 'oklch(0.65 0.18 200)' },
  { type: 'bb', enabled: false, color: 'oklch(0.6 0.15 200)' },
  { type: 'rsi', enabled: true, color: 'oklch(0.7 0.18 55)' },
  { type: 'macd', enabled: false, color: 'oklch(0.7 0.15 145)' },
  { type: 'volume', enabled: true, color: 'oklch(0.7 0 0 / 30%)' },
]

export function ChartDetailView() {
  const {
    chartDetailSymbol,
    chartDetailAssetName,
    chartDetailAssetType,
    closeChartDetail,
    openOverlay,
  } = useAppStore()

  const symbol = chartDetailSymbol ?? ''
  const isOpen = !!symbol

  const [detail, setDetail] = useState<AssetDetail | null>(null)
  const [period, setPeriod] = useState<TimePeriod>('3M')
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair')
  const [drawings, setDrawings] = useState<ChartDrawing[]>([])
  const [indicators, setIndicators] = useState<IndicatorConfig[]>(DEFAULT_INDICATORS)
  const [showIndicators, setShowIndicators] = useState(false)
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null)
  const [crosshairIdx, setCrosshairIdx] = useState<number | null>(null)

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ width: 800, height: 400 })

  // Fetch asset detail
  useEffect(() => {
    if (!isOpen || !symbol) return
    fetch(`/api/assets/${symbol}`)
      .then((r) => r.json())
      .then((res) => setDetail(res.data ?? null))
      .catch(() => setDetail(null))
  }, [isOpen, symbol])

  // Measure chart container
  useEffect(() => {
    const measure = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect()
        setChartSize({ width: rect.width, height: rect.height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showIndicators])

  // Filter data by period
  const filteredData = useMemo(() => {
    if (!detail) return []
    const days = PERIOD_DAYS[period]
    if (days >= detail.priceHistory.length) return detail.priceHistory
    return detail.priceHistory.slice(-days)
  }, [detail, period])

  // OHLC data for crosshair display
  const crosshairCandle = useMemo(() => {
    if (crosshairIdx === null || !detail) return null
    return detail.priceHistory[crosshairIdx] ?? null
  }, [crosshairIdx, detail])

  // Tool definitions
  const tools: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { id: 'crosshair', icon: <Crosshair className="size-4" />, label: 'Crosshair' },
    { id: 'hline', icon: <Minus className="size-4" />, label: 'Đường ngang' },
    { id: 'trendline', icon: <TrendingUp className="size-4" />, label: 'Đường xu hướng' },
    { id: 'fibonacci', icon: <GitBranch className="size-4" />, label: 'Fibonacci' },
    { id: 'rectangle', icon: <Square className="size-4" />, label: 'Vùng giá' },
    { id: 'text', icon: <Type className="size-4" />, label: 'Ghi chú' },
  ]

  // Handle drawing click → set alert
  const handleDrawingClick = useCallback(
    (drawing: ChartDrawing) => {
      const alertInfo = getAlertFromDrawing(drawing, symbol, chartDetailAssetName ?? '')
      if (alertInfo) {
        openOverlay('alert-builder', {
          assetSymbol: symbol,
          assetName: chartDetailAssetName,
          prefillCondition: alertInfo.condition,
          prefillValue: alertInfo.value,
          prefillDescription: alertInfo.conditionDescription,
        })
      }
    },
    [symbol, chartDetailAssetName, openOverlay]
  )

  // Toggle indicator
  const toggleIndicator = useCallback((type: string) => {
    setIndicators((prev) =>
      prev.map((ind) => (ind.type === type ? { ...ind, enabled: !ind.enabled } : ind))
    )
  }, [])

  // Clear all drawings
  const clearDrawings = useCallback(() => {
    setDrawings([])
  }, [])

  // Set alert from crosshair price
  const setAlertFromPrice = useCallback(() => {
    if (crosshairPrice === null) return
    openOverlay('alert-builder', {
      assetSymbol: symbol,
      assetName: chartDetailAssetName,
      prefillValue: crosshairPrice,
      prefillDescription: `Giá chạm ${crosshairPrice.toFixed(2)}`,
    })
  }, [crosshairPrice, symbol, chartDetailAssetName, openOverlay])

  if (!isOpen) return null

  const isPositive = (detail?.change24h ?? 0) >= 0
  const assetType = chartDetailAssetType as 'stock' | 'crypto' | 'gold'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col gap-0 -mx-3 sm:-mx-4 md:-mx-6"
        style={{ minHeight: 'calc(100vh - 6rem)' }}
      >
        {/* ===== Top Header Bar ===== */}
        <div className="shrink-0 px-3 sm:px-4 md:px-6 pt-2 pb-3 bg-card border-b">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => closeChartDetail()}
            >
              <ArrowLeft className="size-5" />
            </Button>

            {/* Asset info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold truncate">{symbol}</h2>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {assetType === 'stock' ? 'CK' : assetType === 'crypto' ? 'Crypto' : 'Vàng'}
                  </Badge>
                </div>
                {detail && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                      {formatCurrency(detail.price, assetType)}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isPositive ? 'text-gain' : 'text-loss'
                      )}
                    >
                      {formatPercent(detail.changePercent)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            {detail && (
              <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
                <span>O: <strong className="text-foreground tabular-nums">{formatNumber(detail.priceHistory[detail.priceHistory.length - 1]?.open ?? 0)}</strong></span>
                <span>H: <strong className="text-foreground tabular-nums">{formatNumber(detail.priceHistory[detail.priceHistory.length - 1]?.high ?? 0)}</strong></span>
                <span>L: <strong className="text-foreground tabular-nums">{formatNumber(detail.priceHistory[detail.priceHistory.length - 1]?.low ?? 0)}</strong></span>
                <span>C: <strong className="text-foreground tabular-nums">{formatNumber(detail.price)}</strong></span>
                <span>Vol: <strong className="text-foreground tabular-nums">{formatNumber(detail.volume)}</strong></span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => openOverlay('watchlist')}>
                    <Layers className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Watchlist</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => openOverlay('alert-builder', { assetSymbol: symbol, assetName: chartDetailAssetName })}
                  >
                    <Bell className="size-3.5 mr-1" />
                    <span className="hidden sm:inline">Cảnh báo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Tạo cảnh báo</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Crosshair OHLC info */}
          {crosshairCandle && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium">{crosshairCandle.date}</span>
              <span>O: <strong className="text-foreground tabular-nums">{formatNumber(crosshairCandle.open)}</strong></span>
              <span>H: <strong className="text-foreground tabular-nums">{formatNumber(crosshairCandle.high)}</strong></span>
              <span>L: <strong className="text-foreground tabular-nums">{formatNumber(crosshairCandle.low)}</strong></span>
              <span>C: <strong className={cn('tabular-nums', crosshairCandle.close >= crosshairCandle.open ? 'text-gain' : 'text-loss')}>
                {formatNumber(crosshairCandle.close)}
              </strong></span>
              <span>Vol: <strong className="text-foreground tabular-nums">{formatNumber(crosshairCandle.volume)}</strong></span>
              {crosshairPrice !== null && (
                <Button variant="ghost" size="sm" className="h-6 ml-auto text-xs" onClick={setAlertFromPrice}>
                  <Bell className="size-3 mr-1" />
                  Cảnh báo @ {formatCurrency(crosshairPrice, assetType)}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ===== Drawing Tools Bar ===== */}
        <div className="shrink-0 px-3 sm:px-4 md:px-6 py-2 bg-card border-b overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            {/* Drawing tools */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
              {tools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTool(tool.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        activeTool === tool.id
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {tool.icon}
                      <span className="hidden md:inline">{tool.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>{tool.label}</p></TooltipContent>
                </Tooltip>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Time period */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
              {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    period === p
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Indicators toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowIndicators(!showIndicators)}
                >
                  <Activity className="size-3.5 mr-1" />
                  Chỉ báo
                  {showIndicators ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Bật/tắt chỉ báo kỹ thuật</p></TooltipContent>
            </Tooltip>

            {/* Clear drawings */}
            {drawings.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearDrawings}>
                    <Trash2 className="size-3.5 mr-1" />
                    Xóa ({drawings.length})
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Xóa tất cả đường vẽ</p></TooltipContent>
              </Tooltip>
            )}

            {/* Drawing count */}
            {drawings.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="bg-muted rounded-full px-2 py-0.5">{drawings.length} đường vẽ</span>
                <span className="text-[10px]">(nhấp đúp để xóa, nhấp phải để đặt cảnh báo)</span>
              </div>
            )}
          </div>
        </div>

        {/* ===== Indicators Panel (collapsible) ===== */}
        <AnimatePresence>
          {showIndicators && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden shrink-0 bg-card border-b"
            >
              <div className="px-3 sm:px-4 md:px-6 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Chỉ báo kỹ thuật</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {indicators.map((ind) => (
                    <button
                      key={ind.type}
                      onClick={() => toggleIndicator(ind.type)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                        ind.enabled
                          ? 'border-primary/50 bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      {ind.type === 'ma20' && <LineChart className="size-3.5" />}
                      {ind.type === 'ma50' && <LineChart className="size-3.5" />}
                      {ind.type === 'ma100' && <LineChart className="size-3.5" />}
                      {ind.type === 'bb' && <BarChart3 className="size-3.5" />}
                      {ind.type === 'rsi' && <Activity className="size-3.5" />}
                      {ind.type === 'macd' && <Ruler className="size-3.5" />}
                      {ind.type === 'volume' && <BarChart3 className="size-3.5" />}
                      <span>{ind.type.toUpperCase()}</span>
                      {ind.enabled ? (
                        <Eye className="size-3 ml-auto" />
                      ) : (
                        <EyeOff className="size-3 ml-auto opacity-50" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Chart Area ===== */}
        <div
          ref={chartContainerRef}
          className="flex-1 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] relative"
        >
          {!detail || filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />
            </div>
          ) : (
            <ContextMenu>
              <ContextMenuTrigger className="block w-full h-full">
                <ChartCanvas
                  data={filteredData}
                  assetType={assetType}
                  width={chartSize.width}
                  height={chartSize.height}
                  activeTool={activeTool}
                  drawings={drawings}
                  onDrawingsChange={setDrawings}
                  indicators={indicators}
                  onCrosshairMove={(price, idx) => {
                    setCrosshairPrice(price)
                    setCrosshairIdx(idx)
                  }}
                  onDrawingClick={handleDrawingClick}
                />
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => {
                  if (crosshairPrice !== null) {
                    openOverlay('alert-builder', {
                      assetSymbol: symbol,
                      assetName: chartDetailAssetName,
                      prefillValue: crosshairPrice,
                      prefillDescription: `Giá chạm ${crosshairPrice.toFixed(2)}`,
                    })
                  }
                }}>
                  <Bell className="size-4 mr-2" />
                  Đặt cảnh báo @ {crosshairPrice ? formatCurrency(crosshairPrice, assetType) : '...'}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => {
                  if (crosshairPrice !== null) {
                    const newDrawing: ChartDrawing = {
                      id: `hline-${Date.now()}`,
                      type: 'hline',
                      color: 'oklch(0.75 0.15 80)',
                      width: 2,
                      points: [{ index: 0, price: crosshairPrice }],
                    }
                    setDrawings((prev) => [...prev, newDrawing])
                  }
                }}>
                  <Minus className="size-4 mr-2" />
                  Vẽ đường ngang @ {crosshairPrice ? formatCurrency(crosshairPrice, assetType) : '...'}
                </ContextMenuItem>
                {drawings.length > 0 && (
                  <ContextMenuItem onClick={clearDrawings} className="text-destructive">
                    <Trash2 className="size-4 mr-2" />
                    Xóa tất cả đường vẽ
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>

        {/* ===== Bottom Info Bar ===== */}
        <div className="shrink-0 px-3 sm:px-4 md:px-6 py-3 bg-card border-t">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap">
              <span>⚠️ Kéo / cuộn để di chuyển biểu đồ</span>
              <span>🔍 Cuộn chuột để zoom</span>
              <span>✏️ Chọn công cụ để vẽ lên biểu đồ</span>
              <span>🔔 Nhấp phải để đặt cảnh báo từ đường vẽ</span>
            </div>
            <div className="flex items-center gap-2">
              {detail && (
                <>
                  <span>
                    RSI(14):{' '}
                    <strong className={cn(
                      detail.technicalIndicators.rsi > 70 ? 'text-loss' : detail.technicalIndicators.rsi < 30 ? 'text-gain' : 'text-foreground'
                    )}>
                      {detail.technicalIndicators.rsi.toFixed(1)}
                    </strong>
                  </span>
                  <span>
                    MA20:{' '}
                    <strong className="text-foreground">{formatNumber(detail.technicalIndicators.ma20)}</strong>
                  </span>
                  <span>
                    MA50:{' '}
                    <strong className="text-foreground">{formatNumber(detail.technicalIndicators.ma50)}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Drawings list */}
          {drawings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {drawings.map((drawing, idx) => (
                <div
                  key={drawing.id}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs bg-card"
                >
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: drawing.color }}
                  />
                  <span className="font-medium">
                    {drawing.type === 'hline' && `Đường ngang ${drawing.points[0]?.price.toFixed(2)}`}
                    {drawing.type === 'trendline' && 'Đường xu hướng'}
                    {drawing.type === 'fibonacci' && 'Fibonacci'}
                    {drawing.type === 'rectangle' && 'Vùng giá'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleDrawingClick(drawing)}
                  >
                    <Bell className="size-3 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setDrawings((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
