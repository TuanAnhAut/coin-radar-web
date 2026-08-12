'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="py-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              {i < 3 && <Separator />}
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
      <h2 className="text-sm font-semibold">Tin tức</h2>

      <div className="rounded-xl border bg-card divide-y">
        {news.map((article, index) => (
          <motion.div
            key={article.id}
            className="px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 first:rounded-t-xl last:rounded-b-xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => openOverlay('news-detail', { id: article.id })}
          >
            <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1">
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
              {article.summary}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getCategoryVariant(article.category)} className="text-[10px] px-1.5 py-0">
                {getCategoryLabel(article.category)}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {article.source}
              </span>
              <span className="text-[10px] text-muted-foreground">
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
