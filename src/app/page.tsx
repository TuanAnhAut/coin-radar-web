'use client'

import { AuthGate } from '@/components/auth/auth-gate'
import { AppLayout } from '@/components/layout/app-layout'
import { useAppStore } from '@/store/app-store'

export default function Home() {
  const { isAuthenticated } = useAppStore()

  return isAuthenticated ? <AppLayout /> : <AuthGate />
}
