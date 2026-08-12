'use client'

import { useTheme } from 'next-themes'
import { Radar, Search, Bell, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const { setSearchOpen, setNotificationsOpen, unreadCount, currentView } =
    useAppStore()

  const viewLabels: Record<string, string> = {
    home: 'Tổng quan',
    alerts: 'Cảnh báo',
    market: 'Thị trường',
    chat: 'Chat AI',
    profile: 'Cá nhân',
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl'
      )}
    >
      <div className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left - Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Radar className="h-4 w-4 text-primary-foreground" />
          </div>
          {/* Hide logo text when sidebar is visible (xl+) */}
          <span className="font-semibold tracking-tight truncate xl:hidden">
            Coin Radar
          </span>
        </div>

        {/* Center - Breadcrumb (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1.5 text-sm absolute left-1/2 -translate-x-1/2">
          <span className="text-muted-foreground">Coin Radar</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{viewLabels[currentView]}</span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => setSearchOpen(true)}
            aria-label="Tìm kiếm"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Thông báo"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Chuyển giao diện"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
