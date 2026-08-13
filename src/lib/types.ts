// ==================== Asset Types ====================

export type AssetType = 'stock' | 'crypto' | 'gold';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  type: AssetType;
  logo: string;
}

export interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ma20: number;
  ma50: number;
  atr: number;
  volumeAvg20: number;
}

export interface RelatedNews {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
}

export interface AssetDetail extends Asset {
  priceHistory: OHLCData[];
  technicalIndicators: TechnicalIndicators;
  relatedNews: RelatedNews[];
  high52w: number;
  low52w: number;
  avgVolume30d: number;
  description: string;
}

// ==================== Alert Types ====================

export type AlertStatus = 'active' | 'triggered' | 'disabled';
export type AlertRiskLevel = 'high' | 'medium' | 'low';
export type AlertType = 'default' | 'custom';

export interface Alert {
  id: string;
  assetSymbol: string;
  assetName: string;
  type: AlertType;
  condition: string;
  status: AlertStatus;
  riskLevel: AlertRiskLevel;
  createdAt: string;
  triggeredAt: string | null;
  conditionDescription: string;
  value?: number;
  threshold?: number;
  indicatorType?: string;
}

export interface CreateAlertInput {
  assetSymbol: string;
  assetName: string;
  type: AlertType;
  condition: string;
  conditionDescription: string;
  riskLevel: AlertRiskLevel;
  value?: number;
  threshold?: number;
  indicatorType?: string;
}

// ==================== Alert Template Types ====================

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  condition: string;
  indicatorType: string;
  assetType: AssetType | 'all';
  riskLevel: AlertRiskLevel;
}

// ==================== News Types ====================

export type NewsCategory = 'macro' | 'micro' | 'stock' | 'crypto' | 'gold';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
  tags: string[];
  imageUrl: string;
}

// ==================== Expert Types ====================

export type ExpertOnlineStatus = 'online' | 'away' | 'offline';

export interface Expert {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  onlineStatus: ExpertOnlineStatus;
  bio: string;
  recentAnalysisCount: number;
  accuracyPercent: number;
}

// ==================== Chat Types ====================

export type ChatMessageRole = 'user' | 'expert' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  expertId: string;
}

export interface ChatConversation {
  expertId: string;
  expertName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// ==================== Portfolio Types ====================

export interface PortfolioAsset {
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  allocationPercent: number;
}

export interface Portfolio {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  riskScore: number;
  assets: PortfolioAsset[];
}

// ==================== Watchlist Types ====================

export interface WatchlistItem {
  id: string;
  assetSymbol: string;
  assetName: string;
  assetType: AssetType;
  price: number;
  change24h: number;
  changePercent: number;
  addedAt: string;
}

// ==================== Notification Types ====================

export type NotificationType =
  | 'alert_triggered'
  | 'breaking_news'
  | 'expert_message'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  iconType: string;
}

// ==================== Scanner Types ====================

export type AnomalyType =
  | 'rsi_oversold'
  | 'rsi_overbought'
  | 'volume_breakout'
  | 'trend_reversal'
  | 'price_breakdown'
  | 'price_breakout'
  | 'macd_bullish'
  | 'macd_bearish'
  | 'volatility_spike'
  | 'ma_crossover';

export interface ScanResult {
  assetSymbol: string;
  assetName: string;
  assetType: AssetType;
  price: number;
  anomalyType: AnomalyType;
  anomalyLabel: string;
  anomalyDescription: string;
  severity: AlertRiskLevel;
  detectedAt: string;
  currentValue: number;
  normalRange: string;
}

export interface ScanResponse {
  totalAnomalies: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  results: ScanResult[];
  scannedAt: string;
}
