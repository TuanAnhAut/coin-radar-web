'use client'

import { useEffect } from 'react'
import {
  Radar,
  LayoutDashboard,
  Bell,
  TrendingUp,
  MessageCircle,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type ViewType } from '@/store/app-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

const navItems: { view: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'home', label: 'Tổng quan', icon: LayoutDashboard },
  { view: 'alerts', label: 'Cảnh báo', icon: Bell },
  { view: 'market', label: 'Thị trường', icon: TrendingUp },
  { view: 'chat', label: 'Chat AI', icon: MessageCircle },
  { view: 'profile', label: 'Cá nhân', icon: User },
]

export function SidebarNav() {
  const { currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed } =
    useAppStore()

  // Sync collapsed state with screen size
  // Sidebar shows at xl (1280px+), auto-collapse below xl
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 1280 && !sidebarCollapsed) {
        setSidebarCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarCollapsed, setSidebarCollapsed])

  return (
    <aside
      className={cn(
        // Hidden below xl, shown at xl+ (1280px+)
        'hidden xl:flex flex-col fixed left-0 top-12 xl:top-14 bottom-0 z-30',
        'border-r bg-sidebar text-sidebar-foreground',
        // Smooth transition for collapse/expand
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          'flex items-center border-b px-3 xl:px-4',
          'h-12 xl:h-14',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Radar className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold tracking-tight text-sm whitespace-nowrap">
              Coin Radar
            </span>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          const button = (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                // Minimum touch target
                'min-h-[44px]',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70',
                sidebarCollapsed ? 'justify-center px-0' : 'px-3 py-2.5'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              {!sidebarCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          )

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.view} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return button
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full min-h-[44px]',
                sidebarCollapsed ? 'h-10 w-10 mx-auto' : 'h-10 justify-start gap-3 px-3'
              )}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span className="text-sm whitespace-nowrap">Thu gọn</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          {sidebarCollapsed && (
            <TooltipContent side="right" className="font-medium">
              Mở rộng
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  )
}
