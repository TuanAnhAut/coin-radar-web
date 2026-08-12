'use client'

import { LayoutDashboard, Bell, TrendingUp, MessageCircle, User } from 'lucide-react'
import { useAppStore, type ViewType } from '@/store/app-store'
import { cn } from '@/lib/utils'

const navItems: { view: ViewType; label: string; icon: typeof LayoutDashboard; showBadge?: boolean }[] = [
  { view: 'home', label: 'Tổng quan', icon: LayoutDashboard },
  { view: 'alerts', label: 'Cảnh báo', icon: Bell, showBadge: true },
  { view: 'market', label: 'Thị trường', icon: TrendingUp },
  { view: 'chat', label: 'Chat', icon: MessageCircle },
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
      <div className="flex items-center justify-around px-1 sm:px-2 h-[60px] sm:h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg transition-colors',
                // Minimum touch target: 44px height, with extra padding for comfortable tap
                'min-h-[44px] min-w-[44px] px-2 sm:px-3 py-1.5',
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
              <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7">
                <Icon
                  className={cn(
                    'h-5 w-5 sm:h-[22px] sm:w-[22px] transition-all duration-200',
                    isActive && 'scale-110'
                  )}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 0 : 2}
                />
                {/* Badge: positioned to not overlap icon */}
                {item.showBadge && unreadCount > 0 && (
                  <span className={cn(
                    'absolute -top-1.5 -right-2 flex items-center justify-center rounded-full bg-destructive text-white leading-none',
                    unreadCount > 9 ? 'h-4 min-w-4 px-1 text-[9px]' : 'h-4 w-4 text-[10px]',
                    'font-bold'
                  )}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              {/* Label */}
              <span className={cn(
                'mt-0.5 leading-none transition-all duration-200',
                isActive ? 'text-[10px] sm:text-[11px] font-semibold' : 'text-[10px] sm:text-[11px] font-medium'
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
