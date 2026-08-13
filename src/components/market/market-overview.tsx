'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Bookmark,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  LineChart,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { formatCurrency, formatVolume, formatPercent, formatNumber } from '@/lib/format'
import type { Asset, AssetType } from '@/lib/types'

type SortField = 'symbol' | 'price' | 'changePercent' | 'change24h' | 'volume' | 'marketCap'
type SortDir = 'asc' | 'desc'

const SECTOR_FILTERS: Record<AssetType, string[]> = {
  stock: ['Tất cả', 'Ngân hàng', 'Bất động sản', 'Công nghệ', 'Thép', 'Chỉ số'],
  crypto: ['Tất cả', 'Layer 1', 'DeFi', 'Meme', 'Stablecoin'],
  gold: ['Tất cả', 'Vàng miếng', 'Vàng thế giới'],
}

const SECTOR_MAP: Record<string, string[]> = {
  'Ngân hàng': ['MBB', 'VCB', 'TCB'],
  'Bất động sản': ['VIC', 'VHM'],
  'Công nghệ': ['FPT', 'GVR'],
  'Thép': ['HPG'],
  'Chỉ số': ['VNINDEX'],
  'Layer 1': ['BTC', 'ETH', 'SOL', 'ADA'],
  DeFi: [],
  Meme: [],
  Stablecoin: [],
  'Vàng miếng': ['SJC'],
  'Vàng thế giới': ['XAU'],
}

function SortIcon({ field, currentField, currentDir }: { field: SortField; currentField: SortField; currentDir: SortDir }) {
  if (currentField !== field) return <ArrowUpDown className="size-3 opacity-40" />
  return currentDir === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
}

export function MarketOverview() {
  const { openOverlay, openChartDetail } = useAppStore()
  const [activeTab, setActiveTab] = useState<AssetType>('stock')
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState('Tất cả')
  const [sortField, setSortField] = useState<SortField>('marketCap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const fetchIdRef = useRef(0)

  useEffect(() => {
    const id = ++fetchIdRef.current
    fetch(`/api/assets?type=${activeTab}`)
      .then((r) => r.json())
      .then((res) => {
        if (fetchIdRef.current === id) setAssets(res.data ?? [])
      })
    return () => {
      fetchIdRef.current++
    }
  }, [activeTab])

  const loading = assets === null

  const filteredAssets = useMemo(() => {
    const list = assets ? [...assets] : []

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return list.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      ).sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal))
      })
    }

    let filtered = list
    if (sectorFilter !== 'Tất cả') {
      const symbols = SECTOR_MAP[sectorFilter] ?? []
      if (symbols.length > 0) {
        filtered = filtered.filter((a) => symbols.includes(a.symbol))
      }
    }

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [assets, searchQuery, sectorFilter, sortField, sortDir])

  const handleSort = useCallback(
    (field: SortField) => {
      setSortDir((prev) => (sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'))
      setSortField(field)
    },
    [sortField]
  )

  const renderPrice = (asset: Asset) => (
    <span className={cn(asset.change24h >= 0 ? 'text-gain' : 'text-loss')}>
      {formatCurrency(asset.price, asset.type)}
    </span>
  )

  const renderChange = (val: number) => {
    const isPositive = val >= 0
    return (
      <span className={cn('inline-flex items-center gap-0.5 font-medium', isPositive ? 'text-gain' : 'text-loss')}>
        {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
        {formatPercent(val)}
      </span>
    )
  }

  const tableSkeleton = (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-20 hidden md:block" />
        </div>
      ))}
    </div>
  )

  const cardSkeleton = (
    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header row: title + watchlist button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Thị trường</h2>
        <button
          onClick={() => openOverlay('watchlist')}
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Bookmark className="size-4" />
          <span className="hidden sm:inline">Watchlist</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as AssetType)
          setSectorFilter('Tất cả')
          setSearchQuery('')
          setAssets(null)
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="stock" className="min-h-[44px] px-4 text-xs sm:text-sm">Chứng khoán</TabsTrigger>
            <TabsTrigger value="crypto" className="min-h-[44px] px-4 text-xs sm:text-sm">Crypto</TabsTrigger>
            <TabsTrigger value="gold" className="min-h-[44px] px-4 text-xs sm:text-sm">Vàng</TabsTrigger>
          </TabsList>

          {/* Search - full width on mobile */}
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm mã, tên..."
              className="h-11 pl-9 text-sm sm:h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sector Filters - horizontal scrollable, no wrap on mobile */}
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SECTOR_FILTERS[activeTab].map((sector) => (
            <button
              key={sector}
              onClick={() => setSectorFilter(sector)}
              className={cn(
                'flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                sectorFilter === sector
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Content */}
        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <>
              <div className="hidden md:block">{tableSkeleton}</div>
              <div className="md:hidden">{cardSkeleton}</div>
            </>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="text-muted-foreground mb-2 size-10" />
              <p className="text-muted-foreground text-sm">Không tìm thấy tài sản nào</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="custom-scrollbar max-h-[calc(100vh-320px)] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="cursor-pointer select-none text-xs font-medium" onClick={() => handleSort('symbol')}>
                          <div className="flex items-center gap-1">
                            Mã <SortIcon field="symbol" currentField={sortField} currentDir={sortDir} />
                          </div>
                        </TableHead>
                        <TableHead className="text-xs font-medium">Tên</TableHead>
                        <TableHead className="cursor-pointer select-none text-right text-xs font-medium" onClick={() => handleSort('price')}>
                          <div className="flex items-center justify-end gap-1">
                            Giá <SortIcon field="price" currentField={sortField} currentDir={sortDir} />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none text-right text-xs font-medium" onClick={() => handleSort('changePercent')}>
                          <div className="flex items-center justify-end gap-1">
                            Thay đổi <SortIcon field="changePercent" currentField={sortField} currentDir={sortDir} />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none text-right text-xs font-medium" onClick={() => handleSort('change24h')}>
                          <div className="flex items-center justify-end gap-1">
                            24h <SortIcon field="change24h" currentField={sortField} currentDir={sortDir} />
                          </div>
                        </TableHead>
                        <TableHead className="hidden cursor-pointer select-none text-right text-xs font-medium md:table-cell" onClick={() => handleSort('volume')}>
                          <div className="flex items-center justify-end gap-1">
                            KLGD <SortIcon field="volume" currentField={sortField} currentDir={sortDir} />
                          </div>
                        </TableHead>
                        <TableHead className="hidden cursor-pointer select-none text-right text-xs font-medium md:table-cell" onClick={() => handleSort('marketCap')}>
                          <div className="flex items-center justify-end gap-1">
                            Vốn hóa <SortIcon field="marketCap" currentField={sortField} currentDir={sortDir} />
                          </div>
                        </TableHead>
                        <TableHead className="w-10 text-center text-xs font-medium">Biểu đồ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset, idx) => (
                        <motion.tr
                          key={asset.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-muted/50 cursor-pointer border-b transition-colors"
                          onClick={() => openOverlay('asset-detail', { symbol: asset.symbol })}
                        >
                          <TableCell className="font-semibold">{asset.symbol}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{asset.name}</TableCell>
                          <TableCell className="text-right font-medium">{renderPrice(asset)}</TableCell>
                          <TableCell className="text-right">{renderChange(asset.changePercent)}</TableCell>
                          <TableCell className="text-right text-sm">
                            <span className={asset.change24h >= 0 ? 'text-gain' : 'text-loss'}>
                              {asset.change24h >= 0 ? '+' : ''}
                              {formatNumber(Math.abs(asset.change24h))}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden text-right text-sm md:table-cell">{formatVolume(asset.volume)}</TableCell>
                          <TableCell className="text-muted-foreground hidden text-right text-sm md:table-cell">
                            {asset.marketCap > 0 ? formatVolume(asset.marketCap) : '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openChartDetail(asset.symbol, asset.name, asset.type)
                              }}
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              title="Xem biểu đồ"
                            >
                              <LineChart className="size-4" />
                            </button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="grid gap-3 p-px md:hidden sm:grid-cols-2">
                {filteredAssets.map((asset, idx) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="min-h-[72px] cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 active:scale-[0.98]"
                    onClick={() => openOverlay('asset-detail', { symbol: asset.symbol })}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">{asset.symbol}</p>
                        <p className="text-muted-foreground text-xs">{asset.name}</p>
                      </div>
                      {renderChange(asset.changePercent)}
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <span className="text-base font-bold">{renderPrice(asset)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openChartDetail(asset.symbol, asset.name, asset.type)
                          }}
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="Xem biểu đồ"
                        >
                          <LineChart className="size-3.5" />
                        </button>
                        {asset.marketCap > 0 && (
                          <span className="text-muted-foreground text-[11px]">Vốn: {formatVolume(asset.marketCap)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
