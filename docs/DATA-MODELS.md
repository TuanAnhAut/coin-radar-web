# Data Models

All TypeScript interfaces from the web app, mapped to Dart class structures.

---

## Asset Types

### AssetType
```typescript
type AssetType = 'stock' | 'crypto' | 'gold'
```
```dart
enum AssetType { stock, crypto, gold }
```

### Asset
```typescript
interface Asset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent: number
  volume: number
  marketCap: number
  type: AssetType
  logo: string
}
```
```dart
class Asset {
  final String id;
  final String symbol;
  final String name;
  final double price;
  final double change24h;
  final double changePercent;
  final double volume;
  final double marketCap;
  final AssetType type;
  final String logo;
}
```

### OHLCData
```typescript
interface OHLCData {
  date: string        // ISO string "2024-01-15T00:00:00Z"
  open: number
  high: number
  low: number
  close: number
  volume: number
}
```

### TechnicalIndicators
```typescript
interface TechnicalIndicators {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  ma20: number
  ma50: number
  atr: number
  volumeAvg20: number
}
```

### RelatedNews
```typescript
interface RelatedNews {
  id: string
  title: string
  summary: string
  publishedAt: string
  category: string
}
```

### AssetDetail (extends Asset)
```typescript
interface AssetDetail extends Asset {
  priceHistory: OHLCData[]
  technicalIndicators: TechnicalIndicators
  relatedNews: RelatedNews[]
  high52w: number
  low52w: number
  avgVolume30d: number
  description: string
}
```

---

## Alert Types

### AlertStatus
```typescript
type AlertStatus = 'active' | 'triggered' | 'disabled'
```
```dart
enum AlertStatus { active, triggered, disabled }
```

### AlertRiskLevel
```typescript
type AlertRiskLevel = 'high' | 'medium' | 'low'
```
```dart
enum AlertRiskLevel { high, medium, low }
```

### AlertType
```typescript
type AlertType = 'default' | 'custom'
```

### Alert
```typescript
interface Alert {
  id: string
  assetSymbol: string
  assetName: string
  type: AlertType
  condition: string         // e.g., "rsi_below_30"
  status: AlertStatus
  riskLevel: AlertRiskLevel
  createdAt: string
  triggeredAt: string | null
  conditionDescription: string  // e.g., "RSI giảm xuống dưới 30"
  value?: number
  threshold?: number
  indicatorType?: string   // "RSI" | "MACD" | "MA" | "ATR" | "volume" | "price"
}
```

### CreateAlertInput
```typescript
interface CreateAlertInput {
  assetSymbol: string
  assetName: string
  type?: AlertType
  condition: string
  conditionDescription: string
  riskLevel?: AlertRiskLevel
  indicatorType?: string
  value?: number
  threshold?: number
}
```

### AlertTemplate
```typescript
interface AlertTemplate {
  id: string
  name: string
  description: string
  condition: string
  indicatorType: string
  assetType: AssetType | 'all'
  riskLevel: AlertRiskLevel
}
```

---

## News Types

### NewsCategory
```typescript
type NewsCategory = 'macro' | 'micro' | 'stock' | 'crypto' | 'gold'
```
```dart
enum NewsCategory { macro, micro, stock, crypto, gold }
```

### NewsImportance
```typescript
type NewsImportance = 'important' | 'normal' | 'minor'
```

### NewsArticle
```typescript
interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string          // Markdown format
  source: string
  publishedAt: string
  category: NewsCategory
  tags: string[]
  imageUrl: string
  importance: NewsImportance
  bookmarked?: boolean     // client-side only
}
```

---

## Expert Types

### ExpertOnlineStatus
```typescript
type ExpertOnlineStatus = 'online' | 'away' | 'offline'
```

### Expert
```typescript
interface Expert {
  id: string
  name: string
  avatar: string
  specialty: string       // e.g., "Phân tích chứng khoán", "Crypto"
  rating: number           // 1.0 - 5.0
  reviewCount: number
  onlineStatus: ExpertOnlineStatus
  bio: string
  recentAnalysisCount: number
  accuracyPercent: number  // e.g., 85.5
}
```

---

## Chat Types

### ChatMessageRole
```typescript
type ChatMessageRole = 'user' | 'expert' | 'system'
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  createdAt: string
  expertId: string
}
```

### ChatConversation
```typescript
interface ChatConversation {
  expertId: string
  expertName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}
```

---

## Portfolio Types

### PortfolioAsset
```typescript
interface PortfolioAsset {
  symbol: string
  name: string
  type: AssetType
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number              // Profit/Loss in VND
  pnlPercent: number
  allocationPercent: number
}
```

### Portfolio
```typescript
interface Portfolio {
  totalValue: number
  dailyChange: number
  dailyChangePercent: number
  monthlyChange: number
  monthlyChangePercent: number
  riskScore: number         // 0-100
  assets: PortfolioAsset[]
}
```

---

## Watchlist Types

### WatchlistItem
```typescript
interface WatchlistItem {
  id: string
  assetSymbol: string
  assetName: string
  assetType: AssetType
  price: number
  change24h: number
  changePercent: number
  addedAt: string
}
```

---

## Notification Types

### NotificationType
```typescript
type NotificationType =
  | 'alert_triggered'
  | 'breaking_news'
  | 'expert_message'
  | 'system'
```

### Notification
```typescript
interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  iconType: string
}
```

---

## Scanner Types

### AnomalyType
```typescript
type AnomalyType =
  | 'rsi_oversold'
  | 'rsi_overbought'
  | 'volume_breakout'
  | 'trend_reversal'
  | 'price_breakdown'
  | 'price_breakout'
  | 'macd_bullish'
  | 'macd_bearish'
  | 'volatility_spike'
  | 'ma_crossover'
```

### ScanResult
```typescript
interface ScanResult {
  assetSymbol: string
  assetName: string
  assetType: AssetType
  price: number
  anomalyType: AnomalyType
  anomalyLabel: string        // e.g., "RSI Quá bán"
  anomalyDescription: string
  severity: AlertRiskLevel
  detectedAt: string
  currentValue: number
  normalRange: string          // e.g., "30 - 70"
}
```

### ScanResponse
```typescript
interface ScanResponse {
  totalAnomalies: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  results: ScanResult[]
  scannedAt: string
}
```

---

## User Types

### UserData
```typescript
interface UserData {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  plan: 'free' | 'pro' | 'enterprise'
  twoFactorEnabled: boolean
  createdAt: string
}
```

### AuthScreen
```typescript
type AuthScreen = 'login' | 'register' | 'forgot-password' | 'verify-otp'
```

---

## Chart Types

### DrawingTool
```typescript
type DrawingTool = 'crosshair' | 'hline' | 'trendline' | 'fibonacci' | 'rectangle' | 'text'
```

### ChartTimeframe
```typescript
type ChartTimeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W'
```

### ChartDrawing
```typescript
interface ChartDrawing {
  id: string
  type: DrawingTool
  color: string
  width: number
  points: { price: number; index: number }[]
  label?: string
  fibLevels?: { level: number; price: number; label: string }[]
  endPrice?: number          // for trendline/rectangle
  endIndex?: number
}
```

### IndicatorType
```typescript
type IndicatorType = 'ma20' | 'ma50' | 'ma100' | 'bb' | 'rsi' | 'macd' | 'volume'
```

### IndicatorData
```typescript
interface IndicatorData {
  // Overlay indicators
  ma20: (number | null)[]    // aligned with OHLC index
  ma50: (number | null)[]
  ma100: (number | null)[]
  bbUpper: (number | null)[]
  bbMiddle: (number | null)[]
  bbLower: (number | null)[]
  // Sub-chart indicators
  rsi: (number | null)[]
  macdLine: (number | null)[]
  macdSignal: (number | null)[]
  macdHistogram: (number | null)[]
  // Volume
  volumePositive: boolean[]
}
```

---

## Navigation Types

### ViewType (Main Pages)
```typescript
type ViewType = 'home' | 'news' | 'alerts' | 'market' | 'chat' | 'profile'
```

### OverlayType (Modals/Sheets)
```typescript
type OverlayType =
  | 'search'
  | 'notifications'
  | 'asset-detail'
  | 'alert-detail'
  | 'news-detail'
  | 'alert-builder'
  | 'alert-templates'
  | 'watchlist'
  | 'scanner'
  | 'expert-profile'
  | 'portfolio'
  | 'notification-settings'
  | 'display-settings'
  | 'security-settings'
  | 'subscription'
  | 'edit-profile'
  | 'two-factor'
  | 'change-password'
  | 'auth-gate'
  | null
```

---

## Formatting Utilities (Vietnamese)

| Function | Input | Output Example |
|----------|-------|---------------|
| `formatCurrency(value, type)` | `(50000, 'stock')` | `50.000đ` |
| `formatCurrency(value, type)` | `(50000, 'gold')` | `50.000 ₫` |
| `formatCurrency(value, type)` | `(65000, 'crypto')` | `$65,000.00` |
| `formatNumber(value)` | `1234567` | `1.234.567` |
| `formatVolume(value)` | `1500000` | `1.5M` |
| `formatVolume(value)` | `2500000000` | `2.5B` |
| `formatPercent(value)` | `2.35` | `+2.35%` |
| `formatPercent(value)` | `-1.5` | `-1.50%` |
| `formatDateTime(iso)` | ISO string | `15/01/2024 08:30` |
