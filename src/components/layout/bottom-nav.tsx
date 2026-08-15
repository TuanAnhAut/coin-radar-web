'use client'

import { LayoutDashboard, Newspaper, Bell, TrendingUp, MessageCircle, User } from 'lucide-react'
import { useAppStore, type ViewType } from '@/store/app-store'
import { cn } from '@/lib/utils'

const navItems: { view: ViewType; label: string; icon: typeof LayoutDashboard; showBadge?: boolean }[] = [
  { view: 'home', label: 'Tổng quan', icon: LayoutDashboard },
  { view: 'news', label: 'Tin tức', icon: Newspaper },
  { view: 'alerts', label: 'Cảnh báo', icon: Bell, showBadge: true },
  { view: 'market', label: 'Thị trường', icon: TrendingUp },
  { view: 'chat', label: 'Chat AI', icon: MessageCircle },
  { view: 'profile', label: 'Cá nhân', icon: User },
]

export function BottomNav() {
  const { currentView, setCurrentView, unreadCount } = useAppStore()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md',
        // Show on md and below, hide when sidebar is visible (xl+)
        'xl:hidden',
        // Safe area support for iOS devices
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      <div className="flex items-center justify-around px-0.5 sm:px-1 h-[56px] sm:h-[60px]">
        {navItems.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg transition-colors',
                // Compact touch target for 6 items
                'min-h-[40px] min-w-[40px] px-1 sm:px-2 py-1',
                // Active indicator
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80 active:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon container with badge */}
              <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] sm:h-5 sm:w-5 transition-all duration-200',
                    isActive && 'scale-110'
                  )}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 0 : 2}
                />
                {/* Badge: positioned to not overlap icon */}
                {item.showBadge && unreadCount > 0 && (
                  <span className={cn(
                    'absolute -top-1.5 -right-2 flex items-center justify-center rounded-full bg-destructive text-white leading-none',
                    unreadCount > 9 ? 'h-3.5 min-w-3.5 px-0.5 text-[8px] sm:h-4 sm:min-w-4 sm:px-1 sm:text-[10px]' : 'h-3.5 w-3.5 sm:h-4 sm:w-4 text-[8px] sm:text-[10px]',
                    'font-bold'
                  )}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              {/* Label */}
              <span className={cn(
                'mt-0.5 leading-none transition-all duration-200',
                isActive ? 'text-[9px] sm:text-[10px] font-semibold' : 'text-[9px] sm:text-[10px] font-medium'
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
