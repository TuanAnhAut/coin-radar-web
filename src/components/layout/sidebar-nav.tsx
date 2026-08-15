'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  Radar,
  LayoutDashboard,
  Newspaper,
  Bell,
  TrendingUp,
  MessageCircle,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
  { view: 'news', label: 'Tin tức', icon: Newspaper },
  { view: 'alerts', label: 'Cảnh báo', icon: Bell },
  { view: 'market', label: 'Thị trường', icon: TrendingUp },
  { view: 'chat', label: 'Chat AI', icon: MessageCircle },
  { view: 'profile', label: 'Cá nhân', icon: User },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed } =
    useAppStore()

  return (
    <>
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
              onClick={() => {
                setCurrentView(item.view)
                onNavigate?.()
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
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
    </>
  )
}

export function SidebarNav() {
  const { sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } =
    useAppStore()

  const prevBreakpoint = useRef<boolean | null>(null)

  // Sync collapsed state with screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const isXl = width >= 1280

      // Only react on actual breakpoint crossings to prevent loops
      if (prevBreakpoint.current !== null && prevBreakpoint.current !== isXl) {
        if (!isXl && !sidebarCollapsed) {
          setSidebarCollapsed(true)
        }
      }
      prevBreakpoint.current = isXl
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarCollapsed, setSidebarCollapsed])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileSidebarOpen])

  const closeMobile = useCallback(() => setMobileSidebarOpen(false), [setMobileSidebarOpen])

  return (
    <>
      {/* Desktop sidebar (xl+) */}
      <aside
        className={cn(
          'hidden xl:flex flex-col fixed left-0 top-[3.5rem] sm:top-14 bottom-0 z-30',
          'border-r bg-sidebar text-sidebar-foreground',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile sidebar drawer (<xl) */}
      {/* Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden transition-opacity duration-300"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'xl:hidden fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r w-64',
          'transition-transform duration-300 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Radar className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight text-sm">Coin Radar</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={closeMobile}
            aria-label="Đóng menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drawer nav items */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = useAppStore.getState().currentView === item.view
            const Icon = item.icon

            return (
              <button
                key={item.view}
                onClick={() => {
                  useAppStore.getState().setCurrentView(item.view)
                  closeMobile()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  'min-h-[44px] px-3 py-2.5',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70'
                )}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
