'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Shield, Newspaper, User, Settings, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Notification, NotificationType } from '@/lib/types'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'alert_triggered': return Shield
    case 'breaking_news': return Newspaper
    case 'expert_message': return User
    case 'system': return Settings
  }
}

function getIconBgColor(type: NotificationType): string {
  switch (type) {
    case 'alert_triggered': return 'bg-loss-soft text-loss'
    case 'breaking_news': return 'bg-primary/10 text-primary'
    case 'expert_message': return 'bg-gain-soft text-gain'
    case 'system': return 'bg-muted text-muted-foreground'
  }
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

export function NotificationCenter() {
  const { notificationsOpen, setNotificationsOpen, setUnreadCount, openOverlay } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      const json = await res.json()
      setNotifications(json.data)
    } catch {
      setError('Không thể tải thông báo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (notificationsOpen) {
      setLoading(true)
      fetchNotifications()
    }
  }, [notificationsOpen, fetchNotifications])

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  function handleNotificationClick(notif: Notification) {
    // Mark as read
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      )
      const unreadCount = notifications.filter((n) => !n.read && n.id !== notif.id).length
      setUnreadCount(unreadCount)
    }

    // Open appropriate overlay
    if (notif.type === 'alert_triggered') {
      openOverlay('alert-detail', { id: notif.id })
    } else if (notif.type === 'breaking_news') {
      openOverlay('news-detail', { id: notif.id })
    }
    setNotificationsOpen(false)
  }

  return (
    <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base">Thông báo</SheetTitle>
              <SheetDescription className="text-xs">
                {notifications.filter((n) => !n.read).length} chưa đọc
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đánh dấu đã đọc
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
          <div className="p-2">
            {loading && (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-0.5"
              >
                {notifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type)
                  return (
                    <motion.button
                      key={notif.id}
                      variants={itemVariants}
                      className={cn(
                        'flex items-start gap-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-accent/50',
                        !notif.read && 'bg-accent/30'
                      )}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0',
                        getIconBgColor(notif.type)
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm leading-snug',
                            !notif.read ? 'font-semibold' : 'font-medium'
                          )}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </motion.div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Chưa có thông báo</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
