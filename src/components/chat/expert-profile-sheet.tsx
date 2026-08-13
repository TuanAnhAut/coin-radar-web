'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, UserPlus, FileText, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Expert } from '@/lib/types'

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

function ProfileSkeleton() {
  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col items-center text-center gap-3">
        <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  )
}

const recentAnalyses = [
  { title: 'Phân tích kỹ thuật VN-Index tuần 24', date: '2 ngày trước' },
  { title: 'Dự báo xu hướng BTC trong tuần tới', date: '5 ngày trước' },
  { title: 'Đánh giá rủi ro thị trường vàng', date: '1 tuần trước' },
]

export function ExpertProfileSheet() {
  const { activeOverlay, overlayData, closeOverlay, setActiveChatExpertId, setCurrentView } = useAppStore()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)

  const isOpen = activeOverlay === 'expert-profile'
  const expertId = overlayData?.id as string | undefined

  useEffect(() => {
    if (!isOpen || !expertId) return

    async function fetchExpert() {
      setLoading(true)
      try {
        const res = await fetch('/api/experts')
        const json = await res.json()
        const found = (json.data || []).find((e: Expert) => e.id === expertId)
        setExpert(found || null)
      } catch {
        toast.error('Không thể tải thông tin chuyên gia')
      } finally {
        setLoading(false)
      }
    }
    fetchExpert()
  }, [isOpen, expertId])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Hồ sơ chuyên gia</SheetTitle>
        </SheetHeader>

        {loading ? (
          <ProfileSkeleton />
        ) : expert ? (
          <ExpertProfileContent expert={expert} onClose={closeOverlay} onSendMessage={() => {
            closeOverlay()
            setCurrentView('chat')
            setTimeout(() => setActiveChatExpertId(expert.id), 200)
          }} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy chuyên gia
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ExpertProfileContent({ expert, onClose, onSendMessage }: { expert: Expert; onClose: () => void; onSendMessage: () => void }) {
  const statusConfig = getStatusConfig(expert.onlineStatus)
  const experience = 5 + parseInt(expert.id.split('-')[1] || '1', 10) * 2

  const stats = [
    {
      icon: Star,
      label: 'Đánh giá',
      value: `${expert.rating}/5`,
      sub: `${expert.reviewCount} đánh giá`,
      color: 'text-amber-500',
    },
    {
      icon: FileText,
      label: 'Phân tích',
      value: `${expert.recentAnalysisCount}`,
      sub: 'bài',
      color: 'text-blue-500',
    },
    {
      icon: TrendingUp,
      label: 'Chính xác',
      value: `${expert.accuracyPercent}%`,
      sub: '',
      color: 'text-emerald-500',
    },
    {
      icon: Award,
      label: 'Kinh nghiệm',
      value: `${experience}`,
      sub: 'năm',
      color: 'text-violet-500',
    },
  ]

  return (
    <div className="custom-scrollbar overflow-y-auto pb-24 -mx-6 px-6 space-y-6">
      {/* Profile header - avatar large centered on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-3"
      >
        <div className="relative">
          <div
            className={cn(
              'h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg',
              getAvatarColor(expert.id)
            )}
          >
            {getInitials(expert.name)}
          </div>
          <span
            className={cn(
              'absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-white dark:border-card',
              statusConfig.dot
            )}
          />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold">{expert.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{expert.specialty}</p>
        </div>
        <Badge
          variant="secondary"
          className={cn('text-xs font-medium', statusConfig.badge)}
        >
          {statusConfig.label}
        </Badge>
      </motion.div>

      {/* Stats grid - 2 cols on mobile, 4 cols on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-3 sm:p-4 text-center"
          >
            <stat.icon className={cn('h-5 w-5 mx-auto mb-1.5', stat.color)} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">
              {stat.label}
              {stat.sub ? ` · ${stat.sub}` : ''}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Bio - proper line height and sizing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card p-4"
      >
        <h4 className="text-sm font-semibold mb-2">Giới thiệu</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{expert.bio}</p>
      </motion.div>

      {/* Recent analyses - proper list spacing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-4"
      >
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Phân tích gần đây
        </h4>
        <div className="space-y-3">
          {recentAnalyses.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-3 min-h-[44px]">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-sm truncate">{item.title}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA buttons - full width stacked on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          className="w-full sm:flex-1 gap-2 h-12"
          size="lg"
          onClick={onSendMessage}
        >
          <MessageCircle className="h-4 w-4" />
          Nhắn tin
        </Button>
        <Button
          variant="outline"
          className="w-full sm:flex-1 gap-2 h-12"
          size="lg"
          onClick={() => toast.success('Đã theo dõi chuyên gia')}
        >
          <UserPlus className="h-4 w-4" />
          Theo dõi
        </Button>
      </motion.div>
    </div>
  )
}
