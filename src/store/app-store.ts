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
  | null

interface AppState {
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
}

export const useAppStore = create<AppState>((set) => ({
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
}))
