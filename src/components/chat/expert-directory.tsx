'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, MessageCircle, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Expert } from '@/lib/types'

const categoryTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'stock', label: 'Chứng khoán' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'gold', label: 'Vàng' },
] as const

type CategoryKey = (typeof categoryTabs)[number]['key']

function getAvatarColor(id: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-pink-500',
  ]
  const idx = parseInt(id.split('-')[1] || '1', 10)
  return colors[(idx - 1) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(-2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
}

function getStatusConfig(status: Expert['onlineStatus']) {
  switch (status) {
    case 'online':
      return { dot: 'bg-green-500', label: 'Đang trực tuyến', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    case 'away':
      return { dot: 'bg-amber-500', label: 'Nghỉ', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
    case 'offline':
      return { dot: 'bg-gray-400', label: 'Ngoại tuyến', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' }
  }
}

function getCategoryForExpert(specialty: string): CategoryKey {
  const lower = specialty.toLowerCase()
  if (lower.includes('crypto') || lower.includes('defi') || lower.includes('nft') || lower.includes('web3') || lower.includes('trading')) return 'crypto'
  if (lower.includes('vàng') || lower.includes('hàng hóa') || lower.includes('gold')) return 'gold'
  if (lower.includes('chứng khoán') || lower.includes('macro') || lower.includes('kinh tế') || lower.includes('vĩ mô')) return 'stock'
  return 'all'
}

function ExpertCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-start gap-3 sm:gap-4">
        <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExpertDirectory() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const { openOverlay } = useAppStore()

  useEffect(() => {
    async function fetchExperts() {
      try {
        const res = await fetch('/api/experts')
        const json = await res.json()
        setExperts(json.data || [])
      } catch {
        toast.error('Không thể tải danh sách chuyên gia')
      } finally {
        setLoading(false)
      }
    }
    fetchExperts()
  }, [])

  const onlineCount = experts.filter((e) => e.onlineStatus === 'online').length

  const filteredExperts = experts.filter((expert) => {
    const matchSearch =
      !searchQuery ||
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchQuery.toLowerCase())

    const matchCategory =
      activeCategory === 'all' || getCategoryForExpert(expert.specialty) === activeCategory

    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold">Chuyên gia phân tích</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
            {onlineCount} trực tuyến
          </Badge>
        </div>
      </div>

      {/* Search - full width */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm chuyên gia..."
          className="pl-9 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category filter tabs - horizontal scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={cn(
              'px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] flex items-center',
              activeCategory === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expert list - single column on mobile for readability */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ExpertCardSkeleton key={i} />)
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy chuyên gia phù hợp</p>
          </div>
        ) : (
          filteredExperts.map((expert, index) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              index={index}
              onSendMessage={() => toast.info('Tính năng sắp ra mắt')}
              onViewProfile={() =>
                openOverlay('expert-profile', { id: expert.id })
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

function ExpertCard({
  expert,
  index,
  onSendMessage,
  onViewProfile,
}: {
  expert: Expert
  index: number
  onSendMessage: () => void
  onViewProfile: () => void
}) {
  const statusConfig = getStatusConfig(expert.onlineStatus)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 flex items-start gap-3 sm:gap-4">
          {/* Avatar - smaller on mobile, larger on desktop */}
          <div className="relative shrink-0">
            <div
              className={cn(
                'h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg',
                getAvatarColor(expert.id)
              )}
            >
              {getInitials(expert.name)}
            </div>
            <span
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-white dark:border-card',
                statusConfig.dot
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{expert.name}</h3>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">{expert.specialty}</p>

            {/* Star rating - visible and readable on mobile */}
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < Math.round(expert.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1.5">
                {expert.rating} ({expert.reviewCount})
              </span>
            </div>

            {/* Status badge */}
            <Badge
              variant="secondary"
              className={cn('mt-2 text-[10px] font-medium', statusConfig.badge)}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Actions - side by side on mobile */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button size="sm" className="h-9 text-xs gap-1.5 min-w-[80px]" onClick={onSendMessage}>
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nhắn tin</span>
              <span className="sm:hidden">Chat</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs gap-1.5 min-w-[80px]"
              onClick={onViewProfile}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Xem profile</span>
              <span className="sm:hidden">Xem</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
