'use client'

import { AppHeader } from '@/components/layout/app-header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { SmartAppBanner, MobileOnboardingPrompt } from '@/components/layout/smart-app-banner'
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
import { ChartDetailView } from '@/components/chart/chart-detail-view'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { currentView, sidebarCollapsed, chartDetailSymbol } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Smart App Banner (mobile/tablet only) */}
      <SmartAppBanner />

      <AppHeader />

      <div className="flex flex-1">
        {/* Sidebar (desktop xl+) */}
        <SidebarNav />

        {/* Main content area */}
        <main
          className={cn(
            'flex-1 min-w-0 transition-all duration-300 ease-in-out',
            // Account for sidebar on xl+ (1280px+)
            'xl:ml-64',
            sidebarCollapsed && 'xl:ml-[68px]'
          )}
        >
          <div
            className={cn(
              'custom-scrollbar overflow-y-auto',
              // Bottom nav clearance: only when sidebar is NOT visible (below xl)
              'pb-[80px] xl:pb-6',
              'pt-4 sm:pt-6 px-3 sm:px-4 md:px-6',
              'min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)]'
            )}
          >
            <div className="mx-auto w-full">
              {chartDetailSymbol ? <ChartDetailView /> : renderView(currentView)}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom navigation (mobile/tablet: md and below) */}
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

      {/* Mobile onboarding prompt (first visit) */}
      <MobileOnboardingPrompt />
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
