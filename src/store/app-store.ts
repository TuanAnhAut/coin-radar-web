'use client'

import { create } from 'zustand'

export type ViewType = 'home' | 'alerts' | 'market' | 'chat' | 'profile'

export type OverlayType =
  | 'search'
  | 'notifications'
  | 'asset-detail'
  | 'alert-detail'
  | 'news-detail'
  | 'alert-builder'
  | 'alert-templates'
  | 'watchlist'
  | 'scanner'
  | 'expert-profile'
  | 'portfolio'
  | 'notification-settings'
  | 'display-settings'
  | 'security-settings'
  | 'subscription'
  | 'edit-profile'
  | 'two-factor'
  | 'change-password'
  | null

export type AuthScreen = 'login' | 'register' | 'forgot-password' | 'verify-otp'

export interface UserData {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  plan: 'free' | 'pro' | 'enterprise'
  twoFactorEnabled: boolean
  createdAt: string
}

interface AppState {
  // Auth
  isAuthenticated: boolean
  authScreen: AuthScreen
  user: UserData | null
  pendingVerifyEmail: string | null
  pendingVerifyType: 'register' | 'forgot-password' | 'login'
  setAuthScreen: (screen: AuthScreen) => void
  login: (user: UserData) => void
  logout: () => void
  setPendingVerify: (email: string, type: 'register' | 'forgot-password' | 'login') => void

  // Navigation
  currentView: ViewType
  setCurrentView: (view: ViewType) => void

  // Overlays (modals/sheets)
  activeOverlay: OverlayType
  overlayData: Record<string, unknown> | null
  openOverlay: (overlay: OverlayType, data?: Record<string, unknown>) => void
  closeOverlay: () => void

  // Global Search
  searchOpen: boolean
  searchQuery: string
  setSearchOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void

  // Notifications
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  unreadCount: number
  setUnreadCount: (count: number) => void

  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Chat - active expert room
  activeChatExpertId: string | null
  setActiveChatExpertId: (id: string | null) => void

  // Chart Detail View
  chartDetailSymbol: string | null
  chartDetailAssetName: string | null
  chartDetailAssetType: string | null
  openChartDetail: (symbol: string, name: string, type: string) => void
  closeChartDetail: () => void
}

// Check localStorage for persisted session on init
function getInitialAuthState(): {
  isAuthenticated: boolean
  user: UserData | null
} {
  if (typeof window === 'undefined') return { isAuthenticated: false, user: null }
  try {
    const stored = localStorage.getItem('cr_auth_session')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.user) {
        return { isAuthenticated: true, user: parsed.user }
      }
    }
  } catch {
    // ignore
  }
  return { isAuthenticated: false, user: null }
}

const initial = getInitialAuthState()

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: initial.isAuthenticated,
  authScreen: 'login',
  user: initial.user,
  pendingVerifyEmail: null,
  pendingVerifyType: 'register',
  setAuthScreen: (screen) => set({ authScreen: screen }),
  login: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cr_auth_session', JSON.stringify({ user }))
    }
    set({ isAuthenticated: true, user, authScreen: 'login' })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cr_auth_session')
    }
    set({
      isAuthenticated: false,
      user: null,
      currentView: 'home',
      activeOverlay: null,
      overlayData: null,
      chartDetailSymbol: null,
      chartDetailAssetName: null,
      chartDetailAssetType: null,
    })
  },
  setPendingVerify: (email, type) => set({
    pendingVerifyEmail: email,
    pendingVerifyType: type,
    authScreen: 'verify-otp',
  }),

  // Navigation
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),

  // Overlays
  activeOverlay: null,
  overlayData: null,
  openOverlay: (overlay, data) =>
    set({ activeOverlay: overlay, overlayData: data ?? null }),
  closeOverlay: () => set({ activeOverlay: null, overlayData: null }),

  // Global Search
  searchOpen: false,
  searchQuery: '',
  setSearchOpen: (open) => set({ searchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Notifications
  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  unreadCount: 3,
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Sidebar
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Chat
  activeChatExpertId: null,
  setActiveChatExpertId: (id) => set({ activeChatExpertId: id }),

  // Chart Detail View
  chartDetailSymbol: null,
  chartDetailAssetName: null,
  chartDetailAssetType: null,
  openChartDetail: (symbol, name, type) => set({
    chartDetailSymbol: symbol,
    chartDetailAssetName: name,
    chartDetailAssetType: type,
  }),
  closeChartDetail: () => set({
    chartDetailSymbol: null,
    chartDetailAssetName: null,
    chartDetailAssetType: null,
  }),
}))
