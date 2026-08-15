'use client'

import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAppStore } from '@/store/app-store'

export default function Home() {
  const _hydrated = useAppStore((s) => s._hydrated)
  const hydrateAuth = useAppStore((s) => s.hydrateAuth)

  // Hydrate auth from localStorage ONLY on the client after mount.
  useEffect(() => {
    if (!_hydrated) {
      hydrateAuth()
    }
  }, [_hydrated, hydrateAuth])

  // Before hydration completes, show empty shell (matches SSR output).
  if (!_hydrated) {
    return (
      <div className="h-screen supports-[height:100dvh]:h-dvh bg-background flex flex-col" />
    )
  }

  // Always render the full app layout — auth gates are handled inside
  return <AppLayout />
}
