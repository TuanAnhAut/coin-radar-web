'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Share2, Calendar, Tag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'
import { useIsMobile } from '@/lib/hooks'
import { formatDateTime } from '@/lib/format'
import type { NewsArticle } from '@/lib/types'
import ReactMarkdown from 'react-markdown'

const CATEGORY_LABELS: Record<string, string> = {
  macro: 'Vĩ mô',
  micro: 'Vi mô',
  stock: 'Chứng khoán',
  crypto: 'Crypto',
  gold: 'Vàng',
}

const CATEGORY_COLORS: Record<string, string> = {
  macro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  micro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  stock: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  crypto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

export function NewsDetailSheet() {
  const { activeOverlay, overlayData, closeOverlay, openOverlay } = useAppStore()
  const isMobile = useIsMobile()
  const newsId = (overlayData?.id as string) ?? ''
  const isOpen = activeOverlay === 'news-detail' && !!newsId

  const [article, setArticle] = useState<NewsArticle | null>(null)
  const fetchIdRef = useRef(0)

  const loading = article === null && isOpen

  useEffect(() => {
    if (!isOpen || !newsId) return
    const id = ++fetchIdRef.current
    fetch('/api/news')
      .then((r) => r.json())
      .then((res) => {
        if (fetchIdRef.current === id) {
          const found = (res.data ?? []).find((n: NewsArticle) => n.id === newsId)
          setArticle(found ?? null)
        }
      })
      .catch(() => {
        if (fetchIdRef.current === id) setArticle(null)
      })
  }, [isOpen, newsId])

  const handleTagClick = (tag: string) => {
    openOverlay('asset-detail', { symbol: tag })
  }

  const handleShare = async () => {
    if (!article) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(article.title + ' - ' + window.location.href)
    }
  }

  const handleClose = closeOverlay
  const title = article?.title ?? 'Tin tức'
  const desc = 'Chi tiết tin tức'

  const renderContent = () => (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ) : article ? (
        <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Category + Date */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className={CATEGORY_COLORS[article.category] ?? ''} variant="secondary">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="size-3" />
              {formatDateTime(article.publishedAt)}
            </span>
            <span className="text-muted-foreground text-xs">{article.source}</span>
          </div>

          {/* Title - text-xl on mobile, text-2xl on desktop */}
          <h1 className="mb-4 text-xl font-bold leading-tight md:text-2xl">{article.title}</h1>

          {/* Cover image placeholder */}
          <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-muted sm:h-56">
            <span className="text-muted-foreground text-sm">Hình ảnh minh họa</span>
          </div>

          {/* Tags - horizontal scrollable on mobile */}
          {article.tags.length > 0 && (
            <div className="mb-4 flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none">
              <Tag className="text-muted-foreground size-3 shrink-0" />
              {article.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <Separator className="mb-4" />

          {/* Markdown content - proper line height and spacing */}
          <div className="[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-sm [&_li]:leading-relaxed [&_ul]:mb-2 [&_ol]:mb-2 [&_strong]:font-semibold [&_table]:w-full [&_table]:text-xs [&_th]:p-1 [&_th]:text-left [&_td]:p-1 [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:italic">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          <Separator className="mt-6" />

          {/* Action buttons - stacked full width on mobile */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="min-h-[48px] w-full sm:flex-1" onClick={handleShare}>
              <Share2 className="mr-2 size-4" />
              Chia sẻ
            </Button>
            <Button variant="outline" className="min-h-[48px] w-full sm:flex-1" onClick={closeOverlay}>
              Đóng
            </Button>
          </div>
        </motion.article>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">Không tìm thấy bài viết</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: Drawer from bottom */}
      <Drawer open={isMobile && isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="px-4 pt-2 text-left">
            <DrawerTitle className="text-base line-clamp-1">{title}</DrawerTitle>
            <DrawerDescription className="text-xs">{desc}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 min-h-0 px-4 pb-8 custom-scrollbar max-h-[calc(92vh-8rem)]">
            {renderContent()}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Desktop: Sheet from right */}
      <Sheet open={!isMobile && isOpen} onOpenChange={handleClose}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{desc}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4 md:p-6 pb-24">
              {renderContent()}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
