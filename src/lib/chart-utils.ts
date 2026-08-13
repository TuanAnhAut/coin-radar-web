import type { OHLCData, TechnicalIndicators } from '@/lib/types'
import type { ChartLayout, ChartViewport, IndicatorData, PricePoint, ChartDrawing } from '@/lib/chart-types'

/**
 * Calculate SMA (Simple Moving Average)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j]
      }
      result.push(sum / period)
    }
  }
  return result
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  if (closes.length < period + 1) return result

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }

  return result
}

/**
 * Calculate MACD
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { line: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(closes, fastPeriod)
  const slowEMA = calculateEMA(closes, slowPeriod)

  const macdLine = fastEMA.map((f, i) => {
    if (isNaN(f) || isNaN(slowEMA[i])) return NaN
    return f - slowEMA[i]
  })

  const validMACD = macdLine.filter((v) => !isNaN(v))
  const signalLine = calculateEMA(validMACD.map((v) => v), signalPeriod)

  // Align signal back
  const signal: number[] = []
  const histogram: number[] = []
  let macdIdx = 0
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i])) {
      signal.push(NaN)
      histogram.push(NaN)
    } else {
      const sig = signalLine[macdIdx] ?? NaN
      signal.push(sig)
      histogram.push(isNaN(sig) ? NaN : macdLine[i] - sig)
      macdIdx++
    }
  }

  return { line: macdLine, signal, histogram }
}

/**
 * Calculate EMA (Exponential Moving Average)
 */
function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(NaN)
  if (data.length < period) return result

  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i]
  }
  result[period - 1] = sum / period

  const multiplier = 2 / (period + 1)
  for (let i = period; i < data.length; i++) {
    result[i] = (data[i] - result[i - 1]) * multiplier + result[i - 1]
  }

  return result
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(closes, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
    } else {
      let sumSq = 0
      for (let j = 0; j < period; j++) {
        const diff = closes[i - j] - middle[i]
        sumSq += diff * diff
      }
      const sd = Math.sqrt(sumSq / period)
      upper.push(middle[i] + stdDev * sd)
      lower.push(middle[i] - stdDev * sd)
    }
  }

  return { upper, middle, lower }
}

/**
 * Compute all indicators from OHLC data
 */
export function computeIndicators(data: OHLCData[]): IndicatorData {
  const closes = data.map((d) => d.close)

  return {
    ma20: calculateSMA(closes, 20),
    ma50: calculateSMA(closes, 50),
    ma100: calculateSMA(closes, 100),
    bbUpper: calculateBollingerBands(closes).upper,
    bbMiddle: calculateBollingerBands(closes).middle,
    bbLower: calculateBollingerBands(closes).lower,
    rsi: calculateRSI(closes, 14),
    ...calculateMACD(closes, 12, 26, 9),
  }
}

/**
 * Calculate chart viewport based on visible data range
 */
export function computeViewport(
  data: OHLCData[],
  startIdx: number,
  endIdx: number,
  indicators: IndicatorData
): ChartViewport {
  const slice = data.slice(startIdx, endIdx + 1)
  let minPrice = Infinity
  let maxPrice = -Infinity

  for (const candle of slice) {
    minPrice = Math.min(minPrice, candle.low)
    maxPrice = Math.max(maxPrice, candle.high)
  }

  // Include visible indicator values in price range
  const overlayIndicators = [indicators.ma20, indicators.ma50, indicators.ma100, indicators.bbUpper, indicators.bbLower]
  for (const ind of overlayIndicators) {
    if (!ind) continue
    for (let i = startIdx; i <= endIdx; i++) {
      const v = ind[i]
      if (!isNaN(v)) {
        minPrice = Math.min(minPrice, v)
        maxPrice = Math.max(maxPrice, v)
      }
    }
  }

  // Add padding
  const padding = (maxPrice - minPrice) * 0.05 || maxPrice * 0.01
  minPrice -= padding
  maxPrice += padding

  return {
    startIndex: startIdx,
    endIndex: endIdx,
    minPrice,
    maxPrice,
  }
}

/**
 * Calculate chart layout metrics
 */
export function computeLayout(
  canvasWidth: number,
  canvasHeight: number,
  rsiEnabled: boolean,
  macdEnabled: boolean,
  dpr: number = 1
): ChartLayout {
  const w = canvasWidth / dpr
  const h = canvasHeight / dpr

  const priceAxisWidth = 72
  const timeAxisHeight = 28
  const volumeHeight = 60

  const chartLeft = 0
  const chartRight = w - priceAxisWidth
  const chartTop = 0

  const subIndicatorCount = (rsiEnabled ? 1 : 0) + (macdEnabled ? 1 : 0)
  const subIndicatorHeight = subIndicatorCount > 0 ? Math.min(120, (h - timeAxisHeight - volumeHeight) / (subIndicatorCount + 1.5)) : 0

  const chartBottom = h - timeAxisHeight - subIndicatorHeight * subIndicatorCount

  let rsiTop: number | undefined
  let rsiBottom: number | undefined
  let macdTop: number | undefined
  let macdBottom: number | undefined

  let subOffset = chartBottom
  if (rsiEnabled) {
    rsiTop = subOffset
    rsiBottom = subOffset + subIndicatorHeight
    subOffset = rsiBottom
  }
  if (macdEnabled) {
    macdTop = subOffset
    macdBottom = subOffset + subIndicatorHeight
  }

  const chartWidth = chartRight - chartLeft
  const candleCount = Math.max(chartWidth / 10, 10)

  return {
    chartTop,
    chartBottom,
    chartLeft,
    chartRight,
    priceAxisWidth,
    timeAxisHeight,
    volumeHeight,
    rsiTop,
    rsiBottom,
    macdTop,
    macdBottom,
    candleWidth: Math.max(3, Math.floor(chartWidth / candleCount)),
    candleGap: 1,
  }
}

/**
 * Convert price to Y coordinate on chart
 */
export function priceToY(price: number, viewport: ChartViewport, layout: ChartLayout): number {
  const { minPrice, maxPrice } = viewport
  const { chartTop, chartBottom, volumeHeight } = layout
  const effectiveTop = chartTop
  const effectiveBottom = chartBottom - volumeHeight
  if (maxPrice === minPrice) return (effectiveTop + effectiveBottom) / 2
  return effectiveBottom - ((price - minPrice) / (maxPrice - minPrice)) * (effectiveBottom - effectiveTop)
}

/**
 * Convert Y coordinate to price
 */
export function yToPrice(y: number, viewport: ChartViewport, layout: ChartLayout): number {
  const { minPrice, maxPrice } = viewport
  const { chartTop, chartBottom, volumeHeight } = layout
  const effectiveTop = chartTop
  const effectiveBottom = chartBottom - volumeHeight
  if (effectiveBottom === effectiveTop) return (minPrice + maxPrice) / 2
  return minPrice + ((effectiveBottom - y) / (effectiveBottom - effectiveTop)) * (maxPrice - minPrice)
}

/**
 * Convert candle index to X coordinate
 */
export function indexToX(index: number, viewport: ChartViewport, layout: ChartLayout): number {
  const totalCandles = viewport.endIndex - viewport.startIndex + 1
  const chartWidth = layout.chartRight - layout.chartLeft
  const step = chartWidth / totalCandles
  return layout.chartLeft + (index - viewport.startIndex + 0.5) * step
}

/**
 * Convert X coordinate to candle index (approximate)
 */
export function xToIndex(x: number, viewport: ChartViewport, layout: ChartLayout): number {
  const totalCandles = viewport.endIndex - viewport.startIndex + 1
  const chartWidth = layout.chartRight - layout.chartLeft
  const step = chartWidth / totalCandles
  const idx = Math.round((x - layout.chartLeft) / step - 0.5 + viewport.startIndex)
  return Math.max(viewport.startIndex, Math.min(viewport.endIndex, idx))
}

/**
 * Format price for chart axis
 */
export function formatChartPrice(price: number, assetType?: string): string {
  if (price > 100000) {
    return (price / 1000).toFixed(0) + 'K'
  }
  if (price > 1000) {
    return price.toFixed(0)
  }
  if (price > 1) {
    return price.toFixed(2)
  }
  return price.toFixed(4)
}

/**
 * Generate Fibonacci levels between two prices
 */
export function fibonacciLevels(high: number, low: number): number[] {
  const diff = high - low
  return [
    0,        // 0%
    0.236,    // 23.6%
    0.382,    // 38.2%
    0.5,      // 50%
    0.618,    // 61.8%
    0.786,    // 78.6%
    1,        // 100%
  ].map((r) => low + diff * r)
}

/**
 * Get alert info from a drawing
 */
export function getAlertFromDrawing(
  drawing: ChartDrawing,
  symbol: string,
  assetName: string
): { condition: string; conditionDescription: string; value: number } | null {
  if (drawing.points.length < 1) return null

  if (drawing.type === 'hline') {
    const price = drawing.points[0].price
    return {
      condition: 'price_above' || 'price_below',
      conditionDescription: `Giá chạm mức ${price.toFixed(2)}`,
      value: price,
    }
  }

  if (drawing.type === 'fibonacci' && drawing.points.length >= 2 && drawing.fibLevels) {
    // Alert on key Fibonacci levels (23.6%, 38.2%, 50%, 61.8%, 78.6%)
    const keyLevels = drawing.fibLevels.filter((_, i) => i > 0 && i < 6)
    const midLevel = keyLevels[Math.floor(keyLevels.length / 2)] ?? keyLevels[0]
    return {
      condition: 'price_cross',
      conditionDescription: `Giá chạm mức Fibonacci ${midLevel.toFixed(2)}`,
      value: midLevel,
    }
  }

  return null
}
