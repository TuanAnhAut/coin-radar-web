'use client'

import { useState } from 'react'
import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { ForgotPasswordScreen } from './forgot-password-screen'
import { VerifyOtpScreen } from './verify-otp-screen'
import { useAppStore } from '@/store/app-store'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AuthGate() {
  const { authScreen } = useAppStore()
  // Wait for client mount before enabling animations to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useState(() => {
    // Use setTimeout to ensure it runs after hydration
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  })

  return (
    <div className="h-screen supports-[height:100dvh]:h-dvh bg-background flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={authScreen}
          initial={mounted ? { opacity: 0, x: 20 } : false}
          animate={{ opacity: 1, x: 0 }}
          exit={mounted ? { opacity: 0, x: -20 } : undefined}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {authScreen === 'login' && <LoginScreen />}
          {authScreen === 'register' && <RegisterScreen />}
          {authScreen === 'forgot-password' && <ForgotPasswordScreen />}
          {authScreen === 'verify-otp' && <VerifyOtpScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
