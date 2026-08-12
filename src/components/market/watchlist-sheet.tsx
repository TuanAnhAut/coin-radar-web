'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Search,
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { formatCurrency, formatPercent } from '@/lib/format'
import type { WatchlistItem, Asset } from '@/lib/types'

export function WatchlistSheet() {
  const { activeOverlay, closeOverlay, openOverlay } = useAppStore()
  const isOpen = activeOverlay === 'watchlist'

  const [items, setItems] = useState<WatchlistItem[] | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [searching, setSearching] = useState(false)
  const fetchIdRef = useRef(0)

  const loading = items === null && isOpen

  useEffect(() => {
    if (!isOpen) return
    const id = ++fetchIdRef.current
    fetch('/api/watchlist')
      .then((r) => r.json())
      .then((res) => {
        if (fetchIdRef.current === id) setItems(res.data ?? [])
      })
  }, [isOpen])

  // Debounced search for adding assets
  useEffect(() => {
    if (!showAdd || !addQuery.trim()) {
      return
    }
    const timer = setTimeout(() => {
      setSearching(true)
      fetch(`/api/assets?search=${encodeURIComponent(addQuery)}`)
        .then((r) => r.json())
        .then((res) => {
          const existing = new Set((items ?? []).map((i) => i.assetSymbol))
          setSearchResults((res.data ?? []).filter((a: Asset) => !existing.has(a.symbol)))
        })
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [addQuery, showAdd, items])

  const handleAdd = async (asset: Asset) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetSymbol: asset.symbol,
          assetName: asset.name,
          assetType: asset.type,
          price: asset.price,
          change24h: asset.change24h,
          changePercent: asset.changePercent,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems((prev) => [...(prev ?? []), data.data])
        setSearchResults((prev) => prev.filter((a) => a.symbol !== asset.symbol))
      }
    } catch {
      // ignore
    }
  }

  const handleRemove = (id: string) => {
    setItems((prev) => (prev ?? []).filter((i) => i.id !== id))
  }

  const handleClose = () => {
    setShowAdd(false)
    setAddQuery('')
    setSearchResults([])
    closeOverlay()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Danh sách theo dõi</SheetTitle>
          <SheetDescription>Quản lý tài sản theo dõi</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="size-5" />
                <h3 className="text-lg font-bold">Danh sách theo dõi</h3>
                {(items ?? []).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {(items ?? []).length}
                  </Badge>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowAdd((v) => !v)}>
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Add asset search */}
            <AnimatePresence>
              {showAdd && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="Tìm mã chứng khoán, crypto..."
                      className="pl-8"
                      value={addQuery}
                      onChange={(e) => setAddQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="custom-scrollbar mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border p-1">
                      {searchResults.map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => handleAdd(asset)}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                        >
                          <div>
                            <p className="text-sm font-semibold">{asset.symbol}</p>
                            <p className="text-muted-foreground text-xs">{asset.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{formatCurrency(asset.price, asset.type)}</p>
                            <span className={cn('text-xs', asset.changePercent >= 0 ? 'text-gain' : 'text-loss')}>
                              {formatPercent(asset.changePercent)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searching && (
                    <div className="mt-2 flex justify-center">
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Watchlist items */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : (items ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookmarkCheck className="text-muted-foreground mb-3 size-12" />
                <p className="font-medium">Danh sách trống</p>
                <p className="text-muted-foreground text-sm">
                  Nhấn &quot;+&quot; để thêm tài sản theo dõi
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {(items ?? []).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => openOverlay('asset-detail', { symbol: item.assetSymbol })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.assetSymbol}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {item.assetType === 'stock' ? 'CK' : item.assetType === 'crypto' ? 'Crypto' : 'Vàng'}
                          </Badge>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(item.id)
                          }}
                          className="text-muted-foreground rounded-full p-1 transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-muted-foreground text-xs">{item.assetName}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{formatCurrency(item.price, item.assetType)}</span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-medium',
                            item.changePercent >= 0 ? 'text-gain' : 'text-loss'
                          )}
                        >
                          {item.changePercent >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          {formatPercent(item.changePercent)}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
