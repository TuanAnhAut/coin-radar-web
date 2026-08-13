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
  fibonacciLevels,
} from '@/lib/chart-utils'
import { cn } from '@/lib/utils'

// Theme colors for chart
const COLORS = {
  bg: 'var(--color-background)',
  grid: 'var(--color-border)',
  text: 'var(--color-muted-foreground)',
  gain: 'oklch(0.7 0.15 145)',
  loss: 'oklch(0.6 0.2 25)',
  gainFill: 'oklch(0.7 0.15 145 / 80%)',
  lossFill: 'oklch(0.6 0.2 25 / 80%)',
  crosshair: 'oklch(0.7 0 0 / 60%)',
  ma20: 'oklch(0.75 0.15 80)',
  ma50: 'oklch(0.7 0.2 310)',
  ma100: 'oklch(0.65 0.18 200)',
  bbUpper: 'oklch(0.6 0.15 200 / 40%)',
  bbLower: 'oklch(0.6 0.15 200 / 40%)',
  bbMiddle: 'oklch(0.6 0.15 200 / 25%)',
  rsi: 'oklch(0.7 0.18 55)',
  macdLine: 'oklch(0.7 0.15 145)',
  macdSignal: 'oklch(0.7 0.2 310)',
  macdHistGain: 'oklch(0.7 0.15 145 / 60%)',
  macdHistLoss: 'oklch(0.6 0.2 25 / 60%)',
  volumeGain: 'oklch(0.7 0.15 145 / 30%)',
  volumeLoss: 'oklch(0.6 0.2 25 / 30%)',
  drawingColors: [
    'oklch(0.75 0.15 80)',    // yellow
    'oklch(0.65 0.2 310)',    // purple
    'oklch(0.7 0.15 145)',    // green
    'oklch(0.6 0.2 25)',      // red
    'oklch(0.7 0.18 55)',     // orange
    'oklch(0.65 0.18 200)',   // blue
  ],
  fib0: 'oklch(0.7 0.18 55 / 25%)',
  fib236: 'oklch(0.75 0.15 80 / 25%)',
  fib382: 'oklch(0.65 0.2 310 / 25%)',
  fib500: 'oklch(0.7 0 0 / 25%)',
  fib618: 'oklch(0.65 0.18 200 / 25%)',
  fib786: 'oklch(0.7 0.15 145 / 25%)',
  fibLine: 'oklch(0.7 0 0 / 50%)',
}

function getCSSColor(color: string): string {
  // For oklch values, return as-is (canvas supports it in modern browsers)
  return color
}

function resolveColor(color: string, ctx: CanvasRenderingContext2D): string {
  if (color.startsWith('oklch')) return color
  return color
}

interface ChartCanvasProps {
  data: OHLCData[]
  assetType?: string
  width: number
  height: number
  activeTool: DrawingTool
  drawings: ChartDrawing[]
  onDrawingsChange: (drawings: ChartDrawing[]) => void
  indicators: IndicatorConfig[]
  onCrosshairMove?: (price: number | null, index: number | null) => void
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
  const containerRef = useRef<HTMLDivElement>(null)
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const dragRef = useRef<ActiveDrawing | null>(null)
  const panRef = useRef<{ startX: number; startOffset: number } | null>(null)
  const scrollOffsetRef = useRef(0) // candle offset from end

  const [visibleStart, setVisibleStart] = useState(() => Math.max(0, data.length - 80))
  const [visibleEnd, setVisibleEnd] = useState(() => data.length - 1)
  const [drawingColorIdx, setDrawingColorIdx] = useState(0)

  // Compute indicators
  const indicatorData = useMemo(() => computeIndicators(data), [data])

  // Check which indicators are enabled
  const rsiEnabled = indicators.some((i) => i.type === 'rsi' && i.enabled)
  const macdEnabled = indicators.some((i) => i.type === 'macd' && i.enabled)
  const bbEnabled = indicators.some((i) => i.type === 'bb' && i.enabled)

  const layout = useMemo(
    () => computeLayout(width, height, rsiEnabled, macdEnabled, dpr),
    [width, height, rsiEnabled, macdEnabled]
  )

  const viewport = useMemo(
    () => computeViewport(data, visibleStart, visibleEnd, indicatorData),
    [data, visibleStart, visibleEnd, indicatorData]
  )

  // Canvas rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = width * dpr
    const h = height * dpr
    ctx.clearRect(0, 0, w, h)
    ctx.scale(dpr, dpr)

    // Background
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#1a1a2e' : '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    drawGrid(ctx, viewport, layout, isDark)

    // Candles
    drawCandles(ctx, data, viewport, layout, isDark)

    // Volume bars
    drawVolume(ctx, data, viewport, layout, isDark)

    // Overlay indicators
    drawOverlayIndicators(ctx, indicatorData, viewport, layout, rsiEnabled, macdEnabled, bbEnabled)

    // Sub indicators (RSI, MACD)
    if (rsiEnabled && layout.rsiTop !== undefined && layout.rsiBottom !== undefined) {
      drawRSI(ctx, indicatorData, viewport, layout, isDark)
    }
    if (macdEnabled && layout.macdTop !== undefined && layout.macdBottom !== undefined) {
      drawMACD(ctx, indicatorData, viewport, layout, isDark)
    }

    // Drawings
    drawDrawings(ctx, drawings, viewport, layout)

    // Active drawing preview
    if (dragRef.current) {
      drawActivePreview(ctx, dragRef.current, viewport, layout)
    }

    // Crosshair
    if (mouseRef.current && !dragRef.current && !panRef.current) {
      drawCrosshair(ctx, mouseRef.current, viewport, layout, data, isDark)
    }

    // Price axis labels
    drawPriceAxis(ctx, viewport, layout, assetType, isDark)

    // Time axis labels
    drawTimeAxis(ctx, data, viewport, layout, isDark)

    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }, [data, width, height, dpr, viewport, layout, indicatorData, drawings, activeTool, rsiEnabled, macdEnabled, bbEnabled, assetType])

  // Render loop
  useEffect(() => {
    render()
  }, [render])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      render()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  // Mouse/touch event handlers
  const getCanvasPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0]
        if (!touch) return null
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)
      if (!pos) return

      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // Middle click or alt+click = pan mode
        panRef.current = { startX: pos.x, startOffset: visibleEnd - visibleStart }
        return
      }

      if (activeTool !== 'crosshair' && pos.x < layout.chartRight) {
        const idx = xToIndex(pos.x, viewport, layout)
        const price = yToPrice(pos.y, viewport, layout)

        dragRef.current = {
          type: activeTool,
          startScreen: pos,
          currentScreen: pos,
          startData: { index: idx, price },
          currentData: { index: idx, price },
        }
      }
    },
    [activeTool, viewport, layout, getCanvasPos, visibleEnd, visibleStart]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)
      if (!pos) return

      mouseRef.current = pos

      if (panRef.current) {
        // Panning
        const dx = pos.x - panRef.current.startX
        const candlesPerPixel = (visibleEnd - visibleStart) / (layout.chartRight - layout.chartLeft)
        const candleShift = Math.round(-dx * candlesPerPixel)
        let newStart = Math.max(0, visibleStart + candleShift)
        let newEnd = newStart + panRef.current.startOffset
        if (newEnd >= data.length) {
          newEnd = data.length - 1
          newStart = Math.max(0, newEnd - panRef.current.startOffset)
        }
        setVisibleStart(newStart)
        setVisibleEnd(newEnd)
        return
      }

      if (dragRef.current) {
        const idx = xToIndex(pos.x, viewport, layout)
        const price = yToPrice(pos.y, viewport, layout)
        dragRef.current = {
          ...dragRef.current,
          currentScreen: pos,
          currentData: { index: idx, price },
        }
        render()
        return
      }

      // Crosshair callback
      if (onCrosshairMove && pos.x < layout.chartRight && pos.y < layout.chartBottom) {
        const idx = xToIndex(pos.x, viewport, layout)
        const price = yToPrice(pos.y, viewport, layout)
        onCrosshairMove(price, idx)
      }

      render()
    },
    [viewport, layout, getCanvasPos, render, onCrosshairMove, data.length]
  )

  const handleMouseUp = useCallback(() => {
    if (panRef.current) {
      panRef.current = null
      return
    }

    if (dragRef.current) {
      finalizeDrawing()
      dragRef.current = null
      render()
    }
  }, [render])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null
    if (panRef.current) panRef.current = null
    if (dragRef.current) {
      finalizeDrawing()
      dragRef.current = null
    }
    render()
  }, [render])

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const pos = getCanvasPos(e)
        if (!pos) return

        mouseRef.current = pos

        if (activeTool !== 'crosshair' && pos.x < layout.chartRight) {
          const idx = xToIndex(pos.x, viewport, layout)
          const price = yToPrice(pos.y, viewport, layout)
          dragRef.current = {
            type: activeTool,
            startScreen: pos,
            currentScreen: pos,
            startData: { index: idx, price },
            currentData: { index: idx, price },
          }
        } else {
          // Pan mode for touch on crosshair
          panRef.current = { startX: pos.x, startOffset: visibleEnd - visibleStart }
        }
      }
    },
    [activeTool, viewport, layout, getCanvasPos, visibleEnd, visibleStart]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const pos = getCanvasPos(e)
      if (!pos) return

      mouseRef.current = pos

      if (panRef.current && !dragRef.current) {
        const dx = pos.x - panRef.current.startX
        const candlesPerPixel = (visibleEnd - visibleStart) / (layout.chartRight - layout.chartLeft)
        const candleShift = Math.round(-dx * candlesPerPixel)
        let newStart = Math.max(0, visibleStart + candleShift)
        let newEnd = newStart + panRef.current.startOffset
        if (newEnd >= data.length) {
          newEnd = data.length - 1
          newStart = Math.max(0, newEnd - panRef.current.startOffset)
        }
        setVisibleStart(newStart)
        setVisibleEnd(newEnd)
        return
      }

      if (dragRef.current) {
        const idx = xToIndex(pos.x, viewport, layout)
        const price = yToPrice(pos.y, viewport, layout)
        dragRef.current = {
          ...dragRef.current,
          currentScreen: pos,
          currentData: { index: idx, price },
        }
      }

      render()
    },
    [viewport, layout, getCanvasPos, render, visibleEnd, visibleStart]
  )

  const handleTouchEnd = useCallback(() => {
    mouseRef.current = null
    if (panRef.current) panRef.current = null
    if (dragRef.current) {
      finalizeDrawing()
      dragRef.current = null
    }
    render()
  }, [render])

  // Finalize drawing from drag
  const finalizeDrawing = useCallback(() => {
    if (!dragRef.current || !dragRef.current.startData || !dragRef.current.currentData) return

    const { type, startData, currentData } = dragRef.current
    const color = COLORS.drawingColors[drawingColorIdx % COLORS.drawingColors.length]

    const newDrawing: ChartDrawing = {
      id: `drawing-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      color,
      width: 2,
      points: [startData, currentData],
    }

    if (type === 'fibonacci' && startData && currentData) {
      const high = Math.max(startData.price, currentData.price)
      const low = Math.min(startData.price, currentData.price)
      newDrawing.fibLevels = fibonacciLevels(high, low)
    }

    if (type === 'hline') {
      newDrawing.points = [startData]
    }

    const updated = [...drawings, newDrawing]
    onDrawingsChange(updated)
    setDrawingColorIdx((prev) => prev + 1)
  }, [drawings, drawingColorIdx, onDrawingsChange])

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
      const currentRange = visibleEnd - visibleStart
      const newRange = Math.round(Math.max(20, Math.min(data.length - 1, currentRange * zoomFactor)))
      const center = Math.round((visibleStart + visibleEnd) / 2)
      let newStart = Math.max(0, center - Math.round(newRange / 2))
      let newEnd = newStart + newRange - 1
      if (newEnd >= data.length) {
        newEnd = data.length - 1
        newStart = Math.max(0, newEnd - newRange + 1)
      }
      setVisibleStart(newStart)
      setVisibleEnd(newEnd)
    },
    [visibleStart, visibleEnd, data.length]
  )

  // Context menu for drawings (right-click)
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)
      if (!pos) return

      // Check if clicking near a drawing
      for (const drawing of drawings) {
        if (drawing.type === 'hline' && drawing.points.length > 0) {
          const lineY = priceToY(drawing.points[0].price, viewport, layout)
          if (Math.abs(pos.y - lineY) < 8 && pos.x < layout.chartRight) {
            e.preventDefault()
            onDrawingClick?.(drawing)
            return
          }
        }
      }
    },
    [drawings, viewport, layout, getCanvasPos, onDrawingClick]
  )

  // Double click to delete drawing
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)
      if (!pos) return

      for (let i = drawings.length - 1; i >= 0; i--) {
        const drawing = drawings[i]
        if (drawing.type === 'hline' && drawing.points.length > 0) {
          const lineY = priceToY(drawing.points[0].price, viewport, layout)
          if (Math.abs(pos.y - lineY) < 10 && pos.x < layout.chartRight) {
            onDrawingsChange(drawings.filter((_, j) => j !== i))
            return
          }
        }
        if (drawing.type === 'trendline' && drawing.points.length >= 2) {
          const x1 = indexToX(drawing.points[0].index, viewport, layout)
          const y1 = priceToY(drawing.points[0].price, viewport, layout)
          const x2 = indexToX(drawing.points[1].index, viewport, layout)
          const y2 = priceToY(drawing.points[1].price, viewport, layout)
          const dist = pointToLineDistance(pos.x, pos.y, x1, y1, x2, y2)
          if (dist < 10) {
            onDrawingsChange(drawings.filter((_, j) => j !== i))
            return
          }
        }
      }
    },
    [drawings, viewport, layout, getCanvasPos, onDrawingsChange]
  )

  return (
    <div ref={containerRef} className="relative w-full h-full no-select" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width * dpr}
        height={height * dpr}
        style={{ width, height }}
        className={cn(
          'block touch-none',
          activeTool === 'crosshair' ? 'cursor-crosshair' : 'cursor-cell'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  )
}

// ==================== Drawing Functions ====================

function drawGrid(ctx: CanvasRenderingContext2D, vp: ChartViewport, layout: ChartLayout, isDark: boolean) {
  const { chartTop, chartBottom, chartLeft, chartRight, volumeHeight } = layout
  const effectiveBottom = chartBottom - volumeHeight

  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1

  // Horizontal grid lines (price)
  const priceRange = vp.maxPrice - vp.minPrice
  const priceStep = niceStep(priceRange, 6)
  let price = Math.ceil(vp.minPrice / priceStep) * priceStep

  while (price <= vp.maxPrice) {
    const y = priceToY(price, vp, layout)
    if (y >= chartTop && y <= effectiveBottom) {
      ctx.beginPath()
      ctx.moveTo(chartLeft, Math.round(y) + 0.5)
      ctx.lineTo(chartRight, Math.round(y) + 0.5)
      ctx.stroke()
    }
    price += priceStep
  }

  // Vertical grid lines (time) - every ~10 candles
  const totalCandles = vp.endIndex - vp.startIndex + 1
  const step = Math.max(1, Math.round(totalCandles / 8))
  for (let i = vp.startIndex; i <= vp.endIndex; i += step) {
    const x = indexToX(i, vp, layout)
    ctx.beginPath()
    ctx.moveTo(Math.round(x) + 0.5, chartTop)
    ctx.lineTo(Math.round(x) + 0.5, chartBottom)
    ctx.stroke()
  }
}

function drawCandles(
  ctx: CanvasRenderingContext2D,
  data: OHLCData[],
  vp: ChartViewport,
  layout: ChartLayout,
  isDark: boolean
) {
  const { chartRight } = layout
  const totalCandles = vp.endIndex - vp.startIndex + 1
  const chartWidth = chartRight - layout.chartLeft
  const candleW = chartWidth / totalCandles
  const bodyW = Math.max(1, candleW * 0.7)

  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const candle = data[i]
    if (!candle) continue

    const x = indexToX(i, vp, layout)
    const isGreen = candle.close >= candle.open

    // Wick
    const wickY1 = priceToY(candle.high, vp, layout)
    const wickY2 = priceToY(candle.low, vp, layout)
    ctx.strokeStyle = isGreen ? COLORS.gain : COLORS.loss
    ctx.lineWidth = Math.max(1, candleW * 0.15)
    ctx.beginPath()
    ctx.moveTo(Math.round(x) + 0.5, Math.round(wickY1))
    ctx.lineTo(Math.round(x) + 0.5, Math.round(wickY2))
    ctx.stroke()

    // Body
    const bodyTop = priceToY(Math.max(candle.open, candle.close), vp, layout)
    const bodyBottom = priceToY(Math.min(candle.open, candle.close), vp, layout)
    const bodyHeight = Math.max(1, bodyBottom - bodyTop)

    ctx.fillStyle = isGreen ? COLORS.gain : COLORS.loss
    ctx.fillRect(Math.round(x - bodyW / 2), Math.round(bodyTop), Math.round(bodyW), Math.round(bodyHeight))
  }
}

function drawVolume(
  ctx: CanvasRenderingContext2D,
  data: OHLCData[],
  vp: ChartViewport,
  layout: ChartLayout,
  isDark: boolean
) {
  const { chartBottom, volumeHeight, chartRight } = layout
  const totalCandles = vp.endIndex - vp.startIndex + 1
  const chartWidth = chartRight - layout.chartLeft
  const barW = chartWidth / totalCandles

  let maxVol = 0
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    maxVol = Math.max(maxVol, data[i].volume)
  }

  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const candle = data[i]
    const x = indexToX(i, vp, layout)
    const isGreen = candle.close >= candle.open
    const barH = (candle.volume / (maxVol || 1)) * volumeHeight * 0.8

    ctx.fillStyle = isGreen ? COLORS.volumeGain : COLORS.volumeLoss
    ctx.fillRect(
      Math.round(x - barW * 0.3),
      Math.round(chartBottom - barH),
      Math.round(barW * 0.6),
      Math.round(barH)
    )
  }
}

function drawOverlayIndicators(
  ctx: CanvasRenderingContext2D,
  indicators: IndicatorData,
  vp: ChartViewport,
  layout: ChartLayout,
  rsiEnabled: boolean,
  macdEnabled: boolean,
  bbEnabled: boolean
) {
  // MA lines
  const maLines = [
    { data: indicators.ma20, color: COLORS.ma20 },
    { data: indicators.ma50, color: COLORS.ma50 },
    { data: indicators.ma100, color: COLORS.ma100 },
  ]

  for (const ma of maLines) {
    if (!ma.data) continue
    ctx.strokeStyle = ma.color
    ctx.lineWidth = 1.5
    ctx.beginPath()

    let started = false
    for (let i = vp.startIndex; i <= vp.endIndex; i++) {
      const val = ma.data[i]
      if (isNaN(val)) continue

      const x = indexToX(i, vp, layout)
      const y = priceToY(val, vp, layout)

      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  // Bollinger Bands
  if (bbEnabled) {
    // Fill between bands
    if (indicators.bbUpper && indicators.bbLower) {
      ctx.fillStyle = isDarkMode(ctx) ? 'rgba(100, 149, 237, 0.05)' : 'rgba(100, 149, 237, 0.08)'
      ctx.beginPath()
      let started = false
      for (let i = vp.startIndex; i <= vp.endIndex; i++) {
        const val = indicators.bbUpper[i]
        if (isNaN(val)) continue
        const x = indexToX(i, vp, layout)
        const y = priceToY(val, vp, layout)
        if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
      }
      for (let i = vp.endIndex; i >= vp.startIndex; i--) {
        const val = indicators.bbLower[i]
        if (isNaN(val)) continue
        ctx.lineTo(indexToX(i, vp, layout), priceToY(val, vp, layout))
      }
      ctx.closePath()
      ctx.fill()
    }

    // BB lines
    const bbLines = [
      { data: indicators.bbUpper, color: COLORS.bbUpper, dash: [4, 4] },
      { data: indicators.bbMiddle, color: COLORS.bbMiddle, dash: [4, 4] },
      { data: indicators.bbLower, color: COLORS.bbLower, dash: [4, 4] },
    ]

    for (const bb of bbLines) {
      if (!bb.data) continue
      ctx.strokeStyle = bb.color
      ctx.lineWidth = 1
      ctx.setLineDash(bb.dash)
      ctx.beginPath()
      let started = false
      for (let i = vp.startIndex; i <= vp.endIndex; i++) {
        const val = bb.data[i]
        if (isNaN(val)) continue
        const x = indexToX(i, vp, layout)
        const y = priceToY(val, vp, layout)
        if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
}

function drawRSI(
  ctx: CanvasRenderingContext2D,
  indicators: IndicatorData,
  vp: ChartViewport,
  layout: ChartLayout,
  isDark: boolean
) {
  if (!indicators.rsi || layout.rsiTop === undefined || layout.rsiBottom === undefined) return

  const rsiTop = layout.rsiTop
  const rsiBottom = layout.rsiBottom
  const rsiHeight = rsiBottom - rsiTop

  // Background
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  ctx.fillRect(0, rsiTop, layout.chartRight, rsiHeight)

  // Overbought/oversold zones
  const ob70 = rsiBottom - (70 / 100) * rsiHeight
  const ob30 = rsiBottom - (30 / 100) * rsiHeight

  ctx.fillStyle = isDark ? 'rgba(255,100,100,0.08)' : 'rgba(255,0,0,0.06)'
  ctx.fillRect(0, rsiTop, layout.chartRight, ob70 - rsiTop)
  ctx.fillStyle = isDark ? 'rgba(100,255,100,0.08)' : 'rgba(0,255,0,0.06)'
  ctx.fillRect(0, ob30, layout.chartRight, rsiBottom - ob30)

  // 70/30 lines
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  ctx.setLineDash([3, 3])
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, Math.round(ob70) + 0.5)
  ctx.lineTo(layout.chartRight, Math.round(ob70) + 0.5)
  ctx.moveTo(0, Math.round(ob30) + 0.5)
  ctx.lineTo(layout.chartRight, Math.round(ob30) + 0.5)
  ctx.stroke()
  ctx.setLineDash([])

  // RSI line
  ctx.strokeStyle = COLORS.rsi
  ctx.lineWidth = 1.5
  ctx.beginPath()
  let started = false
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const val = indicators.rsi[i]
    if (isNaN(val)) continue
    const x = indexToX(i, vp, layout)
    const y = rsiBottom - (val / 100) * rsiHeight
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Label
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  ctx.font = '10px system-ui'
  ctx.fillText('RSI(14)', 4, rsiTop + 12)
  ctx.fillText('70', layout.chartRight + 4, ob70 + 3)
  ctx.fillText('30', layout.chartRight + 4, ob30 + 3)
}

function drawMACD(
  ctx: CanvasRenderingContext2D,
  indicators: IndicatorData,
  vp: ChartViewport,
  layout: ChartLayout,
  isDark: boolean
) {
  if (!indicators.macdLine || layout.macdTop === undefined || layout.macdBottom === undefined) return

  const macdTop = layout.macdTop
  const macdBottom = layout.macdBottom
  const macdHeight = macdBottom - macdTop

  // Background
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  ctx.fillRect(0, macdTop, layout.chartRight, macdHeight)

  // Find MACD range
  let macdMin = Infinity
  let macdMax = -Infinity
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    if (indicators.macdLine[i] !== undefined && !isNaN(indicators.macdLine[i])) {
      macdMin = Math.min(macdMin, indicators.macdLine[i], indicators.macdSignal[i] ?? Infinity)
      macdMax = Math.max(macdMax, indicators.macdLine[i], indicators.macdSignal[i] ?? -Infinity)
    }
  }
  const macdPadding = (macdMax - macdMin) * 0.1 || 0.01
  macdMin -= macdPadding
  macdMax += macdPadding

  const macdToY = (val: number) => macdBottom - ((val - macdMin) / (macdMax - macdMin)) * macdHeight

  // Zero line
  const zeroY = macdToY(0)
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, Math.round(zeroY) + 0.5)
  ctx.lineTo(layout.chartRight, Math.round(zeroY) + 0.5)
  ctx.stroke()

  // Histogram
  const totalCandles = vp.endIndex - vp.startIndex + 1
  const barW = (layout.chartRight - layout.chartLeft) / totalCandles
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const hist = indicators.macdHistogram[i]
    if (isNaN(hist)) continue
    const x = indexToX(i, vp, layout)
    const y = macdToY(hist)
    const barH = Math.abs(zeroY - y)
    ctx.fillStyle = hist >= 0 ? COLORS.macdHistGain : COLORS.macdHistLoss
    ctx.fillRect(Math.round(x - barW * 0.25), Math.round(Math.min(y, zeroY)), Math.round(barW * 0.5), Math.round(barH))
  }

  // MACD line
  ctx.strokeStyle = COLORS.macdLine
  ctx.lineWidth = 1.5
  ctx.beginPath()
  let started = false
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const val = indicators.macdLine[i]
    if (isNaN(val)) continue
    const x = indexToX(i, vp, layout)
    const y = macdToY(val)
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Signal line
  ctx.strokeStyle = COLORS.macdSignal
  ctx.lineWidth = 1.5
  ctx.beginPath()
  started = false
  for (let i = vp.startIndex; i <= vp.endIndex; i++) {
    const val = indicators.macdSignal[i]
    if (isNaN(val)) continue
    const x = indexToX(i, vp, layout)
    const y = macdToY(val)
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Label
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  ctx.font = '10px system-ui'
  ctx.fillText('MACD', 4, macdTop + 12)
}

function drawDrawings(
  ctx: CanvasRenderingContext2D,
  drawings: ChartDrawing[],
  vp: ChartViewport,
  layout: ChartLayout
) {
  for (const drawing of drawings) {
    ctx.strokeStyle = drawing.color
    ctx.fillStyle = drawing.color
    ctx.lineWidth = drawing.width

    if (drawing.type === 'hline' && drawing.points.length > 0) {
      const y = priceToY(drawing.points[0].price, vp, layout)
      ctx.setLineDash([6, 3])
      ctx.beginPath()
      ctx.moveTo(layout.chartLeft, Math.round(y) + 0.5)
      ctx.lineTo(layout.chartRight, Math.round(y) + 0.5)
      ctx.stroke()
      ctx.setLineDash([])

      // Price label
      ctx.font = 'bold 10px system-ui'
      const label = drawing.points[0].price.toFixed(2)
      const textW = ctx.measureText(label).width
      ctx.fillStyle = drawing.color
      ctx.fillRect(layout.chartRight, Math.round(y) - 8, textW + 8, 16)
      ctx.fillStyle = '#000'
      ctx.fillText(label, layout.chartRight + 4, y + 4)
    }

    if (drawing.type === 'trendline' && drawing.points.length >= 2) {
      const x1 = indexToX(drawing.points[0].index, vp, layout)
      const y1 = priceToY(drawing.points[0].price, vp, layout)
      const x2 = indexToX(drawing.points[1].index, vp, layout)
      const y2 = priceToY(drawing.points[1].price, vp, layout)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Price labels at endpoints
      ctx.font = 'bold 10px system-ui'
      ctx.fillStyle = drawing.color
      const label1 = drawing.points[0].price.toFixed(2)
      ctx.fillText(label1, x1 + 4, y1 - 6)
      const label2 = drawing.points[1].price.toFixed(2)
      ctx.fillText(label2, x2 + 4, y2 + 14)
    }

    if (drawing.type === 'fibonacci' && drawing.points.length >= 2 && drawing.fibLevels) {
      const x1 = Math.min(indexToX(drawing.points[0].index, vp, layout), indexToX(drawing.points[1].index, vp, layout))
      const x2 = Math.max(indexToX(drawing.points[0].index, vp, layout), indexToX(drawing.points[1].index, vp, layout))

      const fibColors = [
        COLORS.fib0, COLORS.fib236, COLORS.fib382, COLORS.fib500, COLORS.fib618, COLORS.fib786, COLORS.fib0,
      ]
      const fibLabels = ['0%', '23.6%', '38.2%', '50%', '61.8%', '78.6%', '100%']

      for (let i = 0; i < drawing.fibLevels.length; i++) {
        const price = drawing.fibLevels[i]
        const y = priceToY(price, vp, layout)

        // Fill between this level and next
        if (i < drawing.fibLevels.length - 1) {
          const nextY = priceToY(drawing.fibLevels[i + 1], vp, layout)
          ctx.fillStyle = fibColors[i] ?? COLORS.fibLine
          ctx.fillRect(x1, y, x2 - x1, nextY - y)
        }

        // Line
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(x1, Math.round(y) + 0.5)
        ctx.lineTo(x2, Math.round(y) + 0.5)
        ctx.stroke()
        ctx.setLineDash([])

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '9px system-ui'
        ctx.fillText(`${fibLabels[i]} (${price.toFixed(2)})`, x1 + 2, y - 3)
      }
    }

    if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
      const x1 = indexToX(drawing.points[0].index, vp, layout)
      const y1 = priceToY(drawing.points[0].price, vp, layout)
      const x2 = indexToX(drawing.points[1].index, vp, layout)
      const y2 = priceToY(drawing.points[1].price, vp, layout)

      ctx.fillStyle = drawing.color.replace(')', ',0.1)').replace('oklch', 'oklch')
      ctx.fillRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      )
      ctx.strokeStyle = drawing.color
      ctx.lineWidth = 2
      ctx.strokeRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      )
    }
  }
}

function drawActivePreview(
  ctx: CanvasRenderingContext2D,
  drawing: ActiveDrawing,
  vp: ChartViewport,
  layout: ChartLayout
) {
  if (!drawing.startData || !drawing.currentData) return

  ctx.strokeStyle = COLORS.drawingColors[0]
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])

  if (drawing.type === 'hline') {
    const y = priceToY(drawing.startData.price, vp, layout)
    ctx.beginPath()
    ctx.moveTo(layout.chartLeft, Math.round(y) + 0.5)
    ctx.lineTo(layout.chartRight, Math.round(y) + 0.5)
    ctx.stroke()
  }

  if (drawing.type === 'trendline') {
    const x1 = indexToX(drawing.startData.index, vp, layout)
    const y1 = priceToY(drawing.startData.price, vp, layout)
    const x2 = indexToX(drawing.currentData.index, vp, layout)
    const y2 = priceToY(drawing.currentData.price, vp, layout)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  if (drawing.type === 'fibonacci') {
    const x1 = Math.min(
      indexToX(drawing.startData.index, vp, layout),
      indexToX(drawing.currentData.index, vp, layout)
    )
    const x2 = Math.max(
      indexToX(drawing.startData.index, vp, layout),
      indexToX(drawing.currentData.index, vp, layout)
    )
    const high = Math.max(drawing.startData.price, drawing.currentData.price)
    const low = Math.min(drawing.startData.price, drawing.currentData.price)
    const levels = fibonacciLevels(high, low)

    for (const price of levels) {
      const y = priceToY(price, vp, layout)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x1, Math.round(y) + 0.5)
      ctx.lineTo(x2, Math.round(y) + 0.5)
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
}

function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  mouse: { x: number; y: number },
  vp: ChartViewport,
  layout: ChartLayout,
  data: OHLCData[],
  isDark: boolean
) {
  if (mouse.x >= layout.chartRight || mouse.y >= layout.chartBottom) return

  ctx.strokeStyle = COLORS.crosshair
  ctx.lineWidth = 0.5
  ctx.setLineDash([3, 3])

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

  // Price label at axis
  const price = yToPrice(mouse.y, vp, layout)
  const priceLabel = formatChartPrice(price)
  ctx.font = 'bold 10px system-ui'
  const textW = ctx.measureText(priceLabel).width
  ctx.fillStyle = isDark ? '#2a2a4e' : '#e0e0e0'
  ctx.fillRect(layout.chartRight, mouse.y - 9, textW + 8, 18)
  ctx.fillStyle = isDark ? '#fff' : '#000'
  ctx.fillText(priceLabel, layout.chartRight + 4, mouse.y + 4)

  // Time label
  const idx = xToIndex(mouse.x, vp, layout)
  if (idx >= 0 && idx < data.length) {
    const timeLabel = data[idx].date
    ctx.font = '10px system-ui'
    const tw = ctx.measureText(timeLabel).width
    ctx.fillStyle = isDark ? '#2a2a4e' : '#e0e0e0'
    ctx.fillRect(mouse.x - tw / 2 - 4, layout.chartBottom + 2, tw + 8, 18)
    ctx.fillStyle = isDark ? '#fff' : '#000'
    ctx.fillText(timeLabel, mouse.x - tw / 2, layout.chartBottom + 14)
  }
}

function drawPriceAxis(
  ctx: CanvasRenderingContext2D,
  vp: ChartViewport,
  layout: ChartLayout,
  assetType?: string,
  isDark?: boolean
) {
  const { chartTop, chartBottom, chartRight, priceAxisWidth, volumeHeight } = layout
  const effectiveBottom = chartBottom - volumeHeight

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  ctx.font = '10px system-ui'
  ctx.textAlign = 'left'

  const priceRange = vp.maxPrice - vp.minPrice
  const priceStep = niceStep(priceRange, 6)
  let price = Math.ceil(vp.minPrice / priceStep) * priceStep

  while (price <= vp.maxPrice) {
    const y = priceToY(price, vp, layout)
    if (y >= chartTop && y <= effectiveBottom) {
      ctx.fillText(formatChartPrice(price, assetType), chartRight + 4, y + 3)
    }
    price += priceStep
  }
}

function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  data: OHLCData[],
  vp: ChartViewport,
  layout: ChartLayout,
  isDark: boolean
) {
  const { chartBottom, chartRight, timeAxisHeight } = layout

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  ctx.font = '10px system-ui'
  ctx.textAlign = 'center'

  const totalCandles = vp.endIndex - vp.startIndex + 1
  const step = Math.max(1, Math.round(totalCandles / 8))

  for (let i = vp.startIndex; i <= vp.endIndex; i += step) {
    const x = indexToX(i, vp, layout)
    if (x > 0 && x < chartRight) {
      ctx.fillText(data[i].date.slice(5), x, chartBottom + timeAxisHeight / 2 + 3)
    }
  }
}

// ==================== Utility Functions ====================

function niceStep(range: number, targetSteps: number): number {
  const roughStep = range / targetSteps
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const normalized = roughStep / magnitude
  let niceNorm: number

  if (normalized <= 1.5) niceNorm = 1
  else if (normalized <= 3.5) niceNorm = 2
  else if (normalized <= 7.5) niceNorm = 5
  else niceNorm = 10

  return niceNorm * magnitude
}

function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function isDarkMode(ctx: CanvasRenderingContext2D): boolean {
  return document.documentElement.classList.contains('dark')
}
