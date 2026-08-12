'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Portfolio } from '@/lib/types'

const vnFormatter = new Intl.NumberFormat('vi-VN')

function formatVND(num: number): string {
  return `${vnFormatter.format(num)} ₫`
}

// Generate sparkline data for 30 days based on total value and monthly change
function generateSparklineData(totalValue: number, monthlyChange: number) {
  const startValue = totalValue - monthlyChange
  const data = []
  for (let i = 0; i < 30; i++) {
    const progress = i / 29
    const baseValue = startValue + (monthlyChange * progress)
    const noise = (Math.sin(i * 2.7) * monthlyChange * 0.03) + (Math.cos(i * 1.3) * monthlyChange * 0.02)
    data.push({
      value: Math.round(baseValue + noise),
    })
  }
  return data
}

function getRiskColor(score: number): string {
  if (score < 30) return 'oklch(0.7 0.15 145)'
  if (score < 60) return 'oklch(0.75 0.18 85)'
  return 'oklch(0.6 0.2 25)'
}

function getRiskLabel(score: number): string {
  if (score < 30) return 'Thấp'
  if (score < 60) return 'Trung bình'
  return 'Cao'
}

export function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { openOverlay } = useAppStore()

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio')
        const json = await res.json()
        setPortfolio(json.data)
      } catch {
        setError('Không thể tải dữ liệu danh mục')
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [])

  if (loading) {
    return (
      <Card className="py-4 gap-4">
        <CardContent className="space-y-4 px-4 pt-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6">
            <Skeleton className="h-16 w-32" />
            <Skeleton className="h-16 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !portfolio) {
    return (
      <Card className="py-4 gap-4">
        <CardContent className="px-4 pt-0">
          <p className="text-sm text-muted-foreground">{error ?? 'Không có dữ liệu'}</p>
        </CardContent>
      </Card>
    )
  }

  const sparklineData = generateSparklineData(portfolio.totalValue, portfolio.monthlyChange)
  const isDailyPositive = portfolio.dailyChange >= 0
  const isMonthlyPositive = portfolio.monthlyChange >= 0
  const riskColor = getRiskColor(portfolio.riskScore)
  const riskLabel = getRiskLabel(portfolio.riskScore)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md py-4 gap-4"
        onClick={() => openOverlay('portfolio')}
      >
        <CardContent className="space-y-4 px-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Tổng tài sản
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Total Value */}
          <div>
            <p className="text-2xl font-bold tracking-tight md:text-3xl">
              {formatVND(portfolio.totalValue)}
            </p>
          </div>

          {/* Daily & Monthly Changes */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Hôm nay</p>
              <div className="flex items-center gap-1.5">
                <span className={cn('text-sm font-semibold', isDailyPositive ? 'text-gain' : 'text-loss')}>
                  {isDailyPositive ? '+' : ''}{formatVND(portfolio.dailyChange)}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
                  isDailyPositive ? 'bg-gain-soft text-gain' : 'bg-loss-soft text-loss'
                )}>
                  <TrendingUp className={cn('h-3 w-3', !isDailyPositive && 'rotate-180')} />
                  {isDailyPositive ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Tháng này</p>
              <div className="flex items-center gap-1.5">
                <span className={cn('text-sm font-semibold', isMonthlyPositive ? 'text-gain' : 'text-loss')}>
                  {isMonthlyPositive ? '+' : ''}{formatVND(portfolio.monthlyChange)}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
                  isMonthlyPositive ? 'bg-gain-soft text-gain' : 'bg-loss-soft text-loss'
                )}>
                  <TrendingUp className={cn('h-3 w-3', !isMonthlyPositive && 'rotate-180')} />
                  {isMonthlyPositive ? '+' : ''}{portfolio.monthlyChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Risk Score & Sparkline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Risk Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Điểm rủi ro</span>
                <span className="text-xs font-semibold" style={{ color: riskColor }}>
                  {portfolio.riskScore}/100 · {riskLabel}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${portfolio.riskScore}%`,
                    backgroundColor: riskColor,
                  }}
                />
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isMonthlyPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={isMonthlyPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isMonthlyPositive ? 'oklch(0.7 0.15 145)' : 'oklch(0.6 0.2 25)'}
                    strokeWidth={1.5}
                    fill="url(#sparkGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
