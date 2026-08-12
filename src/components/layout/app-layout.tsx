'use client'

import { AppHeader } from '@/components/layout/app-header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { HomeDashboard } from '@/components/home/home-dashboard'
import { GlobalSearch } from '@/components/shared/global-search'
import { NotificationCenter } from '@/components/shared/notification-center'
import { ExpertDirectory } from '@/components/chat/expert-directory'
import { ExpertProfileSheet } from '@/components/chat/expert-profile-sheet'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'
import { PortfolioSheet } from '@/components/profile/portfolio-sheet'
import { NotificationSettingsSheet } from '@/components/profile/notification-settings-sheet'
import { DisplaySettingsSheet } from '@/components/profile/display-settings-sheet'
import { SecuritySettingsSheet } from '@/components/profile/security-settings-sheet'
import { SubscriptionSheet } from '@/components/profile/subscription-sheet'
import { MarketOverview } from '@/components/market/market-overview'
import { AssetDetailSheet } from '@/components/market/asset-detail-sheet'
import { RiskScannerSheet } from '@/components/market/risk-scanner-sheet'
import { WatchlistSheet } from '@/components/market/watchlist-sheet'
import { NewsDetailSheet } from '@/components/market/news-detail-sheet'
import { AlertHub } from '@/components/alerts/alert-hub'
import { AlertFab } from '@/components/alerts/alert-fab'
import { AlertTemplatesSheet } from '@/components/alerts/alert-templates-sheet'
import { AlertBuilderSheet } from '@/components/alerts/alert-builder-sheet'
import { AlertDetailSheet } from '@/components/alerts/alert-detail-sheet'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { currentView, sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <SidebarNav />

        {/* Main content area */}
        <main
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            // Account for sidebar on desktop
            'lg:ml-64',
            sidebarCollapsed && 'lg:ml-16'
          )}
        >
          <div
            className={cn(
              'custom-scrollbar overflow-y-auto',
              // Account for bottom nav on mobile and header
              'pb-20 pt-6 px-4 md:px-6',
              'min-h-[calc(100vh-3.5rem)]'
            )}
          >
            {renderView(currentView)}
          </div>
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <BottomNav />

      {/* Global overlays */}
      <GlobalSearch />
      <NotificationCenter />

      {/* Market overlays */}
      <AssetDetailSheet />
      <RiskScannerSheet />
      <WatchlistSheet />
      <NewsDetailSheet />

      {/* Overlay sheets */}
      <ExpertProfileSheet />
      <PortfolioSheet />
      <NotificationSettingsSheet />
      <DisplaySettingsSheet />
      <SecuritySettingsSheet />
      <SubscriptionSheet />

      {/* Alert overlays */}
      <AlertTemplatesSheet />
      <AlertBuilderSheet />
      <AlertDetailSheet />
      <AlertFab />
    </div>
  )
}

function renderView(view: string) {
  switch (view) {
    case 'home':
      return <HomeDashboard />
    case 'alerts':
      return <AlertHub />
    case 'market':
      return <MarketOverview />
    case 'chat':
      return <ExpertDirectory />
    case 'profile':
      return <ProfileDashboard />
    default:
      return <HomeDashboard />
  }
}

function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <span className="text-lg font-bold text-muted-foreground">
          {title.charAt(0)}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tính năng đang được phát triển...
      </p>
    </div>
  )
}
