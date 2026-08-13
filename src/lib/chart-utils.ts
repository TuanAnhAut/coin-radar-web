import type { OHLCData } from '@/lib/types'
import type { ChartLayout, ChartViewport, IndicatorData, PricePoint, ChartDrawing } from '@/lib/chart-types'

// ==================== Moving Averages ====================

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) sum += data[i - j]
      result.push(sum / period)
    }
  }
  return result
}

export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(NaN)
  if (data.length < period) return result

  let sum = 0
  for (let i = 0; i < period; i++) sum += data[i]
  result[period - 1] = sum / period

  const k = 2 / (period + 1)
  for (let i = period; i < data.length; i++) {
    result[i] = data[i] * k + result[i - 1] * (1 - k)
  }
  return result
}

// ==================== RSI (Wilder's Smoothing - TradingView standard) ====================

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  if (closes.length < period + 1) return result

  let avgGain = 0
  let avgLoss = 0

  // First `period` changes (i=1..period)
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) avgGain += change
    else avgLoss -= change
  }
  avgGain /= period
  avgLoss /= period

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  // Wilder's smoothing (smoothing factor = 1/period)
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return result
}

// ==================== MACD ====================

export function calculateMACD(
  closes: number[],
  fast = 12,
  slow = 26,
  signal = 9
): { line: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(closes, fast)
  const slowEMA = calculateEMA(closes, slow)

  const macdLine = fastEMA.map((f, i) =>
    isNaN(f) || isNaN(slowEMA[i]) ? NaN : f - slowEMA[i]
  )

  // TradingView-style: compute signal on the valid MACD portion
  const firstValid = macdLine.findIndex((v) => !isNaN(v))
  if (firstValid === -1) {
    return { line: macdLine, signal: new Array(closes.length).fill(NaN), histogram: new Array(closes.length).fill(NaN) }
  }

  const validMACD = macdLine.slice(firstValid)
  const signalEMA = calculateEMA(validMACD, signal)

  const sig: number[] = new Array(closes.length).fill(NaN)
  const hist: number[] = new Array(closes.length).fill(NaN)

  for (let i = 0; i < validMACD.length; i++) {
    const globalIdx = firstValid + i
    sig[globalIdx] = signalEMA[i] ?? NaN
    hist[globalIdx] = isNaN(signalEMA[i]) ? NaN : validMACD[i] - signalEMA[i]
  }

  return { line: macdLine, signal: sig, histogram: hist }
}

// ==================== Bollinger Bands ====================

export function calculateBollingerBands(
  closes: number[],
  period = 20,
  stdDev = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(closes, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { upper.push(NaN); lower.push(NaN) }
    else {
      // Sample standard deviation (TradingView default)
      let sumSq = 0
      for (let j = 0; j < period; j++) {
        const d = closes[i - j] - middle[i]
        sumSq += d * d
      }
      const sd = Math.sqrt(sumSq / (period - 1))
      upper.push(middle[i] + stdDev * sd)
      lower.push(middle[i] - stdDev * sd)
    }
  }
  return { upper, middle, lower }
}

// ==================== Compute All Indicators ====================

export function computeIndicators(data: OHLCData[]): IndicatorData {
  const closes = data.map((d) => d.close)
  const bb = calculateBollingerBands(closes)
  const macd = calculateMACD(closes)

  return {
    ma20: calculateSMA(closes, 20),
    ma50: calculateSMA(closes, 50),
    ma100: calculateSMA(closes, 100),
    bbUpper: bb.upper,
    bbMiddle: bb.middle,
    bbLower: bb.lower,
    rsi: calculateRSI(closes, 14),
    macdLine: macd.line,
    macdSignal: macd.signal,
    macdHistogram: macd.histogram,
  }
}

// ==================== Viewport ====================

export function computeViewport(
  data: OHLCData[],
  startIdx: number,
  endIdx: number,
  indicators: IndicatorData
): ChartViewport {
  let minPrice = Infinity
  let maxPrice = -Infinity

  for (let i = startIdx; i <= endIdx; i++) {
    const c = data[i]
    if (c) {
      minPrice = Math.min(minPrice, c.low)
      maxPrice = Math.max(maxPrice, c.high)
    }
  }

  // Include overlay indicator values with slight weight
  const overlays = [indicators.ma20, indicators.ma50, indicators.ma100, indicators.bbUpper, indicators.bbLower]
  for (const arr of overlays) {
    if (!arr) continue
    for (let i = startIdx; i <= endIdx; i++) {
      const v = arr[i]
      if (!isNaN(v)) {
        minPrice = Math.min(minPrice, v)
        maxPrice = Math.max(maxPrice, v)
      }
    }
  }

  // Professional: asymmetric padding - more space above for indicators
  const range = maxPrice - minPrice || maxPrice * 0.01 || 1
  minPrice -= range * 0.02
  maxPrice += range * 0.04

  return { startIndex: startIdx, endIndex: endIdx, minPrice, maxPrice }
}

// ==================== Layout ====================

export function computeLayout(
  canvasWidth: number,
  canvasHeight: number,
  rsiEnabled: boolean,
  macdEnabled: boolean,
  dpr = 1
): ChartLayout {
  const w = canvasWidth / dpr
  const h = canvasHeight / dpr

  const priceAxisWidth = w < 480 ? 56 : 72
  const timeAxisHeight = w < 480 ? 24 : 28
  const volumeHeight = Math.min(55, h * 0.10)

  const chartLeft = 0
  const chartRight = w - priceAxisWidth
  const chartTop = 0

  // Sub-indicators get proportional space
  const subCount = (rsiEnabled ? 1 : 0) + (macdEnabled ? 1 : 0)
  const subH = subCount > 0 ? Math.min(110, Math.max(60, (h - timeAxisHeight - volumeHeight) / (subCount + 1.2))) : 0

  const chartBottom = h - timeAxisHeight - subH * subCount

  let rsiTop: number | undefined
  let rsiBottom: number | undefined
  let macdTop: number | undefined
  let macdBottom: number | undefined

  let subOffset = chartBottom
  if (rsiEnabled) { rsiTop = subOffset; rsiBottom = subOffset + subH; subOffset = rsiBottom }
  if (macdEnabled) { macdTop = subOffset; macdBottom = subOffset + subH }

  return {
    chartTop, chartBottom, chartLeft, chartRight,
    priceAxisWidth, timeAxisHeight, volumeHeight,
    rsiTop, rsiBottom, macdTop, macdBottom,
    candleWidth: 8, candleGap: 2,
  }
}

// ==================== Coordinate Conversions ====================

export function priceToY(price: number, vp: ChartViewport, layout: ChartLayout): number {
  const { minPrice, maxPrice } = vp
  const effectiveTop = layout.chartTop
  const effectiveBottom = layout.chartBottom - layout.volumeHeight
  if (maxPrice === minPrice) return (effectiveTop + effectiveBottom) / 2
  return effectiveBottom - ((price - minPrice) / (maxPrice - minPrice)) * (effectiveBottom - effectiveTop)
}

export function yToPrice(y: number, vp: ChartViewport, layout: ChartLayout): number {
  const { minPrice, maxPrice } = vp
  const effectiveTop = layout.chartTop
  const effectiveBottom = layout.chartBottom - layout.volumeHeight
  if (effectiveBottom === effectiveTop) return (minPrice + maxPrice) / 2
  return minPrice + ((effectiveBottom - y) / (effectiveBottom - effectiveTop)) * (maxPrice - minPrice)
}

export function indexToX(index: number, vp: ChartViewport, layout: ChartLayout): number {
  const total = vp.endIndex - vp.startIndex + 1
  const chartW = layout.chartRight - layout.chartLeft
  const step = chartW / total
  return layout.chartLeft + (index - vp.startIndex + 0.5) * step
}

export function xToIndex(x: number, vp: ChartViewport, layout: ChartLayout): number {
  const total = vp.endIndex - vp.startIndex + 1
  const chartW = layout.chartRight - layout.chartLeft
  const step = chartW / total
  return Math.max(vp.startIndex, Math.min(vp.endIndex, Math.round((x - layout.chartLeft) / step - 0.5 + vp.startIndex)))
}

// ==================== Formatting ====================

/** Adaptive decimal places for professional price display */
export function getDecimalPlaces(price: number): number {
  if (price >= 100000) return 0
  if (price >= 1000) return 1
  if (price >= 1) return 2
  if (price >= 0.01) return 4
  return 6
}

export function formatChartPrice(price: number, assetType?: string): string {
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(2) + 'M'
  if (price >= 100_000) return (price / 1_000).toFixed(0) + 'K'
  if (price >= 1000) return price.toFixed(1)
  if (price >= 1) return price.toFixed(2)
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(6)
}

/** Format price for display in labels, with adaptive precision */
export function formatPriceLabel(price: number): string {
  if (price >= 10000) return Math.round(price).toLocaleString()
  if (price >= 100) return price.toFixed(1)
  if (price >= 1) return price.toFixed(2)
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(6)
}

export function formatChartVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1) + 'B'
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1) + 'M'
  if (vol >= 1_000) return (vol / 1_000).toFixed(0) + 'K'
  return vol.toString()
}

/** Smart date formatting for chart time axis */
export function formatChartDate(dateStr: string, totalVisible: number): string {
  // dateStr format: "2024-01-15" or "2024-01"
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr

  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  // If showing > 180 days: "Jan '24"
  if (totalVisible > 180) return `${shortMonth(parseInt(month))} '${year.slice(2)}`
  // If showing > 60 days: "Jan 15"
  if (totalVisible > 60) return `${shortMonth(parseInt(month))} ${parseInt(day)}`
  // Default: "Jan 15"
  return `${shortMonth(parseInt(month))} ${parseInt(day)}`
}

function shortMonth(m: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[m - 1] || ''
}

// ==================== Grid Helpers ====================

/** TradingView-style nice step calculation */
export function niceStep(range: number, targetSteps: number): number {
  if (range <= 0) return 1
  const rough = range / targetSteps
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  let nice: number
  if (norm <= 1) nice = 1
  else if (norm <= 2) nice = 2
  else if (norm <= 5) nice = 5
  else nice = 10
  return nice * mag
}

/** Snap price to a "nice" number (e.g. round to nearest 0.5, 1, 5, 10) for drawing tools */
export function snapToPrice(price: number, range: number): number {
  const step = niceStep(range, 8)
  return Math.round(price / step) * step
}

/** Count decimals in a number */
export function countDecimals(val: number): number {
  const s = val.toString()
  const idx = s.indexOf('.')
  return idx === -1 ? 0 : s.length - idx - 1
}

// ==================== Fibonacci ====================

export function fibonacciLevels(high: number, low: number): number[] {
  const diff = high - low
  return [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map((r) => low + diff * r)
}

export const FIB_LABELS = ['0.0%', '23.6%', '38.2%', '50.0%', '61.8%', '78.6%', '100%']

/** Fibonacci zone colors - TradingView style */
export const FIB_ZONE_COLORS = [
  'rgba(239, 83, 80, 0.08)',    // 0% - red zone (top)
  'rgba(255, 152, 0, 0.06)',    // 23.6% - orange
  'rgba(156, 39, 176, 0.06)',   // 38.2% - purple
  'rgba(63, 81, 181, 0.04)',    // 50% - indigo neutral
  'rgba(0, 150, 136, 0.06)',    // 61.8% - teal (golden ratio)
  'rgba(76, 175, 80, 0.06)',    // 78.6% - green
  'rgba(0, 150, 136, 0.08)',    // 100% - teal zone (bottom)
]

/** Fibonacci line colors per level */
export const FIB_LINE_COLORS = [
  'rgba(239, 83, 80, 0.5)',     // 0%
  'rgba(255, 152, 0, 0.4)',     // 23.6%
  'rgba(156, 39, 176, 0.4)',    // 38.2%
  'rgba(63, 81, 181, 0.4)',     // 50%
  'rgba(0, 150, 136, 0.5)',     // 61.8%
  'rgba(76, 175, 80, 0.4)',     // 78.6%
  'rgba(0, 150, 136, 0.5)',     // 100%
]

// ==================== Color Utilities ====================

/** Convert hex color to rgba with alpha */
export function hexToRgba(hex: string, alpha: number): string {
  // Handle short hex
  if (hex.length === 4) {
    const r = parseInt(hex[1] + hex[1], 16)
    const g = parseInt(hex[2] + hex[2], 16)
    const b = parseInt(hex[3] + hex[3], 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Create a gradient color for fills */
export function colorWithAlpha(color: string, alpha: number): string {
  // Already rgba/oklch
  if (color.startsWith('rgba(') || color.startsWith('oklch(')) return color
  // Hex
  if (color.startsWith('#')) return hexToRgba(color, alpha)
  // Fallback
  return color
}

// ==================== Drawing → Alert ====================

export function getAlertFromDrawing(
  drawing: ChartDrawing,
  symbol: string,
  assetName: string
): { condition: string; conditionDescription: string; value: number } | null {
  if (drawing.points.length < 1) return null

  if (drawing.type === 'hline') {
    const price = drawing.points[0].price
    return {
      condition: 'price_cross',
      conditionDescription: `Giá chạm mức ${price.toFixed(2)}`,
      value: price,
    }
  }

  if (drawing.type === 'trendline' && drawing.points.length >= 2) {
    const midPrice = (drawing.points[0].price + drawing.points[1].price) / 2
    return {
      condition: 'price_cross',
      conditionDescription: `Giá chạm đường xu hướng ~${midPrice.toFixed(2)}`,
      value: midPrice,
    }
  }

  if (drawing.type === 'fibonacci' && drawing.points.length >= 2 && drawing.fibLevels) {
    const midLevel = drawing.fibLevels[3] ?? drawing.fibLevels[2]
    return {
      condition: 'price_cross',
      conditionDescription: `Giá chạm Fibonacci 50% = ${midLevel.toFixed(2)}`,
      value: midLevel,
    }
  }

  return null
}
