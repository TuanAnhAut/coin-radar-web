'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import type { OHLCData } from '@/lib/types'
import type {
  DrawingTool,
  ChartDrawing,
  ActiveDrawing,
  IndicatorData,
  ChartLayout,
  ChartViewport,
  IndicatorConfig,
} from '@/lib/chart-types'
import {
  computeIndicators,
  computeViewport,
  computeLayout,
  priceToY,
  yToPrice,
  indexToX,
  xToIndex,
  formatChartPrice,
  formatPriceLabel,
  formatChartVolume,
  formatChartDate,
  fibonacciLevels,
  FIB_LABELS,
  FIB_ZONE_COLORS,
  FIB_LINE_COLORS,
  niceStep,
  snapToPrice,
  colorWithAlpha,
} from '@/lib/chart-utils'
import { cn } from '@/lib/utils'

// ==================== Professional Color Palette (TradingView Dark) ====================

interface ThemeColors {
  bg: string
  grid: string
  gridLight: string
  text: string
  textDim: string
  textMuted: string
  border: string
  crossBg: string
  crossText: string
  gain: string
  loss: string
  gainSoft: string
  lossSoft: string
  panelBg: string
  separatorColor: string
}

const THEME_DARK: ThemeColors = {
  bg: '#131722',
  grid: 'rgba(42, 46, 57, 0.45)',
  gridLight: 'rgba(42, 46, 57, 0.2)',
  text: 'rgba(178, 186, 194, 0.9)',
  textDim: 'rgba(178, 186, 194, 0.55)',
  textMuted: 'rgba(178, 186, 194, 0.35)',
  border: 'rgba(42, 46, 57, 0.7)',
  crossBg: '#2a2e39',
  crossText: '#d1d4dc',
  gain: '#26a69a',
  loss: '#ef5350',
  gainSoft: 'rgba(38, 166, 154, 0.22)',
  lossSoft: 'rgba(239, 83, 80, 0.22)',
  panelBg: 'rgba(19, 23, 34, 0.9)',
  separatorColor: 'rgba(42, 46, 57, 0.6)',
}

const THEME_LIGHT: ThemeColors = {
  bg: '#ffffff',
  grid: 'rgba(209, 212, 218, 0.5)',
  gridLight: 'rgba(209, 212, 218, 0.25)',
  text: 'rgba(54, 60, 72, 0.9)',
  textDim: 'rgba(54, 60, 72, 0.55)',
  textMuted: 'rgba(54, 60, 72, 0.35)',
  border: 'rgba(209, 212, 218, 0.8)',
  crossBg: '#f0f3fa',
  crossText: '#333',
  gain: '#089981',
  loss: '#f23645',
  gainSoft: 'rgba(8, 153, 129, 0.12)',
  lossSoft: 'rgba(242, 54, 69, 0.12)',
  panelBg: 'rgba(255, 255, 255, 0.92)',
  separatorColor: 'rgba(209, 212, 218, 0.6)',
}

const themeRef = { current: THEME_DARK }

function getTheme(): ThemeColors {
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  return dark ? THEME_DARK : THEME_LIGHT
}

// Indicator colors
const IND_COLORS = {
  ma20: '#f7a21b',
  ma50: '#2196f3',
  ma100: '#ab47bc',
  bbLine: 'rgba(130, 140, 180, 0.4)',
  bbFill: 'rgba(130, 140, 180, 0.05)',
  bbFillStrong: 'rgba(130, 140, 180, 0.08)',
  rsi: '#7e57c2',
  rsiFill: 'rgba(126, 87, 194, 0.15)',
  macdLine: '#2196f3',
  macdSignal: '#ff6d00',
  volGain: 'rgba(38, 166, 154, 0.4)',
  volGainGradient: 'rgba(38, 166, 154, 0.1)',
  volLoss: 'rgba(239, 83, 80, 0.4)',
  volLossGradient: 'rgba(239, 83, 80, 0.1)',
  histogramGain: 'rgba(38, 166, 154, 0.6)',
  histogramGainWeak: 'rgba(38, 166, 154, 0.25)',
  histogramLoss: 'rgba(239, 83, 80, 0.6)',
  histogramLossWeak: 'rgba(239, 83, 80, 0.25)',
}

const DRAW_COLORS = ['#f7a21b', '#7e57c2', '#2196f3', '#ef5350', '#ff6d00', '#26a69a']

// ==================== Canvas Props ====================

interface ChartCanvasProps {
  data: OHLCData[]
  assetType?: string
  width: number
  height: number
  activeTool: DrawingTool
  drawings: ChartDrawing[]
  onDrawingsChange: (drawings: ChartDrawing[]) => void
  indicators: IndicatorConfig[]
  onCrosshairMove?: (price: number | null, index: number | null, candle: OHLCData | null) => void
  onDrawingClick?: (drawing: ChartDrawing) => void
}

export function ChartCanvas({
  data,
  assetType,
  width,
  height,
  activeTool,
  drawings,
  onDrawingsChange,
  indicators,
  onCrosshairMove,
  onDrawingClick,
}: ChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const dragRef = useRef<ActiveDrawing | null>(null)
  const panRef = useRef<{ startX: number; startOffset: number } | null>(null)
  const animRef = useRef<number>(0)

  const [visibleStart, setVisibleStart] = useState(() => Math.max(0, data.length - 80))
  const [visibleEnd, setVisibleEnd] = useState(() => data.length - 1)
  const [colorIdx, setColorIdx] = useState(0)

  // Listen for theme changes
  useEffect(() => {
    themeRef.current = getTheme()
    const obs = new MutationObserver(() => { themeRef.current = getTheme(); render() })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const indicatorData = useMemo(() => computeIndicators(data), [data])

  const rsiEnabled = indicators.some((i) => i.type === 'rsi' && i.enabled)
  const macdEnabled = indicators.some((i) => i.type === 'macd' && i.enabled)
  const bbEnabled = indicators.some((i) => i.type === 'bb' && i.enabled)
  const volEnabled = indicators.some((i) => i.type === 'volume' && i.enabled)

  const layout = useMemo(
    () => computeLayout(width, height, rsiEnabled, macdEnabled, dpr),
    [width, height, rsiEnabled, macdEnabled]
  )

  const viewport = useMemo(
    () => computeViewport(data, visibleStart, visibleEnd, indicatorData),
    [data, visibleStart, visibleEnd, indicatorData]
  )

  // ==================== Master Render ====================

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const w = width * dpr
    const h = height * dpr
    ctx.clearRect(0, 0, w, h)

    // DPR scaling
    ctx.save()
    ctx.scale(dpr, dpr)

    // Set default line rendering quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Background
    ctx.fillStyle = themeRef.current.bg
    ctx.fillRect(0, 0, width, height)

    // Grid
    drawGrid(ctx, viewport, layout)

    // Volume
    if (volEnabled) drawVolume(ctx, data, viewport, layout)

    // Candles
    drawCandles(ctx, data, viewport, layout)

    // Overlay indicators
    drawOverlays(ctx, indicatorData, viewport, layout, bbEnabled)

    // Sub-indicators
    if (rsiEnabled && layout.rsiTop != null && layout.rsiBottom != null)
      drawRSI(ctx, indicatorData, viewport, layout)
    if (macdEnabled && layout.macdTop != null && layout.macdBottom != null)
      drawMACD(ctx, indicatorData, viewport, layout)

    // Separator lines for sub-charts
    drawSeparators(ctx, layout)

    // Drawings
    renderDrawings(ctx, drawings, viewport, layout)

    // Active preview
    if (dragRef.current) renderPreview(ctx, dragRef.current, viewport, layout)

    // Crosshair + floating info panel
    if (mouseRef.current && !dragRef.current && !panRef.current) {
      drawCrosshair(ctx, mouseRef.current, viewport, layout)
      drawInfoPanel(ctx, mouseRef.current, viewport, layout, data)
    }

    // Price axis labels
    drawPriceAxis(ctx, viewport, layout)

    // Time axis labels
    drawTimeAxis(ctx, data, viewport, layout)

    // Last price marker
    drawLastPriceMarker(ctx, data, viewport, layout)

    ctx.restore()
  }, [data, width, height, dpr, viewport, layout, indicatorData, drawings, rsiEnabled, macdEnabled, bbEnabled, volEnabled])

  useEffect(() => {
    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  // Resize
  useEffect(() => {
    let rafId = 0
    const onResize = () => { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(render) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(rafId) }
  }, [render])

  // ==================== Input Handlers ====================

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0] || e.changedTouches[0]
      return t ? { x: t.clientX - rect.left, y: t.clientY - rect.top } : null
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    if (!pos) return

    // Middle-click or alt+click = pan
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      panRef.current = { startX: pos.x, startOffset: visibleEnd - visibleStart }
      return
    }

    if (activeTool !== 'crosshair' && pos.x < layout.chartRight) {
      const idx = xToIndex(pos.x, viewport, layout)
      const rawPrice = yToPrice(pos.y, viewport, layout)
      // Snap to nice price for horizontal lines
      const price = activeTool === 'hline' ? snapToPrice(rawPrice, viewport.maxPrice - viewport.minPrice) : rawPrice
      dragRef.current = {
        type: activeTool,
        startScreen: pos,
        currentScreen: pos,
        startData: { index: idx, price },
        currentData: { index: idx, price },
      }
    }
  }, [activeTool, viewport, layout, getPos, visibleStart, visibleEnd])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    if (!pos) return
    mouseRef.current = pos

    if (panRef.current) {
      const dx = pos.x - panRef.current.startX
      const cpi = (visibleEnd - visibleStart) / (layout.chartRight - layout.chartLeft)
      const shift = Math.round(-dx * cpi)
      let ns = Math.max(0, visibleStart + shift)
      let ne = ns + panRef.current.startOffset
      if (ne >= data.length) { ne = data.length - 1; ns = Math.max(0, ne - panRef.current.startOffset) }
      setVisibleStart(ns); setVisibleEnd(ne)
      return
    }

    if (dragRef.current) {
      const idx = xToIndex(pos.x, viewport, layout)
      const rawPrice = yToPrice(pos.y, viewport, layout)
      const price = dragRef.current.type === 'hline' ? snapToPrice(rawPrice, viewport.maxPrice - viewport.minPrice) : rawPrice
      dragRef.current = {
        ...dragRef.current,
        currentScreen: pos,
        currentData: { index: idx, price },
      }
      render(); return
    }

    if (onCrosshairMove && pos.x < layout.chartRight && pos.y < layout.chartBottom) {
      const idx = xToIndex(pos.x, viewport, layout)
      const price = yToPrice(pos.y, viewport, layout)
      const candle = data[idx] ?? null
      onCrosshairMove(price, idx, candle)
    }
    render()
  }, [viewport, layout, getPos, render, onCrosshairMove, data, visibleStart, visibleEnd])

  const onMouseUp = useCallback(() => {
    if (panRef.current) { panRef.current = null; return }
    if (dragRef.current) { finalizeDrawing(); dragRef.current = null; render() }
  }, [render])

  const onMouseLeave = useCallback(() => {
    mouseRef.current = null
    if (panRef.current) panRef.current = null
    if (dragRef.current) { finalizeDrawing(); dragRef.current = null }
    render()
    onCrosshairMove?.(null, null, null)
  }, [render, onCrosshairMove])

  // Touch
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const pos = getPos(e)
    if (!pos) return
    mouseRef.current = pos
    if (activeTool !== 'crosshair' && pos.x < layout.chartRight) {
      const idx = xToIndex(pos.x, viewport, layout)
      const rawPrice = yToPrice(pos.y, viewport, layout)
      const price = activeTool === 'hline' ? snapToPrice(rawPrice, viewport.maxPrice - viewport.minPrice) : rawPrice
      dragRef.current = { type: activeTool, startScreen: pos, currentScreen: pos, startData: { index: idx, price }, currentData: { index: idx, price } }
    } else {
      panRef.current = { startX: pos.x, startOffset: visibleEnd - visibleStart }
    }
  }, [activeTool, viewport, layout, getPos, visibleStart, visibleEnd])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    mouseRef.current = pos
    if (panRef.current && !dragRef.current) {
      const dx = pos.x - panRef.current.startX
      const cpi = (visibleEnd - visibleStart) / (layout.chartRight - layout.chartLeft)
      const shift = Math.round(-dx * cpi)
      let ns = Math.max(0, visibleStart + shift)
      let ne = ns + panRef.current.startOffset
      if (ne >= data.length) { ne = data.length - 1; ns = Math.max(0, ne - panRef.current.startOffset) }
      setVisibleStart(ns); setVisibleEnd(ne)
    } else if (dragRef.current) {
      const idx = xToIndex(pos.x, viewport, layout)
      const rawPrice = yToPrice(pos.y, viewport, layout)
      const price = dragRef.current.type === 'hline' ? snapToPrice(rawPrice, viewport.maxPrice - viewport.minPrice) : rawPrice
      dragRef.current = {
        ...dragRef.current,
        currentScreen: pos,
        currentData: { index: idx, price },
      }
    }
    render()
  }, [viewport, layout, getPos, render, visibleStart, visibleEnd])

  const onTouchEnd = useCallback(() => {
    mouseRef.current = null
    if (panRef.current) panRef.current = null
    if (dragRef.current) { finalizeDrawing(); dragRef.current = null }
    render()
  }, [render])

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.12 : 0.89
    const range = visibleEnd - visibleStart
    const newRange = Math.round(Math.max(15, Math.min(data.length - 1, range * factor)))
    const center = Math.round((visibleStart + visibleEnd) / 2)
    let ns = Math.max(0, center - Math.round(newRange / 2))
    let ne = ns + newRange - 1
    if (ne >= data.length) { ne = data.length - 1; ns = Math.max(0, ne - newRange + 1) }
    setVisibleStart(ns); setVisibleEnd(ne)
  }, [visibleStart, visibleEnd, data.length])

  // Context menu → alert
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    if (!pos) return
    for (const d of drawings) {
      if (d.type === 'hline' && d.points.length > 0) {
        const ly = priceToY(d.points[0].price, viewport, layout)
        if (Math.abs(pos.y - ly) < 12 && pos.x < layout.chartRight) { e.preventDefault(); onDrawingClick?.(d); return }
      }
      if (d.type === 'trendline' && d.points.length >= 2) {
        const x1 = indexToX(d.points[0].index, viewport, layout), y1 = priceToY(d.points[0].price, viewport, layout)
        const x2 = indexToX(d.points[1].index, viewport, layout), y2 = priceToY(d.points[1].price, viewport, layout)
        if (ptLineDist(pos.x, pos.y, x1, y1, x2, y2) < 14) { e.preventDefault(); onDrawingClick?.(d); return }
      }
    }
  }, [drawings, viewport, layout, getPos, onDrawingClick])

  // Double-click delete
  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    if (!pos) return
    for (let i = drawings.length - 1; i >= 0; i--) {
      const d = drawings[i]
      if (d.type === 'hline' && d.points.length > 0) {
        if (Math.abs(priceToY(d.points[0].price, viewport, layout) - pos.y) < 12 && pos.x < layout.chartRight)
          { onDrawingsChange(drawings.filter((_, j) => j !== i)); return }
      }
      if (d.type === 'trendline' && d.points.length >= 2) {
        const x1 = indexToX(d.points[0].index, viewport, layout), y1 = priceToY(d.points[0].price, viewport, layout)
        const x2 = indexToX(d.points[1].index, viewport, layout), y2 = priceToY(d.points[1].price, viewport, layout)
        if (ptLineDist(pos.x, pos.y, x1, y1, x2, y2) < 14)
          { onDrawingsChange(drawings.filter((_, j) => j !== i)); return }
      }
      if (d.type === 'fibonacci' && d.points.length >= 2) {
        const lx1 = Math.min(indexToX(d.points[0].index, viewport, layout), indexToX(d.points[1].index, viewport, layout))
        const lx2 = Math.max(indexToX(d.points[0].index, viewport, layout), indexToX(d.points[1].index, viewport, layout))
        if (pos.x >= lx1 && pos.x <= lx2) { onDrawingsChange(drawings.filter((_, j) => j !== i)); return }
      }
      if (d.type === 'rectangle' && d.points.length >= 2) {
        const rx1 = Math.min(indexToX(d.points[0].index, viewport, layout), indexToX(d.points[1].index, viewport, layout))
        const rx2 = Math.max(indexToX(d.points[0].index, viewport, layout), indexToX(d.points[1].index, viewport, layout))
        const ry1 = Math.min(priceToY(d.points[0].price, viewport, layout), priceToY(d.points[1].price, viewport, layout))
        const ry2 = Math.max(priceToY(d.points[0].price, viewport, layout), priceToY(d.points[1].price, viewport, layout))
        if (pos.x >= rx1 && pos.x <= rx2 && pos.y >= ry1 && pos.y <= ry2)
          { onDrawingsChange(drawings.filter((_, j) => j !== i)); return }
      }
    }
  }, [drawings, viewport, layout, getPos, onDrawingsChange])

  const finalizeDrawing = useCallback(() => {
    if (!dragRef.current?.startData || !dragRef.current?.currentData) return
    const { type, startData, currentData } = dragRef.current
    const color = DRAW_COLORS[colorIdx % DRAW_COLORS.length]
    const nd: ChartDrawing = { id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, color, width: 1.5, points: [startData, currentData] }
    if (type === 'hline') nd.points = [startData]
    if (type === 'fibonacci' && startData && currentData) {
      nd.fibLevels = fibonacciLevels(Math.max(startData.price, currentData.price), Math.min(startData.price, currentData.price))
    }
    onDrawingsChange([...drawings, nd])
    setColorIdx((c) => c + 1)
  }, [drawings, colorIdx, onDrawingsChange])

  return (
    <div className="relative w-full h-full no-select" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width * dpr}
        height={height * dpr}
        style={{ width, height }}
        className={cn(
          'block touch-none',
          activeTool === 'crosshair' ? 'cursor-crosshair' : 'cursor-cell'
        )}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </div>
  )
}

// ==================== DRAWING FUNCTIONS ====================

function drawGrid(ctx: CanvasRenderingContext2D, vp: ChartViewport, layout: ChartLayout) {
  const { chartTop, chartBottom, chartRight, volumeHeight } = layout
  const priceBottom = chartBottom - volumeHeight
  const priceRange = vp.maxPrice - vp.minPrice
  const step = niceStep(priceRange, 6)
  const T = themeRef.current

  // Horizontal price grid
  ctx.save()
  let price = Math.ceil(vp.minPrice / step) * step
  while (price <= vp.maxPrice) {
    const y = priceToY(price, vp, layout)
    if (y >= chartTop && y <= priceBottom) {
      // Use lighter grid for center, stronger for edges
      const distFromCenter = Math.abs(y - (chartTop + priceBottom) / 2) / ((priceBottom - chartTop) / 2)
      const alpha = 0.12 + distFromCenter * 0.08
      ctx.strokeStyle = T.border.replace(/[\d.]+\)$/, `${alpha})`)
      ctx.lineWidth = 0.5
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(layout.chartLeft, Math.round(y) + 0.5)
      ctx.lineTo(chartRight, Math.round(y) + 0.5)
      ctx.stroke()
    }
    price += step
  }

  // Vertical time grid — subtler
  const total = vp.endIndex - vp.startIndex + 1
  const stepC = Math.max(1, Math.round(total / 8))
  for (let i = vp.startIndex; i <= vp.endIndex; i += stepC) {
    const x = Math.round(indexToX(i, vp, layout)) + 0.5
    ctx.strokeStyle = T.gridLight
    ctx.lineWidth = 0.5
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(x, chartTop)
    ctx.lineTo(x, priceBottom)
    ctx.stroke()
  }

  // Chart right border
  ctx.strokeStyle = T.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(Math.round(chartRight) + 0.5, chartTop)
  ctx.lineTo(Math.round(chartRight) + 0.5, chartBottom)
  ctx.stroke()

  ctx.restore()
}

// ==================== Candlestick Rendering ====================

function drawCandles(ctx: CanvasRenderingContext2D, data: OHLCData[], vp: ChartViewport, layout: ChartLayout) {
  const { chartRight, chartBottom, volumeHeight } = layout
  const priceBottom = chartBottom - volumeHeight
  const total = vp.endIndex - vp.startIndex + 1
  const chartW = chartRight - layout.chartLeft
  const slotW = chartW / total
  const bodyW = Math.max(2, slotW * 0.7)
  const wickW = Math.max(1, slotW * 0.12)
  const T = themeRef.current

  ctx.save()

  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const c = data[i]
    if (!c) continue
    const x = indexToX(i, vp, layout)
    const green = c.close >= c.open

    const openY = priceToY(c.open, vp, layout)
    const closeY = priceToY(c.close, vp, layout)
    const highY = priceToY(c.high, vp, layout)
    const lowY = priceToY(c.low, vp, layout)

    const bodyTop = Math.min(openY, closeY)
    const bodyBot = Math.max(openY, closeY)
    const bodyH = Math.max(1, bodyBot - bodyTop)

    // Wick — thin line with round caps for professional look
    ctx.lineCap = 'round'
    ctx.strokeStyle = green ? T.gain : T.loss
    ctx.lineWidth = wickW
    ctx.beginPath()
    ctx.moveTo(x, highY)
    ctx.lineTo(x, lowY)
    ctx.stroke()

    // Body — filled rectangle with subtle gradient
    if (green) {
      // Bullish: solid fill with slight gradient
      const grad = ctx.createLinearGradient(0, bodyTop, 0, bodyBot)
      grad.addColorStop(0, T.gain)
      grad.addColorStop(1, colorWithAlpha(T.gain, 0.85))
      ctx.fillStyle = grad
    } else {
      // Bearish: solid fill
      const grad = ctx.createLinearGradient(0, bodyTop, 0, bodyBot)
      grad.addColorStop(0, colorWithAlpha(T.loss, 0.85))
      grad.addColorStop(1, T.loss)
      ctx.fillStyle = grad
    }

    // Draw body with slightly rounded corners for larger candles
    const r = bodyH > 6 ? Math.min(2, bodyW / 4) : 0
    if (r > 0) {
      roundedRect(ctx, x - bodyW / 2, bodyTop, bodyW, bodyH, r)
      ctx.fill()
    } else {
      ctx.fillRect(x - bodyW / 2, Math.round(bodyTop), bodyW, Math.round(bodyH))
    }

    // Subtle border on body for crispness
    if (bodyH > 3 && slotW > 4) {
      ctx.strokeStyle = colorWithAlpha(green ? T.gain : T.loss, 0.3)
      ctx.lineWidth = 0.5
      ctx.strokeRect(x - bodyW / 2, Math.round(bodyTop), bodyW, Math.round(bodyH))
    }
  }

  // Last candle glow effect
  const lastCandle = data[vp.endIndex]
  if (lastCandle) {
    const x = indexToX(vp.endIndex, vp, layout)
    const green = lastCandle.close >= lastCandle.open
    ctx.shadowColor = green ? T.gain : T.loss
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const bodyTop = Math.min(priceToY(lastCandle.open, vp, layout), priceToY(lastCandle.close, vp, layout))
    const bodyH = Math.max(1, Math.abs(priceToY(lastCandle.open, vp, layout) - priceToY(lastCandle.close, vp, layout)))
    ctx.fillStyle = green ? T.gain : T.loss
    ctx.fillRect(x - bodyW / 2, bodyTop, bodyW, bodyH)

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }

  ctx.lineCap = 'butt'
  ctx.restore()
}

// ==================== Volume Rendering ====================

function drawVolume(ctx: CanvasRenderingContext2D, data: OHLCData[], vp: ChartViewport, layout: ChartLayout) {
  const { chartBottom, volumeHeight, chartRight } = layout
  const total = vp.endIndex - vp.startIndex + 1
  const chartW = chartRight - layout.chartLeft
  const slotW = chartW / total
  let maxVol = 0
  for (let i = vp.startIndex; i <= vp.endIndex; i++) maxVol = Math.max(maxVol, data[i].volume)
  if (maxVol === 0) return

  // Volume separator
  const volTop = chartBottom - volumeHeight
  ctx.strokeStyle = themeRef.current.gridLight
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(layout.chartLeft, Math.round(volTop) + 0.5)
  ctx.lineTo(chartRight, Math.round(volTop) + 0.5)
  ctx.stroke()

  ctx.save()
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const c = data[i]
    const x = indexToX(i, vp, layout)
    const green = c.close >= c.open
    const barH = (c.volume / maxVol) * volumeHeight * 0.88
    const bw = Math.max(1, slotW * 0.55)

    // Gradient fill — professional look
    const grad = ctx.createLinearGradient(0, chartBottom - barH, 0, chartBottom)
    if (green) {
      grad.addColorStop(0, IND_COLORS.volGain)
      grad.addColorStop(1, IND_COLORS.volGainGradient)
    } else {
      grad.addColorStop(0, IND_COLORS.volLoss)
      grad.addColorStop(1, IND_COLORS.volLossGradient)
    }
    ctx.fillStyle = grad

    // Rounded top for wider bars
    const r = bw > 3 ? 1 : 0
    if (r > 0) {
      roundedRect(ctx, x - bw / 2, chartBottom - barH, bw, barH, r)
      ctx.fill()
    } else {
      ctx.fillRect(x - bw / 2, chartBottom - barH, bw, barH)
    }
  }
  ctx.restore()
}

// ==================== Overlay Indicators ====================

function drawOverlays(ctx: CanvasRenderingContext2D, ind: IndicatorData, vp: ChartViewport, layout: ChartLayout, bb: boolean) {
  ctx.save()

  // MA lines — smooth with lineJoin round
  const maList = [
    { d: ind.ma20, color: IND_COLORS.ma20 },
    { d: ind.ma50, color: IND_COLORS.ma50 },
    { d: ind.ma100, color: IND_COLORS.ma100 },
  ]
  for (const ma of maList) {
    if (!ma.d) continue
    ctx.strokeStyle = ma.color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.globalAlpha = 0.9
    ctx.setLineDash([])
    ctx.beginPath()
    let started = false
    for (let i = vp.startIndex; i <= vp.endIndex; i++) {
      const v = ma.d[i]
      if (isNaN(v)) continue
      const x = indexToX(i, vp, layout)
      const y = priceToY(v, vp, layout)
      if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // Bollinger Bands
  if (bb && ind.bbUpper && ind.bbLower) {
    // Fill between bands
    ctx.fillStyle = IND_COLORS.bbFill
    ctx.beginPath()
    let s = false
    for (let i = vp.startIndex; i <= vp.endIndex; i++) {
      const v = ind.bbUpper[i]; if (isNaN(v)) continue
      const x = indexToX(i, vp, layout)
      const y = priceToY(v, vp, layout)
      if (!s) { ctx.moveTo(x, y); s = true } else ctx.lineTo(x, y)
    }
    // Close path via lower band
    for (let i = vp.endIndex; i >= vp.startIndex; i--) {
      const v = ind.bbLower[i]; if (isNaN(v)) continue
      ctx.lineTo(indexToX(i, vp, layout), priceToY(v, vp, layout))
    }
    ctx.closePath()
    ctx.fill()

    // Band lines — dashed, subtle
    const bbLines = [ind.bbUpper, ind.bbMiddle, ind.bbLower]
    for (const line of bbLines) {
      if (!line) continue
      ctx.strokeStyle = IND_COLORS.bbLine
      ctx.lineWidth = 0.8
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      s = false
      for (let i = vp.startIndex; i <= vp.endIndex; i++) {
        const v = line[i]; if (isNaN(v)) continue
        const x = indexToX(i, vp, layout), y = priceToY(v, vp, layout)
        if (!s) { ctx.moveTo(x, y); s = true } else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  ctx.restore()
}

// ==================== RSI Sub-Panel ====================

function drawRSI(ctx: CanvasRenderingContext2D, ind: IndicatorData, vp: ChartViewport, layout: ChartLayout) {
  if (!ind.rsi || layout.rsiTop == null || layout.rsiBottom == null) return
  const { rsiTop: t, rsiBottom: b } = layout
  const h = b - t
  const T = themeRef.current

  ctx.save()

  // Panel background
  ctx.fillStyle = T.panelBg
  ctx.fillRect(0, t, layout.chartRight, h)

  // Overbought zone (70-100)
  const ob70 = b - (70 / 100) * h
  const ob30 = b - (30 / 100) * h

  // Gradient fills for OB/OS zones
  const obGrad = ctx.createLinearGradient(0, t, 0, ob70)
  obGrad.addColorStop(0, 'rgba(239, 83, 80, 0.1)')
  obGrad.addColorStop(1, 'rgba(239, 83, 80, 0.02)')
  ctx.fillStyle = obGrad
  ctx.fillRect(0, t, layout.chartRight, ob70 - t)

  const osGrad = ctx.createLinearGradient(0, ob30, 0, b)
  osGrad.addColorStop(0, 'rgba(38, 166, 154, 0.02)')
  osGrad.addColorStop(1, 'rgba(38, 166, 154, 0.1)')
  ctx.fillStyle = osGrad
  ctx.fillRect(0, ob30, layout.chartRight, b - ob30)

  // 70/30 reference lines
  ctx.strokeStyle = 'rgba(239, 83, 80, 0.25)'
  ctx.lineWidth = 0.5
  ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.moveTo(0, Math.round(ob70) + 0.5); ctx.lineTo(layout.chartRight, Math.round(ob70) + 0.5); ctx.stroke()

  ctx.strokeStyle = 'rgba(38, 166, 154, 0.25)'
  ctx.beginPath(); ctx.moveTo(0, Math.round(ob30) + 0.5); ctx.lineTo(layout.chartRight, Math.round(ob30) + 0.5); ctx.stroke()

  // 50 center line
  const ob50 = b - 0.5 * h
  ctx.strokeStyle = T.gridLight
  ctx.setLineDash([2, 4])
  ctx.beginPath(); ctx.moveTo(0, Math.round(ob50) + 0.5); ctx.lineTo(layout.chartRight, Math.round(ob50) + 0.5); ctx.stroke()
  ctx.setLineDash([])

  // RSI line with gradient fill below
  ctx.strokeStyle = IND_COLORS.rsi
  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  let s = false
  const points: { x: number; y: number }[] = []
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const v = ind.rsi[i]; if (isNaN(v)) continue
    const x = indexToX(i, vp, layout)
    const y = b - (v / 100) * h
    points.push({ x, y })
    if (!s) { ctx.moveTo(x, y); s = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Fill below RSI line
  if (points.length > 1) {
    ctx.beginPath()
    ctx.moveTo(points[0].x, b)
    for (const p of points) ctx.lineTo(p.x, p.y)
    ctx.lineTo(points[points.length - 1].x, b)
    ctx.closePath()
    const fillGrad = ctx.createLinearGradient(0, t, 0, b)
    fillGrad.addColorStop(0, IND_COLORS.rsiFill)
    fillGrad.addColorStop(1, 'rgba(126, 87, 194, 0.02)')
    ctx.fillStyle = fillGrad
    ctx.fill()
  }

  // Labels
  ctx.fillStyle = T.textDim
  ctx.font = '600 10px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('RSI(14)', 6, t + 13)

  // Right side values
  ctx.textAlign = 'left'
  ctx.font = '10px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(239, 83, 80, 0.5)'
  ctx.fillText('70', layout.chartRight + 4, ob70 + 3)
  ctx.fillStyle = 'rgba(38, 166, 154, 0.5)'
  ctx.fillText('30', layout.chartRight + 4, ob30 + 3)
  ctx.fillStyle = T.textMuted
  ctx.fillText('50', layout.chartRight + 4, ob50 + 3)

  ctx.restore()
}

// ==================== MACD Sub-Panel ====================

function drawMACD(ctx: CanvasRenderingContext2D, ind: IndicatorData, vp: ChartViewport, layout: ChartLayout) {
  if (!ind.macdLine || layout.macdTop == null || layout.macdBottom == null) return
  const { macdTop: t, macdBottom: b } = layout
  const h = b - t
  const T = themeRef.current

  ctx.save()

  // Panel background
  ctx.fillStyle = T.panelBg
  ctx.fillRect(0, t, layout.chartRight, h)

  // Calculate range
  let mn = Infinity, mx = -Infinity
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    for (const arr of [ind.macdLine, ind.macdSignal]) {
      const v = arr[i]; if (!isNaN(v)) { mn = Math.min(mn, v); mx = Math.max(mx, v) }
    }
  }
  const pad = (mx - mn) * 0.1 || 0.01; mn -= pad; mx += pad
  const toY = (v: number) => b - ((v - mn) / (mx - mn)) * h

  // Zero line
  const zy = toY(0)
  ctx.strokeStyle = T.grid
  ctx.lineWidth = 0.5
  ctx.setLineDash([])
  ctx.beginPath(); ctx.moveTo(0, Math.round(zy) + 0.5); ctx.lineTo(layout.chartRight, Math.round(zy) + 0.5); ctx.stroke()

  const total = vp.endIndex - vp.startIndex + 1
  const slotW = (layout.chartRight - layout.chartLeft) / total
  const bw = Math.max(1, slotW * 0.5)

  // Histogram bars with gradient
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const v = ind.macdHistogram[i]; if (isNaN(v)) continue
    const x = indexToX(i, vp, layout)
    const y = toY(v)
    const barH = Math.abs(zy - y)

    const isStrong = Math.abs(v) > Math.abs(mn) * 0.3
    const grad = ctx.createLinearGradient(0, Math.min(y, zy), 0, Math.max(y, zy))
    if (v >= 0) {
      grad.addColorStop(0, isStrong ? IND_COLORS.histogramGain : IND_COLORS.histogramGainWeak)
      grad.addColorStop(1, isStrong ? IND_COLORS.histogramGainWeak : 'rgba(38,166,154,0.08)')
    } else {
      grad.addColorStop(0, isStrong ? 'rgba(239,83,80,0.08)' : IND_COLORS.histogramLossWeak)
      grad.addColorStop(1, isStrong ? IND_COLORS.histogramLossWeak : IND_COLORS.histogramLoss)
    }
    ctx.fillStyle = grad

    const r = barH > 4 && bw > 3 ? 1 : 0
    if (r > 0) {
      roundedRect(ctx, x - bw / 2, Math.min(y, zy), bw, barH, r)
      ctx.fill()
    } else {
      ctx.fillRect(Math.round(x - bw / 2), Math.round(Math.min(y, zy)), Math.round(bw), Math.round(barH))
    }
  }

  // MACD line
  ctx.strokeStyle = IND_COLORS.macdLine
  ctx.lineWidth = 1.3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.setLineDash([])
  ctx.beginPath()
  let started = false
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const v = ind.macdLine[i]; if (isNaN(v)) continue
    const x = indexToX(i, vp, layout), y = toY(v)
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Signal line — dashed
  ctx.strokeStyle = IND_COLORS.macdSignal
  ctx.lineWidth = 1.1
  ctx.setLineDash([4, 2])
  ctx.beginPath()
  started = false
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const v = ind.macdSignal[i]; if (isNaN(v)) continue
    const x = indexToX(i, vp, layout), y = toY(v)
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // Label
  ctx.fillStyle = T.textDim
  ctx.font = '600 10px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('MACD(12,26,9)', 6, t + 13)

  ctx.restore()
}

// ==================== Separator Lines ====================

function drawSeparators(ctx: CanvasRenderingContext2D, layout: ChartLayout) {
  const T = themeRef.current
  ctx.save()
  ctx.strokeStyle = T.separatorColor
  ctx.lineWidth = 1
  ctx.setLineDash([])

  if (layout.rsiTop != null) {
    ctx.beginPath()
    ctx.moveTo(0, Math.round(layout.rsiTop) + 0.5)
    ctx.lineTo(layout.chartRight, Math.round(layout.rsiTop) + 0.5)
    ctx.stroke()
  }
  if (layout.macdTop != null) {
    ctx.beginPath()
    ctx.moveTo(0, Math.round(layout.macdTop) + 0.5)
    ctx.lineTo(layout.chartRight, Math.round(layout.macdTop) + 0.5)
    ctx.stroke()
  }
  ctx.restore()
}

// ==================== Crosshair ====================

function drawCrosshair(ctx: CanvasRenderingContext2D, mouse: { x: number; y: number }, vp: ChartViewport, layout: ChartLayout) {
  if (mouse.x >= layout.chartRight || mouse.y >= layout.chartBottom) return
  const T = themeRef.current

  ctx.save()

  // Dotted crosshair lines — TradingView style
  ctx.strokeStyle = T.textDim
  ctx.lineWidth = 0.7
  ctx.setLineDash([2, 2])

  // Vertical line
  ctx.beginPath()
  ctx.moveTo(Math.round(mouse.x) + 0.5, layout.chartTop)
  ctx.lineTo(Math.round(mouse.x) + 0.5, layout.chartBottom)
  ctx.stroke()

  // Horizontal line
  ctx.beginPath()
  ctx.moveTo(layout.chartLeft, Math.round(mouse.y) + 0.5)
  ctx.lineTo(layout.chartRight, Math.round(mouse.y) + 0.5)
  ctx.stroke()

  ctx.setLineDash([])

  // Price label on right axis — professional tag
  const price = yToPrice(mouse.y, vp, layout)
  const label = formatPriceLabel(price)
  ctx.font = '600 10px -apple-system, system-ui, sans-serif'
  const tw = ctx.measureText(label).width

  // Tag background
  ctx.fillStyle = T.crossBg
  roundedRect(ctx, layout.chartRight + 0.5, mouse.y - 10, tw + 12, 20, 3)
  ctx.fill()

  // Tag border
  ctx.strokeStyle = T.border
  ctx.lineWidth = 0.5
  roundedRect(ctx, layout.chartRight + 0.5, mouse.y - 10, tw + 12, 20, 3)
  ctx.stroke()

  // Tag text
  ctx.fillStyle = T.crossText
  ctx.textAlign = 'left'
  ctx.fillText(label, layout.chartRight + 6, mouse.y + 4)

  // Time label at bottom — small tag
  const idx = xToIndex(mouse.x, vp, layout)
  // Use the visible data length for date format
  const totalVisible = vp.endIndex - vp.startIndex + 1

  ctx.restore()
}

// ==================== Info Panel (OHLCV) ====================

function drawInfoPanel(ctx: CanvasRenderingContext2D, mouse: { x: number; y: number }, vp: ChartViewport, layout: ChartLayout, data: OHLCData[]) {
  if (mouse.x >= layout.chartRight || mouse.y >= layout.chartBottom) return
  const idx = xToIndex(mouse.x, vp, layout)
  const c = data[idx]
  if (!c) return

  const T = themeRef.current
  const green = c.close >= c.open

  const lines = [
    { label: 'O', value: formatPriceLabel(c.open), color: T.crossText },
    { label: 'H', value: formatPriceLabel(c.high), color: T.crossText },
    { label: 'L', value: formatPriceLabel(c.low), color: T.crossText },
    { label: 'C', value: formatPriceLabel(c.close), color: green ? T.gain : T.loss },
    { label: 'Vol', value: formatChartVolume(c.volume), color: T.textDim },
  ]

  ctx.save()
  ctx.font = '11px -apple-system, system-ui, sans-serif'
  const maxW = lines.reduce((m, l) => Math.max(m, ctx.measureText(`${l.label} ${l.value}`).width), 0)
  const padX = 10, padY = 6, lineH = 17
  const pw = maxW + padX * 2 + 8
  const ph = lines.length * lineH + padY * 2

  let px = 8
  let py = 8
  if (mouse.y < layout.chartBottom - ph - 10) py = 8
  else py = layout.chartBottom - ph - 8

  // Panel background with shadow
  ctx.shadowColor = 'rgba(0,0,0,0.15)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 2
  ctx.fillStyle = T.panelBg
  roundedRect(ctx, px, py, pw, ph, 6)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetY = 0

  // Border
  ctx.strokeStyle = T.border
  ctx.lineWidth = 0.5
  roundedRect(ctx, px, py, pw, ph, 6)
  ctx.stroke()

  // Text lines
  ctx.textAlign = 'left'
  lines.forEach((l, i) => {
    const y = py + padY + i * lineH + 12
    // Label
    ctx.fillStyle = T.textDim
    ctx.font = '600 10px -apple-system, system-ui, sans-serif'
    ctx.fillText(l.label, px + padX, y)
    // Value
    ctx.fillStyle = l.color
    ctx.font = '11px -apple-system, system-ui, sans-serif'
    ctx.fillText(l.value, px + padX + 20, y)
  })

  ctx.restore()
}

// ==================== Price Axis ====================

function drawPriceAxis(ctx: CanvasRenderingContext2D, vp: ChartViewport, layout: ChartLayout) {
  const { chartTop, chartBottom, chartRight, volumeHeight } = layout
  const priceBottom = chartBottom - volumeHeight
  const priceRange = vp.maxPrice - vp.minPrice
  const step = niceStep(priceRange, 6)
  const T = themeRef.current

  ctx.save()
  ctx.font = '10px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'left'

  let price = Math.ceil(vp.minPrice / step) * step
  while (price <= vp.maxPrice) {
    const y = priceToY(price, vp, layout)
    if (y >= chartTop && y <= priceBottom) {
      // Highlight if near viewport extremes
      const nearHigh = Math.abs(price - vp.maxPrice) < step * 1.5
      const nearLow = Math.abs(price - vp.minPrice) < step * 1.5
      ctx.fillStyle = nearHigh || nearLow ? T.text : T.textDim

      const label = formatPriceLabel(price)
      ctx.fillText(label, chartRight + 6, y + 4)
    }
    price += step
  }
  ctx.restore()
}

// ==================== Time Axis ====================

function drawTimeAxis(ctx: CanvasRenderingContext2D, data: OHLCData[], vp: ChartViewport, layout: ChartLayout) {
  const { chartBottom, chartRight, timeAxisHeight } = layout
  const T = themeRef.current
  const totalVisible = vp.endIndex - vp.startIndex + 1

  ctx.save()
  ctx.fillStyle = T.textDim
  ctx.font = '10px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'

  const total = vp.endIndex - vp.startIndex + 1
  const step = Math.max(1, Math.round(total / 8))
  for (let i = vp.startIndex; i <= vp.endIndex; i += step) {
    const x = indexToX(i, vp, layout)
    if (x > 40 && x < chartRight - 40) {
      const d = data[i].date
      const label = formatChartDate(d, totalVisible)
      ctx.fillText(label, x, chartBottom + timeAxisHeight / 2 + 4)
    }
  }
  ctx.restore()
}

// ==================== Last Price Marker ====================

function drawLastPriceMarker(ctx: CanvasRenderingContext2D, data: OHLCData[], vp: ChartViewport, layout: ChartLayout) {
  const lastCandle = data[vp.endIndex]
  if (!lastCandle) return
  const T = themeRef.current

  const green = lastCandle.close >= lastCandle.open
  const y = priceToY(lastCandle.close, vp, layout)
  const { chartRight } = layout

  ctx.save()

  // Horizontal dashed line
  ctx.strokeStyle = green ? T.gain : T.loss
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 0.8
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(layout.chartLeft, Math.round(y) + 0.5)
  ctx.lineTo(chartRight, Math.round(y) + 0.5)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  // Price tag — filled rectangle
  const label = formatPriceLabel(lastCandle.close)
  ctx.font = '700 10px -apple-system, system-ui, sans-serif'
  const tw = ctx.measureText(label).width
  const tagW = tw + 12
  const tagH = 20

  ctx.fillStyle = green ? T.gain : T.loss
  roundedRect(ctx, chartRight + 0.5, y - tagH / 2, tagW, tagH, 3)
  ctx.fill()

  // Small triangle pointer
  ctx.beginPath()
  ctx.moveTo(chartRight + 0.5, y - 4)
  ctx.lineTo(chartRight + 0.5, y + 4)
  ctx.lineTo(chartRight - 4, y)
  ctx.closePath()
  ctx.fill()

  // Tag text
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.fillText(label, chartRight + 6, y + 4)

  ctx.restore()
}

// ==================== Drawing Renderers ====================

function renderDrawings(ctx: CanvasRenderingContext2D, drawings: ChartDrawing[], vp: ChartViewport, layout: ChartLayout) {
  ctx.save()

  for (const d of drawings) {
    ctx.strokeStyle = d.color
    ctx.fillStyle = d.color
    ctx.lineWidth = d.width

    if (d.type === 'hline' && d.points.length > 0) {
      drawHorizontalLine(ctx, d, vp, layout)
    }

    if (d.type === 'trendline' && d.points.length >= 2) {
      drawTrendline(ctx, d, vp, layout)
    }

    if (d.type === 'fibonacci' && d.points.length >= 2 && d.fibLevels) {
      drawFibonacci(ctx, d, vp, layout)
    }

    if (d.type === 'rectangle' && d.points.length >= 2) {
      drawRectangle(ctx, d, vp, layout)
    }
  }

  ctx.restore()
}

// ==================== Individual Drawing Functions ====================

function drawHorizontalLine(ctx: CanvasRenderingContext2D, d: ChartDrawing, vp: ChartViewport, layout: ChartLayout) {
  const y = priceToY(d.points[0].price, vp, layout)
  const T = themeRef.current

  // Dashed line
  ctx.strokeStyle = d.color
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 1
  ctx.setLineDash([8, 4])
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(layout.chartLeft, Math.round(y) + 0.5)
  ctx.lineTo(layout.chartRight, Math.round(y) + 0.5)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  // Price tag on right
  const label = formatPriceLabel(d.points[0].price)
  ctx.font = '700 9px -apple-system, system-ui, sans-serif'
  const tw = ctx.measureText(label).width
  const tagW = tw + 10
  const tagH = 16

  ctx.fillStyle = d.color
  roundedRect(ctx, layout.chartRight + 0.5, y - tagH / 2, tagW, tagH, 3)
  ctx.fill()

  // Triangle pointer
  ctx.beginPath()
  ctx.moveTo(layout.chartRight + 0.5, y - 3)
  ctx.lineTo(layout.chartRight + 0.5, y + 3)
  ctx.lineTo(layout.chartRight - 3, y)
  ctx.closePath()
  ctx.fill()

  // Text
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.fillText(label, layout.chartRight + 5, y + 3)
}

function drawTrendline(ctx: CanvasRenderingContext2D, d: ChartDrawing, vp: ChartViewport, layout: ChartLayout) {
  const x1 = indexToX(d.points[0].index, vp, layout)
  const y1 = priceToY(d.points[0].price, vp, layout)
  const x2 = indexToX(d.points[1].index, vp, layout)
  const y2 = priceToY(d.points[1].price, vp, layout)

  // Extend trendline beyond endpoints (TradingView style)
  const dx = x2 - x1
  const dy = y2 - y1
  const extendFactor = 0.3
  const extLeft = x1 - dx * extendFactor
  const extRight = x2 + dx * extendFactor
  const extYLeft = y1 - dy * extendFactor
  const extYRight = y2 + dy * extendFactor

  // Line with glow
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Glow
  ctx.shadowColor = d.color
  ctx.shadowBlur = 6
  ctx.strokeStyle = d.color
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.moveTo(extLeft, extYLeft)
  ctx.lineTo(extRight, extYRight)
  ctx.stroke()

  // Main line
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(extLeft, extYLeft)
  ctx.lineTo(extRight, extYRight)
  ctx.stroke()

  // Endpoint dots — larger and cleaner
  for (const [px, py] of [[x1, y1], [x2, y2]]) {
    ctx.beginPath()
    ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fillStyle = colorWithAlpha(d.color, 0.3)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(px, py, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = d.color
    ctx.fill()
    ctx.beginPath()
    ctx.arc(px, py, 1, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
  }

  ctx.restore()
}

function drawFibonacci(ctx: CanvasRenderingContext2D, d: ChartDrawing, vp: ChartViewport, layout: ChartLayout) {
  const x1 = Math.min(indexToX(d.points[0].index, vp, layout), indexToX(d.points[1].index, vp, layout))
  const x2 = Math.max(indexToX(d.points[0].index, vp, layout), indexToX(d.points[1].index, vp, layout))

  ctx.save()

  for (let fi = 0; fi < d.fibLevels.length; fi++) {
    const price = d.fibLevels[fi]
    const y = priceToY(price, vp, layout)

    // Zone fill between levels
    if (fi < d.fibLevels.length - 1) {
      const ny = priceToY(d.fibLevels[fi + 1], vp, layout)
      const fillColor = FIB_ZONE_COLORS[fi] ?? 'rgba(128,128,128,0.04)'
      ctx.fillStyle = fillColor
      ctx.fillRect(x1, Math.min(y, ny), x2 - x1, Math.abs(ny - y))
    }

    // Level line — colored per Fibonacci level
    const lineColor = FIB_LINE_COLORS[fi] ?? 'rgba(128,128,128,0.3)'
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 0.7
    ctx.setLineDash([3, 3])
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, Math.round(y) + 0.5)
    ctx.lineTo(x2, Math.round(y) + 0.5)
    ctx.stroke()
    ctx.setLineDash([])

    // Label with background
    const labelText = `${FIB_LABELS[fi]} — ${formatPriceLabel(price)}`
    ctx.font = '600 9px -apple-system, system-ui, sans-serif'
    const lw = ctx.measureText(labelText).width

    // Label background
    ctx.fillStyle = themeRef.current.panelBg
    roundedRect(ctx, x1 + 3, y - 14, lw + 8, 14, 2)
    ctx.fill()

    // Label text
    ctx.fillStyle = lineColor.replace(/[\d.]+\)$/, '0.9)')
    ctx.textAlign = 'left'
    ctx.fillText(labelText, x1 + 7, y - 4)
  }

  // Vertical boundary lines
  ctx.strokeStyle = 'rgba(128,128,128,0.15)'
  ctx.lineWidth = 0.5
  ctx.setLineDash([2, 2])
  for (const x of [x1, x2]) {
    const topY = priceToY(d.fibLevels[0], vp, layout)
    const botY = priceToY(d.fibLevels[d.fibLevels.length - 1], vp, layout)
    ctx.beginPath()
    ctx.moveTo(Math.round(x) + 0.5, topY)
    ctx.lineTo(Math.round(x) + 0.5, botY)
    ctx.stroke()
  }
  ctx.setLineDash([])

  ctx.restore()
}

function drawRectangle(ctx: CanvasRenderingContext2D, d: ChartDrawing, vp: ChartViewport, layout: ChartLayout) {
  const x1 = indexToX(d.points[0].index, vp, layout)
  const y1 = priceToY(d.points[0].price, vp, layout)
  const x2 = indexToX(d.points[1].index, vp, layout)
  const y2 = priceToY(d.points[1].price, vp, layout)
  const rx = Math.min(x1, x2)
  const ry = Math.min(y1, y2)
  const rw = Math.abs(x2 - x1)
  const rh = Math.abs(y2 - y1)

  ctx.save()

  // Fill with alpha
  const fillAlpha = 0.06
  ctx.fillStyle = colorWithAlpha(d.color, fillAlpha)
  roundedRect(ctx, rx, ry, rw, rh, 3)
  ctx.fill()

  // Border
  ctx.strokeStyle = d.color
  ctx.lineWidth = 1.2
  ctx.lineJoin = 'round'
  ctx.setLineDash([])
  roundedRect(ctx, rx, ry, rw, rh, 3)
  ctx.stroke()

  // Corner handles
  const handleSize = 3
  ctx.fillStyle = d.color
  for (const [hx, hy] of [[rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]]) {
    ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize)
  }

  // Price labels
  const topPrice = Math.max(d.points[0].price, d.points[1].price)
  const botPrice = Math.min(d.points[0].price, d.points[1].price)
  ctx.font = '600 9px -apple-system, system-ui, sans-serif'
  const topLabel = formatPriceLabel(topPrice)
  const botLabel = formatPriceLabel(botPrice)

  ctx.fillStyle = colorWithAlpha(d.color, 0.7)
  ctx.textAlign = 'left'
  ctx.fillText(topLabel, rx + 4, ry + 12)
  ctx.fillText(botLabel, rx + 4, ry + rh - 4)

  ctx.restore()
}

// ==================== Drawing Preview ====================

function renderPreview(ctx: CanvasRenderingContext2D, drawing: ActiveDrawing, vp: ChartViewport, layout: ChartLayout) {
  if (!drawing.startData || !drawing.currentData) return

  ctx.save()
  ctx.strokeStyle = DRAW_COLORS[colorIdxRef.current % DRAW_COLORS.length]
  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.setLineDash([5, 4])
  ctx.globalAlpha = 0.6

  if (drawing.type === 'hline') {
    const y = priceToY(drawing.startData.price, vp, layout)
    ctx.beginPath()
    ctx.moveTo(layout.chartLeft, Math.round(y) + 0.5)
    ctx.lineTo(layout.chartRight, Math.round(y) + 0.5)
    ctx.stroke()
  }

  if (drawing.type === 'trendline') {
    ctx.beginPath()
    ctx.moveTo(indexToX(drawing.startData.index, vp, layout), priceToY(drawing.startData.price, vp, layout))
    ctx.lineTo(indexToX(drawing.currentData.index, vp, layout), priceToY(drawing.currentData.price, vp, layout))
    ctx.stroke()
  }

  if (drawing.type === 'fibonacci') {
    const lx1 = Math.min(indexToX(drawing.startData.index, vp, layout), indexToX(drawing.currentData.index, vp, layout))
    const lx2 = Math.max(indexToX(drawing.startData.index, vp, layout), indexToX(drawing.currentData.index, vp, layout))
    const hi = Math.max(drawing.startData.price, drawing.currentData.price)
    const lo = Math.min(drawing.startData.price, drawing.currentData.price)
    const levels = fibonacciLevels(hi, lo)

    for (let fi = 0; fi < levels.length; fi++) {
      const y = priceToY(levels[fi], vp, layout)
      ctx.strokeStyle = FIB_LINE_COLORS[fi] ?? 'rgba(200,200,200,0.3)'
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(lx1, Math.round(y) + 0.5)
      ctx.lineTo(lx2, Math.round(y) + 0.5)
      ctx.stroke()
    }
  }

  if (drawing.type === 'rectangle') {
    const x1 = indexToX(drawing.startData.index, vp, layout)
    const y1 = priceToY(drawing.startData.price, vp, layout)
    const x2 = indexToX(drawing.currentData.index, vp, layout)
    const y2 = priceToY(drawing.currentData.price, vp, layout)
    ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))
  }

  ctx.setLineDash([])
  ctx.globalAlpha = 1
  ctx.restore()
}

// Shared ref for colorIdx access in renderPreview
const colorIdxRef = { current: 0 }

// Keep colorIdxRef in sync with component state
const origRenderPreview = renderPreview

// ==================== Utilities ====================

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function ptLineDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}
