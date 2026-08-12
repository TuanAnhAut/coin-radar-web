'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { WatchlistItem } from '@/lib/types'

const vnFormatter = new Intl.NumberFormat('vi-VN')

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `${vnFormatter.format(price)} ₫`
  }
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toFixed(3)}`
}

// Generate mini sparkline data (10 points) based on price and change
function generateMiniSparkline(price: number, changePercent: number) {
  const startPrice = price / (1 + changePercent / 100)
  const data = []
  for (let i = 0; i < 10; i++) {
    const progress = i / 9
    const baseValue = startPrice + ((price - startPrice) * progress)
    const noise = Math.sin(i * 3.1) * Math.abs(price * changePercent * 0.002)
    data.push({ value: baseValue + noise })
  }
  return data
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'stock': return 'CK'
    case 'crypto': return 'Crypto'
    case 'gold': return 'Vàng'
    default: return type
  }
}

function MarketCard({ item, index }: { item: WatchlistItem; index: number }) {
  const { openOverlay } = useAppStore()
  const isPositive = item.changePercent >= 0
  const sparkData = generateMiniSparkline(item.price, item.changePercent)
  const gradientId = `spark-${item.assetSymbol}`

  return (
    <motion.div
      className={cn(
        'flex-shrink-0 snap-start',
        // Min-width: 160px mobile, 180px tablet+
        'min-w-[160px] sm:min-w-[180px]'
      )}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        className={cn(
          'rounded-xl border p-3 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]',
          'bg-card h-full'
        )}
        onClick={() => openOverlay('asset-detail', { symbol: item.assetSymbol })}
      >
        {/* Header: symbol + type badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm leading-tight truncate">{item.assetSymbol}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate max-w-[90px] sm:max-w-[110px]">
              {item.assetName}
            </p>
          </div>
          <span className="flex-shrink-0 text-[9px] sm:text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted font-medium">
            {getTypeLabel(item.assetType)}
          </span>
        </div>

        {/* Price - prominent */}
        <p className="text-sm font-bold mb-1.5 tabular-nums">{formatPrice(item.price)}</p>

        {/* Change percent badge */}
        <div className={cn(
          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] sm:text-xs font-medium',
          isPositive ? 'bg-gain-soft text-gain' : 'bg-loss-soft text-loss'
        )}>
          {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
        </div>

        {/* Mini sparkline chart */}
        <div className="h-8 sm:h-10 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

export function MarketCards() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const res = await fetch('/api/watchlist')
        const json = await res.json()
        setItems(json.data.slice(0, 8))
      } catch {
        setError('Không thể tải danh sách theo dõi')
      } finally {
        setLoading(false)
      }
    }
    fetchWatchlist()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[160px] h-[150px] rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (error || items.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold">Danh sách theo dõi</h2>
      </div>
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory',
          // Hide scrollbar cross-browser
          'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]',
          '[&::-webkit-scrollbar]:hidden',
          // Smooth momentum scrolling on touch devices
          'scroll-smooth'
        )}
      >
        {items.map((item, index) => (
          <MarketCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}
