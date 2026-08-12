'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Activity,
  Loader2,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { Asset, AlertRiskLevel, AlertTemplate } from '@/lib/types'

const ASSET_TYPES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'stock', label: 'CK' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'gold', label: 'Vàng' },
] as const

const CONDITION_TYPES = [
  { key: 'technical', label: 'Chỉ báo kỹ thuật', icon: BarChart3 },
  { key: 'price', label: 'Giá chạm', icon: DollarSign },
  { key: 'volatility', label: 'Biến động %', icon: Activity },
] as const

const INDICATORS = [
  { key: 'RSI', label: 'RSI', desc: 'Chỉ số sức mạnh tương đối' },
  { key: 'MACD', label: 'MACD', desc: 'Chỉ số hội tụ phân kỳ' },
  { key: 'MA', label: 'MA', desc: 'Đường trung bình động' },
  { key: 'ATR', label: 'ATR', desc: 'Chỉ số biến động trung bình' },
  { key: 'Volume', label: 'Volume', desc: 'Khối lượng giao dịch' },
] as const

const RISK_LEVELS = [
  { key: 'high' as AlertRiskLevel, label: 'Cao', color: 'bg-destructive text-destructive-foreground border-destructive/30' },
  { key: 'medium' as AlertRiskLevel, label: 'Vừa', color: 'bg-amber-500 text-white border-amber-500/30' },
  { key: 'low' as AlertRiskLevel, label: 'Thấp', color: 'bg-emerald-500 text-white border-emerald-500/30' },
] as const

const RECENT_ASSETS = ['BTC', 'FPT', 'ETH', 'SJC', 'VNINDEX', 'SOL', 'VIC', 'HPG']

const STEPS = ['Chọn tài sản', 'Chọn điều kiện', 'Cài đặt']

function riskBorder(risk: AlertRiskLevel) {
  switch (risk) {
    case 'high': return 'border-destructive ring-destructive/20'
    case 'medium': return 'border-amber-500 ring-amber-500/20'
    case 'low': return 'border-emerald-500 ring-emerald-500/20'
  }
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
      {STEPS.map((step, i) => (
        <div key={step} className="flex shrink-0 items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              i < current
                ? 'bg-primary text-primary-foreground'
                : i === current
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span
            className={cn(
              'text-xs font-medium whitespace-nowrap hidden sm:inline',
              i <= current ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'h-px w-4 sm:w-8 transition-colors',
                i < current ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function formatPrice(price: number, symbol: string): string {
  if (['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA'].includes(symbol)) {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
  if (['SJC', 'XAU'].includes(symbol)) {
    return `${(price / 1_000_000).toFixed(1)} tr VNĐ`
  }
  return `${price.toLocaleString('vi-VN')} VNĐ`
}

// ---------- Step 1: Asset Selection ----------
function StepAsset({
  selected,
  onSelect,
}: {
  selected: Asset | null
  onSelect: (asset: Asset) => void
}) {
  const [search, setSearch] = useState('')
  const [assetType, setAssetType] = useState<string>('all')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAssets = useCallback(async (query?: string, type?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      if (type && type !== 'all') params.set('type', type)
      const res = await fetch(`/api/assets?${params.toString()}`)
      const json = await res.json()
      setAssets(json.data ?? [])
    } catch {
      setAssets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets(search, assetType)
  }, [search, assetType, fetchAssets])

  const handleRecentClick = (symbol: string) => {
    const asset = assets.find((a) => a.symbol === symbol)
    if (asset) onSelect(asset)
    else {
      fetch(`/api/assets?search=${symbol}`)
        .then((r) => r.json())
        .then((json) => {
          const found = (json.data ?? []).find((a: Asset) => a.symbol === symbol)
          if (found) onSelect(found)
        })
        .catch(() => {})
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Search - full width, proper height */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm mã tài sản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-9 text-sm sm:h-11"
        />
      </div>

      {/* Asset type filter - horizontal scrollable chips */}
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none">
        {ASSET_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setAssetType(t.key)}
            className={cn(
              'flex min-h-[36px] shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors',
              assetType === t.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selected asset */}
      {selected && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{selected.symbol}</span>
              <span className="ml-2 text-sm text-muted-foreground">{selected.name}</span>
            </div>
            <button onClick={() => onSelect(null as unknown as Asset)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold">{formatPrice(selected.price, selected.symbol)}</span>
            <span className={cn('text-sm font-medium', selected.change24h >= 0 ? 'text-gain' : 'text-loss')}>
              {selected.change24h >= 0 ? '+' : ''}{selected.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Recent assets */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Gần đây</p>
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none">
          {RECENT_ASSETS.map((sym) => (
            <button
              key={sym}
              onClick={() => handleRecentClick(sym)}
              className={cn(
                'flex min-h-[36px] shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors',
                selected?.symbol === sym
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'
              )}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Asset list - proper height items, price visible */}
      <div className="max-h-48 overflow-y-auto custom-scrollbar rounded-lg border divide-y">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : assets.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy</p>
        ) : (
          assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onSelect(asset)}
              className={cn(
                'flex min-h-[60px] w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent',
                selected?.id === asset.id && 'bg-primary/5'
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
                {asset.symbol.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">{formatPrice(asset.price, asset.symbol)}</p>
                <p className={cn('text-xs font-medium', asset.change24h >= 0 ? 'text-gain' : 'text-loss')}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ---------- Step 2: Condition Selection ----------
function StepCondition({
  conditionType,
  setConditionType,
  indicator,
  setIndicator,
  indicatorConfig,
  setIndicatorConfig,
  template,
}: {
  conditionType: string
  setConditionType: (v: string) => void
  indicator: string
  setIndicator: (v: string) => void
  indicatorConfig: Record<string, unknown>
  setIndicatorConfig: (v: Record<string, unknown>) => void
  template: AlertTemplate | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Template info */}
      {template && (
        <div className="rounded-lg border bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary mb-1">Mẫu đã chọn</p>
          <p className="font-semibold text-sm">{template.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          <p className="mt-1.5 text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1 break-words">
            {template.condition}
          </p>
        </div>
      )}

      {/* Condition type selector - full width on mobile, 3 cols on desktop */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Loại điều kiện</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CONDITION_TYPES.map((ct) => (
            <button
              key={ct.key}
              onClick={() => setConditionType(ct.key)}
              className={cn(
                'flex min-h-[52px] items-center justify-center gap-2 rounded-lg border p-3 text-center transition-colors',
                conditionType === ct.key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'
              )}
            >
              <ct.icon className="h-5 w-5 shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">{ct.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Technical indicator options */}
      {conditionType === 'technical' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Chỉ báo</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INDICATORS.map((ind) => (
              <button
                key={ind.key}
                onClick={() => setIndicator(ind.key)}
                className={cn(
                  'flex min-h-[52px] items-center rounded-lg border p-3 text-left transition-colors',
                  indicator === ind.key
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold', indicator === ind.key ? 'text-primary' : '')}>{ind.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{ind.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Indicator-specific config - full width inputs and sliders */}
          {indicator === 'RSI' && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">Ngưỡng RSI</Label>
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs text-muted-foreground w-14">Quá mua</span>
                <Slider
                  value={[(indicatorConfig.rsiOverbought as number) ?? 70]}
                  min={60}
                  max={90}
                  step={1}
                  onValueChange={([v]) => setIndicatorConfig({ ...indicatorConfig, rsiOverbought: v })}
                  className="flex-1"
                />
                <Badge variant="outline" className="w-10 shrink-0 justify-center font-mono text-xs">
                  {(indicatorConfig.rsiOverbought as number) ?? 70}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs text-muted-foreground w-14">Quá bán</span>
                <Slider
                  value={[(indicatorConfig.rsiOversold as number) ?? 30]}
                  min={10}
                  max={40}
                  step={1}
                  onValueChange={([v]) => setIndicatorConfig({ ...indicatorConfig, rsiOversold: v })}
                  className="flex-1"
                />
                <Badge variant="outline" className="w-10 shrink-0 justify-center font-mono text-xs">
                  {(indicatorConfig.rsiOversold as number) ?? 30}
                </Badge>
              </div>
            </div>
          )}

          {indicator === 'MACD' && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">Hướng cắt</Label>
              {/* Direction buttons - full width on mobile */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { key: 'bullish', label: 'Cắt lên (Tín hiệu mua)', icon: TrendingUp, color: 'text-gain border-gain/30 bg-gain-soft' },
                  { key: 'bearish', label: 'Cắt xuống (Tín hiệu bán)', icon: TrendingDown, color: 'text-loss border-loss/30 bg-loss-soft' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setIndicatorConfig({ ...indicatorConfig, macdDirection: opt.key })}
                    className={cn(
                      'flex min-h-[48px] items-center gap-2 rounded-lg border p-3 transition-colors',
                      indicatorConfig.macdDirection === opt.key
                        ? opt.color
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <opt.icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {indicator === 'MA' && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">Kỳ MA</Label>
              <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none">
                {[20, 50, 100].map((period) => (
                  <button
                    key={period}
                    onClick={() => setIndicatorConfig({ ...indicatorConfig, maPeriod: period })}
                    className={cn(
                      'min-h-[40px] shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                      indicatorConfig.maPeriod === period
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    MA{period}
                  </button>
                ))}
              </div>
              <Label className="text-sm font-medium mt-2">Hướng</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { key: 'above', label: 'Giá trên MA', icon: TrendingUp, color: 'text-gain border-gain/30 bg-gain-soft' },
                  { key: 'below', label: 'Giá dưới MA', icon: TrendingDown, color: 'text-loss border-loss/30 bg-loss-soft' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setIndicatorConfig({ ...indicatorConfig, maDirection: opt.key })}
                    className={cn(
                      'flex min-h-[48px] items-center gap-2 rounded-lg border p-3 transition-colors',
                      indicatorConfig.maDirection === opt.key
                        ? opt.color
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <opt.icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {indicator === 'ATR' && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">Hệ số dãn rộng ATR</Label>
              <Slider
                value={[(indicatorConfig.atrMultiplier as number) ?? 2]}
                min={1.5}
                max={4}
                step={0.1}
                onValueChange={([v]) => setIndicatorConfig({ ...indicatorConfig, atrMultiplier: v })}
              />
              <div className="text-center">
                <Badge variant="outline" className="font-mono text-xs">{((indicatorConfig.atrMultiplier as number) ?? 2).toFixed(1)}x</Badge>
              </div>
            </div>
          )}

          {indicator === 'Volume' && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-sm font-medium">Tăng khối lượng (%)</Label>
              <Slider
                value={[(indicatorConfig.volumeIncrease as number) ?? 200]}
                min={50}
                max={500}
                step={10}
                onValueChange={([v]) => setIndicatorConfig({ ...indicatorConfig, volumeIncrease: v })}
              />
              <div className="text-center">
                <Badge variant="outline" className="font-mono text-xs">{(indicatorConfig.volumeIncrease as number) ?? 200}%</Badge>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price condition */}
      {conditionType === 'price' && (
        <div className="space-y-3 rounded-lg border p-4">
          <Label className="text-sm font-medium">Mức giá mục tiêu</Label>
          <Input
            type="number"
            placeholder="Nhập mức giá..."
            className="h-12 text-sm sm:h-10"
            value={(indicatorConfig.targetPrice as number) ?? ''}
            onChange={(e) => setIndicatorConfig({ ...indicatorConfig, targetPrice: parseFloat(e.target.value) || 0 })}
          />
          <Label className="text-sm font-medium mt-2">Hướng</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { key: 'above', label: 'Giá vượt lên trên', icon: TrendingUp, color: 'text-gain border-gain/30 bg-gain-soft' },
              { key: 'below', label: 'Giá rơi xuống dưới', icon: TrendingDown, color: 'text-loss border-loss/30 bg-loss-soft' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setIndicatorConfig({ ...indicatorConfig, priceDirection: opt.key })}
                className={cn(
                  'flex min-h-[48px] items-center gap-2 rounded-lg border p-3 transition-colors',
                  indicatorConfig.priceDirection === opt.key
                    ? opt.color
                    : 'border-border hover:bg-accent'
                )}
              >
                <opt.icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volatility condition */}
      {conditionType === 'volatility' && (
        <div className="space-y-3 rounded-lg border p-4">
          <Label className="text-sm font-medium">Biến động (%)</Label>
          <Slider
            value={[(indicatorConfig.volatilityPercent as number) ?? 5]}
            min={1}
            max={20}
            step={0.5}
            onValueChange={([v]) => setIndicatorConfig({ ...indicatorConfig, volatilityPercent: v })}
          />
          <div className="text-center">
            <Badge variant="outline" className="font-mono text-xs">{((indicatorConfig.volatilityPercent as number) ?? 5).toFixed(1)}%</Badge>
          </div>
          <Label className="text-sm font-medium mt-2">Khung thời gian</Label>
          <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none">
            {[
              { key: '1h', label: '1 giờ' },
              { key: '4h', label: '4 giờ' },
              { key: '1d', label: '1 ngày' },
              { key: '1w', label: '1 tuần' },
            ].map((tf) => (
              <button
                key={tf.key}
                onClick={() => setIndicatorConfig({ ...indicatorConfig, timeframe: tf.key })}
                className={cn(
                  'min-h-[40px] shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  indicatorConfig.timeframe === tf.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent'
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ---------- Step 3: Settings ----------
function StepSettings({
  riskLevel,
  setRiskLevel,
  actionType,
  setActionType,
  summary,
  submitting,
  onSubmit,
}: {
  riskLevel: AlertRiskLevel
  setRiskLevel: (v: AlertRiskLevel) => void
  actionType: string
  setActionType: (v: string) => void
  summary: { label: string; value: string }[]
  submitting: boolean
  onSubmit: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Risk level - horizontal scrollable or stacked on mobile */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Mức rủi ro</Label>
        <div className="grid grid-cols-3 gap-2">
          {RISK_LEVELS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRiskLevel(r.key)}
              className={cn(
                'min-h-[48px] rounded-lg border p-3 text-center transition-colors',
                riskLevel === r.key
                  ? cn('ring-2', r.color)
                  : 'border-border hover:bg-accent'
              )}
            >
              <span className="text-sm font-semibold">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action type - full width cards on mobile */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Hành động</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { key: 'notify', label: 'Chỉ thông báo', icon: Zap, desc: 'Nhận thông báo khi kích hoạt' },
            { key: 'stoploss', label: 'Đề xuất cắt lỗ', icon: TrendingDown, desc: 'Gợi ý mức cắt lỗ phù hợp' },
          ].map((a) => (
            <button
              key={a.key}
              onClick={() => setActionType(a.key)}
              className={cn(
                'flex min-h-[64px] items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                actionType === a.key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'
              )}
            >
              <a.icon className="h-5 w-5 shrink-0" />
              <div>
                <span className="text-xs font-semibold">{a.label}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary - full width with proper text sizes */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Tóm tắt</Label>
        <div className="rounded-lg border divide-y">
          {summary.map((s, i) => (
            <div key={i} className="flex items-start justify-between gap-2 px-4 py-2.5">
              <span className="text-xs text-muted-foreground shrink-0 sm:text-sm">{s.label}</span>
              <span className="text-xs font-medium text-right max-w-[60%] break-words sm:text-sm">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button - full width, min 48px height */}
      <Button
        className="w-full min-h-[48px] text-sm font-semibold"
        size="lg"
        disabled={submitting}
        onClick={onSubmit}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo...
          </>
        ) : (
          'Tạo cảnh báo'
        )}
      </Button>
    </motion.div>
  )
}

// ---------- Main Builder Dialog ----------
export function AlertBuilderSheet() {
  const { activeOverlay, overlayData, closeOverlay, openOverlay } = useAppStore()
  const open = activeOverlay === 'alert-builder'

  const [step, setStep] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [conditionType, setConditionType] = useState('technical')
  const [indicator, setIndicator] = useState('RSI')
  const [indicatorConfig, setIndicatorConfig] = useState<Record<string, unknown>>({
    rsiOverbought: 70,
    rsiOversold: 30,
    macdDirection: 'bearish',
    maPeriod: 20,
    maDirection: 'below',
    atrMultiplier: 2,
    volumeIncrease: 200,
    targetPrice: 0,
    priceDirection: 'above',
    volatilityPercent: 5,
    timeframe: '1d',
  })
  const [riskLevel, setRiskLevel] = useState<AlertRiskLevel>('medium')
  const [actionType, setActionType] = useState('notify')
  const [submitting, setSubmitting] = useState(false)
  const [template, setTemplate] = useState<AlertTemplate | null>(null)

  // Pre-fill from template
  useEffect(() => {
    if (open) {
      const tpl = overlayData?.template as AlertTemplate | undefined
      if (tpl) {
        setTemplate(tpl)
        if (tpl.indicatorType === 'RSI') setIndicator('RSI')
        else if (tpl.indicatorType === 'MACD') setIndicator('MACD')
        else if (tpl.indicatorType === 'MA') setIndicator('MA')
        else if (tpl.indicatorType === 'ATR') setIndicator('ATR')
        else if (tpl.indicatorType === 'volume') setIndicator('Volume')
        else if (tpl.indicatorType === 'price') setConditionType('price')
        else if (tpl.indicatorType === 'event') setConditionType('volatility')
        setRiskLevel(tpl.riskLevel)
      }
      // Pre-fill asset symbol
      const sym = overlayData?.assetSymbol as string | undefined
      if (sym) {
        fetch(`/api/assets?search=${sym}`)
          .then((r) => r.json())
          .then((json) => {
            const found = (json.data ?? []).find((a: Asset) => a.symbol === sym)
            if (found) setSelectedAsset(found)
          })
          .catch(() => {})
      }
    }
  }, [open, overlayData])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(0)
      setSelectedAsset(null)
      setConditionType('technical')
      setIndicator('RSI')
      setIndicatorConfig({
        rsiOverbought: 70,
        rsiOversold: 30,
        macdDirection: 'bearish',
        maPeriod: 20,
        maDirection: 'below',
        atrMultiplier: 2,
        volumeIncrease: 200,
        targetPrice: 0,
        priceDirection: 'above',
        volatilityPercent: 5,
        timeframe: '1d',
      })
      setRiskLevel('medium')
      setActionType('notify')
      setSubmitting(false)
      setTemplate(null)
    }
  }, [open])

  const canNext = useMemo(() => {
 if (step === 0) return !!selectedAsset
    return step === 1
      ? conditionType === 'price'
        ? !!indicatorConfig.targetPrice && (indicatorConfig.targetPrice as number) > 0
        : !!indicator
      : true
  }, [step, selectedAsset, conditionType, indicator, indicatorConfig])

  const buildConditionDescription = useCallback((): { condition: string; desc: string; indType: string; value?: number; threshold?: number } => {
    if (!selectedAsset) return { condition: '', desc: '', indType: '' }
    const sym = selectedAsset.symbol

    if (conditionType === 'technical') {
      switch (indicator) {
        case 'RSI':
          return {
            condition: `RSI > ${(indicatorConfig.rsiOverbought as number) ?? 70}`,
            desc: `Chỉ số RSI của ${sym} vượt mức ${(indicatorConfig.rsiOverbought as number) ?? 70}, cảnh báo vùng quá mua`,
            indType: 'RSI',
            value: 68,
            threshold: (indicatorConfig.rsiOverbought as number) ?? 70,
          }
        case 'MACD': {
          const dir = indicatorConfig.macdDirection as string
          return {
            condition: dir === 'bullish' ? 'MACD cắt lên tín hiệu' : 'MACD cắt xuống tín hiệu',
            desc: `Đường MACD của ${sym} ${dir === 'bullish' ? 'cắt lên' : 'cắt xuống'} đường tín hiệu`,
            indType: 'MACD',
          }
        }
        case 'MA': {
          const period = indicatorConfig.maPeriod as number
          const dir = indicatorConfig.maDirection as string
          return {
            condition: `Giá ${dir === 'above' ? '>' : '<'} MA${period}`,
            desc: `Giá ${sym} ${dir === 'above' ? 'trên' : 'dưới'} đường MA${period}`,
            indType: 'MA',
          }
        }
        case 'ATR': {
          const mult = indicatorConfig.atrMultiplier as number
          return {
            condition: `ATR > ${mult} * AvgATR`,
            desc: `ATR ${sym} dãn rộng vượt ${mult}x trung bình, dự báo biến động mạnh`,
            indType: 'ATR',
          }
        }
        case 'Volume': {
          const pct = indicatorConfig.volumeIncrease as number
          return {
            condition: `Volume > ${pct}% avg`,
            desc: `Khối lượng ${sym} tăng vượt ${pct}% so với trung bình`,
            indType: 'volume',
          }
        }
        default:
          return { condition: '', desc: '', indType: indicator }
      }
    }

    if (conditionType === 'price') {
      const price = indicatorConfig.targetPrice as number
      const dir = indicatorConfig.priceDirection as string
      return {
        condition: `Giá ${dir === 'above' ? '>' : '<'} ${price.toLocaleString()}`,
        desc: `Giá ${sym} ${dir === 'above' ? 'vượt lên trên' : 'rơi xuống dưới'} ${price.toLocaleString()}`,
        indType: 'price',
        value: selectedAsset.price,
        threshold: price,
      }
    }

    // volatility
    const pct = indicatorConfig.volatilityPercent as number
    const tf = indicatorConfig.timeframe as string
    const tfLabel: Record<string, string> = { '1h': '1 giờ', '4h': '4 giờ', '1d': '1 ngày', '1w': '1 tuần' }
    return {
      condition: `Biến động > ${pct}% trong ${tfLabel[tf] ?? tf}`,
      desc: `${sym} biến động hơn ${pct}% trong ${tfLabel[tf] ?? tf}`,
      indType: 'ATR',
    }
  }, [selectedAsset, conditionType, indicator, indicatorConfig])

  const summary = useMemo(() => {
    if (!selectedAsset) return []
    const cond = buildConditionDescription()
    return [
      { label: 'Tài sản', value: `${selectedAsset.symbol} - ${selectedAsset.name}` },
      { label: 'Điều kiện', value: cond.condition },
      { label: 'Mô tả', value: cond.desc },
      { label: 'Rủi ro', value: riskLevel === 'high' ? 'Cao' : riskLevel === 'medium' ? 'Vừa' : 'Thấp' },
      { label: 'Hành động', value: actionType === 'notify' ? 'Chỉ thông báo' : 'Đề xuất cắt lỗ' },
    ]
  }, [selectedAsset, riskLevel, actionType, buildConditionDescription])

  const handleSubmit = async () => {
    if (!selectedAsset) return
    setSubmitting(true)
    try {
      const cond = buildConditionDescription()
      const body = {
        assetSymbol: selectedAsset.symbol,
        assetName: selectedAsset.name,
        type: 'custom',
        condition: cond.condition,
        conditionDescription: cond.desc,
        riskLevel,
        indicatorType: cond.indType,
        value: cond.value,
        threshold: cond.threshold,
      }
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const json = await res.json()
        closeOverlay()
        setTimeout(() => {
          openOverlay('alert-detail', { id: json.data.id })
        }, 300)
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeOverlay()}>
      {/* Full screen on mobile, centered dialog on desktop */}
      <DialogContent className="fixed inset-0 left-0 top-0 flex w-full max-w-full translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:mx-auto sm:mt-0 sm:max-w-lg sm:h-auto sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0">
        <DialogHeader className="px-4 pt-4 pb-0 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base sm:text-lg">Tạo cảnh báo mới</DialogTitle>
              <DialogDescription className="mt-1 text-xs sm:text-sm">
                {STEPS[step]}
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3">
            <StepIndicator current={step} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 sm:px-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepAsset
                key="step-0"
                selected={selectedAsset}
                onSelect={setSelectedAsset}
              />
            )}
            {step === 1 && (
              <StepCondition
                key="step-1"
                conditionType={conditionType}
                setConditionType={setConditionType}
                indicator={indicator}
                setIndicator={setIndicator}
                indicatorConfig={indicatorConfig}
                setIndicatorConfig={setIndicatorConfig}
                template={template}
              />
            )}
            {step === 2 && (
              <StepSettings
                key="step-2"
                riskLevel={riskLevel}
                setRiskLevel={setRiskLevel}
                actionType={actionType}
                setActionType={setActionType}
                summary={summary}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation - proper size and spacing at bottom */}
        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6 sm:py-4">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="min-h-[44px] gap-1.5 text-sm sm:min-h-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          {step < 2 && (
            <Button
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              disabled={!canNext}
              className="min-h-[44px] gap-1.5 text-sm sm:min-h-0"
            >
              <span className="hidden sm:inline">Tiếp theo</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
