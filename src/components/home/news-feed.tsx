'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import type { NewsArticle, NewsCategory } from '@/lib/types'

function getCategoryLabel(category: NewsCategory): string {
  switch (category) {
    case 'macro': return 'Vĩ mô'
    case 'micro': return 'Vi mô'
    case 'stock': return 'Chứng khoán'
    case 'crypto': return 'Crypto'
    case 'gold': return 'Vàng'
    default: return category
  }
}

function getCategoryVariant(category: NewsCategory): 'default' | 'secondary' | 'outline' {
  switch (category) {
    case 'crypto': return 'default'
    case 'gold': return 'secondary'
    default: return 'outline'
  }
}

function getCategoryColor(category: NewsCategory): string {
  switch (category) {
    case 'crypto': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'gold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'stock': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'macro': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'micro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default: return ''
  }
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { openOverlay, setCurrentView } = useAppStore()

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news')
        const json = await res.json()
        setNews((json.data as NewsArticle[]).slice(0, 5))
      } catch {
        setError('Không thể tải tin tức')
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="rounded-xl border bg-card divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 sm:p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || news.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Section header + "View all" button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold">Tin tức</h2>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] px-2 rounded-md hover:bg-accent/50"
          onClick={() => setCurrentView('news')}
        >
          Xem tất cả
        </button>
      </div>

      <div className="rounded-xl border bg-card divide-y overflow-hidden">
        {news.map((article, index) => (
          <motion.div
            key={article.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent/70',
              'px-3 sm:px-4 py-3 sm:py-4',
              'min-h-[56px] sm:min-h-[64px]'
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => openOverlay('news-detail', { id: article.id })}
          >
            {/* Importance indicator + Title */}
            <div className="flex items-start gap-2">
              {article.importance === 'important' && (
                <span className="mt-1 shrink-0 h-2 w-2 rounded-full bg-destructive" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1">
                  {article.title}
                </h3>

                {/* Summary - hidden on very small screens */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
                  {article.summary}
                </p>

                {/* Meta row: category badge + source + time */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 shrink-0', getCategoryColor(article.category))}
                  >
                    {getCategoryLabel(article.category)}
                  </Badge>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {article.source}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                    · {formatDistanceToNow(new Date(article.publishedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
