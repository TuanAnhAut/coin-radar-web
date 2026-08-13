'use client'

import { Component, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  Crosshair,
  Minus,
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
  Settings2,
  MousePointer2,
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
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format'
import { getAlertFromDrawing } from '@/lib/chart-utils'
import { ChartCanvas } from '@/components/chart/chart-canvas'
import { cn } from '@/lib/utils'
import type { OHLCData, AssetDetail } from '@/lib/types'
import type { DrawingTool, ChartDrawing, IndicatorConfig } from '@/lib/chart-types'

// Error boundary wrapper
class ChartErrorBoundary extends Component<
  { children: React.ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-muted/30 p-8">
          <p className="text-sm text-muted-foreground">Lỗi hiển thị biểu đồ</p>
          <button
            onClick={() => { this.setState({ hasError: false }); this.props.onReset() }}
            className="text-xs text-primary underline"
          >
            Thử lại
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function ChartCanvasWrapper(props: React.ComponentProps<typeof ChartCanvas>) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <ChartErrorBoundary onReset={() => setResetKey((k) => k + 1)} key={resetKey}>
      <ChartCanvas {...props} />
    </ChartErrorBoundary>
  )
}

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
const PERIOD_DAYS: Record<TimePeriod, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: 9999 }

const IND_COLORS = { rsi: '#7e57c2', ma20: '#f7a21b', ma50: '#2196f3', ma100: '#ab47bc', macd: '#2196f3' }

const DEFAULT_INDICATORS: IndicatorConfig[] = [
  { type: 'ma20', enabled: true, color: '#f7a21b' },
  { type: 'ma50', enabled: true, color: '#2196f3' },
  { type: 'ma100', enabled: false, color: '#ab47bc' },
  { type: 'bb', enabled: false, color: '#828cb4' },
  { type: 'rsi', enabled: true, color: '#7e57c2' },
  { type: 'macd', enabled: false, color: '#2196f3' },
  { type: 'volume', enabled: true, color: '#26a69a' },
]

const IND_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ma20: { label: 'MA20', icon: <LineChart className="size-3.5" />, color: '#f7a21b' },
  ma50: { label: 'MA50', icon: <LineChart className="size-3.5" />, color: '#2196f3' },
  ma100: { label: 'MA100', icon: <LineChart className="size-3.5" />, color: '#ab47bc' },
  bb: { label: 'Bollinger', icon: <BarChart3 className="size-3.5" />, color: '#828cb4' },
  rsi: { label: 'RSI(14)', icon: <Activity className="size-3.5" />, color: '#7e57c2' },
  macd: { label: 'MACD', icon: <Ruler className="size-3.5" />, color: '#2196f3' },
  volume: { label: 'Vol', icon: <BarChart3 className="size-3.5" />, color: '#666' },
}

export function ChartDetailView() {
  const { chartDetailSymbol, chartDetailAssetName, chartDetailAssetType, closeChartDetail, openOverlay } = useAppStore()
  const symbol = chartDetailSymbol ?? ''
  const isOpen = !!symbol

  const [detail, setDetail] = useState<AssetDetail | null>(null)
  const [period, setPeriod] = useState<TimePeriod>('3M')
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair')
  const [drawings, setDrawings] = useState<ChartDrawing[]>([])
  const [indicators, setIndicators] = useState<IndicatorConfig[]>(DEFAULT_INDICATORS)
  const [showIndicators, setShowIndicators] = useState(false)
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null)
  const [crosshairCandle, setCrosshairCandle] = useState<OHLCData | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ width: 800, height: 400 })

  useEffect(() => {
    if (!isOpen || !symbol) return
    fetch(`/api/assets/${symbol}`)
      .then((r) => r.json())
      .then((res) => setDetail(res.data ?? null))
      .catch(() => setDetail(null))
  }, [isOpen, symbol])

  useEffect(() => {
    const measure = () => {
      if (chartRef.current) {
        const { width, height } = chartRef.current.getBoundingClientRect()
        setChartSize({ width, height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showIndicators])

  const filteredData = useMemo(() => {
    if (!detail) return []
    const days = PERIOD_DAYS[period]
    if (days >= detail.priceHistory.length) return detail.priceHistory
    return detail.priceHistory.slice(-days)
  }, [detail, period])

  const tools: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { id: 'crosshair', icon: <Crosshair className="size-3.5" />, label: 'Crosshair' },
    { id: 'hline', icon: <Minus className="size-3.5" />, label: 'Đường ngang' },
    { id: 'trendline', icon: <TrendingUp className="size-3.5" />, label: 'Đường xu hướng' },
    { id: 'fibonacci', icon: <GitBranch className="size-3.5" />, label: 'Fibonacci' },
    { id: 'rectangle', icon: <Square className="size-3.5" />, label: 'Vùng giá' },
  ]

  const handleDrawingClick = useCallback((drawing: ChartDrawing) => {
    const info = getAlertFromDrawing(drawing, symbol, chartDetailAssetName ?? '')
    if (info) openOverlay('alert-builder', { assetSymbol: symbol, assetName: chartDetailAssetName, prefillCondition: info.condition, prefillValue: info.value, prefillDescription: info.conditionDescription })
  }, [symbol, chartDetailAssetName, openOverlay])

  const toggleIndicator = useCallback((type: string) => {
    setIndicators((prev) => prev.map((ind) => (ind.type === type ? { ...ind, enabled: !ind.enabled } : ind)))
  }, [])

  const clearDrawings = useCallback(() => setDrawings([]), [])

  const setAlertFromPrice = useCallback(() => {
    if (crosshairPrice === null) return
    openOverlay('alert-builder', { assetSymbol: symbol, assetName: chartDetailAssetName, prefillValue: crosshairPrice, prefillDescription: `Giá chạm ${crosshairPrice.toFixed(2)}` })
  }, [crosshairPrice, symbol, chartDetailAssetName, openOverlay])

  if (!isOpen) return null

  const isPositive = (detail?.change24h ?? 0) >= 0
  const assetType = chartDetailAssetType as 'stock' | 'crypto' | 'gold'
  const lastCandle = detail?.priceHistory[detail.priceHistory.length - 1]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col -mx-3 sm:-mx-4 md:-mx-6"
        style={{ height: 'calc(100vh - 5rem)', minHeight: 'calc(100vh - 5rem)' }}
      >
        {/* ===== Header ===== */}
        <div className="shrink-0 border-b bg-card/80 backdrop-blur-sm">
          <div className="px-3 sm:px-4 md:px-6 py-2 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => closeChartDetail()}>
              <ArrowLeft className="size-4" />
            </Button>

            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-base font-bold truncate">{symbol}</h2>
              <Badge variant="outline" className="text-[10px] shrink-0 font-normal px-1.5">
                {assetType === 'stock' ? 'CK' : assetType === 'crypto' ? 'Crypto' : 'Vàng'}
              </Badge>
              {detail && (
                <>
                  <span className="text-lg font-bold tabular-nums ml-1">{formatCurrency(detail.price, assetType)}</span>
                  <span className={cn('text-sm font-semibold', isPositive ? 'text-gain' : 'text-loss')}>
                    {formatPercent(detail.changePercent)}
                  </span>
                </>
              )}
            </div>

            <div className="flex-1" />

            {detail && lastCandle && (
              <div className="hidden lg:flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                <span>O <strong className="text-foreground">{formatNumber(lastCandle.open)}</strong></span>
                <span>H <strong className="text-foreground">{formatNumber(lastCandle.high)}</strong></span>
                <span>L <strong className="text-foreground">{formatNumber(lastCandle.low)}</strong></span>
                <span>C <strong className={cn(isPositive ? 'text-gain' : 'text-loss')}>{formatNumber(detail.price)}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1 shrink-0">
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openOverlay('watchlist')}><Layers className="size-3.5" /></Button>
              </TooltipTrigger><TooltipContent><p>Watchlist</p></TooltipContent></Tooltip>
              <Button size="sm" className="h-8 text-xs" onClick={() => openOverlay('alert-builder', { assetSymbol: symbol, assetName: chartDetailAssetName })}>
                <Bell className="size-3 mr-1" />
                <span className="hidden sm:inline">Cảnh báo</span>
              </Button>
            </div>
          </div>

          {/* Floating OHLC from crosshair */}
          {crosshairCandle && (
            <div className="px-3 sm:px-4 md:px-6 pb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
              <span className="text-foreground font-medium">{crosshairCandle.date}</span>
              <span>O <strong className="text-foreground">{formatNumber(crosshairCandle.open)}</strong></span>
              <span>H <strong className="text-foreground">{formatNumber(crosshairCandle.high)}</strong></span>
              <span>L <strong className="text-foreground">{formatNumber(crosshairCandle.low)}</strong></span>
              <span>C <strong className={cn(crosshairCandle.close >= crosshairCandle.open ? 'text-gain' : 'text-loss')}>{formatNumber(crosshairCandle.close)}</strong></span>
              <span>Vol <strong className="text-foreground">{formatNumber(crosshairCandle.volume)}</strong></span>
              <div className="flex-1" />
              {crosshairPrice !== null && (
                <button onClick={setAlertFromPrice} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-muted transition-colors">
                  <Bell className="size-3" />
                  <span className="text-foreground font-medium">{formatCurrency(crosshairPrice, assetType)}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== Toolbar ===== */}
        <div className="shrink-0 px-3 sm:px-4 md:px-6 py-1.5 border-b bg-card/60 backdrop-blur-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {/* Tools */}
            <div className="flex items-center bg-muted/60 rounded-md p-0.5 gap-px">
              {tools.map((tool) => (
                <Tooltip key={tool.id}><TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTool(tool.id)}
                    className={cn(
                      'flex items-center gap-1 rounded px-2 py-1.5 text-[11px] font-medium transition-all',
                      activeTool === tool.id
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tool.icon}
                    <span className="hidden md:inline">{tool.label}</span>
                  </button>
                </TooltipTrigger><TooltipContent><p>{tool.label}</p></TooltipContent></Tooltip>
              ))}
            </div>

            <Separator orientation="vertical" className="h-5 mx-0.5" />

            {/* Period */}
            <div className="flex items-center bg-muted/60 rounded-md p-0.5 gap-px">
              {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'rounded px-2 py-1.5 text-[11px] font-medium transition-all',
                    period === p ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >{p}</button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-5 mx-0.5" />

            {/* Indicators button */}
            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Settings2 className="size-3.5" />
              <span className="hidden md:inline">Chỉ báo</span>
              {showIndicators ? <ChevronUp className="size-2.5" /> : <ChevronDown className="size-2.5" />}
            </button>

            {/* Active indicator badges */}
            {indicators.filter((i) => i.enabled && i.type !== 'volume').length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {indicators.filter((i) => i.enabled && i.type !== 'volume').map((ind) => (
                  <Badge
                    key={ind.type}
                    variant="outline"
                    className="text-[9px] font-medium px-1.5 py-0 gap-1 cursor-pointer hover:bg-muted"
                    style={{ borderColor: IND_META[ind.type]?.color + '60', color: IND_META[ind.type]?.color }}
                    onClick={() => toggleIndicator(ind.type)}
                  >
                    <div className="size-1.5 rounded-full" style={{ backgroundColor: IND_META[ind.type]?.color }} />
                    {IND_META[ind.type]?.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Clear drawings */}
            {drawings.length > 0 && (
              <button onClick={clearDrawings} className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all">
                <Trash2 className="size-3" />
                <span className="hidden md:inline">{drawings.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* ===== Indicators Panel ===== */}
        <AnimatePresence>
          {showIndicators && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden shrink-0 border-b bg-card/60 backdrop-blur-sm">
              <div className="px-3 sm:px-4 md:px-6 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold">Chỉ báo kỹ thuật</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                  {indicators.map((ind) => {
                    const meta = IND_META[ind.type]
                    return (
                      <button
                        key={ind.type}
                        onClick={() => toggleIndicator(ind.type)}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-2.5 py-2 text-[11px] font-medium transition-all',
                          ind.enabled ? 'border-current/30 bg-current/5' : 'border-border text-muted-foreground hover:bg-muted/50'
                        )}
                        style={ind.enabled ? { color: meta?.color, borderColor: meta?.color + '30' } : undefined}
                      >
                        {meta?.icon}
                        <span>{meta?.label}</span>
                        {ind.enabled ? <Eye className="size-3 ml-auto opacity-60" /> : <EyeOff className="size-3 ml-auto opacity-30" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Chart ===== */}
        <div ref={chartRef} className="flex-1 min-h-0 relative bg-card">
          {!detail || filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full"><Skeleton className="h-64 w-full max-w-2xl rounded-lg" /></div>
          ) : (
            <ContextMenu>
              <ContextMenuTrigger className="block w-full h-full">
                <ChartCanvasWrapper
                  data={filteredData}
                  assetType={assetType}
                  width={chartSize.width}
                  height={chartSize.height}
                  activeTool={activeTool}
                  drawings={drawings}
                  onDrawingsChange={setDrawings}
                  indicators={indicators}
                  onCrosshairMove={(price, idx, candle) => {
                    setCrosshairPrice(price)
                    setCrosshairCandle(candle)
                  }}
                  onDrawingClick={handleDrawingClick}
                />
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => crosshairPrice !== null && setAlertFromPrice()}>
                  <Bell className="size-4 mr-2" />
                  Đặt cảnh báo @ {crosshairPrice ? formatCurrency(crosshairPrice, assetType) : '...'}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => {
                  if (crosshairPrice !== null) {
                    setDrawings((prev) => [...prev, { id: `hl-${Date.now()}`, type: 'hline', color: '#f7a21b', width: 1.5, points: [{ index: 0, price: crosshairPrice }] }])
                  }
                }}>
                  <Minus className="size-4 mr-2" />
                  Đường ngang @ {crosshairPrice ? formatCurrency(crosshairPrice, assetType) : '...'}
                </ContextMenuItem>
                {drawings.length > 0 && (
                  <ContextMenuItem onClick={clearDrawings} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-4 mr-2" />Xóa tất cả
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>

        {/* ===== Footer Bar ===== */}
        <div className="shrink-0 border-t bg-card/80 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-1.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Indicator values */}
            <div className="flex items-center gap-3 text-[11px] tabular-nums overflow-x-auto scrollbar-none">
              {detail && (
                <>
                  <span className="flex items-center gap-1">
                    <div className="size-2 rounded-full" style={{ backgroundColor: IND_COLORS.rsi }} />
                    <span className="text-muted-foreground">RSI</span>
                    <strong className={cn(detail.technicalIndicators.rsi > 70 ? 'text-loss' : detail.technicalIndicators.rsi < 30 ? 'text-gain' : 'text-foreground')}>
                      {detail.technicalIndicators.rsi.toFixed(1)}
                    </strong>
                  </span>
                  {indicators.find((i) => i.type === 'ma20')?.enabled && (
                    <span className="flex items-center gap-1">
                      <div className="size-2 rounded-full" style={{ backgroundColor: IND_COLORS.ma20 }} />
                      <span className="text-muted-foreground">MA20</span>
                      <strong className="text-foreground">{formatNumber(detail.technicalIndicators.ma20)}</strong>
                    </span>
                  )}
                  {indicators.find((i) => i.type === 'ma50')?.enabled && (
                    <span className="flex items-center gap-1">
                      <div className="size-2 rounded-full" style={{ backgroundColor: IND_COLORS.ma50 }} />
                      <span className="text-muted-foreground">MA50</span>
                      <strong className="text-foreground">{formatNumber(detail.technicalIndicators.ma50)}</strong>
                    </span>
                  )}
                  {indicators.find((i) => i.type === 'ma100')?.enabled && (
                    <span className="flex items-center gap-1">
                      <div className="size-2 rounded-full" style={{ backgroundColor: IND_COLORS.ma100 }} />
                      <span className="text-muted-foreground">MA100</span>
                      <strong className="text-foreground">{formatNumber(detail.technicalIndicators.ma100)}</strong>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">MACD</span>
                    <strong className={detail.technicalIndicators.macd.histogram >= 0 ? 'text-gain' : 'text-loss'}>
                      {detail.technicalIndicators.macd.macd.toFixed(2)}
                    </strong>
                  </span>
                </>
              )}
            </div>

            {/* Right: Drawing pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              {drawings.slice(-3).map((drawing, idx) => (
                <div key={drawing.id} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-background">
                  <div className="size-1.5 rounded-full" style={{ backgroundColor: drawing.color }} />
                  <span className="max-w-[60px] truncate font-medium">
                    {drawing.type === 'hline' && drawing.points[0]?.price.toFixed(0)}
                    {drawing.type === 'trendline' && 'XH'}
                    {drawing.type === 'fibonacci' && 'Fib'}
                    {drawing.type === 'rectangle' && 'VG'}
                  </span>
                  <button onClick={() => handleDrawingClick(drawing)} className="hover:text-primary"><Bell className="size-2.5" /></button>
                </div>
              ))}
              {drawings.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{drawings.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
