'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Newspaper,
  Star,
  AlertOctagon,
  Flame,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  ExternalLink,
  TrendingUp,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/app-store'
import type { NewsArticle, NewsCategory, NewsImportance } from '@/lib/types'

// ==================== Constants ====================

type NewsTab = 'all' | 'important' | 'bookmarked' | 'category'

const tabs: { key: NewsTab; label: string; icon: typeof Newspaper }[] = [
  { key: 'all', label: 'Tin chung', icon: Newspaper },
  { key: 'important', label: 'Quan trọng', icon: AlertOctagon },
  { key: 'bookmarked', label: 'Quan tâm', icon: Star },
  { key: 'category', label: 'Danh mục', icon: Flame },
]

const categories: { value: NewsCategory | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Tất cả', color: '' },
  { value: 'stock', label: 'Chứng khoán', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'crypto', label: 'Crypto', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'gold', label: 'Vàng', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'macro', label: 'Vĩ mô', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'micro', label: 'Vi mô', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
]

function getCategoryLabel(cat: NewsCategory): string {
  const found = categories.find((c) => c.value === cat)
  return found?.label ?? cat
}

function getCategoryColor(cat: NewsCategory): string {
  const found = categories.find((c) => c.value === cat)
  return found?.color ?? ''
}

// ==================== Animation ====================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ==================== News Card ====================

function NewsCard({
  article,
  featured = false,
  bookmarkedIds,
  onToggleBookmark,
  onClick,
}: {
  article: NewsArticle
  featured?: boolean
  bookmarkedIds: Set<string>
  onToggleBookmark: (id: string) => void
  onClick: () => void
}) {
  const isBookmarked = bookmarkedIds.has(article.id)
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: vi,
  })

  if (featured) {
    return (
      <motion.div variants={itemVariants} className="group">
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border bg-card cursor-pointer',
            'transition-all duration-300 hover:shadow-lg hover:border-primary/20',
            'active:scale-[0.98]'
          )}
          onClick={onClick}
        >
          {/* Cover placeholder */}
          <div className="relative h-40 sm:h-48 md:h-56 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Hình ảnh minh họa</span>
            {/* Importance badge */}
            {article.importance === 'important' && (
              <Badge className="absolute top-3 left-3 bg-destructive text-white text-[10px] px-2 py-0.5 gap-1">
                <AlertOctagon className="size-3" />
                Quan trọng
              </Badge>
            )}
            {/* Bookmark button */}
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark(article.id)
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck className="size-4 text-primary fill-primary" />
              ) : (
                <Bookmark className="size-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {/* Category + Time */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getCategoryColor(article.category))}>
                {getCategoryLabel(article.category)}
              </Badge>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                {timeAgo}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>

            {/* Summary */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {article.summary}
            </p>

            {/* Source + Tags */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{article.source}</span>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Compact card
  return (
    <motion.div variants={itemVariants} className="group">
      <div
        className={cn(
          'flex gap-3 sm:gap-4 rounded-xl border bg-card p-3 sm:p-4 cursor-pointer',
          'transition-all duration-200 hover:bg-accent/50 hover:border-primary/20',
          'active:bg-accent/70',
          'min-h-[72px]'
        )}
        onClick={onClick}
      >
        {/* Left: Importance dot + Bookmark */}
        <div className="flex flex-col items-center gap-2 pt-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark(article.id)
            }}
            className="transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="size-4 text-primary fill-primary" />
            ) : (
              <Bookmark className="size-4 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getCategoryColor(article.category))}>
              {getCategoryLabel(article.category)}
            </Badge>
            {article.importance === 'important' && (
              <span className="flex items-center gap-0.5 text-[10px] text-destructive font-medium">
                <AlertOctagon className="size-3" />
                Quan trọng
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-xs text-muted-foreground">{article.source}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5">
              <Clock className="size-2.5" />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Right: Arrow */}
        <div className="flex items-center shrink-0">
          <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  )
}

// ==================== News Page ====================

export function NewsPage() {
  const { openOverlay } = useAppStore()
  const [allNews, setAllNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<NewsTab>('all')
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest')

  // Fetch news
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news')
        const json = await res.json()
        setAllNews(json.data as NewsArticle[])
      } catch {
        // silent error
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Filter & sort news
  const filteredNews = useMemo(() => {
    let result = [...allNews]

    // Tab filter
    switch (activeTab) {
      case 'important':
        result = result.filter((n) => n.importance === 'important')
        break
      case 'bookmarked':
        result = result.filter((n) => bookmarkedIds.has(n.id))
        break
      case 'category':
        if (activeCategory !== 'all') {
          result = result.filter((n) => n.category === activeCategory)
        }
        break
      default:
        break
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.source.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [allNews, activeTab, activeCategory, bookmarkedIds, searchQuery, sortBy])

  // Featured article: the most recent important news, or just the most recent
  const featuredArticle = useMemo(() => {
    if (activeTab === 'bookmarked' || activeTab === 'category') return null
    const important = allNews
      .filter((n) => n.importance === 'important')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]
    return important ?? allNews[0] ?? null
  }, [allNews, activeTab])

  // Rest of articles (excluding featured)
  const listNews = useMemo(() => {
    if (!featuredArticle) return filteredNews
    return filteredNews.filter((n) => n.id !== featuredArticle.id)
  }, [filteredNews, featuredArticle])

  // Stats
  const stats = useMemo(() => ({
    total: allNews.length,
    important: allNews.filter((n) => n.importance === 'important').length,
    bookmarked: bookmarkedIds.size,
  }), [allNews, bookmarkedIds])

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-4 sm:space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Newspaper className="size-5 sm:size-6 text-primary" />
              Tin tức tài chính
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cập nhật thị trường CK, Crypto, Vàng 24/7
            </p>
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                {sortBy === 'latest' ? 'Mới nhất' : 'Cũ nhất'}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('latest')}>
                <Clock className="size-3.5 mr-2" />
                Mới nhất
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                <Clock className="size-3.5 mr-2" />
                Cũ nhất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm tin tức, mã cổ phiếu, tags..."
          className="pl-9 h-10 text-sm bg-muted/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          // Badge count for specific tabs
          let badgeCount: number | null = null
          if (tab.key === 'important') badgeCount = stats.important
          if (tab.key === 'bookmarked') badgeCount = stats.bookmarked

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[36px]',
                'border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="size-3.5 sm:size-4" />
              {tab.label}
              {badgeCount !== null && badgeCount > 0 && (
                <span className={cn(
                  'flex items-center justify-center rounded-full text-[10px] font-bold leading-none min-w-[18px] h-[18px] px-1',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      {/* Category filter (only when "Danh mục" tab is active) */}
      <AnimatePresence mode="wait">
        {activeTab === 'category' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border min-h-[32px]',
                      isActive
                        ? cat.color + ' border-current'
                        : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Flame className="size-3" />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="size-3" />
          {filteredNews.length} tin tức
        </span>
        {(activeTab === 'important' || activeTab === 'bookmarked') && (
          <Separator orientation="vertical" className="h-3" />
        )}
      </motion.div>

      {/* Featured article */}
      {featuredArticle && filteredNews.some((n) => n.id === featuredArticle.id) && (
        <NewsCard
          article={featuredArticle}
          featured
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={toggleBookmark}
          onClick={() => openOverlay('news-detail', { id: featuredArticle.id })}
        />
      )}

      {/* News list */}
      {listNews.length > 0 ? (
        <motion.div className="space-y-2 sm:space-y-3" variants={containerVariants} initial="hidden" animate="show">
          {listNews.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              onClick={() => openOverlay('news-detail', { id: article.id })}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Newspaper className="size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Không có tin tức nào</p>
          {activeTab === 'bookmarked' && (
            <p className="text-xs text-muted-foreground">
              Nhấn biểu tượng <Bookmark className="inline size-3" /> để lưu tin quan tâm
            </p>
          )}
        </motion.div>
      )}

      {/* Refresh button at bottom */}
      {filteredNews.length > 0 && (
        <motion.div variants={itemVariants} className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => {
              setLoading(true)
              fetch('/api/news')
                .then((r) => r.json())
                .then((json) => setAllNews(json.data))
                .finally(() => setLoading(false))
            }}
          >
            <RefreshCw className="size-3" />
            Làm mới tin tức
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
