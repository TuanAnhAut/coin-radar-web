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

export function NewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { openOverlay } = useAppStore()

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news')
        const json = await res.json()
        setNews((json.data as NewsArticle[]).slice(0, 4))
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
      <h2 className="text-sm sm:text-base font-semibold">Tin tức</h2>

      <div className="rounded-xl border bg-card divide-y overflow-hidden">
        {news.map((article, index) => (
          <motion.div
            key={article.id}
            className={cn(
              // Full card as tap target, with proper padding
              'cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent/70',
              'px-3 sm:px-4 py-3 sm:py-4',
              // Min-height for touch target
              'min-h-[56px] sm:min-h-[64px]'
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => openOverlay('news-detail', { id: article.id })}
          >
            {/* Title - limited to 2 lines */}
            <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1 sm:mb-1.5">
              {article.title}
            </h3>

            {/* Summary - limited to 2 lines, hidden on very small screens */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
              {article.summary}
            </p>

            {/* Meta row: category badge + source + time */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Badge variant={getCategoryVariant(article.category)} className="text-[10px] px-1.5 py-0 shrink-0">
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
          </motion.div>
        ))}
      </div>
    </div>
  )
}
