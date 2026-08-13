'use client'

import { useEffect, useRef } from 'react'
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
import { EditProfileSheet } from '@/components/profile/edit-profile-sheet'
import { TwoFactorSheet } from '@/components/profile/two-factor-sheet'
import { ChangePasswordSheet } from '@/components/profile/change-password-sheet'
import { MarketOverview } from '@/components/market/market-overview'
import { AssetDetailSheet } from '@/components/market/asset-detail-sheet'
import { RiskScannerSheet } from '@/components/market/risk-scanner-sheet'
import { WatchlistSheet } from '@/components/market/watchlist-sheet'
import { NewsDetailSheet } from '@/components/market/news-detail-sheet'
import { AlertHub } from '@/components/alerts/alert-hub'
import { NewsPage } from '@/components/news/news-page'
import { AlertFab } from '@/components/alerts/alert-fab'
import { AlertTemplatesSheet } from '@/components/alerts/alert-templates-sheet'
import { AlertBuilderSheet } from '@/components/alerts/alert-builder-sheet'
import { AlertDetailSheet } from '@/components/alerts/alert-detail-sheet'
import { ChartDetailView } from '@/components/chart/chart-detail-view'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { currentView, sidebarCollapsed, chartDetailSymbol } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to top when view changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [currentView, chartDetailSymbol])

  return (
    <div className="h-screen supports-[height:100dvh]:h-dvh flex flex-col bg-background overflow-hidden">
      {/* Smart App Banner (mobile/tablet only) */}
      <SmartAppBanner />

      <AppHeader />

      {/* Content wrapper — min-h-0 is CRITICAL for flex children to allow shrinking */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (desktop xl+) */}
        <SidebarNav />

        {/* Main content area — relative anchor for the absolute-positioned scroll container */}
        <main
          className={cn(
            'relative flex-1 min-w-0 min-h-0 transition-all duration-300 ease-in-out',
            // Account for sidebar on xl+ (1280px+)
            'xl:ml-64',
            sidebarCollapsed && 'xl:ml-[68px]'
          )}
        >
          {/* Scroll container — absolute positioning guarantees full fill of parent */}
          <div
            ref={scrollRef}
            className={cn(
              'custom-scrollbar overflow-y-auto',
              // Absolute positioning: fills the entire main area
              'absolute inset-0',
              // Fixed header clearance (padding stays fixed in scrollport)
              'pt-[3.25rem] sm:pt-[3.75rem]',
              // Bottom nav clearance: only when sidebar is NOT visible (below xl)
              'pb-[80px] xl:pb-6',
              // Side padding
              'px-3 sm:px-4 md:px-6'
            )}
          >
            <div className="mx-auto w-full">
              {chartDetailSymbol ? <ChartDetailView /> : renderView(currentView)}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom navigation (mobile/tablet: below xl) */}
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
      <EditProfileSheet />
      <TwoFactorSheet />
      <ChangePasswordSheet />

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
    case 'news':
      return <NewsPage />
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
