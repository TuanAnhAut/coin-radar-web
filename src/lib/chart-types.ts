// ==================== Chart Drawing Types ====================

export type DrawingTool = 'crosshair' | 'hline' | 'trendline' | 'fibonacci' | 'rectangle' | 'text'

export type ChartTimeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W'

export interface ChartPoint {
  x: number
  y: number
}

export interface PricePoint {
  index: number // candle index in data
  price: number
}

// Drawing on chart - stored as price/time coordinates
export interface ChartDrawing {
  id: string
  type: DrawingTool
  color: string
  width: number
  // Points in data coordinates (candle index + price)
  points: PricePoint[]
  // Optional label for text drawings
  label?: string
  // For fibonacci: store the range
  fibLevels?: number[]
  // For rectangle
  endPrice?: number
  endIndex?: number
}

// Drawing being created (screen coordinates during drag)
export interface ActiveDrawing {
  type: DrawingTool
  startScreen: ChartPoint
  currentScreen: ChartPoint
  startData: PricePoint | null
  currentData: PricePoint | null
}

// Indicator configuration
export type IndicatorType = 'ma20' | 'ma50' | 'ma100' | 'bb' | 'rsi' | 'macd' | 'volume'

export interface IndicatorConfig {
  type: IndicatorType
  enabled: boolean
  color: string
  params?: Record<string, number>
}

export interface IndicatorData {
  // Overlay indicators (on main chart)
  ma20?: number[]
  ma50?: number[]
  ma100?: number[]
  bbUpper?: number[]
  bbMiddle?: number[]
  bbLower?: number[]
  // Sub-chart indicators
  rsi?: number[]
  macdLine?: number[]
  macdSignal?: number[]
  macdHistogram?: number[]
}

// Chart state
export interface ChartViewport {
  startIndex: number // first visible candle index
  endIndex: number   // last visible candle index
  minPrice: number
  maxPrice: number
}

// Chart layout metrics (computed for rendering)
export interface ChartLayout {
  // Main chart area
  chartTop: number
  chartBottom: number
  chartLeft: number
  chartRight: number
  // Price axis
  priceAxisWidth: number
  // Time axis
  timeAxisHeight: number
  // Volume area (inside chart)
  volumeHeight: number
  // Sub-indicators area
  rsiTop?: number
  rsiBottom?: number
  macdTop?: number
  macdBottom?: number
  // Candle width
  candleWidth: number
  candleGap: number
}
