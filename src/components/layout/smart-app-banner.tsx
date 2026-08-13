'use client'

import { useState, useEffect, useCallback, useRef, useMemo, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Download,
  ExternalLink,
  Smartphone,
  Apple,
  MonitorSmartphone,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ==================== App Configuration ====================

const APP_CONFIG = {
  name: 'Coin Radar',
  bundleId: 'com.coinradar.app',
  deepLinkScheme: 'coinradar',
  // Store links (placeholder — replace with actual links when app is published)
  appStoreUrl: 'https://apps.apple.com/vn/app/coin-radar/id1234567890',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.coinradar.app',
  // Session storage keys
  dismissKey: 'cr_banner_dismissed',
  dismissDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Deep link timeout (ms to wait before falling back to store)
  deepLinkTimeout: 1500,
}

// ==================== Device Detection (SSR-safe singleton) ====================

type DevicePlatform = 'ios' | 'android' | 'desktop'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isIOS: boolean
  isAndroid: boolean
  isStandalone: boolean
  platform: DevicePlatform
  userAgent: string
}

const SERVER_DEVICE: DeviceInfo = { isMobile: false, isTablet: false, isIOS: false, isAndroid: false, isStandalone: false, platform: 'desktop', userAgent: '' }

let cachedClientDevice: DeviceInfo | null = null

function getDeviceSnapshot(): DeviceInfo {
  if (typeof window === 'undefined') return SERVER_DEVICE
  if (cachedClientDevice) return cachedClientDevice

  const ua = navigator.userAgent

  // Check if already in standalone/PWA mode
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as unknown as { standalone: boolean }).standalone
    || window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches

  const isAndroid = /android/i.test(ua)
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isTablet = isIOS && /ipad/i.test(ua) || (isAndroid && !/mobile/i.test(ua))
    || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && !isIOS && !isAndroid)
  const isMobile = (isIOS || isAndroid || /mobile/i.test(ua)) && !isTablet

  const platform: DevicePlatform = isStandalone ? 'desktop' : isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'

  cachedClientDevice = { isMobile, isTablet, isIOS, isAndroid, isStandalone, platform, userAgent: ua }
  return cachedClientDevice
}

function getServerSnapshot(): DeviceInfo {
  return SERVER_DEVICE
}

function subscribeToDeviceChanges(callback: () => void): () => void {
  // Device doesn't change at runtime, but we subscribe to satisfy useSyncExternalStore
  return () => {}
}

// ==================== useDevice Hook ====================

function useDevice(): DeviceInfo {
  return useSyncExternalStore(subscribeToDeviceChanges, getDeviceSnapshot, getServerSnapshot)
}

// ==================== Smart App Banner ====================

export function SmartAppBanner() {
  const device = useDevice()
  const [showBanner, setShowBanner] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [isOpeningApp, setIsOpeningApp] = useState(false)
  const [bannerHeight, setBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)
  const deviceRef = useRef(device)

  // Keep deviceRef updated in effect (for use in setTimeout callbacks)
  useEffect(() => { deviceRef.current = device }, [device])

  // Whether we should consider showing the banner (computed from device)
  const canShow = useMemo(() => {
    return !device.isStandalone && device.platform !== 'desktop'
  }, [device.isStandalone, device.platform])

  // Schedule banner appearance after mount
  useEffect(() => {
    if (!canShow) return

    // Check if banner was previously dismissed
    const dismissedAt = localStorage.getItem(APP_CONFIG.dismissKey)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < APP_CONFIG.dismissDuration) return
      // Expired — clear and show again
      localStorage.removeItem(APP_CONFIG.dismissKey)
    }

    // Show banner after a short delay (let page load first)
    const timer = setTimeout(() => setShowBanner(true), 800)
    return () => clearTimeout(timer)
  }, [canShow])

  // Measure banner height for layout adjustment
  useEffect(() => {
    if (!bannerRef.current || !showBanner) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBannerHeight(entry.contentRect.height)
      }
    })
    observer.observe(bannerRef.current)
    return () => {
      observer.disconnect()
      setBannerHeight(0)
    }
  }, [showBanner])

  // Dismiss banner
  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    localStorage.setItem(APP_CONFIG.dismissKey, Date.now().toString())
  }, [])

  // Try to open deep link (with fallback)
  const handleOpenApp = useCallback(() => {
    const d = deviceRef.current
    if (!d) return

    const deepLink = `${APP_CONFIG.deepLinkScheme}://open`
    setIsOpeningApp(true)

    // Try opening the deep link
    window.location.href = deepLink

    // If the deep link fails (app not installed), fallback to store after timeout
    setTimeout(() => {
      setIsOpeningApp(false)
      if (d.platform === 'ios') {
        window.location.href = APP_CONFIG.appStoreUrl
      } else if (d.platform === 'android') {
        window.location.href = APP_CONFIG.playStoreUrl
      }
    }, APP_CONFIG.deepLinkTimeout)
  }, [])

  // Open download dialog
  const handleDownload = useCallback(() => {
    setShowDownloadDialog(true)
  }, [])

  // Direct store redirect from dialog
  const handleStoreRedirect = useCallback((store: 'ios' | 'android') => {
    window.location.href = store === 'ios' ? APP_CONFIG.appStoreUrl : APP_CONFIG.playStoreUrl
    setShowDownloadDialog(false)
    setShowBanner(false)
    localStorage.setItem(APP_CONFIG.dismissKey, Date.now().toString())
  }, [])

  // Don't render on desktop or if no device detected
  if (!canShow) return null

  const PlatformIcon = device.platform === 'ios' ? Apple : Smartphone

  return (
    <>
      {/* Banner space reservation (prevents content jump) */}
      <div style={{ height: bannerHeight }} className="shrink-0" />

      {/* Smart Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            ref={bannerRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="relative z-50 border-b bg-card/95 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5">
                {/* App Icon */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                  <MonitorSmartphone className="size-5 text-primary-foreground" />
                </div>

                {/* App Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold truncate">{APP_CONFIG.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                      {device.platform === 'ios' ? 'iOS' : 'Android'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    Mở trong ứng dụng để trải nghiệm tốt hơn
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={handleOpenApp}
                    disabled={isOpeningApp}
                    className={cn(
                      'h-8 px-3.5 text-[11px] font-semibold rounded-lg shadow-sm transition-all',
                      isOpeningApp && 'animate-pulse'
                    )}
                  >
                    {isOpeningApp ? (
                      <>
                        <span className="size-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span className="ml-1.5">Đang mở...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="size-3 mr-1" />
                        Mở app
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 px-3 text-[11px] font-medium rounded-lg"
                  >
                    <Download className="size-3 mr-1" />
                    Tải
                  </Button>

                  {/* Dismiss */}
                  <button
                    onClick={handleDismiss}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label="Đóng"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Dialog */}
      <AppDownloadDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        devicePlatform={device.platform}
        onDismiss={handleDismiss}
        onStoreRedirect={handleStoreRedirect}
      />
    </>
  )
}

// ==================== App Download Dialog ====================

interface AppDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  devicePlatform: DevicePlatform
  onDismiss: () => void
  onStoreRedirect: (store: 'ios' | 'android') => void
}

function AppDownloadDialog({
  open,
  onOpenChange,
  devicePlatform,
  onDismiss,
  onStoreRedirect,
}: AppDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-8 pb-6 text-center">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative">
            {/* App Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg mb-4">
              <MonitorSmartphone className="size-8 text-primary-foreground" />
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-bold">
                Sử dụng {APP_CONFIG.name} trên điện thoại
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Trải nghiệm theo dõi thị trường tốt hơn với ứng dụng native — thông báo đẩy, hiệu suất cao, giao diện tối ưu.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Features list */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: '🔔', title: 'Thông báo đẩy theo thời gian thực', desc: 'Nhận cảnh báo giá ngay lập tức' },
              { icon: '⚡', title: 'Hiệu suất vượt trội', desc: 'Đồ thị mượt, tải nhanh hơn 3x' },
              { icon: '📱', title: 'Giao diện tối ưu di động', desc: 'Vuốt, chạm tự nhiên như app gốc' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-2">
                <span className="text-lg shrink-0 mt-0.5">{feature.icon}</span>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 space-y-2.5">
          {/* Primary: Open in app */}
          <Button
            className="w-full h-11 text-sm font-semibold rounded-xl shadow-md"
            onClick={() => {
              onOpenChange(false)
              window.location.href = `${APP_CONFIG.deepLinkScheme}://open`
              setTimeout(() => {
                onStoreRedirect(devicePlatform as 'ios' | 'android')
              }, APP_CONFIG.deepLinkTimeout)
            }}
          >
            <ExternalLink className="size-4 mr-2" />
            Mở trong ứng dụng
            <ChevronRight className="size-4 ml-auto opacity-60" />
          </Button>

          {/* Secondary: Download from store */}
          {devicePlatform !== 'desktop' && (
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-medium rounded-xl"
              onClick={() => onStoreRedirect(devicePlatform as 'ios' | 'android')}
            >
              {devicePlatform === 'ios' ? <Apple className="size-4 mr-2" /> : <Smartphone className="size-4 mr-2" />}
              Tải từ {devicePlatform === 'ios' ? 'App Store' : 'Google Play'}
              <Download className="size-3.5 ml-auto opacity-60" />
            </Button>
          )}

          {/* Both stores */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStoreRedirect('ios')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors text-xs font-medium"
            >
              <Apple className="size-3.5" />
              iOS
            </button>
            <button
              onClick={() => onStoreRedirect('android')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors text-xs font-medium"
            >
              <Smartphone className="size-3.5" />
              Android
            </button>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => { onOpenChange(false); onDismiss() }}
            className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Tiếp tục sử dụng trên trình duyệt
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Mobile Bottom Sheet Prompt ====================

/** Show a bottom-sheet style prompt for first-time mobile visitors */
export function MobileOnboardingPrompt() {
  const device = useDevice()
  const [showPrompt, setShowPrompt] = useState(false)
  const deviceRef = useRef(device)

  // Keep deviceRef updated in effect
  useEffect(() => { deviceRef.current = device }, [device])

  const canShow = useMemo(() => {
    return !device.isStandalone && device.platform !== 'desktop'
  }, [device.isStandalone, device.platform])

  useEffect(() => {
    if (!canShow) return

    // Check if already prompted this session
    const prompted = sessionStorage.getItem('cr_mobile_prompted')
    if (prompted) return

    // Show prompt after 3 seconds (give user time to browse first)
    const timer = setTimeout(() => {
      setShowPrompt(true)
      sessionStorage.setItem('cr_mobile_prompted', '1')
    }, 3000)

    return () => clearTimeout(timer)
  }, [canShow])

  if (!canShow || !showPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPrompt(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl bg-card shadow-2xl safe-area-bottom"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                  <MonitorSmartphone className="size-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Ứng dụng {APP_CONFIG.name}</h3>
                  <p className="text-xs text-muted-foreground">Được tối ưu cho thiết bị của bạn</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2.5 mb-5">
                {[
                  '🔔 Thông báo đẩy cảnh báo giá theo thời gian thực',
                  '⚡ Biểu đồ mượt mà, hiệu suất cao hơn',
                  '📱 Giao diện chạm vuốt tự nhiên',
                  '🔒 Bảo mật sinh trắc học (Face ID / vân tay)',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="text-xs leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <Button
                  className="w-full h-12 text-sm font-semibold rounded-xl shadow-md"
                  onClick={() => {
                    setShowPrompt(false)
                    window.location.href = `${APP_CONFIG.deepLinkScheme}://open`
                    setTimeout(() => {
                      const d = deviceRef.current
                      if (d?.platform === 'ios') {
                        window.location.href = APP_CONFIG.appStoreUrl
                      } else {
                        window.location.href = APP_CONFIG.playStoreUrl
                      }
                    }, APP_CONFIG.deepLinkTimeout)
                  }}
                >
                  <ExternalLink className="size-4 mr-2" />
                  Mở ứng dụng {APP_CONFIG.name}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium rounded-xl"
                  onClick={() => {
                    setShowPrompt(false)
                    const d = deviceRef.current
                    if (d?.platform === 'ios') {
                      window.location.href = APP_CONFIG.appStoreUrl
                    } else {
                      window.location.href = APP_CONFIG.playStoreUrl
                    }
                  }}
                >
                  <Download className="size-4 mr-2" />
                  Tải ứng dụng miễn phí
                </Button>

                <button
                  onClick={() => setShowPrompt(false)}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tiếp tục dùng phiên bản web
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
