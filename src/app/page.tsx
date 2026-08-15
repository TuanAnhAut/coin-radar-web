'use client'

import { useEffect } from 'react'
import { AuthGate } from '@/components/auth/auth-gate'
import { AppLayout } from '@/components/layout/app-layout'
import { useAppStore } from '@/store/app-store'

export default function Home() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const _hydrated = useAppStore((s) => s._hydrated)
  const hydrateAuth = useAppStore((s) => s.hydrateAuth)

  // Hydrate auth from localStorage ONLY on the client after mount.
  // This runs after SSR hydration completes, preventing mismatch.
  useEffect(() => {
    if (!_hydrated) {
      hydrateAuth()
    }
  }, [_hydrated, hydrateAuth])

  // Before hydration completes, show nothing (matches SSR output).
  // After hydration, show the correct view based on auth state.
  if (!_hydrated) {
    return (
      <div className="h-screen supports-[height:100dvh]:h-dvh bg-background flex flex-col" />
    )
  }

  return isAuthenticated ? <AppLayout /> : <AuthGate />
}
