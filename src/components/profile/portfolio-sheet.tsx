'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Portfolio, PortfolioAsset } from '@/lib/types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} tỷ`
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} tr`
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('vi-VN').format(value)
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(price))
  }
  if (price >= 100) {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(price)
  }
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 }).format(price)
}

function getTypeColor(type: PortfolioAsset['type']) {
  switch (type) {
    case 'stock': return 'bg-blue-500'
    case 'crypto': return 'bg-amber-500'
    case 'gold': return 'bg-yellow-500'
  }
}

function getTypeLabel(type: PortfolioAsset['type']) {
  switch (type) {
    case 'stock': return 'CK'
    case 'crypto': return 'Crypto'
    case 'gold': return 'Vàng'
  }
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-4 px-6">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function PortfolioSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)

  const isOpen = activeOverlay === 'portfolio'

  useEffect(() => {
    if (!isOpen) return

    async function fetchPortfolio() {
      setLoading(true)
      try {
        const res = await fetch('/api/portfolio')
        const json = await res.json()
        setPortfolio(json.data || null)
      } catch {
        toast.error('Không thể tải danh mục theo dõi')
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Danh mục theo dõi</SheetTitle>
        </SheetHeader>

        {loading ? (
          <PortfolioSkeleton />
        ) : portfolio ? (
          <PortfolioContent portfolio={portfolio} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có mã theo dõi nào
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function PortfolioContent({ portfolio }: { portfolio: Portfolio }) {
  // Group by type for allocation bars
  const allocationByType = portfolio.assets.reduce(
    (acc, asset) => {
      const existing = acc.find((a) => a.type === asset.type)
      if (existing) {
        existing.allocation += asset.allocationPercent
      } else {
        acc.push({
          type: asset.type,
          allocation: asset.allocationPercent,
        })
      }
      return acc
    },
    [] as { type: PortfolioAsset['type']; allocation: number }[]
  )

  return (
    <div className="custom-scrollbar overflow-y-auto pb-24 -mx-6 px-6 space-y-5">
      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Total value */}
        <div className="rounded-xl border bg-card p-4 sm:col-span-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tổng giá trị theo dõi</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
        </div>

        {/* Daily price change */}
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Biến động giá ngày</span>
          <div className="flex items-center gap-1 mt-1">
            {portfolio.dailyChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <p
              className={cn(
                'text-lg font-bold',
                portfolio.dailyChange >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {formatCurrency(Math.abs(portfolio.dailyChange))}
            </p>
          </div>
          <span
            className={cn(
              'text-xs',
              portfolio.dailyChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {portfolio.dailyChangePercent >= 0 ? '+' : ''}
            {portfolio.dailyChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* Monthly price change */}
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Biến động giá tháng</span>
          <div className="flex items-center gap-1 mt-1">
            {portfolio.monthlyChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <p
              className={cn(
                'text-lg font-bold',
                portfolio.monthlyChange >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {formatCurrency(Math.abs(portfolio.monthlyChange))}
            </p>
          </div>
          <span
            className={cn(
              'text-xs',
              portfolio.monthlyChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {portfolio.monthlyChangePercent >= 0 ? '+' : ''}
            {portfolio.monthlyChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* Risk score */}
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Điểm rủi ro thị trường</span>
          <p className="text-lg font-bold mt-1">{portfolio.riskScore}/100</p>
          <Progress value={portfolio.riskScore} className="h-1.5 mt-1" />
        </div>
      </motion.div>

      {/* Allocation bars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-4 space-y-3"
      >
        <h4 className="text-sm font-semibold">Phân bổ theo loại tài sản</h4>
        {/* Visual bar */}
        <div className="flex h-3 rounded-full overflow-hidden">
          {allocationByType.map((item) => (
            <div
              key={item.type}
              className={cn('transition-all', getTypeColor(item.type))}
              style={{ width: `${item.allocation}%` }}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {allocationByType.map((item) => (
            <div key={item.type} className="flex items-center gap-1.5">
              <div className={cn('h-2.5 w-2.5 rounded-full', getTypeColor(item.type))} />
              <span className="text-xs text-muted-foreground">
                {getTypeLabel(item.type)} · {item.allocation.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Holdings table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        <div className="p-4 pb-2">
          <h4 className="text-sm font-semibold">Danh sách theo dõi</h4>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Mã</TableHead>
                <TableHead className="text-xs">SL nắm giữ</TableHead>
                <TableHead className="text-xs text-right">Giá nhập</TableHead>
                <TableHead className="text-xs text-right">Giá hiện tại</TableHead>
                <TableHead className="text-xs text-right">Biến động</TableHead>
                <TableHead className="text-xs text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.assets.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', getTypeColor(asset.type))} />
                      <div>
                        <span className="text-sm font-medium">{asset.symbol}</span>
                        <p className="text-[10px] text-muted-foreground leading-none">{asset.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{asset.quantity}</TableCell>
                  <TableCell className="text-sm text-right">{formatPrice(asset.avgPrice)}</TableCell>
                  <TableCell className="text-sm text-right">{formatPrice(asset.currentPrice)}</TableCell>
                  <TableCell
                    className={cn(
                      'text-sm text-right font-medium',
                      asset.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {formatCurrencyShort(asset.pnl)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-sm text-right font-medium',
                      asset.pnlPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {asset.pnlPercent >= 0 ? '+' : ''}
                    {asset.pnlPercent.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Add button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => toast.info('Tính năng sắp ra mắt')}
        >
          <Plus className="h-4 w-4" />
          Thêm mã theo dõi
        </Button>
      </motion.div>
    </div>
  )
}
