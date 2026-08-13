'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, TrendingUp, TrendingDown, Newspaper, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Asset, NewsArticle } from '@/lib/types'

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

function getTypeLabel(type: string): string {
  switch (type) {
    case 'stock': return 'CK'
    case 'crypto': return 'Crypto'
    case 'gold': return 'Vàng'
    default: return type
  }
}

function getTypeBadgeStyle(type: string): string {
  switch (type) {
    case 'stock': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'crypto': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'gold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function GlobalSearch() {
  const { searchOpen, setSearchOpen, openOverlay } = useAppStore()
  const [query, setQuery] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Focus input when opening
  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setAssets([])
      setNews([])
      setSearched(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, setSearchOpen])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setAssets([])
      setNews([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const [assetsRes, newsRes] = await Promise.all([
        fetch(`/api/assets?search=${encodeURIComponent(q)}`),
        fetch('/api/news'),
      ])

      const assetsJson = await assetsRes.json()
      const newsJson = await newsRes.json()

      const lowerQ = q.toLowerCase()
      const allNews = newsJson.data as NewsArticle[]
      const filteredNews = allNews.filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQ) ||
          n.summary.toLowerCase().includes(lowerQ) ||
          n.tags.some((t) => t.toLowerCase().includes(lowerQ))
      )

      setAssets((assetsJson.data as Asset[]).slice(0, 8))
      setNews(filteredNews.slice(0, 5))
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  if (!searchOpen) return null

  const hasResults = assets.length > 0 || news.length > 0
  const hasNoResults = searched && !loading && !hasResults

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop - dismiss on tap on mobile */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          {/* Content - full screen on mobile, centered panel on desktop */}
          <motion.div
            className={cn(
              'relative bg-background shadow-2xl overflow-hidden',
              // Mobile: full screen with safe area padding
              'inset-0 sm:inset-auto sm:mt-[12vh] sm:mx-auto sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-2xl sm:border'
            )}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Search Input - large and prominent with pt-16 safe area on mobile */}
            <div className="flex items-center gap-3 border-b px-4 pt-[env(safe-area-inset-top,0px)] sm:pt-0 py-3 sm:py-3">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Tìm kiếm tài sản, tin tức..."
                className="border-0 shadow-none focus-visible:ring-0 h-auto p-0 text-lg"
              />
              <button
                className="flex-shrink-0 rounded-md p-2 hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setSearchOpen(false)}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <ScrollArea className="max-h-[calc(100vh-8rem)] sm:max-h-[50vh]">
              <div className="p-2 sm:p-2">
                {/* Loading state - centered spinner */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
                  </div>
                )}

                {/* Empty state - centered */}
                {hasNoResults && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Không tìm thấy kết quả cho &quot;{query}&quot;
                    </p>
                  </div>
                )}

                {/* Asset results - clear type badges, price, change% */}
                {!loading && assets.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                      Tài sản ({assets.length})
                    </p>
                    {assets.map((asset) => {
                      const isPositive = asset.changePercent >= 0
                      return (
                        <button
                          key={asset.id}
                          className="flex items-center gap-3 w-full rounded-lg px-2 py-3 min-h-[60px] text-left transition-colors hover:bg-accent"
                          onClick={() => {
                            setSearchOpen(false)
                            openOverlay('asset-detail', { symbol: asset.symbol })
                          }}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                            <span className="text-xs font-bold text-muted-foreground">
                              {asset.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{asset.symbol}</span>
                              <Badge
                                variant="secondary"
                                className={cn('text-[10px] font-medium px-1.5 py-0', getTypeBadgeStyle(asset.type))}
                              >
                                {getTypeLabel(asset.type)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {asset.name}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium">{formatPrice(asset.price)}</p>
                            <div className={cn(
                              'flex items-center justify-end gap-0.5 text-xs font-medium',
                              isPositive ? 'text-gain' : 'text-loss'
                            )}>
                              {isPositive
                                ? <TrendingUp className="h-3 w-3" />
                                : <TrendingDown className="h-3 w-3" />
                              }
                              {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* News results - title and source properly sized */}
                {!loading && news.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                      Tin tức ({news.length})
                    </p>
                    {news.map((article) => (
                      <button
                        key={article.id}
                        className="flex items-start gap-3 w-full rounded-lg px-2 py-3 min-h-[60px] text-left transition-colors hover:bg-accent"
                        onClick={() => {
                          setSearchOpen(false)
                          openOverlay('news-detail', { id: article.id })
                        }}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted flex-shrink-0 mt-0.5">
                          <Newspaper className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {article.source}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
