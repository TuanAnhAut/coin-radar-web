'use client'

import { LayoutDashboard, Bell, TrendingUp, MessageCircle, User } from 'lucide-react'
import { useAppStore, type ViewType } from '@/store/app-store'
import { cn } from '@/lib/utils'

const navItems: { view: ViewType; label: string; icon: typeof LayoutDashboard; showBadge?: boolean }[] = [
  { view: 'home', label: 'Tổng quan', icon: LayoutDashboard },
  { view: 'alerts', label: 'Cảnh báo', icon: Bell, showBadge: true },
  { view: 'market', label: 'Thị trường', icon: TrendingUp },
  { view: 'chat', label: 'Chat AI', icon: MessageCircle },
  { view: 'profile', label: 'Cá nhân', icon: User },
]

export function BottomNav() {
  const { currentView, setCurrentView, unreadCount } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-zinc-50 dark:bg-zinc-950 md:hidden safe-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-w-[3.5rem]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive && 'scale-110'
                  )}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 0 : 2}
                />
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(isActive && 'font-semibold')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
